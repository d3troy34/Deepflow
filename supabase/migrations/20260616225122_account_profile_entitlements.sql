create schema if not exists private;

alter table public.profiles
  add column if not exists username text,
  add column if not exists display_name text,
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_username_format_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_username_format_check
      check (username is null or (username = lower(username) and username ~ '^[a-z0-9_]{3,24}$'));
  end if;
end $$;

create unique index if not exists profiles_username_lower_key
  on public.profiles ((lower(username)))
  where username is not null;

update public.profiles
set display_name = coalesce(nullif(btrim(display_name), ''), nullif(btrim(name), ''), nullif(split_part(email, '@', 1), '')),
    updated_at = now()
where display_name is null or btrim(display_name) = '';

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_code text not null default 'free',
  billing_status text not null default 'coming_soon',
  credit_balance integer not null default 0,
  monthly_credit_limit integer not null default 0,
  credits_label text not null default 'Proximamente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_entitlements_plan_code_check'
      and conrelid = 'public.user_entitlements'::regclass
  ) then
    alter table public.user_entitlements
      add constraint user_entitlements_plan_code_check
      check (plan_code ~ '^[a-z0-9_-]{1,40}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_entitlements_billing_status_check'
      and conrelid = 'public.user_entitlements'::regclass
  ) then
    alter table public.user_entitlements
      add constraint user_entitlements_billing_status_check
      check (billing_status in ('coming_soon', 'trialing', 'active', 'past_due', 'canceled', 'paused'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_entitlements_credit_balance_check'
      and conrelid = 'public.user_entitlements'::regclass
  ) then
    alter table public.user_entitlements
      add constraint user_entitlements_credit_balance_check
      check (credit_balance >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_entitlements_monthly_credit_limit_check'
      and conrelid = 'public.user_entitlements'::regclass
  ) then
    alter table public.user_entitlements
      add constraint user_entitlements_monthly_credit_limit_check
      check (monthly_credit_limit >= 0);
  end if;
end $$;

create index if not exists user_entitlements_plan_code_idx
  on public.user_entitlements (plan_code);

insert into public.user_entitlements (user_id, plan_code, billing_status, credit_balance, monthly_credit_limit, credits_label)
select id, 'free', 'coming_soon', 0, 0, 'Proximamente'
from public.profiles
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.user_entitlements enable row level security;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists user_entitlements_set_updated_at on public.user_entitlements;
create trigger user_entitlements_set_updated_at
before update on public.user_entitlements
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  );

  insert into public.profiles (id, email, name, display_name)
  values (new.id, coalesce(new.email, ''), profile_name, profile_name)
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name),
        display_name = coalesce(public.profiles.display_name, excluded.display_name);

  insert into public.user_entitlements (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

drop function if exists public.handle_new_user();

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.is_admin(uuid) from public, anon;
grant execute on function private.is_admin(uuid) to authenticated;

drop policy if exists "profiles: admin read all" on public.profiles;
drop policy if exists "profiles: own row read" on public.profiles;
drop policy if exists "profiles: own row update" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (private.is_admin((select auth.uid())));

create policy "profiles_update_own_editable"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;
drop policy if exists "user_entitlements_select_admin" on public.user_entitlements;

create policy "user_entitlements_select_own"
  on public.user_entitlements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_entitlements_select_admin"
  on public.user_entitlements
  for select
  to authenticated
  using (private.is_admin((select auth.uid())));

revoke all on public.profiles from anon;
revoke all on public.user_entitlements from anon;

revoke all on public.profiles from authenticated;
grant select (id, email, name, username, display_name, avatar_url, tier, subscription_status, subscription_expires_at, is_founder, created_at, updated_at)
  on public.profiles to authenticated;
grant update (name, username, display_name, avatar_url)
  on public.profiles to authenticated;

grant select on public.user_entitlements to authenticated;

grant all on public.profiles to service_role;
grant all on public.user_entitlements to service_role;

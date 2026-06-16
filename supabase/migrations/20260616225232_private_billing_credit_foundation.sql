create table if not exists private.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  last_webhook_event_id text,
  raw_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_customers_provider_check'
      and conrelid = 'private.billing_customers'::regclass
  ) then
    alter table private.billing_customers
      add constraint billing_customers_provider_check
      check (provider ~ '^[a-z0-9_-]{1,40}$');
  end if;
end $$;

create unique index if not exists billing_customers_provider_customer_key
  on private.billing_customers (provider, provider_customer_id)
  where provider_customer_id is not null;

create unique index if not exists billing_customers_provider_subscription_key
  on private.billing_customers (provider, provider_subscription_id)
  where provider_subscription_id is not null;

create unique index if not exists billing_customers_provider_webhook_event_key
  on private.billing_customers (provider, last_webhook_event_id)
  where last_webhook_event_id is not null;

create table if not exists private.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  amount integer not null,
  idempotency_key text not null,
  source text not null,
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'credit_ledger_amount_nonzero_check'
      and conrelid = 'private.credit_ledger'::regclass
  ) then
    alter table private.credit_ledger
      add constraint credit_ledger_amount_nonzero_check
      check (amount <> 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'credit_ledger_event_type_check'
      and conrelid = 'private.credit_ledger'::regclass
  ) then
    alter table private.credit_ledger
      add constraint credit_ledger_event_type_check
      check (event_type ~ '^[a-z0-9_-]{1,60}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'credit_ledger_source_check'
      and conrelid = 'private.credit_ledger'::regclass
  ) then
    alter table private.credit_ledger
      add constraint credit_ledger_source_check
      check (source ~ '^[a-z0-9_-]{1,60}$');
  end if;
end $$;

create unique index if not exists credit_ledger_idempotency_key_key
  on private.credit_ledger (idempotency_key);

create index if not exists credit_ledger_user_created_idx
  on private.credit_ledger (user_id, created_at desc);

drop trigger if exists billing_customers_set_updated_at on private.billing_customers;
create trigger billing_customers_set_updated_at
before update on private.billing_customers
for each row execute function private.set_updated_at();

alter table private.billing_customers enable row level security;
alter table private.credit_ledger enable row level security;

revoke all on private.billing_customers from anon, authenticated;
revoke all on private.credit_ledger from anon, authenticated;
grant all on private.billing_customers to service_role;
grant all on private.credit_ledger to service_role;

insert into private.billing_customers (user_id, provider, provider_customer_id, provider_subscription_id, raw_status)
select id, 'stripe', stripe_customer_id, stripe_subscription_id, subscription_status
from public.profiles
where stripe_customer_id is not null or stripe_subscription_id is not null or subscription_status is not null
on conflict (user_id) do update
  set provider_customer_id = coalesce(private.billing_customers.provider_customer_id, excluded.provider_customer_id),
      provider_subscription_id = coalesce(private.billing_customers.provider_subscription_id, excluded.provider_subscription_id),
      raw_status = coalesce(private.billing_customers.raw_status, excluded.raw_status);

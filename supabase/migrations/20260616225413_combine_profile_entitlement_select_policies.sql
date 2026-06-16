drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (((select auth.uid()) = id) or private.is_admin((select auth.uid())));

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;
drop policy if exists "user_entitlements_select_admin" on public.user_entitlements;

create policy "user_entitlements_select_own_or_admin"
  on public.user_entitlements
  for select
  to authenticated
  using (((select auth.uid()) = user_id) or private.is_admin((select auth.uid())));

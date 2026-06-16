revoke select (subscription_status, subscription_expires_at, is_founder)
  on table public.profiles
  from authenticated;

revoke insert, update, delete, truncate, references, trigger on table public.user_entitlements from authenticated;
revoke all privileges on table public.user_entitlements from anon;
grant select on table public.user_entitlements to authenticated;
grant all privileges on table public.user_entitlements to service_role;

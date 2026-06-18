create schema if not exists private;

create or replace function private.is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce($1 = auth.uid(), false)
    and exists (
      select 1
      from auth.users u
      where u.id = $1
        and (
          u.raw_app_meta_data @> '{"admin": true}'::jsonb
          or lower(coalesce(u.raw_app_meta_data ->> 'role', '')) = 'admin'
          or exists (
            select 1
            from jsonb_array_elements_text(
              case
                when jsonb_typeof(u.raw_app_meta_data -> 'roles') = 'array'
                  then u.raw_app_meta_data -> 'roles'
                else '[]'::jsonb
              end
            ) as role(value)
            where lower(role.value) = 'admin'
          )
          or exists (
            select 1
            from public.profiles p
            where p.id = $1
              and lower(coalesce(to_jsonb(p) ->> 'is_admin', 'false')) = 'true'
          )
        )
    );
$$;

revoke all on function private.is_admin(uuid) from public, anon, authenticated;
grant execute on function private.is_admin(uuid) to authenticated;

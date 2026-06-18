create or replace function public.touch_research_deliverables_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.email_log') is not null then
    execute 'create index if not exists email_log_publication_id_idx on public.email_log (publication_id)';
  end if;

  if to_regclass('public.positions') is not null then
    execute 'create index if not exists positions_tesis_id_idx on public.positions (tesis_id)';
  end if;
end $$;

drop policy if exists "billing_customers_no_client_access" on private.billing_customers;
create policy "billing_customers_no_client_access"
  on private.billing_customers
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "credit_ledger_no_client_access" on private.credit_ledger;
create policy "credit_ledger_no_client_access"
  on private.credit_ledger
  for all
  to authenticated
  using (false)
  with check (false);

do $$
begin
  if to_regclass('public.publications') is not null then
    execute 'drop policy if exists "publications: admin all" on public.publications';
    execute 'drop policy if exists "publications: public read published" on public.publications';
    execute 'drop policy if exists "publications_select_public_or_admin" on public.publications';
    execute 'drop policy if exists "publications_insert_admin" on public.publications';
    execute 'drop policy if exists "publications_update_admin" on public.publications';
    execute 'drop policy if exists "publications_delete_admin" on public.publications';

    execute $policy$
      create policy "publications_select_public_or_admin"
        on public.publications
        for select
        to public
        using (published_at is not null or private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "publications_insert_admin"
        on public.publications
        for insert
        to authenticated
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "publications_update_admin"
        on public.publications
        for update
        to authenticated
        using (private.is_admin((select auth.uid())))
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "publications_delete_admin"
        on public.publications
        for delete
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.tesis') is not null then
    execute 'drop policy if exists "tesis: admin all" on public.tesis';
    execute 'drop policy if exists "tesis: public read" on public.tesis';
    execute 'drop policy if exists "tesis_select_public_or_admin" on public.tesis';
    execute 'drop policy if exists "tesis_insert_admin" on public.tesis';
    execute 'drop policy if exists "tesis_update_admin" on public.tesis';
    execute 'drop policy if exists "tesis_delete_admin" on public.tesis';

    execute $policy$
      create policy "tesis_select_public_or_admin"
        on public.tesis
        for select
        to public
        using (published_at is not null or private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "tesis_insert_admin"
        on public.tesis
        for insert
        to authenticated
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "tesis_update_admin"
        on public.tesis
        for update
        to authenticated
        using (private.is_admin((select auth.uid())))
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "tesis_delete_admin"
        on public.tesis
        for delete
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.research_deliverables') is not null then
    execute 'drop policy if exists "research_deliverables: admin all" on public.research_deliverables';
    execute 'drop policy if exists "research_deliverables: public read published" on public.research_deliverables';
    execute 'drop policy if exists "research_deliverables_select_public_or_admin" on public.research_deliverables';
    execute 'drop policy if exists "research_deliverables_insert_admin" on public.research_deliverables';
    execute 'drop policy if exists "research_deliverables_update_admin" on public.research_deliverables';
    execute 'drop policy if exists "research_deliverables_delete_admin" on public.research_deliverables';

    execute $policy$
      create policy "research_deliverables_select_public_or_admin"
        on public.research_deliverables
        for select
        to public
        using ((status = 'published' and published_at is not null) or private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "research_deliverables_insert_admin"
        on public.research_deliverables
        for insert
        to authenticated
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "research_deliverables_update_admin"
        on public.research_deliverables
        for update
        to authenticated
        using (private.is_admin((select auth.uid())))
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "research_deliverables_delete_admin"
        on public.research_deliverables
        for delete
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.positions') is not null then
    execute 'drop policy if exists "positions: admin all" on public.positions';
    execute 'drop policy if exists "positions: public read" on public.positions';
    execute 'drop policy if exists "positions_select_public" on public.positions';
    execute 'drop policy if exists "positions_insert_admin" on public.positions';
    execute 'drop policy if exists "positions_update_admin" on public.positions';
    execute 'drop policy if exists "positions_delete_admin" on public.positions';

    execute $policy$
      create policy "positions_select_public"
        on public.positions
        for select
        to public
        using (true)
    $policy$;
    execute $policy$
      create policy "positions_insert_admin"
        on public.positions
        for insert
        to authenticated
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "positions_update_admin"
        on public.positions
        for update
        to authenticated
        using (private.is_admin((select auth.uid())))
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "positions_delete_admin"
        on public.positions
        for delete
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.nav_history') is not null then
    execute 'drop policy if exists "nav_history: admin all" on public.nav_history';
    execute 'drop policy if exists "nav_history: public read" on public.nav_history';
    execute 'drop policy if exists "nav_history_select_public" on public.nav_history';
    execute 'drop policy if exists "nav_history_insert_admin" on public.nav_history';
    execute 'drop policy if exists "nav_history_update_admin" on public.nav_history';
    execute 'drop policy if exists "nav_history_delete_admin" on public.nav_history';

    execute $policy$
      create policy "nav_history_select_public"
        on public.nav_history
        for select
        to public
        using (true)
    $policy$;
    execute $policy$
      create policy "nav_history_insert_admin"
        on public.nav_history
        for insert
        to authenticated
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "nav_history_update_admin"
        on public.nav_history
        for update
        to authenticated
        using (private.is_admin((select auth.uid())))
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "nav_history_delete_admin"
        on public.nav_history
        for delete
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.changelog') is not null then
    execute 'drop policy if exists "changelog: admin all" on public.changelog';
    execute 'drop policy if exists "changelog: public read" on public.changelog';
    execute 'drop policy if exists "changelog_select_public" on public.changelog';
    execute 'drop policy if exists "changelog_insert_admin" on public.changelog';
    execute 'drop policy if exists "changelog_update_admin" on public.changelog';
    execute 'drop policy if exists "changelog_delete_admin" on public.changelog';

    execute $policy$
      create policy "changelog_select_public"
        on public.changelog
        for select
        to public
        using (true)
    $policy$;
    execute $policy$
      create policy "changelog_insert_admin"
        on public.changelog
        for insert
        to authenticated
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "changelog_update_admin"
        on public.changelog
        for update
        to authenticated
        using (private.is_admin((select auth.uid())))
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "changelog_delete_admin"
        on public.changelog
        for delete
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.email_log') is not null then
    execute 'drop policy if exists "email_log: admin all" on public.email_log';
    execute 'drop policy if exists "email_log_select_admin" on public.email_log';
    execute 'drop policy if exists "email_log_insert_admin" on public.email_log';
    execute 'drop policy if exists "email_log_update_admin" on public.email_log';
    execute 'drop policy if exists "email_log_delete_admin" on public.email_log';

    execute $policy$
      create policy "email_log_select_admin"
        on public.email_log
        for select
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "email_log_insert_admin"
        on public.email_log
        for insert
        to authenticated
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "email_log_update_admin"
        on public.email_log
        for update
        to authenticated
        using (private.is_admin((select auth.uid())))
        with check (private.is_admin((select auth.uid())))
    $policy$;
    execute $policy$
      create policy "email_log_delete_admin"
        on public.email_log
        for delete
        to authenticated
        using (private.is_admin((select auth.uid())))
    $policy$;
  end if;
end $$;

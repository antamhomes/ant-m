
-- ============================================================
-- RLS LOCKDOWN — seeds admin, drops open policies, locks 24 tables
-- admin (you) = full access; owners = SELECT own rows on 5 tables
-- service role (edge sync) bypasses RLS entirely
-- ============================================================

-- 0. seed admin identity
insert into public.user_permissions (id, email, role_label, allowed_sections)
values (gen_random_uuid(), lower('antamhomes@gmail.com'), 'admin', array['*'])
on conflict do nothing;

-- is_admin(): security definer to avoid RLS recursion on user_permissions
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_permissions
    where lower(email) = lower(coalesce(auth.jwt()->>'email',''))
      and role_label = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- my_client_ids(): owner's client rows matched by magic-link email
create or replace function public.my_client_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select id from public.clients
  where lower(email) = lower(coalesce(auth.jwt()->>'email',''));
$$;
revoke all on function public.my_client_ids() from public;
grant execute on function public.my_client_ids() to authenticated;

-- 1. drop every existing policy in public
do $$
declare pol record;
begin
  for pol in select schemaname, tablename, policyname from pg_policies where schemaname='public'
  loop execute format('drop policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename); end loop;
end $$;

-- 2. admin-everything + enable RLS on all public tables
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname='public'
  loop
    execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t.tablename);
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- 3. owner SELECT-only, own rows, on the 5 portal tables
create policy owner_read on public.clients
  for select to authenticated using (id in (select public.my_client_ids()));

create policy owner_read on public.apartments
  for select to authenticated using (client_id in (select public.my_client_ids()));

create policy owner_read on public.reservations
  for select to authenticated using (apartment_id in (
    select a.id from public.apartments a where a.client_id in (select public.my_client_ids())));

create policy owner_read on public.cleaning_rates
  for select to authenticated using (apartment_code in (
    select a.code from public.apartments a where a.client_id in (select public.my_client_ids())));

create policy owner_read on public.report_archive
  for select to authenticated using (client_id in (select public.my_client_ids()));

-- portal branding readable to any logged-in user
create policy portal_settings_read on public.portal_settings
  for select to authenticated using (true);

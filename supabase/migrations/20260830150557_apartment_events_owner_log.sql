-- Owner-visible log per apartment: repairs, visits, notes. Written by admin, read by owner.
create table if not exists public.apartment_events (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  apartment_code text not null,
  date date not null,
  kind text not null default 'note' check (kind in ('repair','visit','note','purchase')),
  title text not null,
  detail text,
  amount numeric,                -- Kč; positive = charged to owner (deducted), null/0 = informational
  visible_to_owner boolean not null default true,
  created_by_email text,
  created_at timestamptz not null default now()
);
create index if not exists apartment_events_apt_date on public.apartment_events(apartment_id, date);
alter table public.apartment_events enable row level security;
drop policy if exists admin_all on public.apartment_events;
create policy admin_all on public.apartment_events for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists owner_read on public.apartment_events;
create policy owner_read on public.apartment_events for select to authenticated
  using (visible_to_owner and apartment_id in (select a.id from public.apartments a where a.client_id in (select my_client_ids())));
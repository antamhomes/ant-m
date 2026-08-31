-- payout model per apartment: when guest_pays_cleaning = true the guest cleaning
-- fee goes to Antam (covers cleaning), owner is NOT charged a flat cleaning,
-- commission = commission_percent of (revenue - guest cleaning).
alter table public.apartments add column if not exists guest_pays_cleaning boolean not null default false;
alter table public.apartment_processes add column if not exists guest_pays_cleaning boolean not null default false;

-- owner self-service blocks (stay for own use)
create table if not exists public.owner_blocks (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  apartment_code text not null,
  client_id uuid references public.clients(id),
  start_date date not null,
  end_date date not null,          -- exclusive (checkout day)
  nights int generated always as (end_date - start_date) stored,
  note text,
  status text not null default 'active' check (status in ('active','cancelled')),
  created_by_email text,
  hospitable_synced_at timestamptz,
  hospitable_error text,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);
create index if not exists owner_blocks_apt_dates on public.owner_blocks(apartment_id, start_date, end_date);
alter table public.owner_blocks enable row level security;

drop policy if exists admin_all on public.owner_blocks;
create policy admin_all on public.owner_blocks for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists owner_read on public.owner_blocks;
create policy owner_read on public.owner_blocks for select to authenticated
  using (apartment_id in (select a.id from public.apartments a where a.client_id in (select my_client_ids())));

-- owners insert/cancel only through the edge function (service role); no direct write policy.
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references apartments(id),
  apartment_code text not null,
  code text not null,
  platform text not null,
  booking_date timestamptz,
  arrival date not null,
  departure date not null,
  nights int not null,
  guests int,
  currency text not null,
  status text not null default 'accepted',
  revenue numeric not null,
  cleaning_fee numeric not null default 0,
  synced_at timestamptz not null default now(),
  unique (apartment_id, code)
);
create index if not exists reservations_apt_arrival on reservations (apartment_id, arrival);

alter table reservations enable row level security;
-- TEMPORARY: matches the current blanket pattern so you can test as yourself.
-- MUST be replaced by the owner-scoped policy migration before any owner login exists.
create policy "authenticated full access" on reservations for all using (auth.role() = 'authenticated');

create table if not exists portal_settings (
  key text primary key,
  value text not null
);
insert into portal_settings values ('eur_rate','24.18') on conflict (key) do nothing;
alter table portal_settings enable row level security;
create policy "authenticated read settings" on portal_settings for select using (auth.role() = 'authenticated');

create or replace view owner_calendar with (security_invoker = true) as
select apartment_id, apartment_code, arrival, departure, nights, platform
from reservations where status = 'accepted';
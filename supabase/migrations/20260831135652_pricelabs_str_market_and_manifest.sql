-- Market baseline for the public calculator (spec antam_kalkulacka_spec_v1.md §3)
create table if not exists public.str_market (
  geo_id        text not null,             -- 'praha3', 'praha3_zizkov', 'praha'
  geo_level     text not null check (geo_level in ('ctvrt','okres','praha')),
  geo_label     text not null,             -- 'Žižkov'
  parent_geos   text[] not null default '{}', -- shrinkage parents; shared čtvrtě list several (Vinohrady: praha2, praha3, praha10)
  band          text not null check (band in ('1BR','2BR','3BR','all')),
  annual_rev    integer not null,          -- SUM of 12 monthly avg_revenue (CZK). Never RevPAR*365.
  n_listings    integer not null,          -- MIN active listings over the 12 months
  n_listings_max integer,
  annual_occ    numeric(5,2),
  annual_adr    integer,
  annual_revpar integer,
  reliable      boolean not null default true,
  months_from   text not null,             -- '2025_08'
  months_to     text not null,             -- '2026_07'
  monthly       jsonb,                     -- full 12-month series (occ, adr, revpar, active_listings, avg_revenue, ...)
  source_note   text,
  pulled_at     date not null,
  updated_at    timestamptz not null default now(),
  primary key (geo_id, band)
);
comment on table public.str_market is 'PriceLabs market_research baseline per geography and bedroom band. avg_revenue = revenue per active listing per calendar month (Airbnb/Vrbo calendars, cleaning excluded, part-time filtered). Public calculator reads annual_rev, n_listings, reliable, parent_geos.';

-- Pull queue / provenance for the neighbourhood pipeline
create table if not exists public.pl_manifest (
  slug            text primary key,        -- 'stare_mesto'
  name            text not null,           -- 'Staré Město'
  parent_districts text[] not null,        -- {'praha1'}
  batch           smallint not null,
  priority        smallint not null,
  status          text not null default 'pending' check (status in ('pending','geometry_selected','pulled','failed','skipped')),
  geometry_label  text,                    -- exact PriceLabs option label approved by Vuong
  geometry_token  text,                    -- last seen token (session-bound, informational)
  approved_by     text,
  approved_at     timestamptz,
  pulled_at       timestamptz,
  output_file     text,
  n_1br integer, n_2br integer, n_3br integer,
  warning         text,
  attempts        smallint not null default 0,
  last_error      text,
  updated_at      timestamptz not null default now()
);

alter table public.str_market enable row level security;
alter table public.pl_manifest enable row level security;
-- market data is public marketing information: allow anonymous read for the website calculator
create policy "str_market public read" on public.str_market for select using (true);
-- manifest: no anon access (service role only)
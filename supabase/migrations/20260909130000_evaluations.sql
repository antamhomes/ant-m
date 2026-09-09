-- Interní vyhodnocovač bytu, fáze 1 (docs/underwriting-mvp-spec.md §6).
-- Projekt: portál Antam Homes (lgjqhbdcjvxktdcqzeff). Spouštět RUČNĚ po revizi.
--
-- Immutabilita: tabulka NEMÁ policy pro DELETE a UPDATE povoluje jen sloupce
-- `action` a `note`, a to jen dokud je akce nerozhodnutá. Všechna počítaná pole
-- jsou tím zamčená: oprava vstupu vytvoří NOVÝ řádek, nepřepíše starý (I8).

create table if not exists public.evaluations (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  author               text not null default (auth.jwt() ->> 'email'),

  -- vstup
  address_raw          text not null default '',
  geo_source           text not null default 'manual' check (geo_source in ('manual','geocoded')),
  geo_confidence       numeric,
  district             text not null,
  ctvrt                text,
  size                 text not null check (size in ('1kk','2kk','3kk','4kk')),
  m2                   numeric not null check (m2 > 0),
  current_rent         numeric,

  -- provenience modelu
  model_version        text not null,
  data_window          text not null,

  -- výstup
  public_monthly       numeric,
  cons_low             numeric,
  cons_high            numeric,
  screening_baseline   numeric,
  ltr_monthly          numeric,
  energy_monthly       numeric,
  floor_monthly        numeric,
  buffer_czk           numeric,
  buffer_pct           numeric,
  cell_derived         boolean,
  n_min                integer,
  operator_factor_used numeric,
  operator_measured    boolean,
  confidence           text check (confidence in ('high','medium','low')),
  verdict              text not null check (verdict in ('worth','review','not_worth')),
  verdict_reason       text check (verdict_reason in ('thin_evidence','marginal_spread')),

  -- co s tím člověk udělal
  action               text not null default 'none' check (action in ('continue','discard','none')),
  source               text not null default 'phone' check (source in ('phone','web','agent','vn_network','referral')),
  note                 text
);

create index if not exists evaluations_created_at_idx on public.evaluations (created_at desc);
create index if not exists evaluations_verdict_idx    on public.evaluations (verdict);

alter table public.evaluations enable row level security;

-- Anonymní klient (ten, kterým web zrcadlí poptávky) sem nesmí vůbec.
revoke all on public.evaluations from anon;
revoke all on public.evaluations from public;

grant select, insert on public.evaluations to authenticated;
-- Sloupcový grant: po zápisu jde měnit JEN tohle.
grant update (action, note) on public.evaluations to authenticated;

drop policy if exists evaluations_admin_select on public.evaluations;
create policy evaluations_admin_select on public.evaluations
  for select to authenticated using (public.is_admin());

drop policy if exists evaluations_admin_insert on public.evaluations;
create policy evaluations_admin_insert on public.evaluations
  for insert to authenticated with check (public.is_admin());

-- Jen dokud je akce nerozhodnutá, a jen vlastní řádek.
drop policy if exists evaluations_admin_action on public.evaluations;
create policy evaluations_admin_action on public.evaluations
  for update to authenticated
  using (public.is_admin() and action = 'none')
  with check (public.is_admin());

-- ŽÁDNÁ delete policy. Mazat nejde ani adminovi.

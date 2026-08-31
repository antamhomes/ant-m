-- Step 0: importni cesta pro PriceLabs pully. Nemeni model ani ekonomiku
-- kalkulacky, jen zarucuje, ze co se do str_market zapise, jde prepocitat
-- ze suroveho artefaktu a ze opakovany pull nemuze tise prepsat historii.

-- 1. Prirozeny klic pullu. Obdobi nese existujici dvojice months_from/months_to;
-- druhou reprezentaci teze veci nezavadime.
alter table str_market add column if not exists source text not null default 'pricelabs';
comment on column str_market.source is
  'Dodavatel dat. Soucast prirozeneho klice pullu (geo_id, source, months_from, months_to, band).';

alter table str_market add column if not exists source_geometry text;
comment on column str_market.source_geometry is
  'Kanonicke ID polygonu u dodavatele (napr. vinohrady). Sdilena geometrie ma jedno source_geometry a nekolik geo_id (praha2_vinohrady, praha3_vinohrady), aby se kvota neutratila dvakrat za totez.';

alter table str_market drop constraint str_market_pkey;
alter table str_market add constraint str_market_pkey
  primary key (geo_id, source, months_from, months_to, band);

-- 2. pull_state je povinny a ma jen dva stavy. Zacina na partial, na complete
-- se prepina az kdyz cely pozadovany pull projde.
update str_market set pull_state = 'complete' where pull_state is null;
alter table str_market alter column pull_state set default 'partial';
alter table str_market alter column pull_state set not null;
alter table str_market add constraint str_market_pull_state_check
  check (pull_state in ('partial','complete'));

-- 3. reliable se NEVERI volajicimu. Trigger ho vzdycky prepocita z n_min,
-- check je pojistka. Prah 50 je HEURISTIC (viz docs/calculator-model.md).
create or replace function public.str_market_set_reliable() returns trigger
language plpgsql as $$
begin
  new.reliable := (new.n_min >= 50);
  return new;
end $$;
drop trigger if exists str_market_set_reliable on public.str_market;
create trigger str_market_set_reliable before insert or update on public.str_market
  for each row execute function public.str_market_set_reliable();
update str_market set reliable = (n_min >= 50);
alter table str_market add constraint str_market_reliable_derived
  check (reliable = (n_min >= 50));

-- 4. Radek zapsany novou importni cestou MUSI nest mesicni radu, jinak z nej
-- nejde n_mean ani n_min prepocitat. Stare radky maji import_version NULL.
alter table str_market add column if not exists import_version text;
comment on column str_market.import_version is
  'NULL = rucni import pred 1. 9. 2026, mesicni rada muze chybet. Neprazdna hodnota = zapsano importni cestou, ktera radu vyzaduje.';
alter table str_market add constraint str_market_series_required
  check (import_version is null or monthly is not null);

-- 5. Skutecna spotreba kvoty se zaznamenava po kazdem pullu, neodhaduje se.
create table if not exists public.pl_pull_log (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  source_geometry text,
  geo_ids text[] not null default '{}',
  bands text[] not null default '{}',
  requests_used integer,
  quota_note text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  outcome text not null default 'started'
    check (outcome in ('started','complete','partial','failed','dry_run')),
  notes text
);
comment on table public.pl_pull_log is
  'Jeden radek na pokus o pull. requests_used se vyplnuje ze skutecne spotreby po pullu, nikdy se neodhaduje dopredu.';
alter table public.pl_pull_log enable row level security;
drop policy if exists admin_all on public.pl_pull_log;
create policy admin_all on public.pl_pull_log for all to authenticated
  using (is_admin()) with check (is_admin());
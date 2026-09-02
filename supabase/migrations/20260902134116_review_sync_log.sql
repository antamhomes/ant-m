-- Log běhů sync-reviews (2. 9. 2026).
-- Existuje proto, že vývojové prostředí nemá do internetu přístup: funkci
-- nikdo z venku nezavolá a nepřečte její odpověď. Zápis do tabulky je jediný
-- způsob, jak se dá zpětně zjistit, co sync udělal a kde se zasekl.
create table if not exists public.review_sync_log (
  id            bigserial primary key,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  properties    int,
  fetched       int,
  kept          int,
  upserted      int,
  translated    int,
  translate_err text,
  error         text
);

comment on table public.review_sync_log is
  'Jeden řádek na běh sync-reviews. kept je počet recenzí, které prošly filtrem (Booking >= 8, Airbnb >= 4, neprázdný text); translate_err drží chybu DeepL, aniž by shodila celý běh, protože posbírat recenze má smysl i bez překladu.';

alter table public.review_sync_log enable row level security;

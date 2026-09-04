-- Pasmo 4BR do str_market. Sonda 4. 9. 2026 (Praha 1 nMin 94, Praha 2 nMin 27)
-- narazila na check constraint z 31. 8., ktery zna jen 1BR/2BR/3BR/all.
-- Jen rozsireni vyctu; zadna zmena semantiky, klice ani triggeru.
-- scripts/pl-derive.mjs BANDS uz 4BR obsahuje od zacatku.
alter table public.str_market drop constraint if exists str_market_band_check;
alter table public.str_market add constraint str_market_band_check
  check (band in ('1BR','2BR','3BR','4BR','all'));

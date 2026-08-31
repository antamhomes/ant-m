comment on table str_market is
  'DOWNSTREAM MIRROR, NENI AUTORITA (31. 8. 2026). Model pocita z data/pricelabs-2026-08/ a src/lib/yield.ts. Vznikla pro edge funkci public-calculator, ktera je retirovana (HTTP 410).';

alter table str_market rename column n_listings to n_min;
alter table str_market add column if not exists n_mean integer;

comment on column str_market.n_min is
  'Minimum aktivnich nabidek pres mesice okna. VYHRADNE brana spolehlivosti. Drive se jmenovalo n_listings, coz svadelo k zamene s prumerem v repu.';
comment on column str_market.n_mean is
  'Prumer aktivnich nabidek pres mesice okna. K vazeni (donor, shrinkage). NULL = pri puvodnim importu se neulozil.';
comment on column str_market.reliable is
  'ODVOZENE jednim pravidlem: n_min >= 50. Neuklada se jako nazor. Pred 31. 8. 2026 si tabulka odporovala: praha8/3BR n=41 true vs praha3/3BR n=42 false.';

update str_market set reliable = (n_min >= 50);

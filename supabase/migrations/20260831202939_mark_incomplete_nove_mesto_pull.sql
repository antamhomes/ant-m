alter table str_market add column if not exists pull_state text;
comment on column str_market.pull_state is
  'complete = vsechna tri pasma stazena. partial = pull nedokoncen, radky neuplne, model je nesmi pouzit.';

update str_market set pull_state = 'complete';

-- Nove Mesto ma jen 1BR a all, 2BR/3BR chybi: pull skoncil ve stavu
-- geometry_selected a nikdy se nedokoncil. Bylo to poznat jen tim, ze radky
-- chybi, coz je presne ten tichy stav, ktery nechceme.
update str_market set pull_state = 'partial'
where geo_id = 'praha1_nove_mesto';

update pl_manifest set warning = coalesce(warning || ' | ', '') ||
  'pull nedokoncen 31. 8. 2026: v str_market jsou jen 1BR a all, chybi 2BR a 3BR'
where slug = 'nove_mesto';

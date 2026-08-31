alter table public.ltr_rent
  add column if not exists is_estimate boolean not null default false,
  add column if not exists note text;
comment on column public.ltr_rent.is_estimate is 'true = not a published Deloitte district value; derived and to be replaced as soon as the real figure is available';

insert into public.ltr_rent (okres, czk_m2_month, source, period, is_estimate, note) values
('praha10', 451, 'Deloitte Rent Index (tisková zpráva)', '2026Q1', false, null),
('praha4', 437, 'odvozeno: Bohemian Estates 11/2025 (2+kk) kalibrováno na Deloitte', '2026Q1', true, 'Deloitte pro Prahu 4 nezveřejňuje v tiskové zprávě; nahradit skutečnou hodnotou z reportu'),
('praha6', 482, 'odvozeno: Bohemian Estates 11/2025 (2+kk) kalibrováno na Deloitte', '2026Q1', true, 'Deloitte pro Prahu 6 nezveřejňuje v tiskové zprávě; nahradit skutečnou hodnotou z reportu'),
('praha8', 404, 'odvozeno: Bohemian Estates 11/2025 (2+kk) kalibrováno na Deloitte', '2026Q1', true, 'Deloitte pro Prahu 8 nezveřejňuje v tiskové zprávě; nahradit skutečnou hodnotou z reportu')
on conflict (okres) do update set czk_m2_month=excluded.czk_m2_month, source=excluded.source, period=excluded.period, is_estimate=excluded.is_estimate, note=excluded.note, updated_at=now();

insert into public.calculator_params (model_version, is_current, params, notes)
select 'v1.1', false,
  jsonb_set(
    jsonb_set(params, '{band_ratio_fallback}',
      '{"2BR_over_1BR": 1.47, "3BR_over_2BR": 1.51, "3BR_over_1BR": 2.26, "min_n_for_district_ratio": 40,
        "measured_from": "okresy, kde jsou obě pásma spolehlivá a n>=40, Aug 2025-Jul 2026: 1BR->2BR mean 1.470 (sd 0.079, n=8), 2BR->3BR mean 1.512 (sd 0.051, n=4), 1BR->3BR mean 2.255 (sd 0.163, n=4)",
        "single_hop_only": true}'::jsonb),
    '{derived_band}', '{"widen_multiplier": 1.6, "note": "když se pásmo odvozuje z jiného pásma, rozpětí se rozšíří"}'::jsonb)
  ,
  'v1.1 (31.8.2026): 3BR se nikdy neodvozuje řetězením 1BR->2BR->3BR. Poměry jsou nově měřené z okresů, kde jsou obě pásma spolehlivá (ne odhadnuté). Přidán přímý poměr 1BR->3BR = 2.26. Odvozené pásmo dostává širší rozpětí. Jinak beze změny proti v1.0.'
from public.calculator_params where model_version = 'v1.0'
on conflict (model_version) do nothing;

update public.calculator_params set is_current = false where model_version = 'v1.0';
update public.calculator_params set is_current = true where model_version = 'v1.1';

select model_version, is_current, params->'band_ratio_fallback' as ratios, params->'derived_band' as derived from public.calculator_params order by model_version;
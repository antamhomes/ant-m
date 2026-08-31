-- Versioned parameter set for the public calculator (spec §4–§7). One row per model version; the website reads the row where is_current = true.
create table if not exists public.calculator_params (
  model_version   text primary key,          -- 'v1.0'
  is_current      boolean not null default false,
  params          jsonb not null,
  notes           text,
  created_at      timestamptz not null default now()
);
alter table public.calculator_params enable row level security;
create policy "calculator_params public read" on public.calculator_params for select using (true);

insert into public.calculator_params (model_version, is_current, params, notes) values (
  'v1.0', true,
  '{
    "operator_factor": {"praha1": 1.00, "praha2": 1.00, "default": 1.10},
    "operator_factor_conservative_centre": 0.90,
    "platform_fee": 0.15,
    "owner_share": 0.70,
    "presentation_band": {"low": 0.92, "high": 1.08, "five_plus_high": 1.15, "min_width": 0.08},
    "twokk_heuristic": {"m2_low": 45, "m2_high": 70, "low_bound_weight_multiplier": 0.5, "label": "HEURISTIC"},
    "shrinkage_weights": [{"min_n": 100, "w": 1.00}, {"min_n": 50, "w": 0.75}, {"min_n": 25, "w": 0.50}, {"min_n": 0, "w": 0.00}],
    "band_ratio_fallback": {"2BR_over_1BR": 1.45, "3BR_over_2BR": 1.50, "min_n_for_district_ratio": 40},
    "dispozice_to_band": {"1+kk": "1BR", "1+1": "1BR", "2+kk": "1BR_to_2BR", "2+1": "1BR_to_2BR", "3+kk": "2BR", "3+1": "2BR", "4+kk": "3BR", "4+1": "3BR", "5+": "3BR"},
    "slider": {"1+kk": [20,35,55], "2+kk": [35,55,85], "3+kk": [50,80,115], "4+kk": [70,105,140], "5+": [90,130,180], "unlock_range": [20,180]},
    "rounding": {"owner_czk": 1000, "ltr_czk": 500},
    "data_window": {"from": "2025_08", "to": "2026_07"}
  }'::jsonb,
  'Frozen 31.8.2026 from the 11-unit reconciliation (workbook v8). Centre factor 1.00 is a forward assumption pending post-August actuals; revisit after the October 2026 close.'
) on conflict (model_version) do nothing;

-- Every public estimate stored with a lead carries the model version and the exact inputs/outputs that produced it
alter table public.web_inquiries
  add column if not exists calc_model_version text,
  add column if not exists calc_inputs  jsonb,
  add column if not exists calc_result  jsonb;
comment on column public.web_inquiries.calc_model_version is 'calculator_params.model_version that produced the estimate shown to this lead';

alter table public.reservations
  add column if not exists revenue_czk numeric,
  add column if not exists cleaning_fee_czk numeric,
  add column if not exists fx_rate numeric;
comment on column public.reservations.fx_rate is 'CNB CZK per unit of currency at arrival date (1 for CZK); future arrivals use latest available rate until arrival passes';
-- existing CZK rows: czk = native, rate 1
update public.reservations
  set revenue_czk = revenue, cleaning_fee_czk = cleaning_fee, fx_rate = 1
  where currency = 'CZK' and revenue_czk is null;

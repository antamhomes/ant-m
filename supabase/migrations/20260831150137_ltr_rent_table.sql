create table if not exists public.ltr_rent (
  okres          text primary key,
  czk_m2_month   numeric(6,1) not null,
  source         text not null,
  period         text not null,
  updated_at     timestamptz not null default now()
);
comment on table public.ltr_rent is 'Long-term rent per m2 per district for the public calculator comparison line. Source: Deloitte Rent Index. A district without a row simply shows no rent line.';
alter table public.ltr_rent enable row level security;
create policy "ltr_rent public read" on public.ltr_rent for select using (true);

insert into public.ltr_rent (okres, czk_m2_month, source, period) values
('praha1', 505, 'Deloitte Rent Index (tisková zpráva)', '2026Q1'),
('praha2', 491, 'Deloitte Rent Index (tisková zpráva)', '2026Q1'),
('praha3', 479, 'Deloitte Rent Index (tisková zpráva)', '2026Q1'),
('praha5', 459, 'Deloitte Rent Index (tisková zpráva)', '2026Q1'),
('praha7', 493, 'Deloitte Rent Index (tisková zpráva)', '2026Q2'),
('praha9', 468, 'Deloitte Rent Index (tisková zpráva)', '2026Q2')
on conflict (okres) do nothing;
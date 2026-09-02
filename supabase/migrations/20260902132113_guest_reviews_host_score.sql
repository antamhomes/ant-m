-- Řazení recenzí podle toho, jestli chválí obsluhu, ne byt (2. 9. 2026).
-- Recenze na výhled a polohu chválí majitelův byt. Recenze na komunikaci,
-- check-in a personál chválí práci Antamu, a ta má na webu vést.
alter table public.guest_reviews
  add column if not exists detail      jsonb,
  add column if not exists host_score  numeric(4,3),
  add column if not exists host_rated  int not null default 0;

comment on column public.guest_reviews.detail is
  'Původní detailed_ratings z Hospitable, kvůli dohledatelnosti skóre.';
comment on column public.guest_reviews.host_score is
  'Průměr kategorií o obsluze (communication, checkin, staff, services) na škále 0-1. POZOR: platforma posílá 0 u kategorie, kterou host NEHODNOTIL, ne jako nulu. Nuly se proto do průměru nezapočítávají, jinak by Booking recenze se staff 10 a communication 0 vyšla jako průměrná.';
comment on column public.guest_reviews.host_rated is
  'Kolik kategorií o obsluze host skutečně ohodnotil. Nula znamená, že se recenze řadí jen podle data, protože o naší práci neříká nic.';

create index if not exists guest_reviews_praise_idx
  on public.guest_reviews (host_score desc nulls last, reviewed_at desc);

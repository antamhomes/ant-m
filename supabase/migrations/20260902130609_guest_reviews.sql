-- Recenze hostů pro veřejný web (2. 9. 2026).
-- Zdroj je Hospitable, plní to noční sync. Web na tabulku nesahá přímo,
-- čte přes edge funkci se service_role, stejně jako dřív public-calculator.
-- Proto tu není žádná anon policy: RLS je zapnutá a veřejný přístup nemá cestu.
create table if not exists public.guest_reviews (
  id                text primary key,                    -- review id z Hospitable
  property_uuid     text not null,
  platform          text not null check (platform in ('airbnb','booking','other')),
  rating            numeric(3,2) not null,               -- normalizovaná škála 1-5
  rating_original   numeric(4,2),                        -- původní škála platformy (Booking 0-10)
  text_orig         text not null,
  lang_orig         text,
  text_cs           text,
  text_vi           text,
  translated_at     timestamptz,
  reviewed_at       timestamptz not null,
  synced_at         timestamptz not null default now()
);

comment on table public.guest_reviews is
  'Recenze hostů z Hospitable pro sekci na webu. Filtr kvality se drží v dotazu, ne tady: Booking >= 8 z rating_original, Airbnb >= 4 z rating, a text_orig nesmí být prázdný (velká část recenzí text nemá). Jména hostů se schválně neukládají.';
comment on column public.guest_reviews.rating_original is
  'Původní hodnota platformy. Booking jede 0-10, Airbnb 1-5. Filtr pro Booking se počítá odsud, ne z normalizovaného ratingu.';
comment on column public.guest_reviews.text_cs is
  'Český překlad. Recenze chodí v mnoha jazycích, web je ukazuje přeložené a označené "přeloženo", stejně jako dosavadní citace hosta.';

create index if not exists guest_reviews_recent_idx
  on public.guest_reviews (reviewed_at desc);

alter table public.guest_reviews enable row level security;

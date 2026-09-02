-- Pořadí recenzí pro web (2. 9. 2026).
--
-- Vuong chtěl "boostnout ty, co chválí hosta", tedy naši práci, ne byt.
-- Kategorie z platformy na to samy nestačí: staff = 10 dá i host, který pak
-- napíše o poloze a parkování, a kategorii o obsluze má 516 z 523 recenzí,
-- takže neroztřídí skoro nic. Proto se skóruje i text.
--
-- Text se čte z českého překladu, ne z originálu: recenze chodí ve třinácti
-- jazycích a jeden český slovník je zvládne všechny naráz.
create or replace view public.public_reviews_ranked as
select
  id, platform, rating, rating_original, lang_orig,
  text_orig, text_cs, text_vi, reviewed_at, host_score, host_rated,
  (text_cs ~* '(hostitel|majitel|ochotn|vstřícn|komunikac|odpověd|reagov|personál|úklid|čist|doporuč|pomoh|milý|přátelsk)') as praises_host,
  (text_cs ~* '(polohu|poloha|lokalit|parkován|výhled|centrum)') as praises_place
from public.guest_reviews
where translated_at is not null
  and length(coalesce(text_cs, '')) >= 40
  and reviewed_at > now() - interval '24 months';

comment on view public.public_reviews_ranked is
  'Recenze připravené pro web. Filtr kvality (Booking >= 8, Airbnb >= 4, neprázdný text) už proběhl při syncu; tady se přidává jen délka textu, časové okno a signál, jestli recenze mluví o naší práci. Řazení dělá endpoint: praises_host desc, host_score desc, reviewed_at desc.';

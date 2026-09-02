-- str_market_no_history_rewrite: dovolit DOPLNENI null -> hodnota konzistentne.
--
-- Trigger uz vyjimku mel, ale jen pro n_mean a monthly. Pro annual_adr,
-- annual_revpar a annual_occ ne, prestoze jde o tutez tridu doplneni:
-- stary radek ze Step 0 vznikl pred zavedenim mesicni rady, takze tahle tri
-- pole ma proste NULL. Pri importu Noveho Mesta 2. 9. 2026 to zastavilo
-- celou transakci, i kdyz se annual_rev ani n_min nemenily.
--
-- Co se NEMENI: prepis uz vyplnene hodnoty zustava zakazany u vsech poli.
-- annual_rev a n_min zustavaji uplne prisne (jsou to jadro radku, NULL tam
-- nikdy nebyl a nema byt).
--
-- Zamerne se NEPOUZIVA antam.allow_history_rewrite: ten vypina ochranu
-- na celou transakci, takze by kryl i skutecny prepis historie.

create or replace function public.str_market_no_history_rewrite()
returns trigger
language plpgsql
as $function$
declare
  changed text[] := '{}';
begin
  if coalesce(current_setting('antam.allow_history_rewrite', true), 'off') = 'on' then
    return new;
  end if;

  -- Jadro radku: jakakoli zmena je prepis historie.
  if new.annual_rev is distinct from old.annual_rev then changed := array_append(changed, 'annual_rev'); end if;
  if new.n_min      is distinct from old.n_min      then changed := array_append(changed, 'n_min');      end if;

  -- Doplnitelna pole: NULL -> hodnota je obohaceni stareho radku a projde.
  -- Zmena uz vyplnene hodnoty je porad prepis historie a zastavi se.
  if old.n_mean        is not null and new.n_mean        is distinct from old.n_mean        then changed := array_append(changed, 'n_mean');        end if;
  if old.monthly       is not null and new.monthly       is distinct from old.monthly       then changed := array_append(changed, 'monthly');       end if;
  if old.annual_adr    is not null and new.annual_adr    is distinct from old.annual_adr    then changed := array_append(changed, 'annual_adr');    end if;
  if old.annual_revpar is not null and new.annual_revpar is distinct from old.annual_revpar then changed := array_append(changed, 'annual_revpar'); end if;
  if old.annual_occ    is not null and new.annual_occ    is distinct from old.annual_occ    then changed := array_append(changed, 'annual_occ');    end if;

  if array_length(changed, 1) > 0 then
    raise exception 'str_market %/% (source %, % az %): opakovany pull meni jiz ulozena data (%). Zastaveno, aby se historie neprepsala tise. Kdyz je to zamer: set local antam.allow_history_rewrite = ''on''.',
      old.geo_id, old.band, old.source, old.months_from, old.months_to, array_to_string(changed, ', ');
  end if;
  return new;
end $function$;

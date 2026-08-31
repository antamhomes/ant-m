-- Oprava str_market_no_history_rewrite: `changed || 'annual_rev'` bral Postgres
-- jako pole, ne jako prvek, takze trigger sice zapis zastavil (fail-safe), ale
-- s hlaskou "malformed array literal" misto vysvetleni, co se meni. Explicitni
-- ::text pridava prvek. Chovani se nemeni, mus jen rekne pravdu.
create or replace function public.str_market_no_history_rewrite() returns trigger
language plpgsql as $$
declare
  changed text[] := '{}';
begin
  if coalesce(current_setting('antam.allow_history_rewrite', true), 'off') = 'on' then
    return new;
  end if;
  if new.annual_rev    is distinct from old.annual_rev    then changed := array_append(changed, 'annual_rev');    end if;
  if new.n_min         is distinct from old.n_min         then changed := array_append(changed, 'n_min');         end if;
  if new.annual_adr    is distinct from old.annual_adr    then changed := array_append(changed, 'annual_adr');    end if;
  if new.annual_revpar is distinct from old.annual_revpar then changed := array_append(changed, 'annual_revpar'); end if;
  if new.annual_occ    is distinct from old.annual_occ    then changed := array_append(changed, 'annual_occ');    end if;
  -- n_mean a monthly smi jit z NULL na hodnotu (doplneni rady ke staremu radku),
  -- prepis uz vyplnene hodnoty jde jen pres explicitni override.
  if old.n_mean  is not null and new.n_mean  is distinct from old.n_mean  then changed := array_append(changed, 'n_mean');  end if;
  if old.monthly is not null and new.monthly is distinct from old.monthly then changed := array_append(changed, 'monthly'); end if;

  if array_length(changed, 1) > 0 then
    raise exception 'str_market %/% (source %, % az %): opakovany pull meni jiz ulozena data (%). Zastaveno, aby se historie neprepsala tise. Kdyz je to zamer: set local antam.allow_history_rewrite = ''on''.',
      old.geo_id, old.band, old.source, old.months_from, old.months_to, array_to_string(changed, ', ');
  end if;
  return new;
end $$;
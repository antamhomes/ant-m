-- Opakovany pull TEHOZ prirozeneho klice smi radek prepsat jen tehdy, kdyz se
-- odvozena cisla nezmenila (idempotentni rerun). Kdyz se zmenila, znamena to,
-- ze dodavatel prepsal historii tehoz okna - to je zastaveni, ne tichy prepis.
-- Novy pull jineho obdobi ma jiny klic, takze je to INSERT a tenhle trigger se
-- ho netyka. Vedomy prepis: set local antam.allow_history_rewrite = 'on'.
create or replace function public.str_market_no_history_rewrite() returns trigger
language plpgsql as $$
declare
  changed text[] := '{}';
begin
  if coalesce(current_setting('antam.allow_history_rewrite', true), 'off') = 'on' then
    return new;
  end if;
  if new.annual_rev    is distinct from old.annual_rev    then changed := changed || 'annual_rev';    end if;
  if new.n_min         is distinct from old.n_min         then changed := changed || 'n_min';         end if;
  if new.annual_adr    is distinct from old.annual_adr    then changed := changed || 'annual_adr';    end if;
  if new.annual_revpar is distinct from old.annual_revpar then changed := changed || 'annual_revpar'; end if;
  if new.annual_occ    is distinct from old.annual_occ    then changed := changed || 'annual_occ';    end if;
  -- n_mean a monthly smi jit z NULL na hodnotu (doplneni rady ke staremu radku),
  -- ale uz vyplnenou hodnotu prepsat necham jen pres explicitni override.
  if old.n_mean is not null and new.n_mean is distinct from old.n_mean then changed := changed || 'n_mean'; end if;
  if old.monthly is not null and new.monthly is distinct from old.monthly then changed := changed || 'monthly'; end if;

  if array_length(changed, 1) > 0 then
    raise exception
      'str_market %/%/% (% az %): opakovany pull meni jiz ulozena data (%). Zastaveno, aby se historie neprepsala tise. Kdyz je to zamer: set local antam.allow_history_rewrite = ''on''.',
      old.geo_id, old.band, old.source, old.months_from, old.months_to, array_to_string(changed, ', ');
  end if;
  return new;
end $$;

drop trigger if exists str_market_no_history_rewrite on public.str_market;
create trigger str_market_no_history_rewrite before update on public.str_market
  for each row execute function public.str_market_no_history_rewrite();
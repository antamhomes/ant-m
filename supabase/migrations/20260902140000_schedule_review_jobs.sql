-- Noční sync recenzí a dočasné dohnání překladů (2. 9. 2026).
--
-- Stejný vzorec jako sync-hospitable: service role klíč se čte z Vaultu,
-- takže nesedí v plain textu v cron.job.
--
-- Čas 03:40 je schválně za sync-hospitable (03:15): obě funkce sahají na
-- stejné Hospitable API a nemá smysl je pouštět proti sobě.
select cron.schedule(
  'sync-reviews',
  '40 3 * * *',
  $CRON$
  select net.http_post(
    url := 'https://lgjqhbdcjvxktdcqzeff.supabase.co/functions/v1/sync-reviews',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'service_role_key' limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 180000
  );
  $CRON$
);

-- Dočasná úloha: dožene překlady u recenzí, které se nasbíraly dřív,
-- než byl DeepL zapojený. Bere 200 na běh. Až doběhne, je to prázdná
-- operace, ale i tak se má odplánovat:
--   select cron.unschedule('translate-backfill');
select cron.schedule(
  'translate-backfill',
  '*/10 * * * *',
  $CRON$
  select net.http_post(
    url := 'https://lgjqhbdcjvxktdcqzeff.supabase.co/functions/v1/translate-backfill',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'service_role_key' limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 180000
  );
  $CRON$
);

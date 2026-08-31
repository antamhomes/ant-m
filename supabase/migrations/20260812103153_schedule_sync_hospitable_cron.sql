
-- Nightly sync at 03:15. Reads the service role key from Vault
-- (secret name 'service_role_key') so it never sits in plaintext in
-- the cron.job table. Job is created now; it will error harmlessly
-- until the Vault secret exists, then run every night.
select cron.schedule(
  'sync-hospitable',
  '15 3 * * *',
  $CRON$
  select net.http_post(
    url := 'https://lgjqhbdcjvxktdcqzeff.supabase.co/functions/v1/sync-hospitable',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'service_role_key' limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $CRON$
);

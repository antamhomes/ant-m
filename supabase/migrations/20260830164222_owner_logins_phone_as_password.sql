-- Owner login = e-mail + password (password = phone from clients).
-- Kept in sync by edge fn sync-owner-logins: nightly + on every clients change.

create or replace function public.call_sync_owner_logins()
returns void language sql security definer set search_path = public as $$
  select net.http_post(
    url := 'https://lgjqhbdcjvxktdcqzeff.supabase.co/functions/v1/sync-owner-logins',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'service_role_key' limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
$$;
revoke all on function public.call_sync_owner_logins() from public, anon, authenticated;

-- trigger: any insert / change of email or phone in clients re-syncs logins
create or replace function public.tg_clients_sync_logins()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.call_sync_owner_logins();
  return null;
end $$;

drop trigger if exists clients_sync_logins on public.clients;
create trigger clients_sync_logins
  after insert or update of email, phone on public.clients
  for each statement execute function public.tg_clients_sync_logins();

-- nightly safety net, 10 min after the Hospitable sync
select cron.unschedule(jobid) from cron.job where jobname = 'sync-owner-logins';
select cron.schedule('sync-owner-logins', '25 3 * * *', $$select public.call_sync_owner_logins();$$);
-- Bhuk Foods — Step 9: pg_cron schedules (applied 2026-05-25).
-- Times in UTC because pg_cron's daemon runs in UTC; IST = UTC + 5:30.
--
--   Job A bhuk_daily_charge    22:30 IST = 17:00 UTC   '0 17 * * *'
--   Job B bhuk_sixteen_hundred 16:00 IST = 10:30 UTC   '30 10 * * *'
--   Job C bhuk_cook_sheet      16:30 IST = 11:00 UTC   '0 11 * * *'
--   Job D bhuk_low_balance     Mon 19:00 IST = Mon 13:30 UTC  '30 13 * * 1'
--
-- The Bearer token is read from Supabase Vault at job time:
--
--   select vault.create_secret(
--     '<generated CRON_SECRET>',
--     'bhuk_cron_secret',
--     'Bearer secret shared between pg_cron and /api/cron/*'
--   );
--
-- The secret is NEVER stored in this file. Rotate by updating the vault row.

create or replace function public.bhuk_cron_bearer()
returns text
language sql
security definer
stable
set search_path = public, vault
as $$
  select 'Bearer ' || decrypted_secret
  from vault.decrypted_secrets
  where name = 'bhuk_cron_secret'
  limit 1
$$;

revoke execute on function public.bhuk_cron_bearer() from public, anon, authenticated;

-- Idempotent: drop any prior bhuk_* schedules first.
do $$
declare j record;
begin
  for j in select jobname from cron.job where jobname like 'bhuk_%' loop
    perform cron.unschedule(j.jobname);
  end loop;
end $$;

select cron.schedule(
  'bhuk_daily_charge',
  '0 17 * * *',
  $cmd$
    select net.http_post(
      url := 'https://www.bhukfoods.com/api/cron/daily-charge',
      headers := jsonb_build_object(
        'Authorization', public.bhuk_cron_bearer(),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $cmd$
);

select cron.schedule(
  'bhuk_sixteen_hundred',
  '30 10 * * *',
  $cmd$
    select net.http_post(
      url := 'https://www.bhukfoods.com/api/cron/sixteen-hundred',
      headers := jsonb_build_object(
        'Authorization', public.bhuk_cron_bearer(),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $cmd$
);

select cron.schedule(
  'bhuk_cook_sheet',
  '0 11 * * *',
  $cmd$
    select net.http_post(
      url := 'https://www.bhukfoods.com/api/cron/cook-sheet',
      headers := jsonb_build_object(
        'Authorization', public.bhuk_cron_bearer(),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $cmd$
);

select cron.schedule(
  'bhuk_low_balance',
  '30 13 * * 1',
  $cmd$
    select net.http_post(
      url := 'https://www.bhukfoods.com/api/cron/low-balance',
      headers := jsonb_build_object(
        'Authorization', public.bhuk_cron_bearer(),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $cmd$
);

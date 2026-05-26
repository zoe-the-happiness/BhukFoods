-- Bhuk Foods — Step 9 follow-up
-- pg_cron stopped firing the 16:00 IST and 16:30 IST jobs after they were
-- first registered in bhuk_009. Symptoms: cron.job_run_details has no
-- entries for jobids 2 + 3 (bhuk_sixteen_hundred + bhuk_cook_sheet) even
-- though their schedules are valid and their times have passed.
--
-- Workaround: unschedule + reschedule. pg_cron picks up the fresh entries.
-- (The other two jobs — daily_charge and low_balance — fire normally and
-- don't need the dance.)

do $$
begin
  perform cron.unschedule('bhuk_sixteen_hundred');
  perform cron.unschedule('bhuk_cook_sheet');
exception when others then null;
end $$;

select cron.schedule(
  'bhuk_sixteen_hundred',
  '30 10 * * *',  -- 10:30 UTC = 16:00 IST
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
  '0 11 * * *',   -- 11:00 UTC = 16:30 IST
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

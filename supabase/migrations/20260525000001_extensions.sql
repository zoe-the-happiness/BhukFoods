-- Bhuk Foods — Step 1
-- Required extensions.
-- pgcrypto for gen_random_uuid(); pg_cron for scheduled jobs; pg_net for HTTPS calls from cron.

create extension if not exists pgcrypto;
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

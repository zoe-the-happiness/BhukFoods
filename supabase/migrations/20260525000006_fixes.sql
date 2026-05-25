-- Bhuk Foods — Step 1 fixes (applied 2026-05-25)
-- 1) Use clock_timestamp() so rows inserted in the same transaction get
--    unique, monotonically-increasing created_at values. The ledger
--    balance_after trigger relies on ordering and `now()` is transaction-
--    scoped (returns the same value for every row in a tx).
-- 2) Pin `set search_path` on the four helper functions that were missing it
--    so the linter is happy and we cannot be tricked by a schema-shadow.
-- 3) Revoke EXECUTE from anon/authenticated on the trigger-only functions
--    that were auto-exposed via /rest/v1/rpc/...

alter table public.ledger
  alter column created_at set default clock_timestamp();

create or replace function public.ist_now()
returns timestamp
language sql
stable
set search_path = public
as $$
  select (timezone('Asia/Kolkata', now()))::timestamp
$$;

create or replace function public.ist_today()
returns date
language sql
stable
set search_path = public
as $$
  select (timezone('Asia/Kolkata', now()))::date
$$;

create or replace function public.can_customer_cancel(p_service_date date)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    p_service_date > public.ist_today()
    and public.ist_now() < ((p_service_date - 1)::timestamp + interval '16 hours')
$$;

create or replace function public.ledger_block_modify()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'ledger is append-only — insert a correcting row instead';
end;
$$;

revoke execute on function public.ledger_compute_balance_after() from anon, authenticated;
revoke execute on function public.ledger_block_modify() from anon, authenticated;
revoke execute on function public.profiles_enforce_immutable_fields() from anon, authenticated;

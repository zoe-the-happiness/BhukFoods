-- Bhuk Foods — Step 1 polish (applied 2026-05-25)
-- A) Fully lock trigger-only functions: REVOKE EXECUTE from PUBLIC so they
--    cannot be called via /rest/v1/rpc/... (they only run from triggers).
-- B) Rewrite the six RLS policies that call auth.uid() to use
--    `(select auth.uid())` so PG caches the result per query instead of
--    re-evaluating per row.

revoke execute on function public.ledger_compute_balance_after() from public;
revoke execute on function public.ledger_block_modify() from public;
revoke execute on function public.profiles_enforce_immutable_fields() from public;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists ledger_customer_select on public.ledger;
create policy ledger_customer_select on public.ledger
  for select to authenticated
  using (user_id = (select auth.uid()) and public.my_role() = 'customer');

drop policy if exists meal_exceptions_customer_select on public.meal_exceptions;
create policy meal_exceptions_customer_select on public.meal_exceptions
  for select to authenticated
  using (
    public.my_role() = 'customer'
    and (user_id = (select auth.uid()) or user_id is null)
  );

drop policy if exists meal_exceptions_customer_insert on public.meal_exceptions;
create policy meal_exceptions_customer_insert on public.meal_exceptions
  for insert to authenticated
  with check (
    public.my_role() = 'customer'
    and user_id = (select auth.uid())
    and kind = 'customer_cancel'
    and public.can_customer_cancel(service_date)
  );

drop policy if exists meal_exceptions_customer_delete on public.meal_exceptions;
create policy meal_exceptions_customer_delete on public.meal_exceptions
  for delete to authenticated
  using (
    public.my_role() = 'customer'
    and user_id = (select auth.uid())
    and kind = 'customer_cancel'
    and public.can_customer_cancel(service_date)
  );

drop policy if exists push_subscriptions_self_all on public.push_subscriptions;
create policy push_subscriptions_self_all on public.push_subscriptions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

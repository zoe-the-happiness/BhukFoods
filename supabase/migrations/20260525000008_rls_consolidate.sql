-- Bhuk Foods — Step 1 polish: consolidate RLS so each (table, action) has
-- exactly one permissive policy. Previously admin's FOR ALL overlapped with
-- role-specific policies, generating duplicate evaluations at scale.
-- Also adds covering indexes for the four FKs that the perf advisor flagged.

------------------------------------------------------------ profiles
drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_self_select on public.profiles;
drop policy if exists profiles_self_update on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    public.my_role() = 'admin'
    or id = (select auth.uid())
  );

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (public.my_role() = 'admin');

create policy profiles_update on public.profiles
  for update to authenticated
  using (
    public.my_role() = 'admin'
    or id = (select auth.uid())
  )
  with check (
    public.my_role() = 'admin'
    or id = (select auth.uid())
  );

create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.my_role() = 'admin');

------------------------------------------------------------ ledger
drop policy if exists ledger_admin_all on public.ledger;
drop policy if exists ledger_customer_select on public.ledger;

create policy ledger_select on public.ledger
  for select to authenticated
  using (
    public.my_role() = 'admin'
    or (public.my_role() = 'customer' and user_id = (select auth.uid()))
  );

create policy ledger_insert on public.ledger
  for insert to authenticated
  with check (public.my_role() = 'admin');

create policy ledger_update on public.ledger
  for update to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

create policy ledger_delete on public.ledger
  for delete to authenticated
  using (public.my_role() = 'admin');

------------------------------------------------------------ meal_exceptions
drop policy if exists meal_exceptions_admin_all on public.meal_exceptions;
drop policy if exists meal_exceptions_customer_select on public.meal_exceptions;
drop policy if exists meal_exceptions_customer_insert on public.meal_exceptions;
drop policy if exists meal_exceptions_customer_delete on public.meal_exceptions;
drop policy if exists meal_exceptions_cook_insert on public.meal_exceptions;
drop policy if exists meal_exceptions_cook_select on public.meal_exceptions;

create policy meal_exceptions_select on public.meal_exceptions
  for select to authenticated
  using (
    public.my_role() = 'admin'
    or (
      public.my_role() = 'customer'
      and (user_id = (select auth.uid()) or user_id is null)
    )
    or (public.my_role() = 'cook' and user_id is null)
  );

create policy meal_exceptions_insert on public.meal_exceptions
  for insert to authenticated
  with check (
    public.my_role() = 'admin'
    or (
      public.my_role() = 'customer'
      and user_id = (select auth.uid())
      and kind = 'customer_cancel'
      and public.can_customer_cancel(service_date)
    )
    or (
      public.my_role() = 'cook'
      and kind = 'cook_leave_global'
      and user_id is null
      and service_date = public.ist_today()
    )
  );

create policy meal_exceptions_update on public.meal_exceptions
  for update to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

create policy meal_exceptions_delete on public.meal_exceptions
  for delete to authenticated
  using (
    public.my_role() = 'admin'
    or (
      public.my_role() = 'customer'
      and user_id = (select auth.uid())
      and kind = 'customer_cancel'
      and public.can_customer_cancel(service_date)
    )
  );

------------------------------------------------------------ push_subscriptions
drop policy if exists push_subscriptions_self_all on public.push_subscriptions;
drop policy if exists push_subscriptions_admin_select on public.push_subscriptions;

create policy push_subscriptions_select on public.push_subscriptions
  for select to authenticated
  using (
    public.my_role() = 'admin'
    or user_id = (select auth.uid())
  );

create policy push_subscriptions_insert on public.push_subscriptions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy push_subscriptions_update on public.push_subscriptions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy push_subscriptions_delete on public.push_subscriptions
  for delete to authenticated
  using (
    public.my_role() = 'admin'
    or user_id = (select auth.uid())
  );

------------------------------------------------------------ FK covering indexes
create index if not exists email_templates_updated_by_idx on public.email_templates (updated_by);
create index if not exists ledger_created_by_idx on public.ledger (created_by);
create index if not exists meal_exceptions_created_by_idx on public.meal_exceptions (created_by);
create index if not exists pending_subscribers_activated_user_idx on public.pending_subscribers (activated_user_id);

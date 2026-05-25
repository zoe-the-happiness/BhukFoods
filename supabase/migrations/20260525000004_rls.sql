-- Bhuk Foods — Step 1
-- Row Level Security policies. All money operations are admin-only at the database layer.

------------------------------------------------------------
-- profiles
------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- Immutability of role / is_active / delivery_fee_per_day is enforced by
-- trg_profiles_immutable trigger in 20260525000003_functions.sql.

------------------------------------------------------------
-- ledger — customers read-only; no inserts allowed for customers; admin full.
------------------------------------------------------------
alter table public.ledger enable row level security;

drop policy if exists ledger_admin_all on public.ledger;
create policy ledger_admin_all on public.ledger
  for all to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

drop policy if exists ledger_customer_select on public.ledger;
create policy ledger_customer_select on public.ledger
  for select to authenticated
  using (user_id = auth.uid() and public.my_role() = 'customer');
-- No INSERT policy for customers ⇒ customers cannot insert. Cooks have no policies ⇒ no access.

------------------------------------------------------------
-- meal_exceptions
------------------------------------------------------------
alter table public.meal_exceptions enable row level security;

drop policy if exists meal_exceptions_admin_all on public.meal_exceptions;
create policy meal_exceptions_admin_all on public.meal_exceptions
  for all to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

drop policy if exists meal_exceptions_customer_select on public.meal_exceptions;
create policy meal_exceptions_customer_select on public.meal_exceptions
  for select to authenticated
  using (
    public.my_role() = 'customer'
    and (user_id = auth.uid() or user_id is null)
  );

-- Customers may insert ONLY their own customer_cancel for a future service date,
-- and only before 16:00 IST on the day before.
drop policy if exists meal_exceptions_customer_insert on public.meal_exceptions;
create policy meal_exceptions_customer_insert on public.meal_exceptions
  for insert to authenticated
  with check (
    public.my_role() = 'customer'
    and user_id = auth.uid()
    and kind = 'customer_cancel'
    and public.can_customer_cancel(service_date)
  );

-- Customers may delete their own future customer_cancel rows
-- (uncancel) but only while the 16:00 cutoff for that date is still open.
drop policy if exists meal_exceptions_customer_delete on public.meal_exceptions;
create policy meal_exceptions_customer_delete on public.meal_exceptions
  for delete to authenticated
  using (
    public.my_role() = 'customer'
    and user_id = auth.uid()
    and kind = 'customer_cancel'
    and public.can_customer_cancel(service_date)
  );

-- Cooks: insert only global panic button for today, select only global rows.
drop policy if exists meal_exceptions_cook_insert on public.meal_exceptions;
create policy meal_exceptions_cook_insert on public.meal_exceptions
  for insert to authenticated
  with check (
    public.my_role() = 'cook'
    and kind = 'cook_leave_global'
    and user_id is null
    and service_date = public.ist_today()
  );

drop policy if exists meal_exceptions_cook_select on public.meal_exceptions;
create policy meal_exceptions_cook_select on public.meal_exceptions
  for select to authenticated
  using (public.my_role() = 'cook' and user_id is null);

------------------------------------------------------------
-- pending_subscribers — admin only (form inserts use service role).
------------------------------------------------------------
alter table public.pending_subscribers enable row level security;

drop policy if exists pending_subscribers_admin_all on public.pending_subscribers;
create policy pending_subscribers_admin_all on public.pending_subscribers
  for all to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');
-- Anonymous form submissions hit this table via a server route that uses the service role key,
-- which bypasses RLS. No anon policy is necessary.

------------------------------------------------------------
-- email_templates — admin only.
------------------------------------------------------------
alter table public.email_templates enable row level security;

drop policy if exists email_templates_admin_all on public.email_templates;
create policy email_templates_admin_all on public.email_templates
  for all to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

------------------------------------------------------------
-- push_subscriptions — each user manages own rows.
------------------------------------------------------------
alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_self_all on public.push_subscriptions;
create policy push_subscriptions_self_all on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists push_subscriptions_admin_select on public.push_subscriptions;
create policy push_subscriptions_admin_select on public.push_subscriptions
  for select to authenticated
  using (public.my_role() = 'admin');

------------------------------------------------------------
-- cook_sheets — admin only; cooks read via signed URL fetched server-side.
------------------------------------------------------------
alter table public.cook_sheets enable row level security;

drop policy if exists cook_sheets_admin_all on public.cook_sheets;
create policy cook_sheets_admin_all on public.cook_sheets
  for all to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

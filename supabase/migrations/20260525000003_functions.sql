-- Bhuk Foods — Step 1
-- Helper functions and triggers. All time logic anchored to Asia/Kolkata.

------------------------------------------------------------
-- my_role() — role of the current authenticated user
------------------------------------------------------------
create or replace function public.my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

------------------------------------------------------------
-- ist_now() / ist_today() — wall clock in Asia/Kolkata
------------------------------------------------------------
create or replace function public.ist_now()
returns timestamp
language sql
stable
as $$
  select (timezone('Asia/Kolkata', now()))::timestamp
$$;

create or replace function public.ist_today()
returns date
language sql
stable
as $$
  select (timezone('Asia/Kolkata', now()))::date
$$;

------------------------------------------------------------
-- can_customer_cancel(p_service_date date)
-- True only if current IST time is strictly before 16:00 on (service_date - 1).
------------------------------------------------------------
create or replace function public.can_customer_cancel(p_service_date date)
returns boolean
language sql
stable
as $$
  select
    p_service_date > public.ist_today()
    and public.ist_now() < ((p_service_date - 1)::timestamp + interval '16 hours')
$$;

------------------------------------------------------------
-- get_meal_balance(p_user_id) / get_sd_balance(p_user_id)
-- Latest balance_after for each bucket, 0 if no rows.
------------------------------------------------------------
create or replace function public.get_meal_balance(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select balance_after from public.ledger
       where user_id = p_user_id and bucket = 'meal'
       order by created_at desc, id desc
       limit 1), 0)
$$;

create or replace function public.get_sd_balance(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select balance_after from public.ledger
       where user_id = p_user_id and bucket = 'sd'
       order by created_at desc, id desc
       limit 1), 0)
$$;

------------------------------------------------------------
-- days_remaining(p_user_id)
-- floor(meal_balance / (100 + delivery_fee_per_day))
------------------------------------------------------------
create or replace function public.days_remaining(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.delivery_fee_per_day is null then 0
    else floor(public.get_meal_balance(p_user_id)::numeric / (100 + p.delivery_fee_per_day))::int
  end
  from public.profiles p where p.id = p_user_id
$$;

------------------------------------------------------------
-- Ledger insert trigger — compute balance_after server-side.
-- Direction by type:
--   credits (+amount): credit, sd_deposit, adjustment
--   debits  (-amount): meal_charge, delivery_charge, refund, damage_deduction, sd_refund
-- 'adjustment' defaults to credit; admins post a 'refund' row when they need to debit.
-- pg_advisory_xact_lock serialises concurrent inserts for the same (user, bucket).
------------------------------------------------------------
create or replace function public.ledger_compute_balance_after()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prev_balance integer;
  delta integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text || ':' || new.bucket, 0));

  select balance_after into prev_balance
    from public.ledger
    where user_id = new.user_id and bucket = new.bucket
    order by created_at desc, id desc
    limit 1;

  prev_balance := coalesce(prev_balance, 0);

  delta := case
    when new.type in ('credit','sd_deposit','adjustment') then new.amount
    when new.type in ('meal_charge','delivery_charge','refund','damage_deduction','sd_refund') then -new.amount
    else 0
  end;

  new.balance_after := prev_balance + delta;
  return new;
end;
$$;

drop trigger if exists trg_ledger_compute_balance_after on public.ledger;
create trigger trg_ledger_compute_balance_after
  before insert on public.ledger
  for each row execute function public.ledger_compute_balance_after();

------------------------------------------------------------
-- Block UPDATE / DELETE on ledger entirely (append-only).
-- Even admin must add a new row to correct mistakes.
------------------------------------------------------------
create or replace function public.ledger_block_modify()
returns trigger
language plpgsql
as $$
begin
  raise exception 'ledger is append-only — insert a correcting row instead';
end;
$$;

drop trigger if exists trg_ledger_block_update on public.ledger;
create trigger trg_ledger_block_update
  before update on public.ledger
  for each row execute function public.ledger_block_modify();

drop trigger if exists trg_ledger_block_delete on public.ledger;
create trigger trg_ledger_block_delete
  before delete on public.ledger
  for each row execute function public.ledger_block_modify();

------------------------------------------------------------
-- profiles immutability — only admin may change role / is_active
------------------------------------------------------------
create or replace function public.profiles_enforce_immutable_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.my_role() is distinct from 'admin' then
    if new.role is distinct from old.role then
      raise exception 'role can only be changed by admin';
    end if;
    if new.is_active is distinct from old.is_active then
      raise exception 'is_active can only be changed by admin';
    end if;
    if new.delivery_fee_per_day is distinct from old.delivery_fee_per_day then
      raise exception 'delivery_fee_per_day can only be changed by admin';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_immutable on public.profiles;
create trigger trg_profiles_immutable
  before update on public.profiles
  for each row execute function public.profiles_enforce_immutable_fields();

------------------------------------------------------------
-- Headcount helper: customers eating on a given service_date
-- Skips Sunday, customers with personal exception, and dates with global exception.
------------------------------------------------------------
create or replace function public.customers_eating_on(p_service_date date)
returns table (
  user_id uuid,
  full_name text,
  phone text,
  delivery_mode text,
  delivery_address text,
  landmark text,
  college text,
  workplace text,
  food_preference text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.phone, p.delivery_mode,
         p.delivery_address, p.landmark, p.college, p.workplace, p.food_preference
  from public.profiles p
  where p.role = 'customer'
    and p.is_active = true
    and extract(dow from p_service_date) <> 0           -- 0 = Sunday in postgres
    and not exists (
      select 1 from public.meal_exceptions e
      where e.service_date = p_service_date
        and (e.user_id = p.id or e.user_id is null)
    )
$$;

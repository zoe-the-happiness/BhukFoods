-- Bhuk Foods — Step 1
-- Core schema. All date logic runs in Asia/Kolkata. Ledger is append-only.

------------------------------------------------------------
-- profiles
------------------------------------------------------------
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  full_name            text,
  display_name         text,
  email                text,
  phone                text,
  whatsapp             text,
  role                 text not null check (role in ('customer','cook','admin')),
  is_active            boolean not null default true,
  is_student           boolean,
  college              text,
  year_of_study        text,
  profession           text,
  workplace            text,
  delivery_mode        text check (delivery_mode in ('blpga_onsite','self_pickup','home_delivery')),
  delivery_fee_per_day integer not null default 0 check (delivery_fee_per_day >= 0),
  google_maps_url      text,
  delivery_address     text,
  landmark             text,
  parent_name          text,
  parent_phone         text,
  food_preference      text check (food_preference in ('veg','nonveg')),
  allergies            text,
  start_date           date,
  created_at           timestamptz not null default now()
);

create index if not exists profiles_role_active_idx on public.profiles (role) where is_active;
create index if not exists profiles_email_idx on public.profiles (lower(email));

------------------------------------------------------------
-- pending_subscribers — form submissions awaiting admin approval
------------------------------------------------------------
create table if not exists public.pending_subscribers (
  id                   uuid primary key default gen_random_uuid(),
  full_name            text not null,
  email                text not null,
  phone                text not null,
  whatsapp             text,
  is_student           boolean not null,
  college              text,
  year_of_study        text,
  profession           text,
  workplace            text,
  delivery_mode        text not null check (delivery_mode in ('blpga_onsite','self_pickup','home_delivery')),
  google_maps_url      text,
  delivery_address     text,
  landmark             text,
  parent_name          text,
  parent_phone         text,
  food_preference      text check (food_preference in ('veg','nonveg')),
  allergies            text,
  start_date           date,
  delivery_fee_per_day integer,
  status               text not null default 'pending' check (status in ('pending','quoted','activated','rejected')),
  quote_total          integer,
  quote_sent_at        timestamptz,
  activated_user_id    uuid references public.profiles(id),
  created_at           timestamptz not null default now()
);

create index if not exists pending_subscribers_status_idx on public.pending_subscribers (status, created_at desc);

------------------------------------------------------------
-- ledger — append-only, two buckets ('meal' and 'sd')
------------------------------------------------------------
create table if not exists public.ledger (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  entry_date     date not null default ((now() at time zone 'Asia/Kolkata')::date),
  bucket         text not null check (bucket in ('meal','sd')),
  type           text not null check (type in (
                   'credit','meal_charge','delivery_charge','refund','adjustment',
                   'sd_deposit','damage_deduction','sd_refund')),
  amount         integer not null check (amount > 0),
  balance_after  integer not null,
  damage_item    text,
  damage_qty     integer,
  photo_url      text,
  note           text,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  -- bucket/type consistency
  constraint ledger_bucket_type_meal check (
    not (bucket = 'meal' and type in ('sd_deposit','damage_deduction','sd_refund'))
  ),
  constraint ledger_bucket_type_sd check (
    not (bucket = 'sd' and type in ('credit','meal_charge','delivery_charge','refund'))
  )
);

create index if not exists ledger_user_bucket_date_idx
  on public.ledger (user_id, bucket, created_at desc);
create index if not exists ledger_meal_charge_dedup_idx
  on public.ledger (user_id, entry_date)
  where type = 'meal_charge';
create index if not exists ledger_entry_date_idx on public.ledger (entry_date);

------------------------------------------------------------
-- meal_exceptions
-- user_id NULL means a GLOBAL (cook absent / admin closed day) exception.
------------------------------------------------------------
create table if not exists public.meal_exceptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  service_date date not null,
  kind         text not null check (kind in ('customer_cancel','admin_user_off','cook_leave_global')),
  note         text,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  -- per-user can only cancel once per day; only one global per day
  constraint meal_exceptions_kind_user_consistency check (
    (kind = 'cook_leave_global' and user_id is null)
    or (kind in ('customer_cancel','admin_user_off') and user_id is not null)
  )
);

-- Unique on (user, date) where user_id present
create unique index if not exists meal_exceptions_user_date_uidx
  on public.meal_exceptions (user_id, service_date) where user_id is not null;

-- One global exception per date max
create unique index if not exists meal_exceptions_global_date_uidx
  on public.meal_exceptions (service_date) where user_id is null;

create index if not exists meal_exceptions_service_date_idx on public.meal_exceptions (service_date);

------------------------------------------------------------
-- email_templates — plain text bodies, admin-editable
------------------------------------------------------------
create table if not exists public.email_templates (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null check (key in (
                'magic_link','form_copy','admin_new_subscriber','quote',
                'tomorrow_customer','tomorrow_admin','low_balance',
                'cook_sheet_admin','exit_statement','damage_notice')),
  subject     text not null,
  body_text   text not null,
  merge_tags  text[] not null default '{}',
  updated_by  uuid references public.profiles(id),
  updated_at  timestamptz not null default now()
);

------------------------------------------------------------
-- push_subscriptions — Web Push endpoints
------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

------------------------------------------------------------
-- cook_sheets — archive of generated A4 PDFs
------------------------------------------------------------
create table if not exists public.cook_sheets (
  id                uuid primary key default gen_random_uuid(),
  service_date      date unique not null,
  pdf_storage_path  text,
  headcount         integer not null,
  generated_at      timestamptz not null default now()
);

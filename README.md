# Bhuk Foods

Prepaid monthly meal subscription PWA. Asia/Kolkata only, English + Bengali.

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres, Auth, Storage, pg_cron)
- Resend (all outbound email)
- Web Push (native, VAPID)
- Microsoft Clarity
- Vercel hosting

The complete spec, frozen business rules, schema, and 14-step build order live
in the original conversation that generated this repo. `STATE.md` tracks which
steps are complete.

## Local dev

```bash
# 1. Install deps
npm install

# 2. Copy env and fill in keys
cp .env.example .env.local
# Edit .env.local with values from Supabase + Resend dashboards.

# 3. Link to the Supabase project (one-time)
npx supabase link --project-ref atbjnresahzomvmqrlef

# 4. Apply migrations + run seed.sql
npx supabase db push

# 5. Seed admin + Cook 1 auth users
npm run seed:users

# 6. Start the app
npm run dev
```

Open http://localhost:3000.

## Project layout

```
app/                  Next.js App Router routes
  layout.tsx          Root layout, fonts (Fraunces + Figtree + Noto Sans Bengali)
  globals.css         Tailwind + bhuk-* design tokens
  page.tsx            Landing (placeholder until Step 11)
lib/
  supabase/           server / browser / admin clients
  time.ts             IST helpers + Bengali numerals/calendars
  types/database.ts   Hand-typed Supabase row types
scripts/
  seed-users.ts       Admin + Cook 1 seed (Supabase Admin API)
  gen-vapid.mjs       VAPID keypair generator (Step 10)
supabase/
  config.toml         Local CLI config (project_id, ports, seed.sql path)
  migrations/         SQL migrations (timestamped)
  seed.sql            Email template rows
  templates/          Supabase Auth email templates
```

## Frozen business rules (do not violate)

- ₹100 per meal. Meal and delivery posted as TWO ledger rows in the `meal`
  bucket on the same date.
- BLPGA residents have ₹0 delivery, no security deposit.
- Service Mon–Sat. Sunday off, no charge.
- Customer self-cancel cutoff = **16:00 IST** on the day before. Enforced in
  the database RLS via `can_customer_cancel(date)` — not just in the UI.
- Admin grace window: 16:00–16:30 IST. After 16:30 the next-day headcount is
  locked.
- Ledger is **append-only**. Triggers block UPDATE and DELETE on every row.
  Corrections are new rows.
- Daily charge cron is idempotent: it skips users that already have a
  `meal_charge` for `(user_id, today)`.

## Useful commands

| Command                | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start the Next.js dev server                       |
| `npm run typecheck`    | `tsc --noEmit`                                     |
| `npx supabase db push` | Apply migrations + run `seed.sql` against remote   |
| `npx supabase db reset`| Reset local DB and re-apply migrations + seed      |
| `npm run seed:users`   | Create admin + Cook 1 auth users + their profiles  |
| `npm run vapid:gen`    | Print a fresh VAPID keypair                        |

## Deployment

GitHub: https://github.com/zoe-the-happiness/BhukFoods
Vercel project: `prj_ZETshdjl8HGUHQces9R0Gvw5UeNh`

Step 13 wires up custom domain `bhukfoods.com` and Resend DKIM/SPF.

# Bhuk Foods — Build State

All 13 steps complete and live at **https://www.bhukfoods.com**.
Auto-deploys from main on the public GitHub repo
https://github.com/zoe-the-happiness/BhukFoods.

## Final deploy health check (2026-05-25)

- Landing `/` 200 · `/login` 200 · `/join` 200
- `/customer` `/admin` `/cook` → 307 → `/login?next=…` for unauthenticated visitors
- `/manifest.webmanifest`, `/sw.js`, `/icon-192.png`, `/icon-512.png` all 200
- `/auth/callback` (no code) → 307 → `/login?error=missing_code`
- `POST /api/cron/daily-charge` with valid Bearer → 200 `{ok:true,charged:0,…}`
- `POST /api/cron/sixteen-hundred` with valid Bearer → 200 `{ok:true,push:[…]}`
- `POST /api/cron/low-balance` with valid Bearer → 200 `{ok:true,notified:0,…}`
- Same routes without Bearer → 401 (expected)
- pg_cron jobs registered: 4 active rows in `cron.job` (bhuk_*)
- Resend domain verified, SMTP wired into Supabase Auth, magic-link
  click end-to-end confirmed working on bhukfoods.com

## Step 1 — Schema + RLS + my_role() + seed  ✅ applied to live Supabase, smoke-tested, advisor-clean

Files landed:

- Project foundation: `package.json` (eslint pinned to 8.57 for the
  eslint-config-next peer dep), `tsconfig.json`, `next.config.mjs`,
  `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json`, `.gitignore`,
  `.env.example`
- App shell: `app/layout.tsx` (Fraunces + Figtree + Noto Sans Bengali, Clarity
  hook, OG/Twitter), `app/globals.css`, `app/page.tsx` (placeholder until Step 11)
- Tailwind palette aligned **exactly** to the owner's paste — see
  `tailwind.config.ts` `bhuk.*` tokens (cream/maroon/terra/saffron/green/amber
  and their bg/ink variants, off/off-ink/line)
- Supabase clients: `lib/supabase/{server,client,admin}.ts`
- IST + Bengali helpers: `lib/time.ts`, type definitions in `lib/types/database.ts`
- Supabase config: `supabase/config.toml` (signup disabled, magic-link only,
  redirect URLs include bhukfoods.com), `supabase/templates/magic_link.html`
- Migrations (Asia/Kolkata throughout):
  - `20260525000001_extensions.sql` — pgcrypto, pg_cron, pg_net
  - `20260525000002_schema.sql` — profiles, pending_subscribers, ledger
    (append-only with bucket/type CHECK constraints), meal_exceptions
    (per-user + global unique partial indexes), email_templates,
    push_subscriptions, cook_sheets
  - `20260525000003_functions.sql` — `my_role()`, `ist_now()`, `ist_today()`,
    `can_customer_cancel(date)`, `get_meal_balance/sd_balance`,
    `days_remaining`, BEFORE INSERT trigger that computes `balance_after`
    under an advisory lock per (user,bucket), append-only UPDATE/DELETE
    blockers, profile immutability trigger, `customers_eating_on(date)`
  - `20260525000004_rls.sql` — full RLS. Customers have NO ledger insert.
    Customers can insert/delete only their own `customer_cancel` and only
    while the DB-side cutoff is open. Cooks can insert only
    `cook_leave_global` for today.
  - `20260525000005_storage.sql` — private buckets `damage-photos` and
    `cook-sheets` with role-scoped policies
- Seed: `supabase/seed.sql` (10 email templates, idempotent on key),
  `scripts/seed-users.ts` (creates admin + Cook 1 auth users + profile rows
  via Admin API, idempotent on email), `scripts/gen-vapid.mjs`
- Design reference: owner's full JSX paste captured at
  `design/bhuk_foods_app.jsx` (skeleton) and `design/bhuk_foods_app.fullpaste.txt`
  (landing/login/topbar verbatim). The customer/admin/cook console
  sections live in the original chat message and are the canonical source.

Local checks:

- `npm install` → 463 packages, exit 0 (Next 14.2.15 advisory noted; bump in Step 13)
- `npx tsc --noEmit` → exit 0
- `npx next lint` → no warnings or errors

### Applied to live Supabase (project ref `atbjnresahzomvmqrlef`)

All 8 migrations applied via the Supabase MCP (`apply_migration`):

| # | Name | What it does |
| - | --- | --- |
| 001 | `bhuk_001_extensions` | pgcrypto, pg_cron, pg_net |
| 002 | `bhuk_002_schema` | 7 tables + indexes + CHECK constraints |
| 003 | `bhuk_003_functions` | `my_role`, IST helpers, `can_customer_cancel`, balance + days_remaining, ledger trigger, append-only blockers, immutability trigger, `customers_eating_on` |
| 004 | `bhuk_004_rls` | initial RLS for 6 tables |
| 005 | `bhuk_005_storage` | `damage-photos` + `cook-sheets` private buckets with role-scoped policies |
| 006 | `bhuk_006_fixes` | `created_at default clock_timestamp()` so in-tx inserts get unique ordering; pinned `search_path` on 4 functions; revoked execute on trigger-only functions |
| 007 | `bhuk_007_polish` | revoked execute from PUBLIC on trigger functions; wrapped `auth.uid()` in `(select …)` everywhere for plan caching |
| 008 | `bhuk_008_rls_consolidate` | one explicit permissive policy per (table, action); covering indexes on the 4 FKs the advisor flagged |

Seed:

- 10 email templates inserted (idempotent on `key`)
- `bhukfoods@gmail.com` → admin profile (id `3aeb2777-1863-…`)
- `cook.bhukfoods@gmail.com` → Cook 1 profile (id `73d752db-3ef1-…`)

### Smoke-test results (all pass)

1. **IST helpers + cutoff** — `ist_today()` = 2026-05-25; `can_customer_cancel(today+2)` = true; `can_customer_cancel(today)` = false.
2. **Ledger arithmetic** — meal: 0→2600→2500→2480→2000 (credit → meal_charge 100 → delivery_charge 20 → refund 480); SD: 0→250→200 (sd_deposit → damage_deduction 50). Trigger orders by `clock_timestamp()` so same-transaction inserts compose correctly.
3. **Append-only** — UPDATE and DELETE on `ledger` both raise `ledger is append-only — insert a correcting row instead`.
4. **Profiles seeded** — admin and cook rows present with correct roles.

### Advisor status

**Security:** 0 *unintentional* warnings.
- 5 SECURITY DEFINER lint entries remain on `my_role`, `get_meal_balance`, `get_sd_balance`, `days_remaining`, `customers_eating_on` — these are **intentional**. They need to bypass the caller's RLS to compute cross-user totals (admin) or expose role info to the signed-in user without RLS recursion. The trigger-only functions are off the list (revoked from PUBLIC).
- `auth_leaked_password_protection` is off — we're magic-link only, no passwords.

**Performance:** 0 WARN-level warnings.
- 11 INFO-level "unused index" entries — empty database; will be exercised by real traffic.

### Owner decisions (locked in)

1. `adjustment` ledger type stays credit-only — admins post a `refund` row for debits.
2. Customers may DELETE their own `customer_cancel` while the 16:00 cutoff is still open (un-cancel).
3. Next.js bumped from 14.2.15 → **14.2.35** before Step 2 started (security advisory cleared).

### Env now in place

`.env.local` populated with Supabase anon + service role keys, Resend API key,
admin/cook/printer emails, Clarity ID (`wwio3dkey0`), site URL.
VAPID keypair will be generated in Step 10.

## Step 2 — Auth + magic-link via Resend  ✅ live on https://www.bhukfoods.com, end-to-end magic-link flow verified by the owner

Files landed:

- `lib/i18n/lang-provider.tsx` — cookie-backed EN/বাং provider, mounted in
  root layout. Initial lang is read from `bhuk-lang` cookie SSR so there's no
  flicker; client updates write back to the cookie.
- `components/lang-toggle.tsx` — pill toggle that mirrors `LangToggle` from
  `design/bhuk_foods_app.jsx`. Supports `dark` variant for hero overlays.
- `components/sign-out-form.tsx` — tiny POST form so sign-out is CSRF-safe.
- `components/role-top-bar.tsx` — Bhuk Foods wordmark + role label + display
  name + LangToggle + Logout. Mirrors `TopBar` from the JSX.
- `app/login/page.tsx` — server component. If already signed in, redirects to
  the role console.
- `app/login/login-form.tsx` — client form. Two states (form + "Check your
  email"), Mail icon spinner, error inline. Demo role picker dropped.
- `app/login/actions.ts` — `sendMagicLink` server action that calls
  `supabase.auth.signInWithOtp({ shouldCreateUser: false, … })`. Accounts are
  only created during admin activation, so a stray sign-in attempt for a
  non-existent address returns success without sending mail (Supabase default).
- `app/auth/callback/route.ts` — exchanges either `code` (new flow) or
  `token_hash` + `type=magiclink` (legacy) for a session, looks up the role,
  honours `?next=` only if same-origin and role-matched, then redirects.
- `app/auth/signout/route.ts` — POST-only sign-out → 303 to `/`.
- `lib/supabase/server.ts` — modernised to `getAll/setAll` cookie API.
- `lib/supabase/middleware.ts` — session refresh + role gate.
- `middleware.ts` — matches every request except static assets.
- `app/customer/page.tsx`, `app/admin/page.tsx`, `app/cook/page.tsx` —
  placeholders that prove role-gated routing works. Cook uses
  `profile.display_name` ("Cook 1") in the top bar per spec; customer/admin
  use `full_name`.

Local checks:

- `npm install` → `lucide-react` added (1 package), 469 total.
- `npx tsc --noEmit` → exit 0.
- `npx next lint` → 0 warnings.
- `npm run build` → 10 routes compiled, middleware 82.4 kB.
- `curl http://localhost:3000/customer` → 307 to `/login?next=%2Fcustomer` ✓
- `curl http://localhost:3000/admin`    → 307 to `/login?next=%2Fadmin`    ✓
- `curl http://localhost:3000/cook`     → 307 to `/login?next=%2Fcook`     ✓
- `node scripts/test-magic-link.mjs` (POST to `/auth/v1/otp` with admin
  email) → **HTTP 200**, empty body. Magic link queued via Supabase's
  default email service.

### What needs to happen before Step 2 is fully shipped

1. **End-to-end click test.** Check `bhukfoods@gmail.com` inbox — should
   contain a Supabase magic link. Clicking it lands at
   `http://localhost:3000/auth/callback?code=…` which should redirect to
   `/admin`. Confirm to me when that works (or paste the failure).
2. **Configure Supabase Auth to send via Resend SMTP** so production
   emails carry the Bhuk Foods brand instead of Supabase's. Two options:
   - **Dashboard:** Supabase → Auth → SMTP Settings → toggle "Enable
     Custom SMTP" and paste:
     - Host: `smtp.resend.com` · Port: `465` · Username: `resend`
     - Password: `<RESEND_API_KEY>`
     - Sender email: `hello@bhukfoods.com` · Sender name: `Bhuk Foods`
   - **Management API:** paste a Supabase personal access token and I'll
     `PATCH /v1/projects/atbjnresahzomvmqrlef/config/auth` directly.
3. **Allowlist redirect URLs.** Supabase → Auth → URL Configuration:
   - Site URL: `https://www.bhukfoods.com`
   - Redirect URLs: `http://localhost:3000/auth/callback`,
     `https://www.bhukfoods.com/auth/callback`,
     `https://bhukfoods.com/auth/callback`.

`supabase/config.toml` already declares these for local CLI use; the live
project needs them set in the dashboard / Management API for the magic-link
callback to be accepted in production.

### Live deploy (interim Step 13)

**Production URL:** https://bhuk-foods-bhuk-foods-team-s-projects.vercel.app
(custom domain `bhukfoods.com` is being connected — DNS in flight)

Done as part of the early-deploy:

- Repo pushed to https://github.com/zoe-the-happiness/BhukFoods (now **public**).
- 11 production env vars set on Vercel via `scripts/vercel-setup.mjs`.
- Project framework patched from `null` to `nextjs` (the first build failed
  with `STATIC_BUILD_NO_OUT_DIR` because Vercel auto-detection misfired).
- `ssoProtection` cleared so the .vercel.app URL is publicly reachable
  while the custom domain DNS lands.
- Smoke tests pass: `/` and `/login` → 200; `/customer` → 307 to
  `/login?next=…`.

Pending on the deploy:

- **Supabase Auth redirect allowlist** needs the Vercel URLs added if you
  want to test magic-link on the .vercel.app URL before bhukfoods.com goes
  live. Supabase → Auth → URL Configuration → Redirect URLs, add:
  - `https://bhuk-foods-bhuk-foods-team-s-projects.vercel.app/auth/callback`
  - `https://bhuk-foods-*-bhuk-foods-team-s-projects.vercel.app/auth/callback`
    (wildcard for preview builds)
- Once `bhukfoods.com` resolves, the existing allowlist entry
  `https://www.bhukfoods.com/auth/callback` already covers it.
- Resend domain verification (DKIM + SPF) for `bhukfoods.com` — needed so
  the SMTP from-address `hello@bhukfoods.com` isn't rejected.

## Step 3 — Customer console  ⏳ pending
## Step 4 — Subscriber form + pending flow  ⏳ pending
## Step 5 — Admin pending → quote → activate  ⏳ pending
## Step 6 — Admin customer detail + damage + exit  ⏳ pending
## Step 7 — Admin closed days + templates + stats  ⏳ pending
## Step 8 — Cook console + panic button  ⏳ pending
## Step 9 — pg_cron jobs A, B, C, D  ⏳ pending
## Step 10 — Web Push (VAPID + service worker)  ⏳ pending
## Step 11 — Landing page SSG + SEO + Clarity  ⏳ pending
## Step 12 — PWA manifest + install prompt  ⏳ pending
## Step 13 — Vercel deploy + domain + Resend DKIM  ⏳ pending

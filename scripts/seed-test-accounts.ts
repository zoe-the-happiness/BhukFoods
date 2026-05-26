/**
 * Seed 3 test accounts (admin, customer, cook) with passwords, plus a few
 * ledger rows for the customer so the calendar has something to render.
 *
 *   ADMIN     admin@bhukfoods.com     / "admin"
 *   CUSTOMER  customer@bhukfoods.com  / "customer"
 *   COOK      cook@bhukfoods.com      / "cook"
 *
 * Idempotent: re-running updates the existing rows.
 * Uses fetch directly because supabase-js' realtime client needs a
 * WebSocket polyfill on Node 20.
 *
 * Run with:   npm run seed:test-accounts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(path: string) {
  try {
    const raw = readFileSync(resolve(path), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {}
}
loadDotEnv(".env.local");

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!URL_ || !KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY must be set");
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

type Account = {
  email: string;
  password: string;
  full_name: string;
  display_name: string;
  role: "admin" | "customer" | "cook";
  profile_extra?: Record<string, unknown>;
};

const ACCOUNTS: Account[] = [
  {
    email: "admin@bhukfoods.com",
    password: "admin",
    full_name: "Test Admin",
    display_name: "Admin",
    role: "admin",
  },
  {
    email: "customer@bhukfoods.com",
    password: "customer",
    full_name: "Test Customer",
    display_name: "Test Customer",
    role: "customer",
    profile_extra: {
      phone: "9999999999",
      whatsapp: "9999999999",
      is_student: true,
      college: "NIT Agarpara",
      year_of_study: "2nd",
      delivery_mode: "blpga_onsite",
      delivery_fee_per_day: 0,
      food_preference: "nonveg",
      start_date: new Date().toISOString().slice(0, 10),
    },
  },
  {
    email: "cook@bhukfoods.com",
    password: "cook",
    full_name: "Test Cook",
    display_name: "Cook 1",
    role: "cook",
  },
];

async function findUserId(email: string): Promise<string | null> {
  const r = await fetch(
    `${URL_}/auth/v1/admin/users?per_page=1000`,
    { headers },
  );
  if (!r.ok) throw new Error(`listUsers ${r.status}: ${await r.text()}`);
  const data = (await r.json()) as { users: Array<{ id: string; email?: string }> };
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

async function upsertAuthUser(acc: Account): Promise<string> {
  const existing = await findUserId(acc.email);
  if (existing) {
    // Update password on the existing user so re-runs always sync.
    const r = await fetch(`${URL_}/auth/v1/admin/users/${existing}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ password: acc.password, email_confirm: true }),
    });
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`updateUser ${acc.email} ${r.status}: ${body}`);
    }
    console.log(`✓ auth.users updated  ${acc.email}  (${existing})`);
    return existing;
  }
  const r = await fetch(`${URL_}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
    }),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`createUser ${acc.email} ${r.status}: ${body}`);
  }
  const data = (await r.json()) as { id?: string; user?: { id: string } };
  const id = data.id ?? data.user?.id;
  if (!id) throw new Error(`createUser returned no id for ${acc.email}`);
  console.log(`+ auth.users created  ${acc.email}  (${id})`);
  return id;
}

async function upsertProfile(acc: Account, id: string) {
  const row = {
    id,
    full_name: acc.full_name,
    display_name: acc.display_name,
    email: acc.email,
    role: acc.role,
    is_active: true,
    ...acc.profile_extra,
  };
  const r = await fetch(`${URL_}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`upsert profile ${acc.email} ${r.status}: ${body}`);
  }
  console.log(`✓ profiles upserted   ${acc.email}  → ${acc.role}`);
}

async function seedCustomerLedger(customerId: string) {
  // Skip if any ledger row already exists for this customer.
  const r = await fetch(
    `${URL_}/rest/v1/ledger?user_id=eq.${customerId}&limit=1`,
    { headers },
  );
  const rows = (await r.json()) as unknown[];
  if (rows.length > 0) {
    console.log(`✓ ledger already populated for ${customerId.slice(0, 8)}…`);
    return;
  }
  const credit = {
    user_id: customerId,
    bucket: "meal",
    type: "credit",
    amount: 2600,
    note: "Test seed — opening balance",
  };
  const ins = await fetch(`${URL_}/rest/v1/ledger`, {
    method: "POST",
    headers,
    body: JSON.stringify(credit),
  });
  if (!ins.ok) {
    const body = await ins.text();
    throw new Error(`seed credit ${ins.status}: ${body}`);
  }
  console.log(`+ ledger seeded ₹2600 credit (meal bucket) for test customer`);
}

async function main() {
  const userIds: Record<string, string> = {};
  for (const acc of ACCOUNTS) {
    const id = await upsertAuthUser(acc);
    await upsertProfile(acc, id);
    userIds[acc.role] = id;
  }
  if (userIds.customer) await seedCustomerLedger(userIds.customer);
  console.log("\nReady. Sign in at https://www.bhukfoods.com/login with any of:");
  for (const acc of ACCOUNTS) {
    console.log(`  ${acc.role.padEnd(8)}  ${acc.email}  /  ${acc.password}`);
  }
}

main().catch((err) => {
  console.error("seed-test-accounts failed:", err);
  process.exit(1);
});

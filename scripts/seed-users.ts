/**
 * Bhuk Foods — seed admin + Cook 1 auth users and their profiles.
 *
 * Uses the Supabase Auth Admin REST API + PostgREST directly via fetch to
 * avoid spinning up the realtime client (which needs WebSocket; Node 20 ships
 * without a native one).
 *
 * Idempotent: re-running skips users that already exist by email.
 *
 * Usage: `npm run seed:users`
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(path: string) {
  try {
    const raw = readFileSync(resolve(path), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local is optional when env vars are already in the environment.
  }
}

loadDotEnv(".env.local");
loadDotEnv(".env");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const COOK_EMAIL = process.env.COOK_EMAIL;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}
if (!ADMIN_EMAIL || !COOK_EMAIL) {
  throw new Error("ADMIN_EMAIL and COOK_EMAIL must be set");
}

const baseHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

type SeedUser = {
  email: string;
  fullName: string;
  displayName: string;
  role: "admin" | "cook";
};

const seeds: SeedUser[] = [
  {
    email: ADMIN_EMAIL,
    fullName: "Nirmalya Ranjan Sarkar",
    displayName: "Admin",
    role: "admin",
  },
  {
    email: COOK_EMAIL,
    fullName: "Cook 1",
    displayName: "Cook 1",
    role: "cook",
  },
];

async function findAuthUserByEmail(email: string): Promise<string | null> {
  const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users`);
  url.searchParams.set("per_page", "1000");
  url.searchParams.set("page", "1");
  const r = await fetch(url, { headers: baseHeaders });
  if (!r.ok) throw new Error(`listUsers failed: ${r.status} ${await r.text()}`);
  const data = (await r.json()) as { users: Array<{ id: string; email?: string }> };
  const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

async function createAuthUser(email: string): Promise<string> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ email, email_confirm: true }),
  });
  if (!r.ok) throw new Error(`createUser failed: ${r.status} ${await r.text()}`);
  const data = (await r.json()) as { id?: string; user?: { id: string } };
  // Supabase returns the user object directly at the top level for admin create.
  const id = data.id ?? data.user?.id;
  if (!id) throw new Error(`createUser returned unexpected shape: ${JSON.stringify(data)}`);
  return id;
}

async function upsertProfile(seed: SeedUser, id: string): Promise<void> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      ...baseHeaders,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id,
      full_name: seed.fullName,
      display_name: seed.displayName,
      email: seed.email,
      role: seed.role,
      is_active: true,
    }),
  });
  if (!r.ok) throw new Error(`upsert profile failed: ${r.status} ${await r.text()}`);
}

async function upsertUser(seed: SeedUser) {
  let userId = await findAuthUserByEmail(seed.email);
  if (userId) {
    console.log(`✓ auth.users: ${seed.email} already exists (${userId})`);
  } else {
    userId = await createAuthUser(seed.email);
    console.log(`+ auth.users: created ${seed.email} (${userId})`);
  }
  await upsertProfile(seed, userId);
  console.log(`✓ profiles: upserted ${seed.email} as ${seed.role}`);
}

async function main() {
  for (const seed of seeds) {
    await upsertUser(seed);
  }
  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

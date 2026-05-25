// Smoke test: send a magic link to the admin email via the live Supabase project.
// Uses fetch directly (no realtime). Prints the Supabase HTTP response.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(path) {
  try {
    const raw = readFileSync(resolve(path), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {}
}
loadDotEnv(".env.local");

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ADMIN = process.env.ADMIN_EMAIL;
if (!URL_ || !ANON || !ADMIN) {
  console.error("missing env: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY/ADMIN_EMAIL");
  process.exit(1);
}

const r = await fetch(`${URL_}/auth/v1/otp`, {
  method: "POST",
  headers: {
    apikey: ANON,
    Authorization: `Bearer ${ANON}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: ADMIN,
    options: { emailRedirectTo: "http://localhost:3000/auth/callback" },
    create_user: false,
  }),
});
console.log("status:", r.status);
console.log("body:", await r.text());

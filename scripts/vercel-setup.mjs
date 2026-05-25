/**
 * Push env vars to Vercel and trigger a new production deployment.
 * Reads VERCEL_TOKEN / VERCEL_PROJECT_ID / VERCEL_TEAM_ID from .env.local,
 * plus every other key from .env.local that should be mirrored to Vercel.
 *
 *   node scripts/vercel-setup.mjs env       # set/update env vars only
 *   node scripts/vercel-setup.mjs deploy    # trigger production deploy
 *   node scripts/vercel-setup.mjs all       # both
 */

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
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {}
}
loadDotEnv(".env.local");

const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;
if (!TOKEN || !PROJECT_ID || !TEAM_ID) {
  console.error("Need VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID in .env.local");
  process.exit(1);
}

const BASE = "https://api.vercel.com";
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

// Keys we mirror from .env.local → Vercel. Operator-only (Vercel/Supabase
// admin) keys are excluded.
const MIRROR = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "ADMIN_EMAIL",
  "COOK_EMAIL",
  "EPSON_PRINTER_EMAIL",
  "VAPID_SUBJECT",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_CLARITY_ID",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "CRON_SECRET",
];

async function listEnv() {
  const r = await fetch(`${BASE}/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, { headers });
  if (!r.ok) throw new Error(`listEnv ${r.status}: ${await r.text()}`);
  return (await r.json()).envs;
}

async function upsertEnv(existing, key, value) {
  const body = {
    key,
    value,
    type: "encrypted",
    target: ["production", "preview", "development"],
  };
  const match = existing.find((e) => e.key === key);
  if (match) {
    const r = await fetch(
      `${BASE}/v9/projects/${PROJECT_ID}/env/${match.id}?teamId=${TEAM_ID}`,
      { method: "PATCH", headers, body: JSON.stringify(body) },
    );
    if (!r.ok) throw new Error(`PATCH ${key} ${r.status}: ${await r.text()}`);
    console.log(`  ↻  ${key} updated`);
  } else {
    const r = await fetch(`${BASE}/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`POST ${key} ${r.status}: ${await r.text()}`);
    console.log(`  +  ${key} created`);
  }
}

async function setAllEnvs() {
  const existing = await listEnv();
  for (const key of MIRROR) {
    const value = process.env[key];
    if (!value) {
      console.log(`  -  ${key} (skipped, empty in .env.local)`);
      continue;
    }
    await upsertEnv(existing, key, value);
  }
}

async function triggerProdDeploy() {
  // Get the latest commit from the linked GitHub repo using Vercel's project info.
  const projR = await fetch(`${BASE}/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`, { headers });
  if (!projR.ok) throw new Error(`project ${projR.status}: ${await projR.text()}`);
  const proj = await projR.json();
  const link = proj.link;
  if (!link || link.type !== "github") {
    throw new Error(`project is not linked to GitHub: ${JSON.stringify(proj.link)}`);
  }
  const repoFull = `${link.org}/${link.repo}`;

  // Discover latest commit SHA on main from GitHub's public API (repo is public now).
  const shaR = await fetch(`https://api.github.com/repos/${repoFull}/commits/main`);
  if (!shaR.ok) throw new Error(`github sha ${shaR.status}`);
  const sha = (await shaR.json()).sha;

  const body = {
    name: proj.name,
    target: "production",
    gitSource: {
      type: "github",
      ref: "main",
      repoId: link.repoId,
      sha,
    },
  };
  const r = await fetch(`${BASE}/v13/deployments?teamId=${TEAM_ID}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) {
    console.error("deploy failed:", JSON.stringify(j, null, 2));
    process.exit(1);
  }
  console.log(`✓ deploy triggered: ${j.id}`);
  console.log(`  url:       https://${j.url}`);
  console.log(`  inspector: ${j.inspectorUrl}`);
}

const mode = process.argv[2] || "all";
if (mode === "env" || mode === "all") {
  console.log("Setting env vars on Vercel:");
  await setAllEnvs();
}
if (mode === "deploy" || mode === "all") {
  console.log("Triggering production deploy:");
  await triggerProdDeploy();
}

#!/usr/bin/env node
/**
 * Local wiring check — no secrets printed.
 * Usage: node scripts/check-supabase-wiring.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const envLocal = resolve(root, ".env.local");
const envExample = resolve(root, ".env.example");

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = {};
if (existsSync(envExample)) Object.assign(env, parseEnv(readFileSync(envExample, "utf8")));
if (existsSync(envLocal)) Object.assign(env, parseEnv(readFileSync(envLocal, "utf8")));
// process env wins
for (const [k, v] of Object.entries(process.env)) {
  if (v != null && v !== "") env[k] = v;
}

const checks = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    ok: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
    hint: "Supabase → Project Settings → API → Project URL"
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ok: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hint: "Supabase → Project Settings → API → anon public"
  },
  {
    name: ".env.local present",
    ok: existsSync(envLocal),
    hint: "cp .env.example .env.local and fill values"
  },
  {
    name: "Connect connector id",
    ok: Boolean(env.AETHOS_VERCEL_CONNECT_SUPABASE_ID || true),
    hint: "default mcp.supabase.com/fuchsia-bridge"
  },
  {
    name: "OIDC or VERCEL_TOKEN (ops only)",
    ok: Boolean(env.VERCEL_OIDC_TOKEN || env.VERCEL_TOKEN),
    hint: "vercel link && vercel env pull (optional for Connect ops)"
  },
  {
    name: "AETHOS_OPS_SECRET (ops route)",
    ok: Boolean(env.AETHOS_OPS_SECRET),
    hint: "required for POST /api/ops/supabase-connect-token"
  }
];

console.log("Aethos Supabase wiring check\n");
for (const c of checks) {
  const mark = c.ok ? "OK " : "·· ";
  console.log(`${mark} ${c.name}`);
  if (!c.ok) {
    console.log(`     → ${c.hint}`);
  }
}

const appReady =
  Boolean(env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

console.log("\nApp cloud sync ready:", appReady ? "YES" : "NO (set public URL + anon key)");
console.log("Connect ops ready:", Boolean(env.VERCEL_OIDC_TOKEN || env.VERCEL_TOKEN) ? "maybe" : "need vercel env pull / VERCEL_TOKEN");
console.log("\nDocs: docs/SUPABASE_SETUP.md · docs/VERCEL_CONNECT_SUPABASE.md");

process.exit(appReady ? 0 : 1);

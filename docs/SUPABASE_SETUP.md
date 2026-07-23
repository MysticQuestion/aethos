# Supabase setup for Aethos

Connect project **https://github.com/MysticQuestion/aethos** to a Supabase project.

Also see:

- `docs/VERCEL_CONNECT_SUPABASE.md` — Vercel Connect / `fuchsia-bridge` / MCP ops tokens  
- `scripts/check-supabase-wiring.mjs` — local env readiness check  
- `scripts/apply-migrations-checklist.md` — migration order  

Quick status while the app is running: `GET /api/ops/supabase-status`

## 1. Create the project

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → New project.
2. Note **Project URL** and **anon public** key (Settings → API).
3. Never put the **service_role** key in `NEXT_PUBLIC_*` variables.

## 2. Apply migrations

In the SQL Editor, run in order:

1. `supabase/migrations/202607080001_aethos_backend_ephemeris_data_layer.sql`
2. `supabase/migrations/202607200001_aethos_auth_persistence.sql`

Or with CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Optional kernel tables (insight cards / reconciliation) live in `supabase/schema.sql` — apply if you use those tables separately from the `aethos_*` layer.

## 3. Auth configuration

Authentication → URL configuration:

| Setting | Value |
| --- | --- |
| Site URL | `http://localhost:3000` (local) or production origin |
| Redirect URLs | `{origin}/auth/callback` |

Enable Email provider (magic link and/or password).

## 4. Local env

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Restart `npm run dev`. Open **Account** → sign in → push local → cloud.

## 5. Vercel / production

Add the same two public vars in the Vercel project environment. Add production origin to Supabase redirect URLs.

## Data model (cloud)

| Table | Purpose |
| --- | --- |
| `aethos_profiles` | Profile + `profile_snapshot` JSON |
| `aethos_birth_intakes` | Birth data (unique per profile) |
| `aethos_journal_entries` | Journal bodies and themes |
| `aethos_reports` | Deterministic report snapshots |
| `aethos_natal_charts` / timing / transit tables | Calculation artifacts |

All use RLS: `auth.uid() = user_id` (or via profile ownership).

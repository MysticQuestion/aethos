# Aethos

Aethos is a serious symbolic intelligence platform for self-knowledge, timing awareness, reflective journaling, and practitioner-ready reports. It is designed for **interpretation, not fatalism**.

**Canonical codebase:** this repository (`Documents/Aethos`). See `docs/REPO_LAYOUT.md`.

## Routes

- `/` public Aethos landing page
- `/onboarding` local profile intake (mirrors to cloud when signed in)
- `/dashboard` profile, timing, journal, report, and reflection overview
- `/profile` structured symbolic profile
- `/journal` journal composer and entry history
- `/reports` deterministic report generation and Markdown preview
- `/timing-lab` demo timing windows, source event table, and lab-mode metadata
- `/engine` inspectable vector/reconciliation engine view
- `/methodology` responsible methodology and interpretive limits
- `/account` optional Supabase auth + push/pull sync
- `/settings` storage mode, privacy posture, and local data controls
- `/privacy` data export/delete posture and sensitive-data notices

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000` or `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment Variables

Aethos works without remote configuration in local demo mode.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional calculation service
AETHOS_CALCULATION_SERVICE_URL=
AETHOS_ALLOW_DEMO_FALLBACK=true
AETHOS_CALC_PROVIDER=demo
AETHOS_SWISS_EPHEMERIS_PATH=
```

Only public Supabase anon configuration belongs in browser-visible variables. Do not expose service role keys, private API keys, or deployment tokens client-side.

For Auth, add redirect URL: `{origin}/auth/callback`.

## Data Modes

**Local demo** stores profile, journal entries, and reports in browser `localStorage`.

**Supabase** activates when both public env vars are set. Sign in on `/account` to enable cloud writes (RLS-backed). Local remains the browser session source of truth; use push/pull on Account to sync.

Schema: `supabase/schema.sql` and `supabase/migrations/`.

## Responsible Use

Aethos does not provide medical, legal, financial, psychiatric, or guaranteed predictive advice. Timing windows are context markers for reflection and decision-making, not commands.

## Ephemeris Status

Swiss Ephemeris is not active by default. The active provider is a deterministic demo provider with server-side contracts for Swiss Ephemeris or other deterministic providers.

## Calculation Service

```bash
cd services/calculation
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
pytest
uvicorn app.main:app --reload
```

Set `AETHOS_CALCULATION_SERVICE_URL` in the Next.js server environment to proxy `/api/aethos/chart` to the calculation service.

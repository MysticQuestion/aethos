# Aethos

Aethos is a serious symbolic intelligence platform for self-knowledge, timing awareness, reflective journaling, and practitioner-ready reports. It is designed for interpretation, not fatalism.

## Routes

- `/` public Aethos landing page
- `/onboarding` local profile intake
- `/dashboard` profile, timing, journal, report, and reflection overview
- `/profile` structured symbolic profile
- `/journal` local journal composer and entry history
- `/reports` deterministic report generation and Markdown preview
- `/timing-lab` deterministic demo timing windows, source event table, and lab-mode metadata
- `/engine` inspectable vector/reconciliation engine view
- `/methodology` responsible methodology and interpretive limits
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
```

Only public Supabase anon configuration belongs in browser-visible variables. Do not expose service role keys, private API keys, or deployment tokens client-side.

## Data Modes

Local demo mode stores profile, journal entries, and generated reports in browser `localStorage`.

Supabase mode is detected only when both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present. The schema and RLS notes are in `supabase/schema.sql`.

## Responsible Use

Aethos does not provide medical, legal, financial, psychiatric, or guaranteed predictive advice. Timing windows are context markers for reflection and decision-making, not commands.

## Ephemeris Status

Swiss Ephemeris is not active in this local build. The current provider is a deterministic demo provider with server-side API contracts for future Swiss Ephemeris or external deterministic providers.

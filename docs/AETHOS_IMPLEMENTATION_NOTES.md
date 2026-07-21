# Aethos Implementation Notes

## Built

- Next.js App Router MVP with public, dashboard, onboarding, profile, journal, reports, methodology, engine, timing-lab, settings, privacy, and account routes.
- Local demo mode without Supabase.
- Typed modules: intake, profile, timing, journal, reports, numerology, Western baseline, dictionary, reconciliation, insight cards.
- FastAPI calculation service with demo provider and Swiss Ephemeris adapter (planets + houses when licensed files present).
- Supabase Auth + dual-mode persistence (push/pull, middleware, `/account`).
- **Multi-system research engines (2026-07-21):**
  - Human Design: withhold Type/Authority without verified BodyGraph + time
  - Vedic: approximate sidereal solar Rashi scaffold; Lagna withheld
  - BaZi: day/month pillar scaffold; hour pillar withheld
  - I Ching: deterministic hexagram scaffold (not ritual cast)
  - Profile `systemLayers` + tabbed multi-system UI
- **Deploy scaffolding:** `vercel.json`, `docker-compose.yml`, expanded `docs/DEPLOYMENT.md`, `docs/SUPABASE_SETUP.md`

## Canonical repo

https://github.com/MysticQuestion/aethos  
Local path: `/Users/micwil/Documents/Aethos`

## Deferred / production next

- Supabase project creation + apply migrations (operator step)
- Swiss ephemeris licensed files + golden chart verification
- True Human Design BodyGraph + Lahiri Swiss Vedic + full BaZi calendar library
- PDF export pipeline
- LLM Agents’ Room narrative (server-side only, structured calc inputs)
- Practitioner workspace + billing
- Vercel + calc container live deploy (operator step)

## Known limits

- Research multi-system layers are deterministic scaffolds with explicit withhold lists — not production BodyGraph/Lagna/hour pillar claims.
- Western V1 solar baseline without Swiss still withholds houses/Ascendant when time unknown.
- Local mode is browser-specific until account sync.

## Continue From Here (operator)

1. Create Supabase project → run migrations → set env + Auth redirects (`docs/SUPABASE_SETUP.md`).
2. `npx vercel` or import GitHub repo; set env vars (`docs/DEPLOYMENT.md`).
3. Deploy calculation service container; point `AETHOS_CALCULATION_SERVICE_URL`.
4. Optionally activate Swiss with licensed ephemeris files.
5. PDF export and practitioner workflows after consumer data is stable.

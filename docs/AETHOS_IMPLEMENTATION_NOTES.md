# Aethos Implementation Notes

## Built

- Next.js App Router MVP with public, dashboard, onboarding, profile, journal, reports, methodology, engine, timing-lab, settings, privacy, and **account** routes.
- Local demo mode that works without Supabase environment variables.
- Typed Aethos modules for intake, profile generation, timing windows, journal themes, reports, storage mode, numerology, Western baseline, semantic dictionary, reconciliation, and insight cards.
- Report generation as deterministic Markdown output.
- Journal entry creation with mood, theme, optional decision context, history, and local persistence.
- Supabase schema with profiles, birth intakes, journal entries, timing windows, reports, calculation runs, semantic fragments, reconciliation runs, insight cards, and RLS policies.
- FastAPI calculation service (`services/calculation`) with demo provider and optional Swiss Ephemeris adapter.
- **Supabase Auth + dual-mode persistence (2026-07-20):**
  - `@supabase/supabase-js` + `@supabase/ssr`
  - Browser/server clients and session middleware
  - `/account` magic-link and email/password sign-in
  - `/auth/callback` code exchange
  - Cloud mirror for profile, journal, reports when signed in
  - Push local → cloud / pull cloud → local
  - Local storage remains source of truth for the browser session

## Consolidated repos

Canonical path: `/Users/micwil/Documents/Aethos`  
Remote: `https://github.com/MysticQuestion/aethos.git`  
See `docs/REPO_LAYOUT.md` and `archive/early-desktop-prototype/`.

## Deferred

- Forced protected account routes (intentionally opt-in so demo mode stays open).
- Server-side writes from API routes (browser-authenticated mirror is first cut).
- Human Design BodyGraph engine.
- Vedic, BaZi, I Ching production engines.
- PDF rendering pipeline.
- LLM-assisted report prose (Agents’ Room).
- Practitioner workspace and billing.
- Swiss Ephemeris production activation + golden chart fixtures.

## Known Limits

- Western astrology V1 is a solar baseline and intentionally withholds houses, Ascendant, and time-sensitive claims without sufficient data.
- Local mode is browser-specific and is not account-synced until the user signs in and pushes/pulls.
- Report generation is Markdown/HTML-ready only.
- Birth-intake upsert requires migration `202607200001_aethos_auth_persistence.sql` (unique on `profile_id`, snapshot columns).

## Continue From Here

1. Apply Supabase migrations + configure Auth redirect URLs (`/auth/callback`).
2. Optional: harden API routes to accept authenticated server-side persistence.
3. Implement PDF export after report rendering is visually verified.
4. Activate Swiss Ephemeris with licensed ephemeris files and golden fixtures.
5. Add multi-system dashboard tabs (see `docs/MULTI_SYSTEM_VISION.md`) as engines land.
6. Practitioner review workflow after consumer profile and journal data are stable.

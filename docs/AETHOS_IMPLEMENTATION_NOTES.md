# Aethos Implementation Notes

## Built

- Next.js App Router MVP with polished public, dashboard, onboarding, profile, journal, reports, methodology, engine, and settings routes.
- Local demo mode that works without Supabase environment variables.
- Typed Aethos modules for intake, profile generation, timing windows, journal themes, reports, storage mode, numerology, Western baseline, semantic dictionary, reconciliation, and insight cards.
- Report generation as deterministic Markdown output.
- Journal entry creation with mood, theme, optional decision context, history, and local persistence.
- Supabase schema with profiles, birth intakes, journal entries, timing windows, reports, calculation runs, semantic fragments, reconciliation runs, insight cards, and RLS policies.

## Deferred

- Full Supabase Auth flow.
- Server-side Supabase persistence.
- Human Design BodyGraph engine.
- Vedic, BaZi, I Ching production engines.
- PDF rendering pipeline.
- LLM-assisted report prose.
- Practitioner workspace and billing.

## Known Limits

- Western astrology V1 is a solar baseline and intentionally withholds houses, Ascendant, and time-sensitive claims without sufficient data.
- Local mode is browser-specific and is not account-synced.
- Report generation is Markdown/HTML-ready only.

## Continue From Here

1. Add Supabase client dependency and authenticated persistence behind public anon config.
2. Add protected account routes while keeping local demo mode available.
3. Implement PDF export after report rendering is visually verified.
4. Add practitioner review workflow after consumer profile and journal data are stable.

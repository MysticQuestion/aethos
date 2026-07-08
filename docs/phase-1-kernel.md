# Aethos Phase 1 Technical Kernel

This implementation turns the architecture notes into a buildable first kernel:

- Canonical profile intake with birth-time confidence.
- Deterministic Pythagorean numerology.
- Western astrology solar baseline that withholds Ascendant, houses, and other time-sensitive outputs without sufficient data.
- Ontological Dictionary entries that convert symbolic keys into normalized semantic vectors.
- Reconciliation Engine using Net Alignment and weighted variance as the Contradiction Index.
- Insight Cards with source badges, confidence labels, and expandable Engine View JSON.
- Journal privacy modes that do not claim zero-knowledge while sending plaintext to cloud AI.
- Supabase schema with RLS policies and journal privacy checks.

## Local routes

- `/` dashboard and Insight Cards
- `/onboarding` canonical intake
- `/profile` deterministic outputs and withheld calculations
- `/engine` reconciliation runs and vectors
- `/journal` journal privacy modes
- `/methodology` calculation and interpretation method
- `/settings/privacy` consent, export, deletion, and encryption posture

## API routes

- `POST /api/profile/create`
- `POST /api/calculate/numerology`
- `POST /api/calculate/western-baseline`
- `POST /api/reconcile`
- `POST /api/insights/generate`
- `POST /api/journal/create`
- `GET /api/profile/:id/export`

## Non-negotiable constraints

- Unknown birth time never defaults to noon.
- Ascendant, houses, Human Design Type, BaZi Hour Pillar, Vedic Lagna, and astrocartography are withheld unless a real engine and required data exist.
- Insight prose is generated from structured vectors and dictionary fragments.
- Contradictions are surfaced as tension or paradox instead of averaged into false neutrality.
- RLS is treated as authorization, not zero-knowledge confidentiality.

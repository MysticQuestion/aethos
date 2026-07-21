# Multi-System Vision

Aethos is intended as a unified symbolic identity and timing system:

**Human Design × Vedic × BaZi × Western × Sidereal × Numerology** — one cohesive, graceful experience.

## Product framing

- One profile, many wisdom systems
- Synthesis without false neutrality: contradictions surface as tension or paradox
- Source transparency: every claim should link back to structured calculation and dictionary fragments
- Graceful degradation when birth time or location is incomplete

## Dashboard tabs (target UX)

| Tab | Status in Phase 1 | Notes |
| --- | --- | --- |
| Overview / Aethos Core | Partial | Profile summary + insight cards |
| Western | V1 solar baseline | Houses/Ascendant withheld without sufficient data |
| Numerology | V1 | Pythagorean deterministic |
| Human Design | Scaffold / deferred engine | BodyGraph production engine not yet wired |
| Vedic | Research preview | Engine not production |
| BaZi | Research preview | Engine not production |
| I Ching | Research preview | Engine not production |
| Synthesis | V1 reconciliation | Net alignment + contradiction index |
| Sources | Partial | Engine drawer JSON; full RAG sources later |
| Journal | V1 local | Cloud sync via Supabase when authenticated |
| Timing | V1 demo + service | Swiss Ephemeris optional production provider |

## Non-negotiables

- Unknown birth time never defaults to noon.
- Time-sensitive outputs (Ascendant, houses, HD Type, BaZi Hour Pillar, Vedic Lagna) are withheld without real engines and required inputs.
- LLMs interpret structured calculation output only; they never compute planetary positions.

# Aethos Systems Codex v0.1

Internal operating manual for how Aethos calculates, interprets, reconciles, stores, and presents symbolic systems.

## First principle (non-negotiable)

**Never confuse calculation with interpretation.**

| Stage | Nature | May LLM touch? |
| --- | --- | --- |
| Calculation | Mechanical, deterministic | **No** |
| Interpretation | Symbolic, dictionary-bound | Only from structured objects |
| Synthesis | Editorial intelligence | Yes, with guardrails + source badges |
| Reconciliation | Math over vectors | **No** (deterministic) |

Every claim is:

```
symbolic claim
+ source system
+ calculation basis
+ confidence level
+ interpretive category
+ user-facing explanation
+ limitation note
```

Store **structured data first, prose second.**

## Universal pipeline (every system)

1. **Intake** — birth date/time/place, name, question, journal  
2. **Normalization** — UTC, IANA timezone, geocode, DST, birth-time confidence  
3. **Calculation** — ephemeris, calendars, number maps, cast procedures  
4. **System output** — raw JSON (degrees, houses, pillars, gates, hexagrams…)  
5. **Interpretation** — tradition-specific dictionary fragments  
6. **Reconciliation** — Net Alignment + Contradiction Index (no false neutrality)  
7. **Synthesis** — practical, non-fatalistic guidance  
8. **Memory** — calc version, interpretation version, journal, report history  

## Birth-time discipline

- Unknown time **never defaults to noon for time-sensitive claims**.  
- Withheld when incomplete: Ascendant, houses, HD Type, BaZi hour pillar, Vedic Lagna, full BodyGraph.  
- Confidence labels: high / medium / low; methods and restricted outputs always visible.

## System layers (status)

| System | Status in product | Notes |
| --- | --- | --- |
| Numerology | V1 | Pythagorean deterministic |
| Western solar / chart | V1 baseline → Swiss production path | Houses/angles require time + coords |
| Vedic | Research preview | Lahiri Swiss path deferred; Lagna withheld |
| Human Design | Research / withhold | Official BodyGraph engine not certified |
| BaZi | Research preview | Hour pillar withheld without solar time |
| I Ching | Decision Lens (ephemeral) | Not a natal identity layer |
| Astrocartography | Deferred | Requires Swiss + geo pipeline |

## I Ching as Decision Lens (not natal baseline)

I Ching must be treated as an **ephemeral override**:

- High short-term weight for a specific question  
- Does **not** permanently rewrite natal vectors  
- Decays / archives into journal memory  
- Frames situational advice against baseline (Western, numerology, timing), not fate commands  

## Transparent methodology UI

Every insight card and system layer should support progressive disclosure:

1. Readable insight  
2. Source badges + confidence  
3. **Show the Math** — engine drawer JSON (vectors, metadata, withheld list)  
4. Responsible-use limits  

## Single-input engine

One canonical intake object feeds all systems. Raw storage is degrees / pillars / keys — not only “Aries Sun” labels. See:

- `docs/SINGLE_INPUT_SCHEMA.md`  
- `supabase/migrations/202607210001_aethos_single_input_engine.sql`

## Responsible use

Timing windows and decision casts are **context markers for reflection**, not medical/legal/financial/psychiatric advice or guaranteed prediction. Match the ethical framing of professional tools (e.g. Astro.com entertainment disclaimers on locational tools) without diluting seriousness.

## Future architecture (not current MVP)

Long-form notes on zero-knowledge journals, Kubernetes canaries, OTA mobile logic bundles, and ArgoCD are **aspirational**. Current production path is:

- Next.js + Supabase (RLS, not ZK)  
- FastAPI calculation service + Swiss optional  
- GitHub Actions CI  
- Vercel + container deploy  

Do not implement ZK/K8s until core calc + multi-system reconciliation are verified with golden charts.

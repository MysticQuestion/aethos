# Aethos chart-reader accuracy baseline — 2026-11-19

## Decision

Treat the user-supplied **Aethos — Chart Reader Prototype** standalone HTML as the **canonical behavior reference** for calculation reconciliation. The current Next.js application and its FastAPI calculation service are *not* assumed more accurate merely because their Vercel production builds have status READY. **Do not overwrite or substitute the prototype's calculation methods without parity checks and independent verification.**

Both supplied HTML files were byte-identical (721,216 bytes each):

```
SHA-256 195c8416fa391df2e988352d8c978d2482429bb49a6e67130304ce50bf4ae468
```

The full reference HTML was furnished in the 2026-11-19 conversation and is deliberately **not committed** to the repository in this baseline PR. Its source contains embedded third-party Astronomy Engine code with an MIT license notice, which must be retained upon redistribution.

## What the prototype computes

- Western tropical natal planets, Placidus cusps and aspects, with a labeled whole-sign fallback at high latitudes
- Vedic sidereal placements using a linearized Lahiri ayanamsa and mean lunar node; nakshatras and Vimshottari dasha periods
- BaZi Four Pillars, solar-term boundaries and luck pillars
- Human Design design/personality activations, gates, channels, centers, type, authority and profile
- Pythagorean numerology and a date-based Mayan Tzolk'in / Tarot / Sabian supplement
- Multi-system interpretive synthesis and downloadable text dossier

The astronomy code is client-side and bundles Don Cross's Astronomy Engine; location search calls Open-Meteo geocoding on explicit user action. Accuracy of the **astronomical positions does not automatically validate every derived interpretive system**.

## First independent checks (not certification)

The standalone HTML was actually executed in headless Chromium. Four UTC test instants (2000-01-01, 1991-11-06, 2020-02-01, 2024-06-21) were evaluated with the embedded Astronomy Engine. Tropical longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto were compared independently against Python Swiss Ephemeris (Moshier mode).

- Across **40 planet comparisons**, the largest absolute difference was **0.24 arcminute** (0.004 degree).
- Three nonpolar comparisons of the Ascendant, Midheaven and all twelve Placidus house cusps agreed closely with Swiss Ephemeris; largest house cusp difference was approximately **0.002 degree**.
- For latitude 70° N, the prototype reported its whole-sign high-latitude fallback.
- The Tzolk'in anchor check for 2012-12-21 returned Kin 160 as stated by the prototype.
- The linearized Lahiri value differed by approximately 0.24 arcminute from Swiss Ephemeris's Lahiri value in the same test cases.

See `tests/fixtures/html-prototype-positions.v1.json` for reproducible reference inputs and expected outputs. These are **captured observations of the provided prototype**, not independently certified interpretations, and are not yet wired to CI as a parity gate.

## Priority defects and verification gates

1. **Timezone ambiguity is a confirmed bug:** `2024-03-10 02:30 America/Los_Angeles` does not exist in local civil time, but the current `zonedTimeToUtc` logic silently returns `2024-03-10T09:30:00Z`, which round-trips to 01:30 local. Reject nonexistent times and require explicit disambiguation of fall-back repeated times.
2. **Vimshottari antardasha needs correction/review:** the implementation starts the *remaining balance* of the birth Mahadasha at birth and allocates all nine antardashas fresh from that shortened period. Standard dasha sequencing requires honoring the elapsed part of the original full Mahadasha and returning its remaining subperiod tail. Test birth-boundary cases against documented references.
3. **Calculation provider must be non-silent:** the Next.js route can return a deterministic demo provider when the real service is absent or fails. Production charts advertised as calculated must fail closed or have an unmistakable demonstration indicator; configure production `AETHOS_ALLOW_DEMO_FALLBACK=false` after validating service connectivity.
4. **Input handling:** never assume coordinates `0,0` or the timezone `America/Los_Angeles` for an unknown location; the existing service adapter currently has such defaults. Require explicit birth place, timezone resolution and provenance before generating precision-sensitive outputs.
5. **Missing or approximate birth time:** do not invent noon or show unsupported rising signs, houses, BaZi hour pillars, Human Design type or astrocartography. Surface eligibility and uncertainty at field level.
6. **Reproducibility:** capture calculation instant and interpretation `asOf` separately. The prototype currently uses `new Date()` for live transits, current dasha and personal year; saved dossiers need their reference dates.
7. **Conventions and licensing:** validate gate offset and line boundaries, year-length conventions, BaZi civil-day boundaries, mean/true nodes, Dasha subperiods, numerology mapping and software license obligations by system rather than labeling everything universally correct.

## Safe execution sequence

1. Preserve source SHA-256 and copy the supplied HTML into a restricted reference area before modifications.
2. Add an extraction adapter that emits a typed, versioned calculation JSON contract *without changing the underlying equations*.
3. Run the reference engine on fixtures and compare each subsystem separately with the current FastAPI/Next.js behavior.
4. Repair timezone and Dasha issues in the reference-compatible engine; version golden fixtures alongside changes.
5. Enforce provider/source metadata in all API responses and refuse mislabeled demo outputs.
6. Build the paid 99+-page Aethos dossier as a **renderer of verified structured chart data**, never as a text generator of positions, gates, pillars or timestamps.
7. Stage a private preview, run cross-browser/mobile tests and payment-free waitlist/onboarding flows. Keep Stripe checkout disabled until the Stripe account is recovered and webhook-based fulfillment is verified.

**Release gate:** No paid report may ship until astronomical goldens, non-Western system calculations, historical timezones, user-input uncertainty, privacy controls, PDF pagination and independent report review pass. Do not merge this baseline-only PR as if it implemented those fixes.

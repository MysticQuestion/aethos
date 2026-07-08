# Calculation Verification

Implemented test coverage:

- Zodiac boundary conversion
- Circular longitude normalization
- Wraparound aspect math
- Retrograde detection
- Station detection
- Natal chart endpoint
- Unknown birth time disabling houses and angles
- IANA timezone validation
- Transit endpoint
- Events endpoint
- Timing primitives endpoint
- Canonical input hashing
- Reproducibility of demo chart facts

Golden fixtures:

- `services/calculation/tests/fixtures/golden_charts.pending.json`

The golden fixture file is intentionally marked pending. It defines required fixture categories but does not claim accuracy until expected values are populated from trusted external references.

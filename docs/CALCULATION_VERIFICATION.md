# Calculation Verification

## Implemented test coverage

- Zodiac boundary conversion
- Circular longitude normalization
- Wraparound aspect math
- Retrograde / station detection
- Natal chart endpoint
- Unknown birth time disables houses and angles
- IANA timezone validation
- Transit / events / timing primitives endpoints
- Canonical input hashing
- Demo chart reproducibility
- **Swiss / Moshier golden charts** (5 charts, body longitudes + angles + houses)

## Golden charts

Fixture: `services/calculation/tests/fixtures/golden_charts.json`

| Chart | What it stresses |
| --- | --- |
| `modern_us_chart` | LA 1992, Pacific TZ, Placidus |
| `european_chart` | Paris 1985, CET/CEST history |
| `southern_hemisphere_chart` | Sydney 1978, negative latitude |
| `historical_dst_sensitive_chart` | Florida 1969, US DST edge context |
| `unknown_birth_time_chart` | No time → houses empty; noon UTC-normalized planets only |

### Ephemeris modes

| Mode | Env | Use |
| --- | --- | --- |
| **Moshier** (default for CI) | `AETHOS_SWISS_EPHEMERIS_MODE=moshier` | Built-in `FLG_MOSEPH`, no licensed files |
| **Swiss files** | `AETHOS_SWISS_EPHEMERIS_MODE=files` + `AETHOS_SWISS_EPHEMERIS_PATH` | Production-grade `FLG_SWIEPH` |

### Failure policy

When `AETHOS_CALC_PROVIDER=swiss`:

- Body ecliptic longitude must match golden within `toleranceDegrees` (default **0.02°**)
- ASC / MC / house cusps within `angleToleranceDegrees` (default **0.05°**)
- Retrograde flags must match
- Demo provider must **not** pass golden sun within 0.5° (anti-false-positive)

### Regenerate fixtures

```bash
cd services/calculation
pip install -r requirements-swiss.txt
python scripts/generate_golden_charts.py
pytest tests/test_golden_charts.py -v
```

Licensed files:

```bash
AETHOS_SWISS_EPHEMERIS_MODE=files \
AETHOS_SWISS_EPHEMERIS_PATH=/path/to/ephe \
python scripts/generate_golden_charts.py
```

After regenerating with files mode, update `ephemerisMode` in the JSON and commit only if the team accepts the new reference values.

## Run

```bash
cd services/calculation
pip install -r requirements.txt -r requirements-swiss.txt
AETHOS_CALC_PROVIDER=swiss AETHOS_SWISS_EPHEMERIS_MODE=moshier \
  AETHOS_ALLOW_DEMO_FALLBACK=false pytest -v
```

CI installs `pyswisseph` and runs the full calculation suite including golden charts.

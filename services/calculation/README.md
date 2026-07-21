# Aethos Calculation Service

FastAPI service for server-side calculation boundaries. The active provider defaults to deterministic demo mode unless a verified Swiss Ephemeris provider is available.

## Run

```bash
cd services/calculation
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Test

```bash
cd services/calculation
pytest
```

## Endpoints

- `GET /health`
- `POST /v1/natal-chart`
- `POST /v1/transits`
- `POST /v1/events`
- `POST /v1/timing-primitives`
- `POST /v1/astrocartography`
- `POST /v1/relocation-chart`

## Provider Status

| Mode | Env | Notes |
| --- | --- | --- |
| demo | `AETHOS_CALC_PROVIDER=demo` | Deterministic samples, not astronomical |
| swiss + moshier | `AETHOS_CALC_PROVIDER=swiss` `AETHOS_SWISS_EPHEMERIS_MODE=moshier` | Built-in ephemeris; golden CI |
| swiss + files | `AETHOS_CALC_PROVIDER=swiss` `AETHOS_SWISS_EPHEMERIS_MODE=files` + path | Licensed SE files |

```bash
pip install -r requirements-swiss.txt
AETHOS_CALC_PROVIDER=swiss AETHOS_SWISS_EPHEMERIS_MODE=moshier \
  AETHOS_ALLOW_DEMO_FALLBACK=false pytest tests/test_golden_charts.py -v
```

Regenerate goldens: `python scripts/generate_golden_charts.py`  
Details: `docs/CALCULATION_VERIFICATION.md`

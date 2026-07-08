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

## Provider Status

Swiss Ephemeris is not active unless `pyswisseph` is installed, `AETHOS_CALC_PROVIDER=swiss`, and `AETHOS_SWISS_EPHEMERIS_PATH` points to available ephemeris files. Demo mode is deterministic but not astronomical precision.

# Aethos Calculation Service

The calculation service lives in `services/calculation` and provides server-side calculation boundaries for Aethos.

Implemented:

- FastAPI service
- `GET /health`
- `POST /v1/natal-chart`
- `POST /v1/transits`
- `POST /v1/events`
- `POST /v1/timing-primitives`
- Strict Pydantic request/response models
- Deterministic demo provider
- Optional Swiss Ephemeris provider adapter
- Calculation metadata and canonical input hashing
- Unknown-birth-time safeguards
- Request date-range limits
- Structured request logs without journal text or full private notes

Active provider in this repository state:

- `aethos-demo-calculation-provider`
- This is deterministic but not astronomical precision.

Swiss Ephemeris status:

- Adapter exists.
- `pyswisseph` is not installed by default.
- Ephemeris files are not bundled.
- No Swiss-backed production calculations were verified in this phase.

Run:

```bash
cd services/calculation
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Test:

```bash
cd services/calculation
. .venv/bin/activate
pytest
```

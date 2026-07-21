# Swiss Ephemeris Service

Aethos is ready for a future server-side Swiss Ephemeris service, but Swiss Ephemeris is not active in this local build.

Current calculation-service status:

- Adapter: `services/calculation/app/providers/swiss_ephemeris.py`
- Python extra: `pyswisseph` (`requirements-swiss.txt`)
- Modes:
  - **moshier** (default): built-in ephemeris, no licensed files — used for golden CI
  - **files**: licensed Swiss Ephemeris path via `AETHOS_SWISS_EPHEMERIS_PATH`
- Env vars:
  - `AETHOS_CALC_PROVIDER=swiss`
  - `AETHOS_SWISS_EPHEMERIS_MODE=moshier|files`
  - `AETHOS_SWISS_EPHEMERIS_PATH=/path/to/ephemeris/files` (files mode)
  - `AETHOS_ALLOW_DEMO_FALLBACK=false` recommended for production / golden tests
- Golden suite: `tests/fixtures/golden_charts.json` + `tests/test_golden_charts.py`
- See `docs/CALCULATION_VERIFICATION.md`

Recommended production boundary:

- FastAPI or other server-side sidecar
- Swiss Ephemeris installed only on the server
- Ephemeris files mounted in a private server path
- Aethos Next.js API routes call the service through server-only environment variables

Expected environment variables:

- `AETHOS_EPHEMERIS_SERVICE_URL`
- `AETHOS_EPHEMERIS_SERVICE_TOKEN`

Licensing caution:

Swiss Ephemeris has licensing requirements. A proprietary SaaS should verify professional/commercial license obligations before deployment. Do not copy licensed files into the client bundle.

Expected JSON contract:

- Input: date/time, timezone, coordinates, house system, zodiac mode, requested bodies
- Output: positions, speeds, houses, aspects, provider version, ephemeris source, warnings

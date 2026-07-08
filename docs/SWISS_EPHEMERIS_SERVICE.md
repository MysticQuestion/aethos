# Swiss Ephemeris Service

Aethos is ready for a future server-side Swiss Ephemeris service, but Swiss Ephemeris is not active in this local build.

Current calculation-service status:

- Optional adapter: `services/calculation/app/providers/swiss_ephemeris.py`
- Required Python extra: `pyswisseph`
- Required env vars:
  - `AETHOS_CALC_PROVIDER=swiss`
  - `AETHOS_SWISS_EPHEMERIS_PATH=/path/to/ephemeris/files`
  - `AETHOS_ALLOW_DEMO_FALLBACK=false` recommended for production
- Verified in this phase: demo provider only

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

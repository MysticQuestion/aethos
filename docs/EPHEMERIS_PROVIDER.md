# Ephemeris Provider

The provider interface lives under `src/lib/aethos/astrology/providers`.

Current provider:

- `aethos-demo-ephemeris`
- Mode: `demo`
- Deterministic sample output
- Emits warning: demo outputs are not astronomical calculations

Future providers:

- Server-side Swiss Ephemeris service
- External deterministic astrology API

Rules:

- Do not bundle licensed ephemeris code into the browser.
- Do not expose private service tokens client-side.
- Do not claim Swiss Ephemeris is active unless the server-side service is configured and verified.
- Store provider ID, version, input hash, coordinates, timezone, house system, zodiac mode, and warnings with every calculation.

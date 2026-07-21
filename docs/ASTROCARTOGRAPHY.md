# Astrocartography scaffold

Locational astrology layer for Aethos: planetary **ASC / DSC / MC / IC** lines + relocation chart.

## Product framing

Competitors: Astro.com AstroClick Travel, Astro-Seek Astrocartography / Relocation.

Aethos play:

- Same birth intake as the single-input engine  
- Deterministic line search on the calculation service  
- Responsible-use copy (reflection, not “you must move here”)  
- Transparent methodology (`methodKey`, residual orbs, Show the Math)  
- Journal / Decision Lens can reference relocation experiments later  

## API (calculation service)

### `POST /v1/astrocartography`

Request: natal birth fields + optional `lineTypes`, `longitudeStepDegrees`, `sampleLatitudes`.

Response:

- `lines[]` — body, lineType, geographicLongitude, sampleLatitude, residualOrbDegrees  
- `withheld[]` — when birth time unknown  
- `responsibleUseNote`  
- calculation metadata  

### `POST /v1/relocation-chart`

Same body as natal chart with **relocated** lat/lon/timezone. Returns chart + `relocationLabel`.

## Method (scaffold)

1. Normalize birth to UTC.  
2. Compute planet ecliptic longitudes (Swiss/Moshier or demo).  
3. For each body × line type, sample geographic longitudes and minimize angular distance between the planet and the relocated angle (ASC/DSC/MC/IC).  
4. ASC/DSC use sample latitudes; MC/IC use natal latitude.  

**Not yet:** full paran crossings, interactive world map tiles, local space, or Jim Lewis A*C*G trademarked report language.

## Frontend

- Route: `/astrocartography`  
- API proxy: `POST /api/aethos/astrocartography`  
- Local demo works without the Python service (server-side demo path via calc service when configured).

## Run

```bash
cd services/calculation
AETHOS_CALC_PROVIDER=swiss AETHOS_SWISS_EPHEMERIS_MODE=moshier \
  uvicorn app.main:app --reload
# POST /v1/astrocartography with natal JSON
pytest tests/test_astrocartography.py -v
```

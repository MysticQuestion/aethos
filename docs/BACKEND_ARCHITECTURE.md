# Aethos Backend Architecture

Aethos now has server-compatible contracts for deterministic chart, transit, timing-window, storage, export, and privacy workflows.

## Implemented

- `POST /api/aethos/chart`
- `POST /api/aethos/transits`
- `POST /api/aethos/timing-windows`
- `GET /api/aethos/provider-status`
- Deterministic demo ephemeris provider
- Calculation metadata and input hashing
- Local storage router with export/delete
- Supabase migration for `aethos_*` tables

## Calculation Boundary

LLMs must not calculate planetary positions, aspects, houses, stations, retrogrades, or timing windows. They may only interpret structured calculation output after deterministic services have produced data.

The current provider is demo mode only. It is deterministic and stable for the same inputs, but it is not astronomical output.

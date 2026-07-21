# Aethos repository layout

## Canonical path

```
/Users/micwil/Documents/Aethos
```

Git remote: `https://github.com/MysticQuestion/aethos.git`

## Consolidated sources

| Former location | Disposition |
| --- | --- |
| `~/Documents/Aethos` | **Canonical** — full Next.js app + calculation service |
| `~/aethos` | Bootstrap clone with empty README only; now points here |
| `~/Desktop/aethos-project` | Early mock; source files archived under `archive/early-desktop-prototype/` |

## Top-level structure

```
src/                 Next.js App Router UI + typed kernel modules
services/calculation FastAPI calculation boundary (demo / Swiss Ephemeris)
supabase/            Schema + migrations + RLS
docs/                Architecture and methodology
tests/               Vitest kernel + ephemeris contract tests
archive/             Historical prototypes (not runtime)
```

## Branches

Feature history (linear):

1. `feature/aethos-system-implementation` — identity + timing intelligence MVP
2. `feature/aethos-backend-ephemeris-data-layer` — backend contracts + data layer
3. `feature/aethos-calculation-service` — FastAPI calculation service
4. `main` — tip of that stack (current development line)

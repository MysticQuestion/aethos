# Deployment

Aethos splits into:

1. **Next.js frontend** (Vercel or any Node host) — this monorepo root  
2. **Calculation service** (container) — `services/calculation`  
3. **Supabase** (Auth + Postgres + RLS) — see `docs/SUPABASE_SETUP.md`

GitHub: https://github.com/MysticQuestion/aethos

## 1. Supabase (required for cloud accounts)

1. Create a Supabase project.
2. Apply migrations in `supabase/migrations/` (order by filename).
3. Configure Auth redirect: `{production-origin}/auth/callback` and local `http://localhost:3000/auth/callback`.
4. Copy Project URL + anon key into Vercel and local `.env.local`.

Details: `docs/SUPABASE_SETUP.md`.

## 2. Frontend on Vercel

```bash
# From repo root, with Vercel CLI optional:
npx vercel
```

Or import **MysticQuestion/aethos** in the Vercel dashboard.

### Environment variables (Vercel)

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For cloud mode | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For cloud mode | Public anon only |
| `AETHOS_CALCULATION_SERVICE_URL` | Production calc | Server-only |
| `AETHOS_ALLOW_DEMO_FALLBACK` | Recommended `false` in prod | Server-only |

Never set service role keys or Swiss ephemeris paths as `NEXT_PUBLIC_*`.

### Local demo

No env required. `npm run dev` works offline with localStorage.

## 3. Calculation service

### Docker (local / any host)

```bash
docker compose up calculation
# health
curl http://localhost:8000/health
```

Full stack (web + calc):

```bash
docker compose up
```

### Swiss Ephemeris production mode

1. Obtain licensed ephemeris files (respect Swiss Ephemeris commercial terms).
2. Place files in a host directory, e.g. `./services/calculation/ephe`.
3. Install optional Python dep: `pip install -r services/calculation/requirements-swiss.txt`
4. Set:

```bash
AETHOS_CALC_PROVIDER=swiss
AETHOS_SWISS_EPHEMERIS_PATH=/ephe   # inside container
AETHOS_ALLOW_DEMO_FALLBACK=false
AETHOS_SWISS_EPHEMERIS_HOST_PATH=./services/calculation/ephe
```

5. Rebuild calculation image if you bake `pyswisseph` into Dockerfile (default image is demo-only; install swiss extras in a custom image or runtime).

Custom image snippet:

```dockerfile
RUN pip install --no-cache-dir -r requirements-swiss.txt
```

### Deploy calculation service

Any container platform works (Fly.io, Railway, Render, Cloud Run, ECS).

Example Fly.io sketch:

```bash
cd services/calculation
fly launch --name aethos-calc --no-deploy
fly secrets set AETHOS_CALC_PROVIDER=demo AETHOS_ALLOW_DEMO_FALLBACK=true
fly deploy
```

Then set Vercel:

```bash
AETHOS_CALCULATION_SERVICE_URL=https://aethos-calc.fly.dev
AETHOS_ALLOW_DEMO_FALLBACK=false
```

## 4. CI

`.github/workflows/aethos-ci.yml` runs:

- calculation `pytest`
- frontend `lint` / `typecheck` / `test` / `build`

on push and PR to `main`.

## 5. Go-live checklist

- [ ] Supabase migrations applied + RLS verified  
- [ ] Auth redirect URLs include production origin  
- [ ] Vercel env public Supabase vars set  
- [ ] Calculation service healthy and reachable from Vercel server runtime  
- [ ] `AETHOS_ALLOW_DEMO_FALLBACK=false` if Swiss is required  
- [ ] Responsible-use copy reviewed on public pages  
- [ ] No secrets in client bundle  

## Local Demo Mode

No environment variables are required. The application stores local profile, journal, and report data in browser storage.

# Deployment

## Vercel

1. Install dependencies with `npm install` or `npm ci`.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
3. Configure optional public Supabase variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy the Next.js project.

## Local Demo Mode

No environment variables are required. The application stores local profile, journal, and report data in browser storage.

## Supabase Mode

Apply `supabase/schema.sql` to a Supabase project and verify RLS policies before enabling account persistence. Never expose service role keys in browser-visible variables.

## Calculation Service

The Python/FastAPI calculation service lives in `services/calculation`.

Container build:

```bash
cd services/calculation
docker build -t aethos-calculation-service .
docker run -p 8000:8000 aethos-calculation-service
```

Production command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Healthcheck:

```bash
curl http://localhost:8000/health
```

Vercel should keep serving the Next.js frontend. Deploy the FastAPI service to a container-capable environment, then configure the frontend server runtime:

```bash
AETHOS_CALCULATION_SERVICE_URL=https://your-calculation-service.example.com
AETHOS_ALLOW_DEMO_FALLBACK=false
```

Do not expose service tokens or private ephemeris paths in browser-visible variables.

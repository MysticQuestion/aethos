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

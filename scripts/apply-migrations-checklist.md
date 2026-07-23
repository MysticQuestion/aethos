# Apply Aethos migrations (checklist)

## In Supabase Dashboard → SQL Editor

Run **in this order** (copy/paste each file):

1. [ ] `supabase/migrations/202607080001_aethos_backend_ephemeris_data_layer.sql`
2. [ ] `supabase/migrations/202607200001_aethos_auth_persistence.sql`
3. [ ] `supabase/migrations/202607210001_aethos_single_input_engine.sql`

Optional kernel tables (insight cards / older schema):

4. [ ] `supabase/schema.sql` (if you still use non-`aethos_*` tables)

## Then

- [ ] Auth → URL config: Site URL + redirect `.../auth/callback`
- [ ] Enable Email provider (magic link and/or password)
- [ ] Copy Project URL + anon key into `.env.local` and Vercel env
- [ ] `node scripts/check-supabase-wiring.mjs`
- [ ] `npm run dev` → `/account` → sign in → push local → cloud

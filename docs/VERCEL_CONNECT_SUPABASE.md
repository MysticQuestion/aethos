# Vercel Connect + Supabase (`fuchsia-bridge`)

This path is for **ops / agents / MCP**: mint short-lived Supabase management tokens through Vercel Connect.

It is **not** how Aethos end-users sign in. App users still use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `/account` + `/auth/callback`

## Your Vercel context

| Item | Value |
| --- | --- |
| Team | `mysticquestions-projects` (`team_fwmCRasS1SrH3wwmYK5cYyAS`) |
| Existing project | `aethos-your-inner-compass` (framework was **Vite**, last deploy **ERROR**) |
| Canonical code | `/Users/micwil/Documents/Aethos` (Next.js 16) |
| GitHub | `https://github.com/MysticQuestion/aethos` |

**Recommendation:** Link/import this Next.js repo as a clean Vercel project named `aethos` (or re-point `aethos-your-inner-compass` at this repo and set Framework to Next.js). Connectors attach to a project.

## 1. Create the Supabase MCP connector (dashboard)

1. Open [Vercel Connect](https://vercel.com/dashboard) → team **mysticquestions-projects** → pick project **aethos** (or create one).
2. Go to **Connect** for that project.
3. **Create connector**:
   - Type: Custom OAuth / MCP provider (as offered for Supabase MCP)
   - Service URL: `https://mcp.supabase.com` (or the value Supabase shows for MCP)
   - **Name / id**: keep stable — your snippet uses  
     `mcp.supabase.com/fuchsia-bridge`  
     The last segment (`fuchsia-bridge`) is the installation slug.
4. Complete Supabase OAuth/consent in the browser.
5. **Attach** the connector to environments: Production + Preview (+ Development if you use local OIDC).

### CLI equivalent (when Connect CLI is available)

```bash
cd ~/Documents/Aethos
npx vercel link   # select mysticquestions-projects + aethos project
npx vercel connect create mcp.supabase.com --name fuchsia-bridge
npx vercel connect attach mcp.supabase.com/fuchsia-bridge
npx vercel env pull .env.local
```

## 2. Fix the token snippet

**Broken / incomplete example:**

```ts
getToken('mcp.supabase.com/fuchsia-bridge', {
  subject: { type: "user", id: "usr_123" }, // placeholder
  scopes: [/* ... */],
});
```

**Correct patterns used in Aethos:**

### App-level ops (migrations, project admin — no end-user consent)

```ts
import { getSupabaseConnectToken } from "@/lib/vercel/connect-supabase";

const token = await getSupabaseConnectToken({
  subject: { type: "app" },
});
```

### User-delegated ops (acts as a specific Supabase user)

```ts
const token = await getSupabaseConnectToken({
  subject: { type: "user", id: realUserId }, // never usr_123
});
// On UserAuthorizationRequiredError → startSupabaseConnectAuthorization()
```

Helpers live in:

- `src/lib/vercel/connect-supabase.ts`
- `POST /api/ops/supabase-connect-token` (requires `AETHOS_OPS_SECRET`)
- `GET /api/ops/supabase-status` (safe, no secrets)

## 3. Environment variables

### App runtime (required for `/account` cloud sync)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Ops / Connect (optional)

```bash
# Connector id if different from default
AETHOS_VERCEL_CONNECT_SUPABASE_ID=mcp.supabase.com/fuchsia-bridge

# Prefer OIDC from `vercel env pull` on linked projects:
# VERCEL_OIDC_TOKEN=...

# Or a personal/team token for CI scripts:
# VERCEL_TOKEN=...

# Only if using user-subject tokens:
# AETHOS_CONNECT_SUBJECT_USER_ID=...

# Protects POST /api/ops/supabase-connect-token
AETHOS_OPS_SECRET=long-random-string
```

## 4. Auth redirects (Supabase dashboard)

Authentication → URL configuration:

| Setting | Local | Production |
| --- | --- | --- |
| Site URL | `http://localhost:3000` | `https://your-aethos.vercel.app` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://your-aethos.vercel.app/auth/callback` |

## 5. Apply migrations

In Supabase SQL Editor, run in order:

1. `supabase/migrations/202607080001_aethos_backend_ephemeris_data_layer.sql`
2. `supabase/migrations/202607200001_aethos_auth_persistence.sql`
3. `supabase/migrations/202607210001_aethos_single_input_engine.sql`

Or:

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

## 6. Verify

```bash
# App config (safe)
curl -s http://localhost:3000/api/ops/supabase-status | jq .

# Ops token (only after Connect is attached + OIDC/token present)
curl -s -X POST http://localhost:3000/api/ops/supabase-connect-token \
  -H "content-type: application/json" \
  -H "x-aethos-ops-secret: $AETHOS_OPS_SECRET" \
  -d '{"subjectType":"app"}' | jq .
```

## Security rules

- Never put Connect access tokens or service_role keys in `NEXT_PUBLIC_*`.
- Never commit `.env.local`.
- Mint Connect tokens at request time; do not cache them in env for days.
- Lock `AETHOS_OPS_SECRET` and do not expose `/api/ops/*` without it.

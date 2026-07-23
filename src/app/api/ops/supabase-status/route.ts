import { NextResponse } from "next/server";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { getSupabaseConnectStatus } from "@/lib/vercel/connect-supabase";

/**
 * Safe status endpoint — never returns secrets.
 * GET /api/ops/supabase-status
 */
export async function GET() {
  const app = getSupabaseConfigStatus();
  const connect = getSupabaseConnectStatus();

  return NextResponse.json({
    ok: true,
    app: {
      configured: app.configured,
      requiredEnv: app.requiredEnv,
      readyForAccountSync: app.configured
    },
    connect: connect,
    vercelProjectHint: {
      team: "mysticquestions-projects",
      existingProject: "aethos-your-inner-compass",
      note: "Existing Vercel project is Vite-based and last deploy ERRORed. Link Documents/Aethos (Next.js) as aethos or reconfigure that project to this repo."
    },
    migrations: [
      "supabase/migrations/202607080001_aethos_backend_ephemeris_data_layer.sql",
      "supabase/migrations/202607200001_aethos_auth_persistence.sql",
      "supabase/migrations/202607210001_aethos_single_input_engine.sql"
    ],
    nextSteps: app.configured
      ? [
          "Open /account and sign in",
          "Confirm Auth redirect URLs include /auth/callback",
          "Optional: configure Vercel Connect fuchsia-bridge for ops MCP"
        ]
      : [
          "Create Supabase project",
          "Run migrations in SQL editor (see docs/SUPABASE_SETUP.md)",
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and Vercel",
          "Restart npm run dev"
        ]
  });
}

import { NextResponse } from "next/server";
import {
  getSupabaseConnectTokenResponse,
  isConnectInstallationRequired,
  isConnectUserAuthRequired,
  startSupabaseConnectAuthorization,
  resolveConnectSubject,
  getSupabaseConnectConfig
} from "@/lib/vercel/connect-supabase";

/**
 * Server-only ops route: mint a short-lived Supabase Connect token.
 *
 * Guarded by AETHOS_OPS_SECRET (header x-aethos-ops-secret).
 * Never expose this publicly without that secret.
 *
 * POST /api/ops/supabase-connect-token
 * Body optional: { "subjectType": "app" | "user", "userId"?: string }
 */
export async function POST(request: Request) {
  const expected = process.env.AETHOS_OPS_SECRET?.trim();
  if (!expected) {
    return NextResponse.json(
      {
        error: "ops_disabled",
        message: "Set AETHOS_OPS_SECRET to enable this ops endpoint."
      },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-aethos-ops-secret");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let subjectType: "app" | "user" = "app";
  let userId: string | undefined;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      subjectType?: "app" | "user";
      userId?: string;
    };
    if (body.subjectType === "user" || body.subjectType === "app") {
      subjectType = body.subjectType;
    }
    userId = body.userId?.trim() || process.env.AETHOS_CONNECT_SUBJECT_USER_ID?.trim();
  } catch {
    // empty body ok
  }

  const subject =
    subjectType === "user"
      ? resolveConnectSubject(
          userId ? { type: "user", id: userId } : undefined
        )
      : ({ type: "app" } as const);

  if (subject.type === "user" && !("id" in subject && subject.id)) {
    return NextResponse.json(
      {
        error: "missing_user_id",
        message: "User subject requires body.userId or AETHOS_CONNECT_SUBJECT_USER_ID."
      },
      { status: 400 }
    );
  }

  try {
    const response = await getSupabaseConnectTokenResponse({ subject });
    // Return metadata + token only over authenticated ops channel.
    return NextResponse.json({
      ok: true,
      connector: response.connector,
      expiresAt: response.expiresAt,
      tokenId: response.tokenId,
      // Short-lived Connect token; only returned when ops secret matches.
      token: response.token,
      config: {
        connectorId: getSupabaseConnectConfig().connectorId,
        subject
      }
    });
  } catch (error) {
    if (isConnectUserAuthRequired(error)) {
      try {
        const auth = await startSupabaseConnectAuthorization({
          subject: subject.type === "user" ? subject : undefined
        });
        return NextResponse.json(
          {
            error: "user_authorization_required",
            message: "User must complete Supabase consent via Connect.",
            authorizationUrl: auth.url
          },
          { status: 403 }
        );
      } catch (authError) {
        return NextResponse.json(
          {
            error: "user_authorization_required",
            message:
              authError instanceof Error
                ? authError.message
                : "Consent required; could not start authorization."
          },
          { status: 403 }
        );
      }
    }

    if (isConnectInstallationRequired(error)) {
      return NextResponse.json(
        {
          error: "connector_installation_required",
          message:
            "Create and attach mcp.supabase.com/fuchsia-bridge in Vercel Connect. See docs/VERCEL_CONNECT_SUPABASE.md."
        },
        { status: 424 }
      );
    }

    return NextResponse.json(
      {
        error: "connect_failed",
        message: error instanceof Error ? error.message : "Token request failed.",
        hint: "Run vercel link && vercel env pull so VERCEL_OIDC_TOKEN is available, or set VERCEL_TOKEN."
      },
      { status: 502 }
    );
  }
}

/**
 * Vercel Connect → Supabase MCP token helper (ops / agents only).
 *
 * NOT for browser clients. NOT a replacement for NEXT_PUBLIC_SUPABASE_* app auth.
 *
 * Connector id example from your setup: mcp.supabase.com/fuchsia-bridge
 * Create/attach the connector in Vercel Connect first — see docs/VERCEL_CONNECT_SUPABASE.md
 */

import {
  getToken,
  getTokenResponse,
  startAuthorization,
  UserAuthorizationRequiredError,
  ConnectorInstallationRequiredError,
  type ConnectTokenResponse
} from "@vercel/connect";

/** Default connector slug from Vercel Connect / Supabase MCP install. Override via env. */
export const DEFAULT_SUPABASE_CONNECT_ID = "mcp.supabase.com/fuchsia-bridge";

/** Scopes aligned with management + migration ops (trim in production). */
export const DEFAULT_SUPABASE_CONNECT_SCOPES = [
  "organizations:read",
  "projects:read",
  "projects:write",
  "database:read",
  "database:write",
  "analytics:read",
  "secrets:read",
  "edge_functions:read",
  "edge_functions:write",
  "environment:read",
  "environment:write",
  "storage:read"
] as const;

export type ConnectSubject =
  | { type: "app" }
  | { type: "user"; id: string };

export function getSupabaseConnectConfig() {
  return {
    connectorId: process.env.AETHOS_VERCEL_CONNECT_SUPABASE_ID?.trim() || DEFAULT_SUPABASE_CONNECT_ID,
    scopes: (process.env.AETHOS_VERCEL_CONNECT_SCOPES?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [...DEFAULT_SUPABASE_CONNECT_SCOPES]) as string[],
    /** Optional off-Vercel auth (CI). Prefer OIDC on Vercel deployments. */
    vercelToken: process.env.VERCEL_TOKEN?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim() || undefined,
    subjectUserId: process.env.AETHOS_CONNECT_SUBJECT_USER_ID?.trim() || undefined
  };
}

export function resolveConnectSubject(override?: ConnectSubject): ConnectSubject {
  if (override) return override;
  const cfg = getSupabaseConnectConfig();
  if (cfg.subjectUserId) {
    return { type: "user", id: cfg.subjectUserId };
  }
  // App-level ops tokens skip end-user consent when the connector allows it.
  return { type: "app" };
}

/**
 * Mint a short-lived Supabase Connect token for MCP / Management API calls.
 * Call at request time — do not store in long-lived env vars.
 */
export async function getSupabaseConnectToken(options?: {
  subject?: ConnectSubject;
  scopes?: string[];
  connectorId?: string;
}): Promise<string> {
  const cfg = getSupabaseConnectConfig();
  const connectorId = options?.connectorId ?? cfg.connectorId;
  const subject = resolveConnectSubject(options?.subject);
  const scopes = options?.scopes ?? cfg.scopes;

  return getToken(
    connectorId,
    { subject, scopes },
    cfg.vercelToken ? { vercelToken: cfg.vercelToken } : undefined
  );
}

export async function getSupabaseConnectTokenResponse(options?: {
  subject?: ConnectSubject;
  scopes?: string[];
  connectorId?: string;
}): Promise<ConnectTokenResponse> {
  const cfg = getSupabaseConnectConfig();
  const connectorId = options?.connectorId ?? cfg.connectorId;
  const subject = resolveConnectSubject(options?.subject);
  const scopes = options?.scopes ?? cfg.scopes;

  return getTokenResponse(
    connectorId,
    { subject, scopes },
    cfg.vercelToken ? { vercelToken: cfg.vercelToken } : undefined
  );
}

/**
 * Start user consent when getToken throws UserAuthorizationRequiredError.
 */
export async function startSupabaseConnectAuthorization(options?: {
  subject?: ConnectSubject;
  scopes?: string[];
  connectorId?: string;
}) {
  const cfg = getSupabaseConnectConfig();
  const connectorId = options?.connectorId ?? cfg.connectorId;
  const subject = resolveConnectSubject(options?.subject);
  if (subject.type !== "user") {
    throw new Error("startSupabaseConnectAuthorization requires a user subject.");
  }
  const scopes = options?.scopes ?? cfg.scopes;
  return startAuthorization(
    connectorId,
    { subject, scopes },
    cfg.vercelToken ? { vercelToken: cfg.vercelToken } : undefined
  );
}

export function isConnectUserAuthRequired(error: unknown): error is UserAuthorizationRequiredError {
  return error instanceof UserAuthorizationRequiredError;
}

export function isConnectInstallationRequired(error: unknown): error is ConnectorInstallationRequiredError {
  return error instanceof ConnectorInstallationRequiredError;
}

export function getSupabaseConnectStatus() {
  const cfg = getSupabaseConnectConfig();
  return {
    connectorId: cfg.connectorId,
    scopes: cfg.scopes,
    hasVercelToken: Boolean(cfg.vercelToken),
    subjectMode: cfg.subjectUserId ? ("user" as const) : ("app" as const),
    subjectUserIdConfigured: Boolean(cfg.subjectUserId),
    note: "Runtime app data still uses NEXT_PUBLIC_SUPABASE_URL + ANON_KEY. Connect tokens are for ops/MCP only."
  };
}

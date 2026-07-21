import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv, hasSupabasePublicConfig } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  if (!hasSupabasePublicConfig()) {
    return response;
  }

  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  // Refresh session if present; do not force-login (local demo remains open).
  await supabase.auth.getUser();

  const isAccountRoute = request.nextUrl.pathname.startsWith("/account");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  if (isAccountRoute || isAuthCallback) {
    return response;
  }

  return response;
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv, hasSupabasePublicConfig } from "./env";

export async function createSupabaseServerClient() {
  if (!hasSupabasePublicConfig()) {
    return null;
  }

  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component without mutable cookies — middleware refreshes sessions.
        }
      }
    }
  });
}

export async function getServerSessionUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

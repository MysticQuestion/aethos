import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv, hasSupabasePublicConfig, getSupabaseConfigStatus } from "./env";

export { hasSupabasePublicConfig, getSupabaseConfigStatus };

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicConfig()) {
    return null;
  }
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}

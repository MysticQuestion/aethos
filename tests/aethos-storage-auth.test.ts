import { describe, expect, it } from "vitest";
import { getSupabaseStoreStatus } from "@/lib/aethos/storage/supabase-store";
import { getSupabaseConfigStatus, hasSupabasePublicConfig } from "@/lib/supabase/env";

describe("Aethos storage and auth status", () => {
  it("reports Supabase as unconfigured without public env", () => {
    expect(hasSupabasePublicConfig()).toBe(false);
    expect(getSupabaseConfigStatus().configured).toBe(false);
    const status = getSupabaseStoreStatus(null);
    expect(status.configured).toBe(false);
    expect(status.writable).toBe(false);
    expect(status.authenticated).toBe(false);
  });

  it("requires a session before cloud writes even when env is present", () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    try {
      expect(hasSupabasePublicConfig()).toBe(true);
      const unauthenticated = getSupabaseStoreStatus(null);
      expect(unauthenticated.configured).toBe(true);
      expect(unauthenticated.writable).toBe(false);
      expect(unauthenticated.authenticated).toBe(false);

      const authenticated = getSupabaseStoreStatus({
        id: "00000000-0000-0000-0000-000000000001",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString()
      } as never);

      expect(authenticated.writable).toBe(true);
      expect(authenticated.authenticated).toBe(true);
      expect(authenticated.userId).toBe("00000000-0000-0000-0000-000000000001");
    } finally {
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
    }
  });
});

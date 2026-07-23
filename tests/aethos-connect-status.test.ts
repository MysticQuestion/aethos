import { describe, expect, it } from "vitest";
import {
  DEFAULT_SUPABASE_CONNECT_ID,
  getSupabaseConnectStatus,
  resolveConnectSubject
} from "@/lib/vercel/connect-supabase";

describe("Vercel Connect Supabase helpers", () => {
  it("defaults connector id to fuchsia-bridge style id", () => {
    const status = getSupabaseConnectStatus();
    expect(status.connectorId).toBe(DEFAULT_SUPABASE_CONNECT_ID);
    expect(status.note).toMatch(/NEXT_PUBLIC_SUPABASE/i);
  });

  it("resolves app subject when no user id is configured", () => {
    const previous = process.env.AETHOS_CONNECT_SUBJECT_USER_ID;
    delete process.env.AETHOS_CONNECT_SUBJECT_USER_ID;
    try {
      expect(resolveConnectSubject()).toEqual({ type: "app" });
      expect(resolveConnectSubject({ type: "user", id: "real-user" })).toEqual({
        type: "user",
        id: "real-user"
      });
    } finally {
      if (previous === undefined) delete process.env.AETHOS_CONNECT_SUBJECT_USER_ID;
      else process.env.AETHOS_CONNECT_SUBJECT_USER_ID = previous;
    }
  });
});

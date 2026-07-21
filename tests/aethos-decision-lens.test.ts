import { describe, expect, it } from "vitest";
import {
  castDecisionLens,
  decisionCastToJournalBody,
  isCastExpired
} from "@/lib/aethos/engines/decision-lens";

describe("I Ching Decision Lens", () => {
  it("requires a real question", () => {
    expect(() => castDecisionLens("ok")).toThrow(/question/i);
  });

  it("produces ephemeral cast with math and decay", () => {
    const cast = castDecisionLens("Should I ship the multi-system profile this week?", "fixed-entropy-for-test");
    expect(cast.systemKey).toBe("i_ching");
    expect(cast.primaryHexagram).toBeGreaterThanOrEqual(1);
    expect(cast.primaryHexagram).toBeLessThanOrEqual(64);
    expect(cast.ephemeralWeight).toBe(0.95);
    expect(cast.lines).toHaveLength(6);
    expect(cast.math.lineValues).toHaveLength(6);
    expect(new Date(cast.expiresAt).getTime()).toBeGreaterThan(new Date(cast.castAt).getTime());
    expect(isCastExpired(cast, new Date(cast.castAt))).toBe(false);
    expect(isCastExpired(cast, new Date(cast.expiresAt))).toBe(true);
  });

  it("archives to a journal-ready body without claiming fate", () => {
    const cast = castDecisionLens("Is this the right week to relocate?", "archive-test");
    const body = decisionCastToJournalBody(cast);
    expect(body).toContain("Decision Lens");
    expect(body).toContain(cast.userQuestion);
    expect(body.toLowerCase()).not.toContain("you will definitely");
  });

  it("is deterministic for fixed entropy", () => {
    const a = castDecisionLens("Same question for determinism check?", "same-seed");
    const b = castDecisionLens("Same question for determinism check?", "same-seed");
    expect(a.primaryHexagram).toBe(b.primaryHexagram);
    expect(a.relatingHexagram).toBe(b.relatingHexagram);
    expect(a.math.lineValues).toEqual(b.math.lineValues);
    expect(a.math.seed).toBe(b.math.seed);
  });
});

import { describe, expect, it } from "vitest";
import { demoIntake, buildDemoKernel } from "@/lib/aethos/demo";
import { isLowConfidenceMode, parseBirthIntake } from "@/lib/aethos/intake";
import { createJournalEntry, extractJournalThemes } from "@/lib/aethos/journal";
import { calculateNumerology, reduceNumber } from "@/lib/aethos/numerology";
import { createSampleAethosProfile, generateAethosProfile } from "@/lib/aethos/profile";
import { generateAethosReport } from "@/lib/aethos/reports";
import { classifyReconciliation, reconcileVectors } from "@/lib/aethos/reconciliation";
import { getStorageMode } from "@/lib/aethos/storage";
import { generateTimingWindows } from "@/lib/aethos/timing";
import type { SymbolicVector } from "@/lib/aethos/types";

describe("Aethos Phase 1 kernel", () => {
  it("validates canonical intake and preserves unknown birth time", () => {
    const parsed = parseBirthIntake(demoIntake);
    expect(parsed.birthTime).toBeUndefined();
    expect(parsed.birthTimeConfidence).toBe("unknown");
    expect(isLowConfidenceMode(parsed)).toBe(true);
  });

  it("reduces numerology values while preserving master numbers", () => {
    expect(reduceNumber(29)).toBe(11);
    expect(reduceNumber(38)).toBe(11);
    expect(reduceNumber(44)).toBe(8);
  });

  it("calculates deterministic numerology without birth time", () => {
    const result = calculateNumerology(demoIntake, new Date("2026-07-08T12:00:00.000Z"));
    expect(result.lifePath).toBe(7);
    expect(result.birthDay).toBe(9);
    expect(result.personalYear).toBe(5);
    expect(result.symbolicKeys).toContain("num_life_path_7");
  });

  it("classifies high variance as paradox instead of averaging it away", () => {
    const vectors: SymbolicVector[] = [
      {
        symbolicKey: "a",
        sourceSystem: "numerology",
        sourceObject: "A",
        theme: "action_decision",
        axis: "pacing_momentum",
        direction: 0.9,
        weight: 1,
        confidence: 1
      },
      {
        symbolicKey: "b",
        sourceSystem: "western_astrology",
        sourceObject: "B",
        theme: "action_decision",
        axis: "pacing_momentum",
        direction: -0.9,
        weight: 1,
        confidence: 1
      }
    ];
    const [run] = reconcileVectors(vectors);
    expect(run.classification).toBe("paradox");
    expect(classifyReconciliation(run.netAlignment, run.contradictionIndex)).toBe("paradox");
  });

  it("builds insight cards with engine metadata", () => {
    const kernel = buildDemoKernel();
    expect(kernel.insights.length).toBeGreaterThan(0);
    expect(kernel.insights[0].engineDrawer.generatedFrom).toBe("structured_vectors");
    expect(kernel.western.metadata.restrictedOutputs).toContain("Ascendant");
  });

  it("generates a structured sample profile and timing windows", () => {
    const profile = createSampleAethosProfile();
    const timing = generateTimingWindows(profile);
    expect(profile.isSample).toBe(true);
    expect(profile.corePatternMap.length).toBeGreaterThanOrEqual(3);
    expect(timing).toHaveLength(3);
    expect(timing[0].summary).toContain("reflective marker");
  });

  it("extracts journal themes and generates report markdown", () => {
    const entry = createJournalEntry({
      mood: "charged",
      theme: "decision",
      decisionContext: "Choose a project direction",
      body: "The decision feels tied to work timing and body energy."
    });
    const profile = generateAethosProfile(demoIntake, true);
    const report = generateAethosReport("decision_lens", profile, [entry]);

    expect(extractJournalThemes(entry.body, "decision")).toEqual(
      expect.arrayContaining(["decision", "timing", "energy", "work"])
    );
    expect(report.markdown).toContain("## Responsible Use");
    expect(report.journalObservations.length).toBeGreaterThan(0);
  });

  it("defaults to local demo mode without public Supabase env vars", () => {
    expect(getStorageMode()).toBe("local_demo");
  });
});

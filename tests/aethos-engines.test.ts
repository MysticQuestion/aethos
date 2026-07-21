import { describe, expect, it } from "vitest";
import { demoIntake, buildDemoKernel } from "@/lib/aethos/demo";
import {
  calculateBazi,
  calculateHumanDesign,
  calculateIChing,
  calculateVedicBaseline,
  runEnabledEngines
} from "@/lib/aethos/engines";
import { createSampleAethosProfile } from "@/lib/aethos/profile";

describe("Aethos multi-system engines", () => {
  it("withholds Human Design Type without exact birth time", () => {
    const hd = calculateHumanDesign(demoIntake);
    expect(hd.status).toBe("withheld");
    expect(hd.withheld).toContain("Type");
    expect(hd.symbolicKeys).toHaveLength(0);
  });

  it("exposes research preview Vedic/BaZi/I Ching scaffolds from date", () => {
    const vedic = calculateVedicBaseline(demoIntake);
    const bazi = calculateBazi(demoIntake);
    const iching = calculateIChing(demoIntake);
    expect(vedic.highlights.some((h) => h.label.includes("Rashi"))).toBe(true);
    expect(bazi.highlights.some((h) => h.label.includes("Day pillar"))).toBe(true);
    expect(Number(iching.highlights.find((h) => h.label === "Hexagram")?.value)).toBeGreaterThan(0);
    expect(bazi.withheld).toContain("Hour pillar");
  });

  it("runs enabled engines and attaches system layers on profiles", () => {
    const kernel = buildDemoKernel();
    expect(kernel.multiSystem.length).toBeGreaterThanOrEqual(3);
    const profile = createSampleAethosProfile();
    expect(profile.systemLayers.length).toBeGreaterThanOrEqual(4);
    expect(profile.systemLayers.some((layer) => layer.systemKey === "numerology")).toBe(true);
    expect(profile.systemLayers.some((layer) => layer.systemKey === "human_design")).toBe(true);
  });

  it("is deterministic for same intake", () => {
    const a = runEnabledEngines(demoIntake);
    const b = runEnabledEngines(demoIntake);
    expect(a.map((x) => x.summary)).toEqual(b.map((x) => x.summary));
  });
});

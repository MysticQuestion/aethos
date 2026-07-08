import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { calculateAspect } from "@/lib/aethos/astrology/aspects";
import { createInputHash, attachCalculationMetadata, validateCalculationMetadata } from "@/lib/aethos/astrology/metadata";
import { createNatalChart } from "@/lib/aethos/astrology/natal";
import { demoEphemerisProvider } from "@/lib/aethos/astrology/providers/demo-ephemeris-provider";
import { detectRetrograde, detectStation } from "@/lib/aethos/astrology/retrogrades";
import { generateTransitEvents } from "@/lib/aethos/astrology/transits";
import { aggregateThemeScores, calculateConfidenceScore, generateTimingWindows } from "@/lib/aethos/astrology/timing-windows";
import { decimalToZodiac, normalizeLongitude, zodiacToDecimal } from "@/lib/aethos/astrology/zodiac-format";
import { compareWindowToBaseline, createEmaJournalEntry } from "@/lib/aethos/journal/journal-analysis";
import { exportAethosData } from "@/lib/aethos/storage/data-export";
import { deleteLocalAethosData } from "@/lib/aethos/storage/data-delete";
import { loadTimingWindows, saveTimingWindows } from "@/lib/aethos/storage/local-store";
import { createScratchpad, validateScratchpad } from "@/lib/aethos/narrative/scratchpad";
import type { CelestialPosition, NatalChartInput } from "@/lib/aethos/astrology/types";

const chartInput: NatalChartInput = {
  birthDate: "1992-04-18",
  birthTimeKnown: false,
  birthLocationLabel: "Los Angeles, United States",
  houseSystem: "whole_sign",
  zodiacMode: "tropical",
  calculationMode: "demo"
};

function position(body: "sun" | "moon", longitude: number): CelestialPosition {
  return {
    body,
    longitude,
    latitude: 0,
    speed: { longitudePerDay: 1 },
    zodiac: decimalToZodiac(longitude),
    isRetrograde: false,
    calculatedAt: "2026-07-08T00:00:00.000Z",
    providerId: "test",
    calculationMode: "demo",
    warnings: []
  };
}

describe("Aethos backend ephemeris and data layer", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key)
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converts decimal longitude and zodiac positions correctly", () => {
    expect(normalizeLongitude(-1)).toBe(359);
    expect(decimalToZodiac(30.5)).toMatchObject({ sign: "Taurus", degree: 0, minute: 30 });
    expect(zodiacToDecimal("Aries", 29, 59, 60)).toBe(30);
  });

  it("calculates aspects and retrograde station states", () => {
    const aspect = calculateAspect(position("sun", 10), position("moon", 100));
    expect(aspect?.type).toBe("square");
    expect(detectRetrograde(-0.1)).toBe(true);
    expect(detectStation(0.2, -0.01)).toBe("station_retrograde");
  });

  it("creates stable input hashes and valid metadata", () => {
    expect(createInputHash({ b: 2, a: 1 })).toBe(createInputHash({ a: 1, b: 2 }));
    const metadata = attachCalculationMetadata({
      providerId: "demo",
      providerVersion: "1",
      calculationMode: "demo",
      sourceInput: chartInput
    });
    expect(validateCalculationMetadata(metadata)).toBe(true);
  });

  it("returns deterministic demo provider output", async () => {
    const one = await demoEphemerisProvider.getPlanetPosition({ ...chartInput, body: "sun", date: "2026-07-08T00:00:00.000Z" });
    const two = await demoEphemerisProvider.getPlanetPosition({ ...chartInput, body: "sun", date: "2026-07-08T00:00:00.000Z" });
    expect(one.longitude).toBe(two.longitude);
    expect(one.warnings[0]).toContain("Demo ephemeris provider active");
  });

  it("generates timing windows and theme scores from demo transits", async () => {
    const chart = await createNatalChart(chartInput);
    const { transitEvents } = await generateTransitEvents(chart, {
      startDate: "2026-07-01T00:00:00.000Z",
      endDate: "2026-09-01T00:00:00.000Z"
    });
    const windows = generateTimingWindows(transitEvents);
    expect(aggregateThemeScores(transitEvents).length).toBeGreaterThan(0);
    expect(calculateConfidenceScore(transitEvents)).toBeGreaterThan(0);
    expect(windows[0].responsibleUseNote).toContain("interpretation");
  });

  it("compares journal windows to baseline conservatively", async () => {
    const chart = await createNatalChart(chartInput);
    const { transitEvents } = await generateTransitEvents(chart, {
      startDate: "2026-07-01T00:00:00.000Z",
      endDate: "2026-09-01T00:00:00.000Z"
    });
    const [window] = generateTimingWindows(transitEvents);
    const entries = Array.from({ length: 6 }, (_, index) =>
      ({
        ...createEmaJournalEntry({
          mood: 5,
          stress: 7,
          focus: 4,
          tags: ["structure"],
          linkedTimingWindowIds: [window.id]
        }),
        createdAt: new Date(new Date(window.startDate).getTime() + index * 1000).toISOString()
      })
    );
    const insight = compareWindowToBaseline(entries, window);
    expect(insight.status).toBe("insufficient_data");
  });

  it("exports, persists, and deletes local timing data", async () => {
    const chart = await createNatalChart(chartInput);
    const { transitEvents } = await generateTransitEvents(chart, {
      startDate: "2026-07-01T00:00:00.000Z",
      endDate: "2026-09-01T00:00:00.000Z"
    });
    const windows = generateTimingWindows(transitEvents);
    saveTimingWindows(windows);
    expect(loadTimingWindows()).toHaveLength(1);
    expect(exportAethosData().exportVersion).toBe("aethos-export-v1");
    deleteLocalAethosData();
    expect(loadTimingWindows()).toHaveLength(0);
  });

  it("validates narrative scratchpad structure", () => {
    expect(validateScratchpad(createScratchpad())).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  createDemoAstrocartography,
  toServiceAstrocartographyPayload
} from "@/lib/aethos/astrology/astrocartography";

describe("Astrocartography frontend scaffold", () => {
  it("withholds lines without birth time in local demo", () => {
    const result = createDemoAstrocartography({
      birthDate: "1992-04-18",
      birthTimeKnown: false,
      timezone: "America/Los_Angeles",
      latitude: 34,
      longitude: -118
    });
    expect(result.lines).toHaveLength(0);
    expect(result.withheld.length).toBeGreaterThan(0);
  });

  it("produces deterministic demo lines with birth time", () => {
    const input = {
      birthDate: "1992-04-18",
      birthTime: "14:30",
      birthTimeKnown: true,
      timezone: "America/Los_Angeles",
      latitude: 34.0522,
      longitude: -118.2437,
      requestedBodies: ["sun", "moon"] as const,
      lineTypes: ["MC", "IC"] as const
    };
    const a = createDemoAstrocartography({ ...input, requestedBodies: [...input.requestedBodies], lineTypes: [...input.lineTypes] });
    const b = createDemoAstrocartography({ ...input, requestedBodies: [...input.requestedBodies], lineTypes: [...input.lineTypes] });
    expect(a.lines).toHaveLength(4);
    expect(a.lines).toEqual(b.lines);
    expect(a.providerRoute).toBe("local_demo");
  });

  it("maps to calculation service payload shape", () => {
    const payload = toServiceAstrocartographyPayload({
      birthDate: "1992-04-18",
      birthTime: "14:30",
      birthTimeKnown: true,
      timezone: "America/Los_Angeles",
      latitude: 34,
      longitude: -118
    });
    expect(payload.localBirthDate).toBe("1992-04-18");
    expect(payload.localBirthTime).toBe("14:30:00");
    expect(payload.lineTypes).toContain("ASC");
    expect(payload.houseSystem).toBe("placidus");
  });
});

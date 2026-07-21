import type { Planet } from "./types";

export type AcgLineType = "ASC" | "DSC" | "MC" | "IC";

export type AstroCartographyLine = {
  lineId: string;
  body: Planet;
  lineType: AcgLineType;
  geographicLongitude: number;
  sampleLatitude: number;
  residualOrbDegrees: number;
  methodKey: string;
  notes: string[];
};

export type AstrocartographyResult = {
  normalizedUtc: string;
  lines: AstroCartographyLine[];
  withheld: string[];
  warnings: string[];
  responsibleUseNote: string;
  calculationMetadata: {
    calculationMode?: string;
    providerId?: string;
    inputHash?: string;
    [key: string]: unknown;
  };
  providerRoute: "calculation_service" | "local_demo";
};

export type AstrocartographyInput = {
  birthDate: string;
  birthTime?: string;
  birthTimeKnown: boolean;
  timezone: string;
  latitude: number;
  longitude: number;
  houseSystem?: "placidus" | "whole_sign";
  requestedBodies?: Planet[];
  lineTypes?: AcgLineType[];
  longitudeStepDegrees?: number;
  sampleLatitudes?: number[];
};

/** Local demo scaffold when calculation service is unavailable. */
export function createDemoAstrocartography(input: AstrocartographyInput): AstrocartographyResult {
  if (!input.birthTimeKnown || !input.birthTime) {
    return {
      normalizedUtc: `${input.birthDate}T12:00:00+00:00`,
      lines: [],
      withheld: ["All ASC/DSC/MC/IC lines"],
      warnings: ["Birth time unknown: astrocartography lines withheld."],
      responsibleUseNote:
        "Astrocartography lines are reflective location-context markers, not commands to move or make major life decisions.",
      calculationMetadata: { calculationMode: "demo", providerId: "aethos-local-acg-demo" },
      providerRoute: "local_demo"
    };
  }

  const bodies = input.requestedBodies ?? (["sun", "moon", "mars"] as Planet[]);
  const lineTypes = input.lineTypes ?? (["ASC", "DSC", "MC", "IC"] as AcgLineType[]);
  const lines: AstroCartographyLine[] = [];

  for (const body of bodies) {
    const seed = hashSeed(`${input.birthDate}|${input.birthTime}|${body}`);
    for (const lineType of lineTypes) {
      const typeOffset = { ASC: 0, DSC: 90, MC: 180, IC: 270 }[lineType];
      const lon = ((((seed + typeOffset) % 360) + 360) % 360) - 180;
      lines.push({
        lineId: `${body}-${lineType}-demo`,
        body,
        lineType,
        geographicLongitude: Math.round(lon * 100) / 100,
        sampleLatitude: input.latitude,
        residualOrbDegrees: 1.5,
        methodKey: "local_demo_seed_scaffold",
        notes: ["Local demo lines — start calculation service for Swiss/Moshier ACG search."]
      });
    }
  }

  return {
    normalizedUtc: `${input.birthDate}T00:00:00+00:00`,
    lines,
    withheld: [],
    warnings: ["Local demo astrocartography active (not astronomical)."],
    responsibleUseNote:
      "Astrocartography lines are reflective location-context markers, not commands to move or make major life decisions.",
    calculationMetadata: { calculationMode: "demo", providerId: "aethos-local-acg-demo" },
    providerRoute: "local_demo"
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function toServiceAstrocartographyPayload(input: AstrocartographyInput) {
  const time = input.birthTimeKnown && input.birthTime ? `${input.birthTime}:00` : null;
  return {
    localBirthDate: input.birthDate,
    localBirthTime: time,
    birthTimeKnown: input.birthTimeKnown,
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    houseSystem: input.houseSystem ?? "placidus",
    zodiacMode: "tropical",
    requestedBodies: input.requestedBodies ?? ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"],
    lineTypes: input.lineTypes ?? ["ASC", "DSC", "MC", "IC"],
    longitudeStepDegrees: input.longitudeStepDegrees ?? 2,
    sampleLatitudes: input.sampleLatitudes ?? [input.latitude]
  };
}

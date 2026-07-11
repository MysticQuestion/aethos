import type {
  Aspect,
  CalculationMetadataV2,
  CalculationMode,
  CelestialPosition,
  HouseCusp,
  NatalChart,
  NatalChartInput,
  Planet,
  ZodiacPosition
} from "../types";

export function getCalculationServiceConfig() {
  return {
    url: process.env.AETHOS_CALCULATION_SERVICE_URL,
    allowDemoFallback: process.env.AETHOS_ALLOW_DEMO_FALLBACK !== "false"
  };
}

export type CalculationServiceNatalResponse = {
  normalizedUtc: string;
  planetaryPositions: Array<{
    body: Planet;
    longitude: number;
    latitude: number;
    distanceAu?: number;
    speedLongitude: number;
    speedLatitude?: number;
    retrograde: boolean;
    zodiacPosition: Omit<ZodiacPosition, "longitude">;
    providerMetadata: {
      providerId: string;
      calculationMode: CalculationMode;
      warnings: string[];
    };
  }>;
  houses: Array<{
    house: number;
    longitude: number;
    zodiacPosition: Omit<ZodiacPosition, "longitude">;
  }>;
  aspects: Array<{
    bodyA: Planet;
    bodyB: Planet;
    aspectType: Aspect["type"];
    exactAngle: number;
    orb: number;
    applyingSeparating?: "applying" | "separating";
  }>;
  calculationMetadata: Omit<CalculationMetadataV2, "coordinates"> & {
    serviceVersion?: string;
    normalizedUtc?: string;
    coordinates?: CalculationMetadataV2["coordinates"] | null;
  };
  warnings: string[];
};

function normalizeServiceZodiac(position: Omit<ZodiacPosition, "longitude">, longitude: number): ZodiacPosition {
  return {
    ...position,
    longitude
  };
}

export function normalizeServiceNatalChart(
  response: CalculationServiceNatalResponse,
  input: NatalChartInput
): NatalChart {
  const metadata: CalculationMetadataV2 = {
    calculationId: response.calculationMetadata.calculationId,
    providerId: response.calculationMetadata.providerId,
    providerVersion: response.calculationMetadata.providerVersion,
    calculationMode: response.calculationMetadata.calculationMode,
    generatedAt: response.calculationMetadata.generatedAt,
    inputHash: response.calculationMetadata.inputHash,
    timezone: response.calculationMetadata.timezone,
    coordinates: response.calculationMetadata.coordinates ?? undefined,
    houseSystem: response.calculationMetadata.houseSystem,
    zodiacMode: response.calculationMetadata.zodiacMode,
    ephemerisSource: response.calculationMetadata.ephemerisSource,
    warnings: response.warnings.length > 0 ? response.warnings : response.calculationMetadata.warnings
  };

  const positions: CelestialPosition[] = response.planetaryPositions.map((position) => ({
    body: position.body,
    longitude: position.longitude,
    latitude: position.latitude,
    distanceAu: position.distanceAu,
    speed: {
      longitudePerDay: position.speedLongitude,
      latitudePerDay: position.speedLatitude
    },
    zodiac: normalizeServiceZodiac(position.zodiacPosition, position.longitude),
    isRetrograde: position.retrograde,
    calculatedAt: response.calculationMetadata.generatedAt,
    providerId: position.providerMetadata.providerId,
    calculationMode: position.providerMetadata.calculationMode,
    warnings: position.providerMetadata.warnings
  }));

  const houses: HouseCusp[] = response.houses.map((house) => ({
    house: house.house,
    longitude: house.longitude,
    zodiac: normalizeServiceZodiac(house.zodiacPosition, house.longitude)
  }));

  const aspects: Aspect[] = response.aspects.map((aspect) => ({
    id: `${aspect.bodyA}-${aspect.bodyB}-${aspect.aspectType}`,
    bodyA: aspect.bodyA,
    bodyB: aspect.bodyB,
    type: aspect.aspectType,
    orb: aspect.orb,
    exactAngle: aspect.exactAngle,
    applying: aspect.applyingSeparating === "applying"
  }));

  return {
    id: `natal-${metadata.inputHash.slice(0, 12)}`,
    input,
    positions,
    houses,
    aspects,
    metadata
  };
}

export async function getCalculationServiceStatus() {
  const config = getCalculationServiceConfig();
  if (!config.url) {
    return {
      configured: false,
      available: false,
      status: null,
      warning: "AETHOS_CALCULATION_SERVICE_URL is not configured."
    };
  }

  try {
    const response = await fetch(`${config.url.replace(/\/$/, "")}/health`, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) {
      return { configured: true, available: false, status: null, warning: `Calculation service returned ${response.status}.` };
    }
    return { configured: true, available: true, status: await response.json(), warning: null };
  } catch (error) {
    return {
      configured: true,
      available: false,
      status: null,
      warning: `Calculation service unavailable: ${error instanceof Error ? error.message : "unknown error"}.`
    };
  }
}

export async function createServiceNatalChart(input: {
  birthDate: string;
  birthTime?: string;
  birthTimeKnown: boolean;
  birthLocationLabel?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  houseSystem: string;
  zodiacMode: string;
}) {
  const config = getCalculationServiceConfig();
  if (!config.url) throw new Error("AETHOS_CALCULATION_SERVICE_URL is not configured.");

  const payload = {
    localBirthDate: input.birthDate,
    localBirthTime: input.birthTime,
    birthTimeKnown: input.birthTimeKnown,
    timezone: input.timezone ?? "America/Los_Angeles",
    latitude: input.latitude ?? 0,
    longitude: input.longitude ?? 0,
    houseSystem: input.houseSystem === "placidus" ? "placidus" : "whole_sign",
    zodiacMode: input.zodiacMode,
    requestedBodies: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
  };

  const response = await fetch(`${config.url.replace(/\/$/, "")}/v1/natal-chart`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Calculation service natal-chart request failed with ${response.status}.`);
  }

  return response.json() as Promise<CalculationServiceNatalResponse>;
}

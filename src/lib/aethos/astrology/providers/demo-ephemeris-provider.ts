import { attachCalculationMetadata, createInputHash } from "../metadata";
import { PLANETS } from "../planets";
import { detectRetrograde } from "../retrogrades";
import type { EphemerisProvider, HouseCusp, NatalChartInput, Planet, ProviderStatus } from "../types";
import { decimalToZodiac, normalizeLongitude } from "../zodiac-format";

const DEMO_WARNING = "Demo ephemeris provider active. Outputs are deterministic samples, not astronomical calculations.";
const PLANET_OFFSETS: Record<Planet, number> = {
  sun: 0,
  moon: 27.3,
  mercury: 48,
  venus: 76,
  mars: 112,
  jupiter: 154,
  saturn: 196,
  uranus: 238,
  neptune: 281,
  pluto: 318
};

function seededDegrees(input: NatalChartInput & { body?: Planet; date?: string }) {
  const hash = createInputHash({
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthLocationLabel: input.birthLocationLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    body: input.body,
    date: input.date
  });
  const seed = Number.parseInt(hash.slice(0, 10), 16);
  return seed % 360;
}

function seededSpeed(input: NatalChartInput & { body: Planet; date: string }) {
  const base = Number.parseInt(createInputHash({ speed: input.body, date: input.date }).slice(0, 8), 16);
  const speed = ((base % 240) - 80) / 100;
  return Number(speed.toFixed(3));
}

export const demoEphemerisProvider: EphemerisProvider = {
  id: "aethos-demo-ephemeris",
  label: "Aethos deterministic demo ephemeris",
  mode: "demo",
  version: "0.3.0",
  async getPlanetPosition(input) {
    const speed = seededSpeed(input);
    const longitude = normalizeLongitude(seededDegrees(input) + PLANET_OFFSETS[input.body]);
    return {
      body: input.body,
      longitude,
      latitude: Number(((seededDegrees({ ...input, birthDate: `${input.birthDate}-lat` }) % 16) - 8).toFixed(3)),
      speed: { longitudePerDay: speed },
      zodiac: decimalToZodiac(longitude),
      isRetrograde: detectRetrograde(speed),
      calculatedAt: input.date,
      providerId: this.id,
      calculationMode: "demo",
      warnings: [DEMO_WARNING]
    };
  },
  async getPlanetPositions(input) {
    return Promise.all(input.bodies.map((body) => this.getPlanetPosition({ ...input, body })));
  },
  async getHouses(input) {
    if (!input.birthTimeKnown || input.latitude === undefined || input.longitude === undefined) return [];
    const ascSeed = seededDegrees({ ...input, body: "sun", date: input.birthDate });
    return Array.from({ length: 12 }, (_, index): HouseCusp => {
      const longitude = normalizeLongitude(ascSeed + index * 30);
      return {
        house: index + 1,
        longitude,
        zodiac: decimalToZodiac(longitude)
      };
    });
  },
  async getProviderStatus(): Promise<ProviderStatus> {
    return {
      activeProvider: this.id,
      calculationMode: "demo",
      serverConfigured: true,
      swissEphemerisAvailable: false,
      warnings: [
        DEMO_WARNING,
        "Swiss Ephemeris is not active in this deployment. Use a licensed server-side service before claiming astronomical precision."
      ],
      requiredEnvVars: []
    };
  }
};

export function getDemoProviderMetadata(input: NatalChartInput) {
  return attachCalculationMetadata({
    providerId: demoEphemerisProvider.id,
    providerVersion: demoEphemerisProvider.version,
    calculationMode: "demo",
    sourceInput: input,
    timezone: input.timezone,
    coordinates:
      input.latitude !== undefined && input.longitude !== undefined
        ? { latitude: input.latitude, longitude: input.longitude }
        : undefined,
    houseSystem: input.houseSystem,
    zodiacMode: input.zodiacMode,
    ephemerisSource: "deterministic-demo-provider",
    warnings: [DEMO_WARNING]
  });
}

export const DEFAULT_ASTRO_BODIES = PLANETS;

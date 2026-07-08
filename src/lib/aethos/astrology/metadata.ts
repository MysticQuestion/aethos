import { createHash } from "node:crypto";
import type { CalculationMetadataV2, CalculationMode, HouseSystem, ZodiacMode } from "./types";

export function createCalculationId(prefix = "calc"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createInputHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(sortObject(input))).digest("hex");
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function attachCalculationMetadata(input: {
  providerId: string;
  providerVersion: string;
  calculationMode: CalculationMode;
  sourceInput: unknown;
  timezone?: string;
  coordinates?: { latitude: number; longitude: number };
  houseSystem?: HouseSystem;
  zodiacMode?: ZodiacMode;
  ephemerisSource?: string;
  warnings?: string[];
}): CalculationMetadataV2 {
  return {
    calculationId: createCalculationId("aethos"),
    providerId: input.providerId,
    providerVersion: input.providerVersion,
    calculationMode: input.calculationMode,
    generatedAt: new Date().toISOString(),
    inputHash: createInputHash(input.sourceInput),
    timezone: input.timezone ?? "unknown",
    coordinates: input.coordinates,
    houseSystem: input.houseSystem,
    zodiacMode: input.zodiacMode,
    ephemerisSource: input.ephemerisSource,
    warnings: input.warnings ?? []
  };
}

export function validateCalculationMetadata(metadata: CalculationMetadataV2): boolean {
  return Boolean(
    metadata.calculationId &&
      metadata.providerId &&
      metadata.providerVersion &&
      metadata.calculationMode &&
      metadata.generatedAt &&
      metadata.inputHash
  );
}

export function compareCalculationInputs(a: unknown, b: unknown): boolean {
  return createInputHash(a) === createInputHash(b);
}

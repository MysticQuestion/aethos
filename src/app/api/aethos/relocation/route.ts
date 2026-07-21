import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { createNatalChart } from "@/lib/aethos/astrology/natal";
import {
  createServiceNatalChart,
  getCalculationServiceConfig,
  normalizeServiceNatalChart
} from "@/lib/aethos/astrology/providers/calculation-service-client";

const placeSchema = z.object({
  label: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(3)
});

const schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  birthTimeKnown: z.boolean(),
  houseSystem: z.enum(["whole_sign", "placidus", "koch", "equal"]).default("placidus"),
  zodiacMode: z.enum(["tropical", "sidereal"]).default("tropical"),
  natal: placeSchema,
  relocation: placeSchema
});

async function resolveChart(input: {
  birthDate: string;
  birthTime?: string;
  birthTimeKnown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  houseSystem: string;
  zodiacMode: string;
  birthLocationLabel?: string;
}) {
  const serviceConfig = getCalculationServiceConfig();
  if (serviceConfig.url) {
    try {
      const serviceResult = await createServiceNatalChart({
        ...input,
        houseSystem: input.houseSystem,
        zodiacMode: input.zodiacMode
      });
      return {
        natalChart: normalizeServiceNatalChart(serviceResult, {
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          birthTimeKnown: input.birthTimeKnown,
          birthLocationLabel: input.birthLocationLabel,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone,
          houseSystem: input.houseSystem as "whole_sign" | "placidus" | "koch" | "equal",
          zodiacMode: input.zodiacMode as "tropical" | "sidereal",
          calculationMode: "demo"
        }),
        warnings: serviceResult.warnings as string[],
        providerRoute: "calculation_service" as const
      };
    } catch (error) {
      if (!serviceConfig.allowDemoFallback) throw error;
    }
  }

  const natalChart = await createNatalChart({
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimeKnown: input.birthTimeKnown,
    birthLocationLabel: input.birthLocationLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    houseSystem: input.houseSystem as "whole_sign" | "placidus" | "koch" | "equal",
    zodiacMode: input.zodiacMode as "tropical" | "sidereal",
    calculationMode: "demo"
  });

  return {
    natalChart,
    warnings: natalChart.metadata.warnings,
    providerRoute: "next_demo_fallback" as const
  };
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const shared = {
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthTimeKnown: body.birthTimeKnown,
      houseSystem: body.houseSystem,
      zodiacMode: body.zodiacMode
    };

    const [natal, relocation] = await Promise.all([
      resolveChart({
        ...shared,
        latitude: body.natal.latitude,
        longitude: body.natal.longitude,
        timezone: body.natal.timezone,
        birthLocationLabel: body.natal.label ?? "Natal"
      }),
      resolveChart({
        ...shared,
        latitude: body.relocation.latitude,
        longitude: body.relocation.longitude,
        timezone: body.relocation.timezone,
        birthLocationLabel: body.relocation.label ?? "Relocation"
      })
    ]);

    return NextResponse.json({
      natal: {
        place: body.natal,
        chart: natal.natalChart,
        warnings: natal.warnings,
        providerRoute: natal.providerRoute
      },
      relocation: {
        place: body.relocation,
        chart: relocation.natalChart,
        warnings: relocation.warnings,
        providerRoute: relocation.providerRoute
      },
      comparison: {
        note: "Houses and angles shift with location; planetary ecliptic longitudes are fixed for the same instant.",
        natalHouseCount: natal.natalChart.houses.length,
        relocationHouseCount: relocation.natalChart.houses.length
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}

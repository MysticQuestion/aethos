import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { createNatalChart } from "@/lib/aethos/astrology/natal";
import { generateTransitEvents } from "@/lib/aethos/astrology/transits";

const natalChartInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().optional(),
  birthTimeKnown: z.boolean(),
  birthLocationLabel: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  houseSystem: z.enum(["whole_sign", "placidus", "koch", "equal"]).default("whole_sign"),
  zodiacMode: z.enum(["tropical", "sidereal"]).default("tropical"),
  calculationMode: z.enum(["demo", "server", "external", "swiss"]).default("demo")
});

const transitsSchema = z.object({
  natalChart: z.any().optional(),
  natalChartInput: natalChartInputSchema.optional(),
  dateRangeStart: z.string(),
  dateRangeEnd: z.string(),
  providerMode: z.enum(["demo", "server", "external", "swiss"]).default("demo"),
  transitBodies: z.array(z.string()).optional(),
  orbConfig: z.record(z.number()).optional()
});

export async function POST(request: Request) {
  try {
    const input = transitsSchema.parse(await request.json());
    const natalChart = input.natalChart ?? (await createNatalChart(input.natalChartInput ?? {
      birthDate: new Date().toISOString().slice(0, 10),
      birthTimeKnown: false,
      houseSystem: "whole_sign",
      zodiacMode: "tropical",
      calculationMode: "demo"
    }));
    const result = await generateTransitEvents(natalChart, {
      startDate: input.dateRangeStart,
      endDate: input.dateRangeEnd
    });

    return NextResponse.json({
      ...result,
      calculationMetadata: result.transitEvents[0]?.metadata ?? natalChart.metadata,
      warnings: [
        "Demo transit events are deterministic samples and not astronomical Swiss Ephemeris calculations."
      ]
    });
  } catch (error) {
    return jsonError(error);
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { createNatalChart } from "@/lib/aethos/astrology/natal";
import {
  createServiceNatalChart,
  getCalculationServiceConfig,
  normalizeServiceNatalChart
} from "@/lib/aethos/astrology/providers/calculation-service-client";

const chartSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  birthTimeKnown: z.boolean(),
  birthLocationLabel: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().optional(),
  houseSystem: z.enum(["whole_sign", "placidus", "koch", "equal"]).default("whole_sign"),
  zodiacMode: z.enum(["tropical", "sidereal"]).default("tropical"),
  calculationMode: z.enum(["demo", "server", "external", "swiss"]).default("demo")
});

export async function POST(request: Request) {
  try {
    const input = chartSchema.parse(await request.json());
    const serviceConfig = getCalculationServiceConfig();
    if (serviceConfig.url) {
      try {
        const serviceResult = await createServiceNatalChart(input);
        const natalChart = normalizeServiceNatalChart(serviceResult, input);
        return NextResponse.json({
          natalChart,
          calculationMetadata: natalChart.metadata,
          warnings: serviceResult.warnings,
          providerRoute: "calculation_service"
        });
      } catch (error) {
        if (!serviceConfig.allowDemoFallback) {
          throw error;
        }
      }
    }
    const natalChart = await createNatalChart(input);
    return NextResponse.json({
      natalChart,
      calculationMetadata: natalChart.metadata,
      warnings: [
        ...natalChart.metadata.warnings,
        serviceConfig.url
          ? "Calculation service was unavailable; AETHOS_ALLOW_DEMO_FALLBACK permitted deterministic demo fallback."
          : "AETHOS_CALCULATION_SERVICE_URL is not configured; deterministic demo provider used."
      ],
      providerRoute: "next_demo_fallback"
    });
  } catch (error) {
    return jsonError(error);
  }
}

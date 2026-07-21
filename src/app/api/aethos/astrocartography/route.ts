import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import {
  createDemoAstrocartography,
  toServiceAstrocartographyPayload,
  type AstrocartographyResult
} from "@/lib/aethos/astrology/astrocartography";
import {
  createServiceAstrocartography,
  getCalculationServiceConfig
} from "@/lib/aethos/astrology/providers/calculation-service-client";

const schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  birthTimeKnown: z.boolean(),
  timezone: z.string().min(3),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  houseSystem: z.enum(["placidus", "whole_sign"]).default("placidus"),
  requestedBodies: z
    .array(
      z.enum([
        "sun",
        "moon",
        "mercury",
        "venus",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
        "pluto"
      ])
    )
    .optional(),
  lineTypes: z.array(z.enum(["ASC", "DSC", "MC", "IC"])).optional(),
  longitudeStepDegrees: z.number().min(0.25).max(5).optional(),
  sampleLatitudes: z.array(z.number().min(-90).max(90)).optional()
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const serviceConfig = getCalculationServiceConfig();

    if (serviceConfig.url) {
      try {
        const serviceBody = await createServiceAstrocartography(toServiceAstrocartographyPayload(input));
        const result: AstrocartographyResult = {
          normalizedUtc: serviceBody.normalizedUtc,
          lines: serviceBody.lines,
          withheld: serviceBody.withheld ?? [],
          warnings: serviceBody.warnings ?? [],
          responsibleUseNote: serviceBody.responsibleUseNote,
          calculationMetadata: serviceBody.calculationMetadata ?? {},
          providerRoute: "calculation_service"
        };
        return NextResponse.json(result);
      } catch (error) {
        if (!serviceConfig.allowDemoFallback) {
          throw error;
        }
      }
    }

    return NextResponse.json(createDemoAstrocartography(input));
  } catch (error) {
    return jsonError(error);
  }
}

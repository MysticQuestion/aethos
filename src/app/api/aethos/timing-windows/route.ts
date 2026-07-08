import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { generateTimingWindows } from "@/lib/aethos/astrology/timing-windows";

const timingSchema = z.object({
  transitEvents: z.array(z.any()),
  journalBaseline: z.any().optional(),
  userProfile: z.any().optional()
});

export async function POST(request: Request) {
  try {
    const input = timingSchema.parse(await request.json());
    const timingWindows = generateTimingWindows(input.transitEvents);
    return NextResponse.json({
      timingWindows,
      themeScores: timingWindows[0]?.sourceEvents.flatMap((event) => Object.entries(event.themeContributions)) ?? [],
      confidenceNotes: [
        "Demo timing windows use deterministic sample events.",
        "Confidence describes source clarity and available personal calibration, not prediction certainty."
      ],
      warnings: timingWindows[0]?.calculationMetadata.warnings ?? []
    });
  } catch (error) {
    return jsonError(error);
  }
}

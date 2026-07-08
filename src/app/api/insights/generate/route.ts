import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { fragmentsToVectors, reconcileVectors } from "@/lib/aethos/reconciliation";
import { generateInsightCards } from "@/lib/aethos/insights";

const insightSchema = z.object({
  symbolicKeys: z.array(z.string()),
  lowConfidenceMode: z.boolean().default(false)
});

export async function POST(request: Request) {
  try {
    const { symbolicKeys, lowConfidenceMode } = insightSchema.parse(await request.json());
    const vectors = fragmentsToVectors(symbolicKeys, lowConfidenceMode);
    const reconciliations = reconcileVectors(vectors);
    return NextResponse.json({
      insights: generateInsightCards(reconciliations)
    });
  } catch (error) {
    return jsonError(error);
  }
}

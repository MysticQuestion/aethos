import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { fragmentsToVectors, reconcileVectors } from "@/lib/aethos/reconciliation";

const reconcileSchema = z.object({
  symbolicKeys: z.array(z.string()),
  lowConfidenceMode: z.boolean().default(false)
});

export async function POST(request: Request) {
  try {
    const { symbolicKeys, lowConfidenceMode } = reconcileSchema.parse(await request.json());
    const vectors = fragmentsToVectors(symbolicKeys, lowConfidenceMode);
    return NextResponse.json({
      vectors,
      reconciliations: reconcileVectors(vectors)
    });
  } catch (error) {
    return jsonError(error);
  }
}

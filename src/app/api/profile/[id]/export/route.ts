import { NextResponse } from "next/server";
import { buildDemoKernel } from "@/lib/aethos/demo";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kernel = buildDemoKernel();

  return NextResponse.json({
    profileId: id,
    exportedAt: new Date().toISOString(),
    permissions: {
      includesPlaintextJournal: false,
      includesEngineMetadata: true,
      includesConsentLogs: true
    },
    package: {
      intake: kernel.intake,
      calculations: {
        numerology: kernel.numerology,
        westernBaseline: kernel.western
      },
      reconciliations: kernel.reconciliations,
      insights: kernel.insights
    }
  });
}

import { NextResponse } from "next/server";
import { getActiveProviderStatus, isSwissEphemerisConfigured } from "@/lib/aethos/astrology/providers/provider-status";
import { getCalculationServiceStatus } from "@/lib/aethos/astrology/providers/calculation-service-client";

export async function GET() {
  const status = await getActiveProviderStatus();
  const service = await getCalculationServiceStatus();
  return NextResponse.json({
    ...status,
    calculationService: service,
    swissEphemerisAvailable: isSwissEphemerisConfigured(),
    warnings: isSwissEphemerisConfigured()
      ? status.warnings
      : [
          ...status.warnings,
          "No AETHOS_EPHEMERIS_SERVICE_URL detected. Demo provider remains active."
        ]
  });
}

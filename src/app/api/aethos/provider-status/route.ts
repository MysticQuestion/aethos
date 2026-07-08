import { NextResponse } from "next/server";
import { getActiveProviderStatus, isSwissEphemerisConfigured } from "@/lib/aethos/astrology/providers/provider-status";

export async function GET() {
  const status = await getActiveProviderStatus();
  return NextResponse.json({
    ...status,
    swissEphemerisAvailable: isSwissEphemerisConfigured(),
    warnings: isSwissEphemerisConfigured()
      ? status.warnings
      : [
          ...status.warnings,
          "No AETHOS_EPHEMERIS_SERVICE_URL detected. Demo provider remains active."
        ]
  });
}

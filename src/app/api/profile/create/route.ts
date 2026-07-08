import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { parseBirthIntake } from "@/lib/aethos/intake";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const intake = parseBirthIntake(payload);

    return NextResponse.json(
      {
        profile: {
          id: "local-profile-demo",
          displayName: intake.displayName,
          createdAt: new Date().toISOString()
        },
        intake,
        consentLogs: Object.entries(intake.consent).map(([consentType, consentValue]) => ({
          consentType,
          consentValue,
          consentVersion: "phase-1-kernel-v0.2",
          createdAt: new Date().toISOString()
        }))
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}

import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { parseBirthIntake } from "@/lib/aethos/intake";
import { calculateNumerology } from "@/lib/aethos/numerology";

export async function POST(request: Request) {
  try {
    const intake = parseBirthIntake(await request.json());
    return NextResponse.json(calculateNumerology(intake));
  } catch (error) {
    return jsonError(error);
  }
}

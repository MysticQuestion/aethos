import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { parseBirthIntake } from "@/lib/aethos/intake";
import { calculateWesternBaseline } from "@/lib/aethos/western";

export async function POST(request: Request) {
  try {
    const intake = parseBirthIntake(await request.json());
    return NextResponse.json(calculateWesternBaseline(intake));
  } catch (error) {
    return jsonError(error);
  }
}

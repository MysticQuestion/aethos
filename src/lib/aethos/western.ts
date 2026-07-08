import { getRestrictedOutputs } from "./intake";
import type { AethosBirthIntake, WesternBaselineResult } from "./types";

const SUN_SIGNS = [
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] }
] as const;

function inRange(month: number, day: number, start: readonly number[], end: readonly number[]) {
  const value = month * 100 + day;
  const startValue = start[0] * 100 + start[1];
  const endValue = end[0] * 100 + end[1];
  if (startValue > endValue) {
    return value >= startValue || value <= endValue;
  }
  return value >= startValue && value <= endValue;
}

export function getSunSign(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return SUN_SIGNS.find((range) => inRange(month, day, range.start, range.end))?.sign ?? "Unknown";
}

export function calculateWesternBaseline(intake: AethosBirthIntake): WesternBaselineResult {
  const restrictedOutputs = getRestrictedOutputs(intake);
  const canCalculateTimeSensitive =
    restrictedOutputs.length === 0 &&
    Boolean(intake.birthTime && intake.birthPlace?.latitude && intake.birthPlace.longitude && intake.birthPlace.timezone);

  const sunSign = getSunSign(intake.birthDate);

  return {
    sunSign,
    moonStatus: canCalculateTimeSensitive ? "available" : "date_probability_only",
    ascendantStatus: canCalculateTimeSensitive ? "available" : "withheld",
    housesStatus: canCalculateTimeSensitive ? "available" : "withheld",
    symbolicKeys: [`western_sun_${sunSign.toLowerCase()}`],
    metadata: {
      systemKey: "western_astrology",
      methodKey: "solar_baseline_v1",
      engineVersion: "aethos-kernel-0.2.0",
      inputCompleteness: canCalculateTimeSensitive ? "complete" : "partial",
      restrictedOutputs,
      notes: [
        "Phase 1 uses a solar baseline only.",
        "Moon sign, Ascendant, and houses require ephemeris-grade calculation with time, place, and timezone.",
        "No unknown birth time is silently defaulted to noon."
      ]
    }
  };
}

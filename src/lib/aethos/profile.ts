import { buildDemoKernel, demoIntake } from "./demo";
import { parseBirthIntake } from "./intake";
import type { AethosBirthIntake, AethosProfile, ConfidenceLevel } from "./types";

export function validateBirthIntake(payload: unknown): AethosBirthIntake {
  return parseBirthIntake(payload);
}

export function normalizeBirthLocationInput(input?: AethosBirthIntake["birthPlace"]) {
  if (!input) return undefined;
  return {
    city: input.city.trim(),
    region: input.region?.trim(),
    country: input.country.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone?.trim()
  };
}

function confidenceFromBirthTime(intake: AethosBirthIntake): ConfidenceLevel {
  if (intake.birthTimeConfidence === "exact") return "high";
  if (intake.birthTimeConfidence === "approximate") return "medium";
  return "low";
}

export function generateAethosProfile(intake: AethosBirthIntake, isSample = false): AethosProfile {
  const normalizedIntake = {
    ...intake,
    birthPlace: normalizeBirthLocationInput(intake.birthPlace)
  };
  const kernel = buildDemoKernel(normalizedIntake);
  const topInsight = kernel.insights[0];

  return {
    id: isSample ? "sample-profile" : `profile-${Date.now()}`,
    displayName: normalizedIntake.displayName,
    isSample,
    generatedAt: new Date().toISOString(),
    intake: normalizedIntake,
    identitySummary:
      topInsight?.body ??
      "Aethos has enough baseline information to begin a symbolic profile, but more lived context will improve relevance.",
    corePatternMap: [
      {
        label: "Numerology baseline",
        value: `Life Path ${kernel.numerology.lifePath}`,
        confidence: "high",
        source: "Pythagorean numerology"
      },
      {
        label: "Solar baseline",
        value: `Sun in ${kernel.western.sunSign}`,
        confidence: kernel.lowConfidenceMode ? "medium" : "high",
        source: "Western solar placement"
      },
      {
        label: "Birth time precision",
        value: normalizedIntake.birthTimeConfidence,
        confidence: confidenceFromBirthTime(normalizedIntake),
        source: "Canonical intake"
      }
    ],
    strengths: [
      "Can translate symbolic material into structured reflection.",
      "Benefits from distinguishing intuitive signal from operational next step.",
      "Works best when journal evidence is used to confirm or revise patterns."
    ],
    tensions: [
      "Timing context may feel actionable before supporting data is complete.",
      "Low birth-time precision limits time-sensitive chart claims.",
      "Symbolic confidence should be checked against lived experience."
    ],
    timingSensitivities: [
      `Personal Year ${kernel.numerology.personalYear} suggests a symbolic timing emphasis for review.`,
      "Birth-time unknown mode withholds Ascendant, houses, Human Design Type, BaZi Hour Pillar, and Vedic Lagna."
    ],
    reflectionPrompts: [
      "Where is the current pattern asking for observation rather than immediate action?",
      "Which recurring journal theme has enough evidence to become a decision constraint?",
      "What would make this interpretation more grounded in lived experience?"
    ]
  };
}

export function createSampleAethosProfile() {
  return generateAethosProfile(demoIntake, true);
}

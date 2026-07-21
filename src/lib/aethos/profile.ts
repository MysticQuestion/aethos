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
  const systemLayers = [
    {
      systemKey: "numerology",
      label: "Numerology",
      status: "v1" as const,
      confidence: "high" as const,
      summary: `Life Path ${kernel.numerology.lifePath}, Personal Year ${kernel.numerology.personalYear}.`,
      highlights: [
        { label: "Life Path", value: String(kernel.numerology.lifePath) },
        { label: "Personal Year", value: String(kernel.numerology.personalYear) }
      ],
      withheld: [] as string[]
    },
    {
      systemKey: "western_astrology",
      label: "Western",
      status: "v1" as const,
      confidence: kernel.lowConfidenceMode ? ("medium" as const) : ("high" as const),
      summary: `Sun in ${kernel.western.sunSign}. Ascendant and houses: ${kernel.western.ascendantStatus}.`,
      highlights: [
        { label: "Sun", value: kernel.western.sunSign },
        { label: "Ascendant", value: kernel.western.ascendantStatus },
        { label: "Houses", value: kernel.western.housesStatus }
      ],
      withheld: kernel.western.metadata.restrictedOutputs
    },
    ...kernel.multiSystem.map((layer) => ({
      systemKey: layer.systemKey,
      label: layer.label,
      status: layer.status,
      confidence: layer.confidence,
      summary: layer.summary,
      highlights: layer.highlights,
      withheld: layer.withheld
    }))
  ];

  return {
    // UUID required for Supabase aethos_profiles primary key when cloud-synced.
    id: isSample
      ? "00000000-0000-4000-8000-0000000000aa"
      : typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0").slice(-12)}`,
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
      },
      ...kernel.multiSystem.slice(0, 2).map((layer) => ({
        label: layer.label,
        value: layer.highlights[0]?.value ?? layer.status,
        confidence: layer.confidence,
        source: layer.status === "v1" ? layer.label : `${layer.label} (research)`
      }))
    ],
    systemLayers,
    strengths: [
      "Can translate symbolic material into structured reflection.",
      "Benefits from distinguishing intuitive signal from operational next step.",
      "Works best when journal evidence is used to confirm or revise patterns."
    ],
    tensions: [
      "Timing context may feel actionable before supporting data is complete.",
      "Low birth-time precision limits time-sensitive chart claims.",
      "Multi-system research layers must not be treated as production BodyGraph or Lagna claims.",
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

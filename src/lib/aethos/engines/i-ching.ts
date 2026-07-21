import type { AethosBirthIntake } from "../types";
import type { EngineLayerResult } from "./types";

const TRIGRAMS = ["Heaven", "Lake", "Fire", "Thunder", "Wind", "Water", "Mountain", "Earth"] as const;

/** Deterministic day-based hexagram scaffold (not a traditional yarrow or coin cast). */
export function calculateIChing(intake: AethosBirthIntake): EngineLayerResult {
  const seed = hashSeed(`${intake.birthDate}:${intake.displayName}`);
  const upper = seed % 8;
  const lower = Math.floor(seed / 8) % 8;
  const hexagramNumber = ((seed % 64) + 1) as number;
  const changingLine = (seed % 6) + 1;

  return {
    systemKey: "i_ching",
    label: "I Ching",
    status: "research_preview",
    confidence: "medium",
    summary: `Research preview hexagram ${hexagramNumber} (${TRIGRAMS[upper]} over ${TRIGRAMS[lower]}) derived deterministically from birth date identity seed — not a ritual cast.`,
    highlights: [
      { label: "Hexagram", value: String(hexagramNumber), note: "Deterministic scaffold" },
      { label: "Upper trigram", value: TRIGRAMS[upper] },
      { label: "Lower trigram", value: TRIGRAMS[lower] },
      { label: "Changing line (scaffold)", value: String(changingLine) }
    ],
    symbolicKeys: [`iching_hex_${hexagramNumber}`, `iching_upper_${upper}`, `iching_lower_${lower}`],
    withheld: ["Traditional yarrow/coin cast fidelity", "Full King Wen commentary library"],
    metadata: {
      systemKey: "i_ching",
      methodKey: "deterministic_date_seed_v0",
      engineVersion: "0.1.0-research",
      inputCompleteness: "date_only",
      restrictedOutputs: ["Ritual cast fidelity"],
      notes: [
        "This is a reflective scaffold, not a substitute for classical divination procedure.",
        "Use as a journal prompt generator until a verified cast pipeline exists."
      ]
    }
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

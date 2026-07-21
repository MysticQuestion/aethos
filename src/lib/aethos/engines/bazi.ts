import type { AethosBirthIntake } from "../types";
import { isLowConfidenceMode } from "../intake";
import type { EngineLayerResult } from "./types";

const STEMS = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"] as const;
const BRANCHES = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"] as const;
const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

/** Day/month pillar scaffold from civil date; hour pillar withheld without verified solar time. */
export function calculateBazi(intake: AethosBirthIntake): EngineLayerResult {
  const [y, m, d] = intake.birthDate.split("-").map(Number);
  const dayIndex = dayNumber(y, m, d);
  const stem = STEMS[dayIndex % 10];
  const branch = BRANCHES[dayIndex % 12];
  const monthBranch = BRANCHES[(m + 1) % 12];
  const dayMasterElement = ELEMENTS[dayIndex % 5];
  const low = isLowConfidenceMode(intake);

  const withheld = ["Hour pillar", "True solar time correction", "Full ten gods analysis"];
  if (low) {
    withheld.push("Any claim that depends on birth hour");
  }

  return {
    systemKey: "bazi",
    label: "BaZi (research preview)",
    status: "research_preview",
    confidence: low ? "low" : "medium",
    summary: `Day pillar scaffold ${stem}-${branch} with day-master emphasis ${dayMasterElement}. Hour pillar withheld until verified time engine exists.`,
    highlights: [
      { label: "Day pillar (scaffold)", value: `${stem}-${branch}` },
      { label: "Month branch (scaffold)", value: monthBranch },
      { label: "Day master element", value: dayMasterElement },
      { label: "Hour pillar", value: "withheld" }
    ],
    symbolicKeys: [`bazi_day_${stem.toLowerCase()}_${branch.toLowerCase()}`, `bazi_element_${dayMasterElement.toLowerCase()}`],
    withheld,
    metadata: {
      systemKey: "bazi",
      methodKey: "civil_date_pillar_scaffold_v0",
      engineVersion: "0.1.0-research",
      inputCompleteness: low ? "date_only" : "partial",
      restrictedOutputs: withheld,
      notes: [
        "Civil Gregorian scaffold only — not a complete Four Pillars calendar library.",
        "Do not treat hour pillar as known without exact local solar time."
      ]
    }
  };
}

function dayNumber(y: number, m: number, d: number): number {
  // Simple serial day count for deterministic pillars (not astronomical Julian).
  const date = Date.UTC(y, m - 1, d);
  return Math.floor(date / 86_400_000);
}

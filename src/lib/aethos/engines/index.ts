import type { AethosBirthIntake } from "../types";
import { calculateBazi } from "./bazi";
import { calculateHumanDesign } from "./human-design";
import { calculateIChing } from "./i-ching";
import { calculateVedicBaseline } from "./vedic";
import type { EngineLayerResult } from "./types";

export type { EngineLayerResult, EngineStatus } from "./types";
export { calculateBazi, calculateHumanDesign, calculateIChing, calculateVedicBaseline };
export { castDecisionLens, decisionCastToJournalBody, isCastExpired } from "./decision-lens";
export type { DecisionCast } from "./decision-lens";

export function runEnabledEngines(intake: AethosBirthIntake): EngineLayerResult[] {
  const results: EngineLayerResult[] = [];
  const sys = intake.systemsEnabled;

  // Permanent natal profiles only include systems whose current behavior is
  // defensible at the supplied input resolution. Research calculators remain
  // directly available to lab surfaces, but cannot contribute natal vectors.
  if (sys.humanDesign) results.push(calculateHumanDesign(intake));

  return results;
}

export function collectEngineSymbolicKeys(layers: EngineLayerResult[]): string[] {
  return layers.flatMap((layer) => layer.symbolicKeys);
}

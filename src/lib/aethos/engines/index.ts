import type { AethosBirthIntake } from "../types";
import { calculateBazi } from "./bazi";
import { calculateHumanDesign } from "./human-design";
import { calculateIChing } from "./i-ching";
import { calculateVedicBaseline } from "./vedic";
import type { EngineLayerResult } from "./types";

export type { EngineLayerResult, EngineStatus } from "./types";
export { calculateBazi, calculateHumanDesign, calculateIChing, calculateVedicBaseline };

export function runEnabledEngines(intake: AethosBirthIntake): EngineLayerResult[] {
  const results: EngineLayerResult[] = [];
  const sys = intake.systemsEnabled;

  if (sys.humanDesign) results.push(calculateHumanDesign(intake));
  if (sys.vedicAstrology) results.push(calculateVedicBaseline(intake));
  if (sys.bazi) results.push(calculateBazi(intake));
  if (sys.iChing) results.push(calculateIChing(intake));

  return results;
}

export function collectEngineSymbolicKeys(layers: EngineLayerResult[]): string[] {
  return layers.flatMap((layer) => layer.symbolicKeys);
}

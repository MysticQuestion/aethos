import { fragmentsForKeys } from "./dictionary";
import type {
  Axis,
  CoreTheme,
  ReconciliationClassification,
  ReconciliationRun,
  SemanticFragment,
  SymbolicVector
} from "./types";

function confidenceForSensitivity(sensitivity: SemanticFragment["confidenceSensitivity"], lowConfidenceMode: boolean) {
  if (!lowConfidenceMode) return 1;
  if (sensitivity === "high") return 0.45;
  if (sensitivity === "medium") return 0.7;
  return 1;
}

export function fragmentsToVectors(symbolicKeys: string[], lowConfidenceMode: boolean): SymbolicVector[] {
  return fragmentsForKeys(symbolicKeys).flatMap((fragment) =>
    fragment.themes.map((theme) => ({
      symbolicKey: fragment.symbolicKey,
      sourceSystem: fragment.sourceSystem,
      sourceObject: fragment.sourceObject,
      theme,
      axis: fragment.axis,
      direction: fragment.direction,
      weight: fragment.defaultWeight,
      confidence: confidenceForSensitivity(fragment.confidenceSensitivity, lowConfidenceMode)
    }))
  );
}

export function weightedMean(vectors: SymbolicVector[]) {
  const denominator = vectors.reduce((sum, vector) => sum + vector.weight * vector.confidence, 0);
  if (denominator === 0) return 0;
  return (
    vectors.reduce((sum, vector) => sum + vector.direction * vector.weight * vector.confidence, 0) / denominator
  );
}

export function weightedVariance(vectors: SymbolicVector[], mean = weightedMean(vectors)) {
  const denominator = vectors.reduce((sum, vector) => sum + vector.weight * vector.confidence, 0);
  if (denominator === 0) return 0;
  return (
    vectors.reduce((sum, vector) => {
      const adjustedWeight = vector.weight * vector.confidence;
      return sum + adjustedWeight * Math.pow(vector.direction - mean, 2);
    }, 0) / denominator
  );
}

export function classifyReconciliation(
  netAlignment: number,
  contradictionIndex: number
): ReconciliationClassification {
  if (contradictionIndex < 0.2 && Math.abs(netAlignment) >= 0.55) {
    return "agreement";
  }

  if (contradictionIndex >= 0.2 && contradictionIndex < 0.55) {
    return "tension";
  }

  if (contradictionIndex >= 0.55) {
    return "paradox";
  }

  return "mixed";
}

export function reconcileVectors(vectors: SymbolicVector[]): ReconciliationRun[] {
  const grouped = new Map<string, SymbolicVector[]>();

  vectors.forEach((vector) => {
    const key = `${vector.theme}:${vector.axis}`;
    const existing = grouped.get(key) ?? [];
    grouped.set(key, [...existing, vector]);
  });

  return Array.from(grouped.entries()).map(([key, values]) => {
    const [theme, axis] = key.split(":") as [CoreTheme, Axis];
    const netAlignment = Number(weightedMean(values).toFixed(3));
    const contradictionIndex = Number(weightedVariance(values, netAlignment).toFixed(3));

    return {
      theme,
      axis,
      netAlignment,
      contradictionIndex,
      classification: classifyReconciliation(netAlignment, contradictionIndex),
      vectors: values
    };
  });
}

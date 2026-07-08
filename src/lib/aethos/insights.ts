import { findFragment } from "./dictionary";
import type { InsightCardModel, ReconciliationRun } from "./types";

const TITLE_BY_THEME: Record<InsightCardModel["theme"], string> = {
  identity_output: "Identity Output Kernel",
  emotional_relational: "Emotional & Relational Kernel",
  action_decision: "Action & Decision Kernel",
  timing_climate: "Timing Climate Kernel"
};

const CLASSIFICATION_COPY: Record<InsightCardModel["classification"], string> = {
  agreement: "The participating systems are largely reinforcing one another.",
  tension: "The participating systems are pointing in different but workable directions.",
  paradox: "The participating systems should not be averaged away; the contradiction is the insight.",
  mixed: "The participating systems are not strong enough to support a single directive."
};

function confidenceLabel(run: ReconciliationRun): InsightCardModel["confidenceLabel"] {
  const averageConfidence =
    run.vectors.reduce((sum, vector) => sum + vector.confidence, 0) / Math.max(run.vectors.length, 1);

  if (averageConfidence >= 0.88 && run.vectors.length >= 2) return "High";
  if (averageConfidence >= 0.65) return "Medium";
  return "Low";
}

export function generateInsightCards(runs: ReconciliationRun[]): InsightCardModel[] {
  return runs
    .sort((a, b) => b.vectors.length - a.vectors.length || b.contradictionIndex - a.contradictionIndex)
    .map((run, index) => {
      const fragments = run.vectors
        .map((vector) => findFragment(vector.symbolicKey))
        .filter(Boolean);
      const strongest = fragments[0];
      const sourceNames = Array.from(new Set(run.vectors.map((vector) => vector.sourceObject)));
      const imperatives = fragments
        .map((fragment) => fragment?.fragments.coreImperative)
        .filter(Boolean)
        .slice(0, 2);
      const caution = strongest?.fragments.cautionPhrase ?? "keep the interpretation provisional";

      const body = [
        `${CLASSIFICATION_COPY[run.classification]} In practical terms, ${imperatives.join(" while ")}.`,
        `Use this as a reflection prompt, not a verdict: ${caution}.`
      ].join(" ");

      return {
        id: `insight-${index + 1}`,
        title: TITLE_BY_THEME[run.theme],
        body,
        sources: sourceNames,
        theme: run.theme,
        axis: run.axis,
        confidenceLabel: confidenceLabel(run),
        classification: run.classification,
        engineDrawer: {
          ...run,
          interpretationLimits: Array.from(
            new Set(fragments.flatMap((fragment) => fragment?.interpretationLimits ?? []))
          ),
          generatedFrom: "structured_vectors"
        }
      };
    });
}

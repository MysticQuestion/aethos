import { RESPONSIBLE_USE_NOTE } from "../constants";
import { attachCalculationMetadata } from "./metadata";
import type { AstroTimingWindow, CalculationMetadataV2, TimingTheme, TransitEvent } from "./types";

export function aggregateThemeScores(events: TransitEvent[]) {
  const scores = events.reduce<Partial<Record<TimingTheme, number>>>((acc, event) => {
    Object.entries(event.themeContributions).forEach(([theme, score]) => {
      const key = theme as TimingTheme;
      acc[key] = Number(((acc[key] ?? 0) + (score ?? 0)).toFixed(3));
    });
    return acc;
  }, {});

  return Object.entries(scores)
    .map(([theme, score]) => ({ theme: theme as TimingTheme, score: Number(score.toFixed(3)) }))
    .sort((a, b) => b.score - a.score);
}

export function calculateWindowIntensity(events: TransitEvent[]) {
  const themeScores = aggregateThemeScores(events);
  const total = themeScores.reduce((sum, item) => sum + item.score, 0);
  return Number(Math.min(1, total / Math.max(events.length, 1)).toFixed(3));
}

export function calculateConfidenceScore(events: TransitEvent[], demoMode = true) {
  const sourceStrength = Math.min(1, events.length / 3);
  const modePenalty = demoMode ? 0.42 : 0;
  return Number(Math.max(0.18, sourceStrength - modePenalty).toFixed(3));
}

export function generateTimingWindowSummary(primaryTheme: TimingTheme, intensity: number) {
  return `This window may be useful for observing ${primaryTheme.toLowerCase()} patterns. The system flags it because source events cluster around a ${Math.round(
    intensity * 100
  )}% intensity score. This is not a command or prediction.`;
}

export function generateRecommendedReflection(primaryTheme: TimingTheme) {
  return `What changes when you treat ${primaryTheme.toLowerCase()} as a context marker rather than an instruction?`;
}

export function generateActionExperiment(primaryTheme: TimingTheme): AstroTimingWindow["recommendedActionExperiment"] {
  if (primaryTheme === "Conflict") return "pause";
  if (primaryTheme === "Expression") return "communicate";
  if (primaryTheme === "Rest" || primaryTheme === "Inner Life") return "rest";
  if (primaryTheme === "Agency" || primaryTheme === "Visibility") return "initiate";
  if (primaryTheme === "Decision Pressure") return "decide_later";
  return "observe";
}

export function generateTimingWindows(transitEvents: TransitEvent[]): AstroTimingWindow[] {
  if (transitEvents.length === 0) return [];
  const themeScores = aggregateThemeScores(transitEvents);
  const primaryTheme = themeScores[0]?.theme ?? "Inner Life";
  const secondaryThemes = themeScores.slice(1, 4).map((item) => item.theme);
  const sortedDates = transitEvents.map((event) => event.exactAt).sort();
  const startDate = transitEvents.map((event) => event.startsAt).sort()[0];
  const endDate = transitEvents.map((event) => event.endsAt).sort().at(-1) ?? transitEvents[0].endsAt;
  const peakDate = sortedDates[Math.floor(sortedDates.length / 2)];
  const intensityScore = calculateWindowIntensity(transitEvents);
  const confidenceScore = calculateConfidenceScore(transitEvents, true);
  const metadataSource = transitEvents[0]?.metadata;
  const calculationMetadata: CalculationMetadataV2 =
    metadataSource ??
    attachCalculationMetadata({
      providerId: "aethos-demo-ephemeris",
      providerVersion: "0.3.0",
      calculationMode: "demo",
      sourceInput: transitEvents,
      warnings: ["Demo timing window generated from deterministic sample events."]
    });

  return [
    {
      id: `timing-window-${calculationMetadata.inputHash.slice(0, 10)}`,
      title: `${primaryTheme} observation window`,
      primaryTheme,
      secondaryThemes,
      startDate,
      peakDate,
      endDate,
      sourceEvents: transitEvents,
      intensityScore,
      confidenceScore,
      interpretiveSummary: generateTimingWindowSummary(primaryTheme, intensityScore),
      suggestedReflection: generateRecommendedReflection(primaryTheme),
      recommendedActionExperiment: generateActionExperiment(primaryTheme),
      responsibleUseNote: RESPONSIBLE_USE_NOTE,
      calculationMetadata
    }
  ];
}

export function scoreTimingWindow(window: AstroTimingWindow) {
  return Number(((window.intensityScore + window.confidenceScore) / 2).toFixed(3));
}

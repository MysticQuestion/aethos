import type { AethosProfile, TimingWindow } from "./types";

export function generateTimingWindows(profile: AethosProfile): TimingWindow[] {
  const personalYear = profile.corePatternMap.find((item) => item.label === "Numerology baseline")?.value ?? "baseline";

  return [
    {
      id: "timing-current",
      title: "Current Integration Window",
      timeframe: "Now through the next 30 days",
      theme: "timing_climate",
      confidence: "medium",
      summary: `Use the ${personalYear} context as a reflective marker, not a prediction.`,
      reflectionPrompt: "What decision becomes clearer when you separate urgency from readiness?"
    },
    {
      id: "timing-journal",
      title: "Journal Evidence Window",
      timeframe: "Next 7 entries",
      theme: "emotional_relational",
      confidence: "high",
      summary: "The most reliable next signal will come from repeated themes in written reflection.",
      reflectionPrompt: "Which emotional state keeps appearing around the same kind of choice?"
    },
    {
      id: "timing-practitioner",
      title: "Practitioner Review Window",
      timeframe: "After profile calibration",
      theme: "action_decision",
      confidence: "low",
      summary: "Practitioner-ready synthesis should wait until intake, journal, and report context are complete.",
      reflectionPrompt: "What would a reviewer need to know before treating this pattern as meaningful?"
    }
  ];
}

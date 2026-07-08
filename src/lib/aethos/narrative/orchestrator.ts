import { RESPONSIBLE_USE_NOTE } from "../constants";
import type { AstroTimingWindow } from "../astrology/types";
import type { CalibrationInsight } from "../journal/journal-types";
import { appendScratchpadSection, createScratchpad, type Scratchpad } from "./scratchpad";

export function generatePlanningNotes(window?: AstroTimingWindow, calibration?: CalibrationInsight) {
  return [
    window ? `Primary timing theme: ${window.primaryTheme}.` : "No active timing window supplied.",
    calibration ? `Calibration status: ${calibration.status}.` : "Calibration status unavailable.",
    "Use non-fatalistic language and keep calculation claims separate from interpretation."
  ];
}

export function generateReportDraft(scratchpad: Scratchpad) {
  return [
    "# Aethos Narrative Synthesis",
    "",
    "## Timing Context",
    ...scratchpad.TIMING_EVENTS.map((line) => `- ${line}`),
    "",
    "## Journal Signals",
    ...scratchpad.JOURNAL_SIGNALS.map((line) => `- ${line}`),
    "",
    "## Planning Notes",
    ...scratchpad.PLANNING_NOTES.map((line) => `- ${line}`),
    "",
    "## Responsible Use",
    RESPONSIBLE_USE_NOTE
  ].join("\n");
}

export function generateFinalReport(draft: string) {
  return `${draft}\n\nThis synthesis is generated from structured Aethos data and deterministic templates.`;
}

export function runNarrativeOrchestrator(input: {
  profileSummary: string;
  timingWindow?: AstroTimingWindow;
  calibration?: CalibrationInsight;
}) {
  let scratchpad = createScratchpad();
  scratchpad = appendScratchpadSection(scratchpad, "INPUT_CONTEXT", input.profileSummary);
  if (input.timingWindow) {
    scratchpad = appendScratchpadSection(
      scratchpad,
      "TIMING_EVENTS",
      `${input.timingWindow.title}; ${input.timingWindow.interpretiveSummary}`
    );
    scratchpad = appendScratchpadSection(scratchpad, "THEME_SCORES", `Intensity ${input.timingWindow.intensityScore}`);
  }
  if (input.calibration) {
    scratchpad = appendScratchpadSection(scratchpad, "JOURNAL_SIGNALS", input.calibration.summary);
  }
  generatePlanningNotes(input.timingWindow, input.calibration).forEach((note) => {
    scratchpad = appendScratchpadSection(scratchpad, "PLANNING_NOTES", note);
  });
  scratchpad = appendScratchpadSection(scratchpad, "RESPONSIBLE_USE_NOTES", RESPONSIBLE_USE_NOTE);
  const draft = generateReportDraft(scratchpad);
  scratchpad = appendScratchpadSection(scratchpad, "REPORT_DRAFT", draft);
  return {
    scratchpad,
    finalReport: generateFinalReport(draft)
  };
}

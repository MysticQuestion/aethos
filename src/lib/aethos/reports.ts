import { REPORT_TYPES, RESPONSIBLE_USE_NOTE } from "./constants";
import { summarizeJournal } from "./journal";
import { generateTimingWindows } from "./timing";
import type { AethosProfile, AethosReport, JournalEntry, ReportType } from "./types";

export function generateAethosReport(
  type: ReportType,
  profile: AethosProfile,
  journalEntries: JournalEntry[] = []
): AethosReport {
  const definition = REPORT_TYPES.find((item) => item.value === type) ?? REPORT_TYPES[0];
  const timingWindows = generateTimingWindows(profile);
  const journalSummary = summarizeJournal(journalEntries);
  const generatedAt = new Date().toISOString();
  const keyThemes = profile.corePatternMap.map((item) => `${item.label}: ${item.value}`);
  const reflectionPrompts = profile.reflectionPrompts.slice(0, 3);
  const journalObservations =
    journalSummary.length > 0
      ? journalSummary
      : ["No journal pattern has enough local evidence yet. Add entries to ground symbolic interpretation."];

  const report: Omit<AethosReport, "markdown"> = {
    id: `report-${type}-${Date.now()}`,
    type,
    title: definition.label,
    generatedAt,
    intakeSummary: `${profile.displayName}; birth date ${profile.intake.birthDate}; birth-time confidence ${profile.intake.birthTimeConfidence}.`,
    coreProfileSummary: profile.identitySummary,
    keyThemes,
    timingContext: timingWindows.map((window) => `${window.title}: ${window.summary}`).join(" "),
    journalObservations,
    confidenceNotes: [
      "Confidence levels describe source clarity, interpretive strength, and user-confirmed relevance.",
      "Calculation mode may be demo unless a server-side ephemeris provider is configured.",
      profile.isSample ? "This is a sample profile for local demo mode." : "This report is generated from locally available user data.",
      "Time-sensitive systems remain restricted when birth time or location precision is incomplete."
    ],
    reflectionPrompts,
    responsibleUseNote: RESPONSIBLE_USE_NOTE
  };

  return {
    ...report,
    markdown: renderReportMarkdown(report)
  };
}

function renderReportMarkdown(report: Omit<AethosReport, "markdown">) {
  return [
    `# ${report.title}`,
    "",
    `Generated: ${new Date(report.generatedAt).toLocaleString("en-US")}`,
    "",
    "## Intake Summary",
    report.intakeSummary,
    "",
    "## Core Profile Summary",
    report.coreProfileSummary,
    "",
    "## Key Themes",
    ...report.keyThemes.map((theme) => `- ${theme}`),
    "",
    "## Timing Context",
    report.timingContext,
    "",
    "## Journal-Derived Observations",
    ...report.journalObservations.map((observation) => `- ${observation}`),
    "",
    "## Confidence Notes",
    ...report.confidenceNotes.map((note) => `- ${note}`),
    "",
    "## Reflection Prompts",
    ...report.reflectionPrompts.map((prompt) => `- ${prompt}`),
    "",
    "## Responsible Use",
    report.responsibleUseNote
  ].join("\n");
}

export function createReportPreviews(profile: AethosProfile, journalEntries: JournalEntry[] = []) {
  return REPORT_TYPES.map((definition) => generateAethosReport(definition.value, profile, journalEntries));
}

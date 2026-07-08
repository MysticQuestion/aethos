export type ScratchpadSection =
  | "INPUT_CONTEXT"
  | "CHART_FACTS"
  | "TIMING_EVENTS"
  | "JOURNAL_SIGNALS"
  | "THEME_SCORES"
  | "INTERPRETIVE_CONSTRAINTS"
  | "PLANNING_NOTES"
  | "REPORT_DRAFT"
  | "RESPONSIBLE_USE_NOTES";

export type Scratchpad = Record<ScratchpadSection, string[]>;

export const SCRATCHPAD_SECTIONS: ScratchpadSection[] = [
  "INPUT_CONTEXT",
  "CHART_FACTS",
  "TIMING_EVENTS",
  "JOURNAL_SIGNALS",
  "THEME_SCORES",
  "INTERPRETIVE_CONSTRAINTS",
  "PLANNING_NOTES",
  "REPORT_DRAFT",
  "RESPONSIBLE_USE_NOTES"
];

export function createScratchpad(): Scratchpad {
  return SCRATCHPAD_SECTIONS.reduce((acc, section) => {
    acc[section] = [];
    return acc;
  }, {} as Scratchpad);
}

export function appendScratchpadSection(scratchpad: Scratchpad, section: ScratchpadSection, line: string): Scratchpad {
  return {
    ...scratchpad,
    [section]: [...scratchpad[section], line]
  };
}

export function validateScratchpad(scratchpad: Scratchpad) {
  return SCRATCHPAD_SECTIONS.every((section) => Array.isArray(scratchpad[section]));
}

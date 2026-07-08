import type { EmaJournalEntry, JournalAverages } from "./journal-types";

const NUMERIC_FIELDS: Array<keyof Omit<EmaJournalEntry, "id" | "freeText" | "tags" | "linkedTimingWindowIds" | "createdAt">> = [
  "mood",
  "stress",
  "focus",
  "sleepQuality",
  "socialConnection",
  "conflictLevel",
  "creativity",
  "decisionPressure",
  "bodyEnergy",
  "clarity"
];

export function clampScale(value?: number) {
  if (value === undefined) return undefined;
  return Math.min(10, Math.max(1, Math.round(value)));
}

export function calculateJournalAverages(entries: EmaJournalEntry[]): JournalAverages {
  const averages: JournalAverages = { count: entries.length };
  NUMERIC_FIELDS.forEach((field) => {
    const values = entries.map((entry) => entry[field]).filter((value): value is number => typeof value === "number");
    if (values.length > 0) {
      averages[field] = Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
    }
  });
  return averages;
}

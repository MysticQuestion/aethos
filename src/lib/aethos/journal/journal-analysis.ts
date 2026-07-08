import type { AstroTimingWindow } from "../astrology/types";
import { calculateJournalAverages } from "./ema";
import type { CalibrationInsight, EmaJournalEntry } from "./journal-types";

export function createEmaJournalEntry(input: Omit<EmaJournalEntry, "id" | "createdAt">): EmaJournalEntry {
  return {
    ...input,
    id: `ema-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
}

export function updateJournalEntry(entries: EmaJournalEntry[], id: string, patch: Partial<EmaJournalEntry>) {
  return entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
}

export function deleteJournalEntry(entries: EmaJournalEntry[], id: string) {
  return entries.filter((entry) => entry.id !== id);
}

export function getEntriesForDateRange(entries: EmaJournalEntry[], startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return entries.filter((entry) => {
    const time = new Date(entry.createdAt).getTime();
    return time >= start && time <= end;
  });
}

export function getEntriesNearTimingWindow(entries: EmaJournalEntry[], window: AstroTimingWindow) {
  return getEntriesForDateRange(entries, window.startDate, window.endDate);
}

export function compareWindowToBaseline(entries: EmaJournalEntry[], window: AstroTimingWindow): CalibrationInsight {
  const baseline = calculateJournalAverages(entries);
  const windowEntries = getEntriesNearTimingWindow(entries, window);
  const windowAverage = calculateJournalAverages(windowEntries);
  const status = calibrationStatus(entries.length);

  if (entries.length < 7) {
    return {
      status,
      baseline,
      windowAverage,
      summary:
        "Not enough journal history yet. Aethos needs repeated check-ins before it can estimate personal timing correlations."
    };
  }

  const stress = windowAverage.stress ?? baseline.stress;
  const baselineStress = baseline.stress;
  const stressCopy =
    stress && baselineStress
      ? `Stress averaged ${stress} in this window compared with a baseline of ${baselineStress}.`
      : "Stress comparison is not available yet.";

  return {
    status,
    baseline,
    windowAverage,
    summary: `${stressCopy} Treat this as a pattern to observe, not a deterministic forecast.`
  };
}

export function generateCalibrationInsight(entries: EmaJournalEntry[], window?: AstroTimingWindow): CalibrationInsight {
  if (!window) {
    return {
      status: calibrationStatus(entries.length),
      baseline: calculateJournalAverages(entries),
      summary:
        entries.length < 7
          ? "Not enough journal history yet. Aethos needs repeated check-ins before it can estimate personal timing correlations."
          : "Aethos is building a personal baseline from repeated check-ins."
    };
  }
  return compareWindowToBaseline(entries, window);
}

function calibrationStatus(count: number): CalibrationInsight["status"] {
  if (count < 7) return "insufficient_data";
  if (count <= 20) return "early_learning";
  if (count <= 60) return "emerging_signal";
  return "stronger_basis";
}

import {
  AETHOS_STORAGE_KEY,
  emptyAethosState,
  loadLocalAethosState,
  saveLocalAethosState
} from "../storage";
import type { AethosReport, AethosState, JournalEntry } from "../types";
import type { AstroTimingWindow, NatalChart, TransitEvent } from "../astrology/types";

export type ExtendedAethosState = AethosState & {
  natalChart?: NatalChart;
  transitEvents?: TransitEvent[];
  timingWindows?: AstroTimingWindow[];
};

export function loadExtendedLocalState(): ExtendedAethosState {
  return loadLocalAethosState() as ExtendedAethosState;
}

export function saveExtendedLocalState(state: ExtendedAethosState) {
  saveLocalAethosState(state);
}

export function saveNatalChart(natalChart: NatalChart) {
  const state = loadExtendedLocalState();
  saveExtendedLocalState({ ...state, natalChart });
}

export function saveTransitEvents(transitEvents: TransitEvent[]) {
  const state = loadExtendedLocalState();
  saveExtendedLocalState({ ...state, transitEvents });
}

export function saveTimingWindows(timingWindows: AstroTimingWindow[]) {
  const state = loadExtendedLocalState();
  saveExtendedLocalState({ ...state, timingWindows });
}

export function loadTimingWindows() {
  return loadExtendedLocalState().timingWindows ?? [];
}

export function saveJournalEntryLocal(entry: JournalEntry) {
  const state = loadExtendedLocalState();
  saveExtendedLocalState({ ...state, journalEntries: [entry, ...state.journalEntries] });
}

export function loadJournalEntriesLocal() {
  return loadExtendedLocalState().journalEntries;
}

export function saveReportLocal(report: AethosReport) {
  const state = loadExtendedLocalState();
  saveExtendedLocalState({ ...state, reports: [report, ...state.reports] });
}

export function loadReportsLocal() {
  return loadExtendedLocalState().reports;
}

export function clearLocalSegment(segment: "profile" | "journal" | "reports" | "timing" | "all") {
  if (typeof window === "undefined") return;
  if (segment === "all") {
    window.localStorage.removeItem(AETHOS_STORAGE_KEY);
    return;
  }
  const state = loadExtendedLocalState();
  const next: ExtendedAethosState = { ...state };
  if (segment === "profile") {
    delete next.profile;
    delete next.natalChart;
  }
  if (segment === "journal") next.journalEntries = [];
  if (segment === "reports") next.reports = [];
  if (segment === "timing") {
    next.timingWindows = [];
    next.transitEvents = [];
  }
  saveExtendedLocalState({ ...emptyAethosState(), ...next });
}

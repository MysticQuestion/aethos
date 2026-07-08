import { getStorageMode } from "../storage";
import type { AethosProfile, AethosReport, JournalEntry } from "../types";
import type { AstroTimingWindow, NatalChart, TransitEvent } from "../astrology/types";
import {
  loadExtendedLocalState,
  loadJournalEntriesLocal,
  loadReportsLocal,
  loadTimingWindows,
  saveExtendedLocalState,
  saveJournalEntryLocal,
  saveNatalChart,
  saveReportLocal,
  saveTimingWindows,
  saveTransitEvents
} from "./local-store";
import { exportAethosData, importAethosData } from "./data-export";
import { deleteLocalAethosData, deleteProfileData } from "./data-delete";

export function getActiveStorageMode() {
  return getStorageMode();
}

export function saveProfile(profile: AethosProfile) {
  const state = loadExtendedLocalState();
  saveExtendedLocalState({ ...state, profile });
}

export function loadProfile() {
  return loadExtendedLocalState().profile;
}

export function saveBirthIntake(profile: AethosProfile) {
  saveProfile(profile);
}

export { saveNatalChart, saveTransitEvents, saveTimingWindows, loadTimingWindows };

export function saveJournalEntry(entry: JournalEntry) {
  saveJournalEntryLocal(entry);
}

export function loadJournalEntries() {
  return loadJournalEntriesLocal();
}

export function saveReport(report: AethosReport) {
  saveReportLocal(report);
}

export function loadReports() {
  return loadReportsLocal();
}

export function persistTimingFlow(input: {
  natalChart: NatalChart;
  transitEvents: TransitEvent[];
  timingWindows: AstroTimingWindow[];
}) {
  saveNatalChart(input.natalChart);
  saveTransitEvents(input.transitEvents);
  saveTimingWindows(input.timingWindows);
}

export { exportAethosData, importAethosData, deleteLocalAethosData, deleteProfileData };

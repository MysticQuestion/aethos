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
import {
  getBrowserSessionUser,
  getSupabaseStoreStatus,
  loadJournalEntriesRemote,
  loadProfileRemote,
  loadReportsRemote,
  saveJournalEntryRemote,
  saveReportRemote,
  upsertProfileRemote
} from "./supabase-store";

export function getActiveStorageMode() {
  return getStorageMode();
}

/** Always write local first so demo mode and offline keep working. */
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

/**
 * Best-effort cloud mirror when Supabase is configured and the user is signed in.
 * Local storage remains the source of truth for the browser session.
 */
export async function mirrorProfileToCloud(profile: AethosProfile) {
  const user = await getBrowserSessionUser();
  const status = getSupabaseStoreStatus(user);
  if (!status.writable || !user) {
    return { mirrored: false as const, reason: status.warning ?? "not writable" };
  }
  await upsertProfileRemote(profile, user.id);
  return { mirrored: true as const };
}

export async function mirrorJournalEntryToCloud(entry: JournalEntry, profileId: string) {
  const user = await getBrowserSessionUser();
  const status = getSupabaseStoreStatus(user);
  if (!status.writable || !user) {
    return { mirrored: false as const, reason: status.warning ?? "not writable" };
  }
  await saveJournalEntryRemote(entry, profileId, user.id);
  return { mirrored: true as const };
}

export async function mirrorReportToCloud(report: AethosReport, profileId: string) {
  const user = await getBrowserSessionUser();
  const status = getSupabaseStoreStatus(user);
  if (!status.writable || !user) {
    return { mirrored: false as const, reason: status.warning ?? "not writable" };
  }
  await saveReportRemote(report, profileId, user.id);
  return { mirrored: true as const };
}

export async function pullCloudStateIntoLocal() {
  const user = await getBrowserSessionUser();
  const status = getSupabaseStoreStatus(user);
  if (!status.writable || !user) {
    return { pulled: false as const, reason: status.warning ?? "not writable" };
  }

  const profile = await loadProfileRemote(user.id);
  if (!profile) {
    return { pulled: false as const, reason: "No remote profile for this account." };
  }

  const [journalEntries, reports] = await Promise.all([
    loadJournalEntriesRemote(profile.id, user.id),
    loadReportsRemote(profile.id, user.id)
  ]);

  const previous = loadExtendedLocalState();
  saveExtendedLocalState({
    ...previous,
    profile,
    journalEntries: journalEntries.length ? journalEntries : previous.journalEntries,
    reports: reports.length ? reports : previous.reports,
    updatedAt: new Date().toISOString()
  });

  return {
    pulled: true as const,
    profileId: profile.id,
    journalCount: journalEntries.length,
    reportCount: reports.length
  };
}

export { exportAethosData, importAethosData, deleteLocalAethosData, deleteProfileData, getSupabaseStoreStatus };

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AethosProfile, AethosReport, JournalEntry } from "@/lib/aethos/types";
import type { NatalChart } from "@/lib/aethos/astrology/types";
import { emptyAethosState } from "@/lib/aethos/storage";
import { loadExtendedLocalState, saveExtendedLocalState, type ExtendedAethosState } from "@/lib/aethos/storage/local-store";
import { getBrowserSessionUser } from "@/lib/aethos/storage/supabase-store";
import { mirrorProfileToCloud, pullCloudStateIntoLocal } from "@/lib/aethos/storage/storage-router";

type ActiveProfileStatus = "loading" | "ready" | "empty";
type ActiveProfileSource = "local" | "cloud" | null;

type ActiveProfileContextValue = {
  profile?: AethosProfile;
  natalChart?: NatalChart;
  journalEntries: JournalEntry[];
  reports: AethosReport[];
  status: ActiveProfileStatus;
  source: ActiveProfileSource;
  syncNote?: string;
  refresh: () => Promise<void>;
  saveActiveProfile: (profile: AethosProfile, natalChart?: NatalChart) => Promise<{ mirrored: boolean; note: string }>;
};

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null);

export function ActiveProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ExtendedAethosState>(() => emptyAethosState());
  const [status, setStatus] = useState<ActiveProfileStatus>("loading");
  const [source, setSource] = useState<ActiveProfileSource>(null);
  const [syncNote, setSyncNote] = useState<string>();

  const loadLocal = useCallback(() => {
    const local = loadExtendedLocalState();
    setState(local);
    setSource(local.profile ? "local" : null);
    setStatus(local.profile ? "ready" : "empty");
    return local;
  }, []);

  const refresh = useCallback(async () => {
    const local = loadLocal();
    try {
      const user = await getBrowserSessionUser();
      if (!user) return;
      const pulled = await pullCloudStateIntoLocal();
      if (pulled.pulled) {
        const cloudState = loadExtendedLocalState();
        setState(cloudState);
        setSource("cloud");
        setStatus("ready");
        setSyncNote("Authenticated cloud profile loaded and cached locally.");
      } else if (local.profile) {
        setSyncNote("Using the local profile; no cloud profile was available.");
      }
    } catch {
      setSyncNote("Cloud profile could not be reached. Your local profile remains available.");
    }
  }, [loadLocal]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    const handleStorage = () => loadLocal();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("aethos:profile-updated", handleStorage);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("aethos:profile-updated", handleStorage);
    };
  }, [loadLocal, refresh]);

  const saveActiveProfile = useCallback(async (profile: AethosProfile, natalChart?: NatalChart) => {
    const previous = loadExtendedLocalState();
    const next = { ...previous, profile, natalChart: natalChart ?? previous.natalChart };
    saveExtendedLocalState(next);
    setState(next);
    setSource("local");
    setStatus("ready");

    try {
      const mirror = await mirrorProfileToCloud(profile);
      const note = mirror.mirrored
        ? "Profile saved locally and mirrored to your authenticated cloud account."
        : "Profile saved locally. Sign in from Account to enable cloud backup.";
      setSyncNote(note);
      return { mirrored: mirror.mirrored, note };
    } catch {
      const note = "Profile saved locally. Cloud backup was unavailable and can be retried from Account.";
      setSyncNote(note);
      return { mirrored: false, note };
    }
  }, []);

  const value = useMemo<ActiveProfileContextValue>(() => ({
    profile: state.profile,
    natalChart: state.natalChart,
    journalEntries: state.journalEntries,
    reports: state.reports,
    status,
    source,
    syncNote,
    refresh,
    saveActiveProfile
  }), [refresh, saveActiveProfile, source, state, status, syncNote]);

  return <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>;
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) throw new Error("useActiveProfile must be used inside ActiveProfileProvider.");
  return context;
}

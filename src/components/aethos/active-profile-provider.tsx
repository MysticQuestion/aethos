"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AethosProfile, AethosReport, JournalEntry } from "@/lib/aethos/types";
import type { AstroTimingWindow, NatalChart, TransitEvent } from "@/lib/aethos/astrology/types";
import { generateTimingWindows } from "@/lib/aethos/astrology/timing-windows";
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
  transitEvents: TransitEvent[];
  timingWindows: AstroTimingWindow[];
  timingStatus: "idle" | "loading" | "ready" | "empty" | "error";
  timingNote?: string;
  status: ActiveProfileStatus;
  source: ActiveProfileSource;
  syncNote?: string;
  refresh: () => Promise<void>;
  refreshTiming: () => Promise<void>;
  saveActiveProfile: (profile: AethosProfile, natalChart?: NatalChart) => Promise<{ mirrored: boolean; note: string }>;
};

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null);

export function ActiveProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ExtendedAethosState>(() => emptyAethosState());
  const [status, setStatus] = useState<ActiveProfileStatus>("loading");
  const [source, setSource] = useState<ActiveProfileSource>(null);
  const [syncNote, setSyncNote] = useState<string>();
  const [timingStatus, setTimingStatus] = useState<ActiveProfileContextValue["timingStatus"]>("idle");
  const [timingNote, setTimingNote] = useState<string>();

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
    const chartChanged = Boolean(natalChart && natalChart.id !== previous.natalChart?.id);
    const next = {
      ...previous,
      profile,
      natalChart: natalChart ?? previous.natalChart,
      transitEvents: chartChanged ? [] : previous.transitEvents,
      timingWindows: chartChanged ? [] : previous.timingWindows
    };
    saveExtendedLocalState(next);
    setState(next);
    setSource("local");
    setStatus("ready");
    if (chartChanged) {
      setTimingStatus("idle");
      setTimingNote(undefined);
    }

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

  const refreshTiming = useCallback(async () => {
    const current = loadExtendedLocalState();
    if (!current.natalChart) {
      setTimingStatus("empty");
      setTimingNote("A saved natal chart is required before timing events can be calculated.");
      return;
    }
    setTimingStatus("loading");
    try {
      const start = new Date();
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 60);
      const response = await fetch("/api/aethos/transits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          natalChart: current.natalChart,
          dateRangeStart: start.toISOString(),
          dateRangeEnd: end.toISOString(),
          providerMode: current.natalChart.metadata.calculationMode
        })
      });
      if (!response.ok) throw new Error("Timing service request failed.");
      const result = await response.json() as {
        transitEvents: TransitEvent[];
        warnings?: string[];
        providerRoute?: string;
      };
      const timingWindows = generateTimingWindows(result.transitEvents);
      const next = { ...current, transitEvents: result.transitEvents, timingWindows };
      saveExtendedLocalState(next);
      setState(next);
      setTimingStatus(timingWindows.length ? "ready" : "empty");
      setTimingNote(
        timingWindows.length
          ? `${result.providerRoute === "calculation_service" ? "Calculation-service" : "Demo-provider"} events refreshed for the next 60 days.`
          : "No supported transit aspects were detected in the next 60 days."
      );
    } catch {
      setTimingStatus("error");
      setTimingNote("Timing events could not be refreshed. The saved natal profile remains available.");
    }
  }, []);

  const value = useMemo<ActiveProfileContextValue>(() => ({
    profile: state.profile,
    natalChart: state.natalChart,
    journalEntries: state.journalEntries,
    reports: state.reports,
    transitEvents: state.transitEvents ?? [],
    timingWindows: state.timingWindows ?? [],
    timingStatus,
    timingNote,
    status,
    source,
    syncNote,
    refresh,
    refreshTiming,
    saveActiveProfile
  }), [refresh, refreshTiming, saveActiveProfile, source, state, status, syncNote, timingNote, timingStatus]);

  return <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>;
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) throw new Error("useActiveProfile must be used inside ActiveProfileProvider.");
  return context;
}

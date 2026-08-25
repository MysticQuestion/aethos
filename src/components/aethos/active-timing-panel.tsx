"use client";

import { useEffect, useRef } from "react";
import { CalendarClock, LoaderCircle, RefreshCw } from "lucide-react";
import { useActiveProfile } from "./active-profile-provider";
import { StatusBadge } from "@/components/status-badge";

export function ActiveTimingPanel({ limit = 2 }: { limit?: number }) {
  const { natalChart, timingWindows, timingStatus, timingNote, refreshTiming } = useActiveProfile();
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!natalChart || timingWindows.length || requestedFor.current === natalChart.id) return;
    const timer = window.setTimeout(() => {
      requestedFor.current = natalChart.id;
      void refreshTiming();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [natalChart, refreshTiming, timingWindows.length]);

  if (!natalChart) {
    return <div className="aethos-panel rounded-md p-5"><p className="text-sm font-semibold">Timing unavailable</p><p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Create or recalculate a natal profile before requesting timing events.</p></div>;
  }

  if (timingStatus === "loading") {
    return <div className="aethos-panel flex min-h-40 items-center justify-center rounded-md"><LoaderCircle className="h-5 w-5 animate-spin text-[var(--violet)]" aria-label="Refreshing timing events" /></div>;
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold">Event-derived timing</p><p className="mt-1 text-xs text-[var(--ink-soft)]">{timingNote ?? "Windows are derived from saved transit events, not generic calendar copy."}</p></div>
        <button type="button" onClick={() => void refreshTiming()} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-semibold"><RefreshCw className="h-3.5 w-3.5" />Refresh 60 days</button>
      </div>
      {timingWindows.length ? timingWindows.slice(0, limit).map((window) => (
        <article key={window.id} className="aethos-panel rounded-md p-5">
          <div className="flex items-start justify-between gap-3"><CalendarClock className="h-5 w-5 text-[var(--violet)]" /><StatusBadge>{Math.round(window.confidenceScore * 100)} confidence</StatusBadge></div>
          <h3 className="mt-4 text-lg font-semibold">{window.title}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">{new Date(window.startDate).toLocaleDateString()} — {new Date(window.endDate).toLocaleDateString()}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{window.interpretiveSummary}</p>
          <p className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-3 text-sm leading-6">{window.suggestedReflection}</p>
          <div className="mt-4 flex flex-wrap gap-2"><StatusBadge>{window.sourceEvents.length} source events</StatusBadge><StatusBadge>{Math.round(window.intensityScore * 100)} intensity</StatusBadge><StatusBadge tone={window.calculationMetadata.calculationMode === "demo" ? "tension" : "agreement"}>{window.calculationMetadata.calculationMode} provider</StatusBadge></div>
        </article>
      )) : <div className="rounded-md border border-dashed border-[var(--line)] p-5 text-sm leading-6 text-[var(--ink-soft)]">{timingNote ?? "No timing windows are currently available."}</div>}
    </section>
  );
}

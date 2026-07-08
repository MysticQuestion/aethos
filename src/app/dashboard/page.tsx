import Link from "next/link";
import { FileText, NotebookPen, ShieldCheck } from "lucide-react";
import { InsightCard } from "@/components/insight-card";
import { MetricCard } from "@/components/metric-card";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { TimingWindowCard } from "@/components/aethos/timing-window-card";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { buildDemoKernel } from "@/lib/aethos/demo";
import { createSampleAethosProfile } from "@/lib/aethos/profile";
import { generateTimingWindows } from "@/lib/aethos/timing";
import { getStorageMode } from "@/lib/aethos/storage";

export default function DashboardPage() {
  const kernel = buildDemoKernel();
  const profile = createSampleAethosProfile();
  const timingWindows = generateTimingWindows(profile);
  const storageMode = getStorageMode();

  return (
    <SiteShell
      eyebrow="User dashboard"
      title="A coherent workspace for profile, timing, journal signals, reports, and next reflection."
      description="Demo data appears when no user is authenticated. Missing Supabase variables never blank-screen the application."
      actions={
        <>
          <Link href="/journal" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--line)] px-4 text-sm font-semibold">
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            Journal
          </Link>
          <Link href="/reports" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Reports
          </Link>
        </>
      }
    >
      <section className="rounded-md border border-[rgba(94,234,212,0.25)] bg-[rgba(94,234,212,0.07)] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--teal)]">
              {storageMode === "local_demo" ? "Local mode: data is stored in this browser only." : "Supabase mode active."}
            </p>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--ink-soft)]">
              Aethos remains usable without authentication or remote configuration. Supabase persistence activates only when public environment variables are configured.
            </p>
          </div>
          <ShieldCheck className="h-6 w-6 text-[var(--teal)]" aria-hidden="true" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Aethos Core" value="Ready" detail={`Life Path ${kernel.numerology.lifePath}; Sun ${kernel.western.sunSign}`} />
        <MetricCard label="Current Timing" value={kernel.numerology.personalYear} detail="Personal year context marker" />
        <MetricCard label="Journal Signals" value="Local" detail="Theme extraction available" />
        <MetricCard label="Recent Reports" value="5" detail="Report types scaffolded" />
        <MetricCard label="Next Reflection" value="1" detail="Decision prompt queued" />
      </section>

      {kernel.lowConfidenceMode ? (
        <section className="rounded-md border border-[rgba(214,106,154,0.3)] bg-[rgba(214,106,154,0.08)] p-5">
          <p className="text-sm font-semibold text-[var(--wine)]">Data Calibration: Birth time unknown.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            Aethos has restricted Ascendant, houses, Human Design Type, astrocartography, Vedic Lagna, and BaZi Hour Pillar to protect the profile from false precision.
          </p>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          {kernel.insights.slice(0, 3).map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
        <aside className="grid h-fit gap-5">
          {timingWindows.slice(0, 2).map((window) => (
            <TimingWindowCard key={window.id} window={window} />
          ))}
          <div className="aethos-panel rounded-md p-5">
            <p className="text-sm font-semibold">Next recommended reflection</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              What would make this interpretation more grounded in lived experience before it becomes a decision input?
            </p>
            <div className="mt-4">
              <StatusBadge tone="mixed">reflection</StatusBadge>
            </div>
          </div>
        </aside>
      </section>
      <ResponsibleUseNote compact />
      <ResponsibleUseBoundary />
    </SiteShell>
  );
}

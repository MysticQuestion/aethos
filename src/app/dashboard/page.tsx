"use client";

import Link from "next/link";
import { FileText, LoaderCircle, NotebookPen, ShieldCheck, UserRoundPlus } from "lucide-react";
import { InsightCard } from "@/components/insight-card";
import { MetricCard } from "@/components/metric-card";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { ActiveTimingPanel } from "@/components/aethos/active-timing-panel";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { EmptyState } from "@/components/aethos/empty-state";
import { useActiveProfile } from "@/components/aethos/active-profile-provider";
import { buildDemoKernel } from "@/lib/aethos/demo";

export default function DashboardPage() {
  const { profile, natalChart, journalEntries, reports, source, status, syncNote } = useActiveProfile();
  const kernel = profile ? buildDemoKernel(profile.intake) : null;

  return (
    <SiteShell
      eyebrow="User dashboard"
      title={profile ? `Welcome back, ${profile.displayName}.` : "Your personal Aethos workspace starts with a profile."}
      description="One active profile now powers your dashboard, calculations, journal context, reports, and profile view."
      actions={profile ? <>
        <Link href="/journal" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--line)] px-4 text-sm font-semibold"><NotebookPen className="h-4 w-4" />Journal</Link>
        <Link href="/reports" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]"><FileText className="h-4 w-4" />Reports</Link>
      </> : undefined}
    >
      {status === "loading" ? (
        <div className="aethos-panel flex min-h-48 items-center justify-center rounded-md"><LoaderCircle className="h-6 w-6 animate-spin text-[var(--teal)]" aria-label="Loading active profile" /></div>
      ) : !profile || !kernel ? (
        <EmptyState
          icon={UserRoundPlus}
          title="No active profile yet"
          detail="Complete the canonical intake to create your first real profile. Aethos will not substitute sample data for your personal workspace."
          action={<Link href="/onboarding" className="rounded-md bg-[var(--ochre)] px-5 py-3 text-sm font-semibold text-[#090a12]">Create my profile</Link>}
        />
      ) : <>
        <section className="rounded-md border border-[rgba(94,234,212,0.25)] bg-[rgba(94,234,212,0.07)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-sm font-semibold text-[var(--teal)]">{source === "cloud" ? "Cloud profile active" : "Local profile active"}</p><p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{syncNote ?? "Your saved profile is the source for every module on this page."}</p></div>
            <ShieldCheck className="h-6 w-6 text-[var(--teal)]" aria-hidden="true" />
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-5">
          <MetricCard label="Aethos Core" value="Active" detail={`Life Path ${kernel.numerology.lifePath}; Sun ${kernel.western.sunSign}`} />
          <MetricCard label="Chart Provider" value={natalChart?.metadata.calculationMode ?? "Pending"} detail={natalChart?.metadata.providerId ?? "Complete intake calculation"} />
          <MetricCard label="Journal Signals" value={journalEntries.length} detail="Saved entries" />
          <MetricCard label="Recent Reports" value={reports.length} detail="Saved reports" />
          <MetricCard label="Birth Precision" value={profile.intake.birthTimeConfidence} detail="Canonical intake confidence" />
        </section>
        {kernel.lowConfidenceMode ? <section className="rounded-md border border-[rgba(214,106,154,0.3)] bg-[rgba(214,106,154,0.08)] p-5"><p className="text-sm font-semibold text-[var(--wine)]">Data calibration: birth time incomplete.</p><p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Ascendant, houses, Human Design Type, astrocartography, Vedic Lagna, and BaZi Hour Pillar remain restricted to prevent false precision.</p></section> : null}
        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-5">{kernel.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}</div>
          <aside className="grid h-fit gap-5"><ActiveTimingPanel limit={2} /><div className="aethos-panel rounded-md p-5"><p className="text-sm font-semibold">Next recommended reflection</p><p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">What would make this interpretation more grounded in lived experience before it becomes a decision input?</p><div className="mt-4"><StatusBadge tone="mixed">reflection</StatusBadge></div></div></aside>
        </section>
        <ResponsibleUseNote compact />
        <ResponsibleUseBoundary />
      </>}
    </SiteShell>
  );
}

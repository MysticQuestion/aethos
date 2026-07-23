"use client";

import Link from "next/link";
import { LoaderCircle, UserRoundPlus } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { ProfileSummary } from "@/components/aethos/profile-summary";
import { SystemLayersPanel } from "@/components/aethos/system-layers-panel";
import { TimingWindowCard } from "@/components/aethos/timing-window-card";
import { EmptyState } from "@/components/aethos/empty-state";
import { useActiveProfile } from "@/components/aethos/active-profile-provider";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { buildDemoKernel } from "@/lib/aethos/demo";
import { generateTimingWindows } from "@/lib/aethos/timing";

export default function ProfilePage() {
  const { profile, natalChart, status } = useActiveProfile();
  const kernel = profile ? buildDemoKernel(profile.intake) : null;
  const timing = profile ? generateTimingWindows(profile) : [];

  return <SiteShell eyebrow="Profile baseline" title={profile ? `${profile.displayName}'s structured profile` : "Your structured profile"} description="This page uses the same active profile as onboarding, calculations, persistence, and the dashboard.">
    {status === "loading" ? <div className="aethos-panel flex min-h-48 items-center justify-center rounded-md"><LoaderCircle className="h-6 w-6 animate-spin text-[var(--teal)]" aria-label="Loading active profile" /></div> : !profile || !kernel ? (
      <EmptyState icon={UserRoundPlus} title="No profile to display" detail="Create a profile first. Sample identities are no longer presented as personal results." action={<Link href="/onboarding" className="rounded-md bg-[var(--ochre)] px-5 py-3 text-sm font-semibold text-[#090a12]">Start canonical intake</Link>} />
    ) : <>
      <ProfileSummary profile={profile} />
      <SystemLayersPanel layers={profile.systemLayers} />
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Expression" value={kernel.numerology.expressionNumber ?? "N/A"} detail="Full-name Pythagorean sum" />
        <MetricCard label="Personal Year" value={kernel.numerology.personalYear} detail="Date-based timing layer" />
        <MetricCard label="Chart bodies" value={natalChart?.positions.length ?? 0} detail={natalChart?.metadata.calculationMode ?? "Calculation pending"} />
        <MetricCard label="Houses" value={natalChart?.houses.length ?? 0} detail={profile.intake.birthTimeConfidence === "exact" ? "Calculated when supported" : "Restricted by input precision"} />
      </section>
      <section className="grid gap-5 lg:grid-cols-3">{([['Strengths', profile.strengths], ['Tensions / growth edges', profile.tensions], ['Reflection prompts', profile.reflectionPrompts]] as const).map(([title, items]) => <div key={title} className="aethos-panel rounded-md p-5"><h2 className="text-lg font-semibold">{title}</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ink-soft)]">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</section>
      <section className="grid gap-5 lg:grid-cols-3">{timing.map((window) => <TimingWindowCard key={window.id} window={window} />)}</section>
      <section className="aethos-panel rounded-md p-5"><h2 className="text-lg font-semibold">Calculation boundary</h2><div className="mt-4 flex flex-wrap gap-2"><StatusBadge tone="agreement">Sun: {kernel.western.sunSign}</StatusBadge><StatusBadge tone={natalChart ? "agreement" : "tension"}>Chart: {natalChart?.metadata.calculationMode ?? "pending"}</StatusBadge><StatusBadge tone={kernel.western.housesStatus === "available" ? "agreement" : "tension"}>Houses: {kernel.western.housesStatus}</StatusBadge></div></section>
    </>}
  </SiteShell>;
}

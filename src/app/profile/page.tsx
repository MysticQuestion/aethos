import { MetricCard } from "@/components/metric-card";
import { ProfileSummary } from "@/components/aethos/profile-summary";
import { SystemLayersPanel } from "@/components/aethos/system-layers-panel";
import { TimingWindowCard } from "@/components/aethos/timing-window-card";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { buildDemoKernel } from "@/lib/aethos/demo";
import { createSampleAethosProfile } from "@/lib/aethos/profile";
import { generateTimingWindows } from "@/lib/aethos/timing";

export default function ProfilePage() {
  const kernel = buildDemoKernel();
  const profile = createSampleAethosProfile();
  const timing = generateTimingWindows(profile);

  return (
    <SiteShell
      eyebrow="Profile baseline"
      title="A structured symbolic profile with strengths, tensions, timing sensitivities, and prompts."
      description="This page separates supported V1 outputs from systems that require higher-resolution data or future engines."
    >
      <ProfileSummary profile={profile} />
      <SystemLayersPanel layers={profile.systemLayers} />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Expression" value={kernel.numerology.expressionNumber ?? "N/A"} detail="Full-name Pythagorean sum" />
        <MetricCard label="Personal Year" value={kernel.numerology.personalYear} detail="Date-based timing layer" />
        <MetricCard label="Moon" value={kernel.western.moonStatus} detail="No ephemeris claim in Phase 1" />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Strengths</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ink-soft)]">
            {profile.strengths.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Tensions / growth edges</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ink-soft)]">
            {profile.tensions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Reflection prompts</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ink-soft)]">
            {profile.reflectionPrompts.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {timing.map((window) => <TimingWindowCard key={window.id} window={window} />)}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Numerology calculation</h2>
          <pre className="mt-4 overflow-auto rounded-md bg-[#191714] p-4 text-xs leading-5 text-[#f7f5ef]">
            {JSON.stringify(kernel.numerology, null, 2)}
          </pre>
        </div>
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Western baseline</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="agreement">Sun: {kernel.western.sunSign}</StatusBadge>
            <StatusBadge tone="tension">Ascendant: {kernel.western.ascendantStatus}</StatusBadge>
            <StatusBadge tone="tension">Houses: {kernel.western.housesStatus}</StatusBadge>
          </div>
          <pre className="mt-4 overflow-auto rounded-md bg-[#191714] p-4 text-xs leading-5 text-[#f7f5ef]">
            {JSON.stringify(kernel.western, null, 2)}
          </pre>
        </div>
      </section>
    </SiteShell>
  );
}

import { StatusBadge } from "@/components/status-badge";
import type { AethosProfile } from "@/lib/aethos/types";

export function ProfileSummary({ profile }: { profile: AethosProfile }) {
  return (
    <section className="aethos-panel rounded-md p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{profile.displayName}</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{profile.isSample ? "Sample profile" : "Local profile"}</p>
        </div>
        <StatusBadge tone={profile.isSample ? "tension" : "agreement"}>{profile.intake.birthTimeConfidence} birth time</StatusBadge>
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--ink-soft)]">{profile.identitySummary}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {profile.corePatternMap.map((item) => (
          <div key={item.label} className="rounded-md border border-[var(--line)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">{item.label}</p>
            <p className="mt-2 text-lg font-semibold">{item.value}</p>
            <p className="mt-2 text-xs text-[var(--ink-soft)]">{item.source}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

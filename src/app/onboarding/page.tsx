import { CircleDashed } from "lucide-react";
import { IntakeStepper } from "@/components/aethos/intake-stepper";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { demoIntake } from "@/lib/aethos/demo";

const fields = [
  ["Display name", demoIntake.displayName],
  ["Birth date", demoIntake.birthDate],
  ["Birth time confidence", demoIntake.birthTimeConfidence],
  ["Birth place", `${demoIntake.birthPlace?.city}, ${demoIntake.birthPlace?.region ?? ""}`],
  ["Full birth name", demoIntake.fullBirthName ?? "Not provided"]
];

export default function OnboardingPage() {
  return (
    <SiteShell
      eyebrow="Canonical intake"
      title="Create a profile that stays useful even when birth data is incomplete."
      description="Onboarding collects identity, birth context, intention, preferred systems, and consent. Unknown birth time lowers confidence instead of forcing fabricated defaults."
    >
      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <IntakeStepper />
        <div className="grid gap-5">
          <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Demo intake record</h2>
          <div className="mt-5 grid gap-3">
            {fields.map(([label, value]) => (
              <div key={label} className="grid gap-2 rounded-md border border-[var(--line)] p-4 sm:grid-cols-[180px_1fr]">
                <p className="text-sm font-semibold text-[var(--ink-soft)]">{label}</p>
                <p className="text-sm text-[var(--foreground)]">{value}</p>
              </div>
            ))}
          </div>
        </div>
          <div className="aethos-panel rounded-md p-5">
            <h2 className="text-lg font-semibold">Systems enabled</h2>
            <div className="mt-5 grid gap-3">
              {Object.entries(demoIntake.systemsEnabled).map(([system, enabled]) => (
                <div key={system} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--ink-soft)]">{system}</span>
                  {enabled ? <StatusBadge tone="agreement">enabled</StatusBadge> : <CircleDashed className="h-5 w-5 text-[var(--ink-soft)]" />}
                </div>
              ))}
            </div>
          </div>
          <ResponsibleUseNote compact />
        </div>
      </section>
    </SiteShell>
  );
}

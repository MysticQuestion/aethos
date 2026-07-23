import { CheckCircle2, ShieldCheck } from "lucide-react";
import { IntakeStepper } from "@/components/aethos/intake-stepper";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";

const readiness = [
  "Birth time is never silently replaced with noon for time-sensitive claims.",
  "Coordinates and timezone are retained with the canonical intake when provided.",
  "System preferences are explicit and can be revised later.",
  "Responsible-use consent starts unaccepted and requires an affirmative choice.",
  "Calculation metadata is stored alongside the active profile."
];

export default function OnboardingPage() {
  return (
    <SiteShell
      eyebrow="Canonical intake"
      title="Create the profile that powers your entire Aethos workspace."
      description="Your intake is calculated, saved locally first, optionally mirrored to your authenticated cloud account, and then used by the dashboard and profile experience."
    >
      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <IntakeStepper />
        <aside className="grid h-fit gap-5">
          <div className="aethos-panel rounded-md p-5">
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[var(--teal)]" aria-hidden="true" /><h2 className="text-lg font-semibold">Data integrity boundary</h2></div>
            <div className="mt-5 grid gap-3">
              {readiness.map((item) => <div key={item} className="flex items-start gap-3 rounded-md border border-[var(--line)] p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" aria-hidden="true" /><p className="text-sm leading-6 text-[var(--ink-soft)]">{item}</p></div>)}
            </div>
          </div>
          <ResponsibleUseNote compact />
        </aside>
      </section>
    </SiteShell>
  );
}

import { ShieldAlert } from "lucide-react";

export function ResponsibleUseBoundary() {
  return (
    <section className="rounded-md border border-[rgba(217,180,95,0.34)] bg-[rgba(217,180,95,0.08)] p-4">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ochre)]" aria-hidden="true" />
        <p className="text-sm leading-6 text-[var(--ink-soft)]">
          Aethos supports reflection, planning, and self-knowledge. It does not provide medical, legal,
          financial, psychiatric, emergency, or guaranteed predictive advice. Timing windows are interpretive
          context markers, not commands or guarantees.
        </p>
      </div>
    </section>
  );
}

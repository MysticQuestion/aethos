import { BookOpenCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";

const steps = [
  "Normalize intake into one canonical object.",
  "Run deterministic calculations only where required inputs exist.",
  "Map symbolic outputs to an Ontological Dictionary entry.",
  "Convert fragments into weighted semantic vectors.",
  "Calculate Net Alignment and Contradiction Index.",
  "Generate insight cards from structured vectors, not freeform invention.",
  "Expose Engine View and interpretation limits for every insight."
];

export default function MethodologyPage() {
  return (
    <SiteShell
      eyebrow="Methodology"
      title="Aethos uses progressive disclosure: readable insight first, practitioner proof underneath."
      description="The product is designed to be non-fatalistic, confidence-aware, and auditable across user, practitioner, and developer layers."
    >
      <section className="aethos-panel rounded-md p-5">
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <div key={step} className="grid gap-3 rounded-md border border-[var(--line)] p-4 sm:grid-cols-[48px_1fr]">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgba(15,118,110,0.12)] text-sm font-semibold text-[var(--teal)]">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{step}</p>
                <p className="mt-1 text-sm leading-5 text-[var(--ink-soft)]">
                  <BookOpenCheck className="mr-2 inline h-4 w-4" aria-hidden="true" />
                  Stored with calculation metadata, confidence labels, and interpretation limits.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

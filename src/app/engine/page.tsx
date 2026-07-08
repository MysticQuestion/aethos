import { Database } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { buildDemoKernel } from "@/lib/aethos/demo";

export default function EnginePage() {
  const kernel = buildDemoKernel();

  return (
    <SiteShell
      eyebrow="Practitioner-grade proof"
      title="Engine View exposes vectors, weights, confidence, and raw symbolic keys."
      description="Every insight is traceable back to deterministic calculations and dictionary entries. Contradictions remain visible instead of being averaged into vague neutrality."
    >
      <section className="grid gap-5">
        {kernel.reconciliations.map((run) => (
          <article key={`${run.theme}-${run.axis}`} className="aethos-panel rounded-md p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgba(98,82,163,0.12)] text-[var(--violet)]">
                  <Database className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{run.theme.replace("_", " ")}</h2>
                  <p className="text-sm text-[var(--ink-soft)]">{run.axis.replace("_", " ")}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={run.classification}>{run.classification}</StatusBadge>
                <StatusBadge>net {run.netAlignment}</StatusBadge>
                <StatusBadge>variance {run.contradictionIndex}</StatusBadge>
              </div>
            </div>
            <pre className="mt-5 overflow-auto rounded-md bg-[#191714] p-4 text-xs leading-5 text-[#f7f5ef]">
              {JSON.stringify(run, null, 2)}
            </pre>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}

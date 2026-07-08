import { ChevronDown, Code2, Layers3 } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { InsightCardModel } from "@/lib/aethos/types";

export function InsightCard({ insight }: { insight: InsightCardModel }) {
  return (
    <article className="aethos-panel rounded-md p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgba(15,118,110,0.12)] text-[var(--teal)]">
            <Layers3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{insight.title}</h2>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">{insight.axis.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={insight.classification}>{insight.classification}</StatusBadge>
          <StatusBadge>{insight.confidenceLabel} confidence</StatusBadge>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-[var(--foreground)]">{insight.body}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {insight.sources.map((source) => (
          <StatusBadge key={source}>{source}</StatusBadge>
        ))}
      </div>

      <details className="mt-5 rounded-md border border-[var(--line)] bg-[rgba(237,232,220,0.28)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Code2 className="h-4 w-4" aria-hidden="true" />
            Engine View
          </span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </summary>
        <div className="border-t border-[var(--line)] p-4">
          <pre className="max-h-96 overflow-auto rounded-md bg-[#191714] p-4 text-xs leading-5 text-[#f7f5ef]">
            {JSON.stringify(insight.engineDrawer, null, 2)}
          </pre>
        </div>
      </details>
    </article>
  );
}

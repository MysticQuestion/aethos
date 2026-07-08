import { Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { TimingWindow } from "@/lib/aethos/types";

export function TimingWindowCard({ window }: { window: TimingWindow }) {
  return (
    <article className="aethos-panel rounded-md p-5">
      <div className="flex items-start justify-between gap-3">
        <Clock3 className="h-5 w-5 text-[var(--violet)]" aria-hidden="true" />
        <StatusBadge>{window.confidence} confidence</StatusBadge>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{window.title}</h3>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">{window.timeframe}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{window.summary}</p>
      <p className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-3 text-sm leading-6">
        {window.reflectionPrompt}
      </p>
    </article>
  );
}

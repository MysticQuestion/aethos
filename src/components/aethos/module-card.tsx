import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

export function ModuleCard({
  title,
  detail,
  status,
  icon: Icon
}: {
  title: string;
  detail: string;
  status: string;
  icon: LucideIcon;
}) {
  return (
    <article className="aethos-panel rounded-md p-5">
      <Icon className="h-6 w-6 text-[var(--teal)]" aria-hidden="true" />
      <div className="mt-5 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <StatusBadge>{status}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{detail}</p>
    </article>
  );
}

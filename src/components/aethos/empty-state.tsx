import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  detail
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-[var(--line)] p-6 text-center">
      <Icon className="mx-auto h-7 w-7 text-[var(--ink-soft)]" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-soft)]">{detail}</p>
    </div>
  );
}

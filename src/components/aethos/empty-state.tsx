import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  detail,
  action
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-[var(--line)] p-6 text-center">
      <Icon className="mx-auto h-7 w-7 text-[var(--ink-soft)]" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-soft)]">{detail}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

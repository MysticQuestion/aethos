import { ShieldCheck } from "lucide-react";
import { RESPONSIBLE_USE_NOTE } from "@/lib/aethos/constants";

export function ResponsibleUseNote({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-md border border-[rgba(217,180,95,0.32)] bg-[rgba(217,180,95,0.09)] p-4">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ochre)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Responsible-use note</p>
          <p className={compact ? "mt-1 text-xs leading-5 text-[var(--ink-soft)]" : "mt-2 text-sm leading-6 text-[var(--ink-soft)]"}>
            {RESPONSIBLE_USE_NOTE}
          </p>
        </div>
      </div>
    </section>
  );
}

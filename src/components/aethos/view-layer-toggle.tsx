"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Braces, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const views = [
  { href: "/dashboard", label: "Insight View", icon: Sparkles },
  { href: "/engine", label: "Engine View", icon: Braces }
] as const;

export function ViewLayerToggle() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Aethos view layer"
      className="inline-flex rounded-md border border-[var(--line)] bg-[rgba(9,10,18,0.35)] p-1"
    >
      {views.map((view) => {
        const Icon = view.icon;
        const active = pathname === view.href;

        return (
          <Link
            key={view.href}
            href={view.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded px-3 text-xs font-semibold transition",
              active
                ? "bg-[var(--ochre)] text-[#090a12]"
                : "text-[var(--ink-soft)] hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {view.label}
          </Link>
        );
      })}
    </nav>
  );
}

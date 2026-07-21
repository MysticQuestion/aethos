import Link from "next/link";
import {
  BookOpenCheck,
  Compass,
  Database,
  FileText,
  Fingerprint,
  Gauge,
  Globe2,
  Home,
  Menu,
  NotebookPen,
  Orbit,
  ShieldAlert,
  Settings2,
  UserRound
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/onboarding", label: "Intake", icon: Fingerprint },
  { href: "/profile", label: "Profile", icon: Orbit },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/decision-lens", label: "Decision", icon: Compass },
  { href: "/astrocartography", label: "Map lines", icon: Globe2 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/timing-lab", label: "Timing Lab", icon: Database },
  { href: "/engine", label: "Engine", icon: Database },
  { href: "/methodology", label: "Method", icon: BookOpenCheck },
  { href: "/account", label: "Account", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings2 },
  { href: "/privacy", label: "Privacy", icon: ShieldAlert }
];

export function SiteShell({
  children,
  eyebrow,
  title,
  description,
  actions
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[var(--line)] bg-[rgba(9,10,18,0.82)] px-4 py-5 backdrop-blur-xl lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--ochre)] text-sm font-semibold text-[#090a12]">
            Ae
          </span>
          <span>
            <span className="block text-sm font-semibold">Aethos</span>
            <span className="block text-xs text-[var(--ink-soft)]">Identity Intelligence</span>
          </span>
        </Link>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-md border border-[var(--line)] bg-[rgba(27,30,49,0.7)] p-3 text-xs leading-5 text-[var(--ink-soft)]">
          Interpretation, not fatalism. Every insight remains inspectable.
        </div>
      </aside>

      <main className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--line)] bg-[rgba(9,10,18,0.82)] px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ochre)] text-[#090a12]">Ae</span>
            Aethos
          </Link>
          <details className="relative">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-[var(--line)]">
              <Menu className="h-4 w-4" aria-hidden="true" />
            </summary>
            <div className="absolute right-0 mt-2 grid w-56 gap-1 rounded-md border border-[var(--line)] bg-[var(--panel)] p-2 shadow-xl">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-[var(--ink-soft)]">
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="grid gap-5 border-b border-[var(--line)] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              {eyebrow ? (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">{eyebrow}</p>
              ) : null}
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)] sm:text-base">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}

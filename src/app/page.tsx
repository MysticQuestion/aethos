import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, FileText, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";
import { ModuleCard } from "@/components/aethos/module-card";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";

export default function LandingPage() {
  return (
    <SiteShell
      eyebrow="Mystic Sage flagship platform"
      title="Aethos turns symbolic systems, reflective writing, and timing cycles into a structured self-knowledge workspace."
      description="A serious identity-intelligence and timing-intelligence application for pattern mapping, journal-grounded reflection, decision support, and practitioner-ready reports."
      actions={
        <>
          <Link href="/onboarding" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]">
            Begin Intake
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/dashboard" className="inline-flex min-h-10 items-center rounded-md border border-[var(--line)] px-4 text-sm font-semibold">
            View Dashboard
          </Link>
        </>
      }
    >
      <section className="grid min-h-[58vh] gap-6 lg:grid-cols-[1fr_460px] lg:items-center">
        <div className="grid gap-5">
          <div className="aethos-panel rounded-md p-6">
            <p className="text-sm font-semibold text-[var(--ochre)]">What Aethos does</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                "Maps symbolic profile data into clear pattern language.",
                "Tracks journal themes so insight is grounded in lived experience.",
                "Frames timing windows as context markers for reflection.",
                "Generates structured reports with confidence notes and limits."
              ].map((item) => (
                <div key={item} className="rounded-md border border-[var(--line)] p-4 text-sm leading-6 text-[var(--ink-soft)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <ResponsibleUseNote />
        </div>
        <div className="aethos-panel rounded-md p-5">
          <p className="text-sm font-semibold">Product state preview</p>
          <div className="mt-5 grid gap-3">
            {[
              ["Aethos Core", "Identity summary and core pattern map", "High"],
              ["Current Timing", "Context markers for the next reflective window", "Medium"],
              ["Journal Signals", "Themes from local written entries", "Building"],
              ["Reports", "Markdown/HTML-ready structured output", "Ready"]
            ].map(([title, detail, confidence]) => (
              <div key={title} className="rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{title}</span>
                  <span className="text-xs uppercase tracking-[0.14em] text-[var(--ochre)]">{confidence}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard icon={Sparkles} title="Aethos Core" status="V1" detail="Symbolic profile synthesis with visible confidence and source boundaries." />
        <ModuleCard icon={BarChart3} title="Timing Intelligence" status="V1" detail="Timing windows presented as context for reflection, never guaranteed prediction." />
        <ModuleCard icon={NotebookPen} title="Journal Memory" status="V1" detail="Local reflective writing, mood tags, theme tags, and pattern extraction placeholders." />
        <ModuleCard icon={FileText} title="Reports" status="V1" detail="Structured core, timing, decision, journal, and practitioner report previews." />
      </section>

      <section className="aethos-panel rounded-md p-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <ShieldCheck className="h-6 w-6 text-[var(--teal)]" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Responsible by design</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Aethos avoids deterministic fate language and labels unfinished systems as research preview or deferred.</p>
          </div>
          <div>
            <BookOpenCheck className="h-6 w-6 text-[var(--violet)]" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Inspectable method</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Every insight can be expanded into source systems, vectors, confidence, and interpretation limits.</p>
          </div>
          <div>
            <NotebookPen className="h-6 w-6 text-[var(--ochre)]" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Grounded in reflection</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Journaling gives Aethos a record of lived experience so interpretation does not depend on symbolism alone.</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

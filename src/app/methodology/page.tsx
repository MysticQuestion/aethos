import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { ShowTheMath } from "@/components/aethos/show-the-math";
import { SiteShell } from "@/components/site-shell";
import { buildDemoKernel } from "@/lib/aethos/demo";

const steps = [
  "Intake — birth data, name, intention, consent, systems enabled.",
  "Normalization — UTC, IANA timezone, geocode, birth-time confidence (never invent noon for time-sensitive claims).",
  "Calculation — deterministic engines only (Swiss / formula / cast procedure).",
  "System output — structured JSON: degrees, numbers, pillars, hexagrams, keys.",
  "Interpretation — Ontological Dictionary fragments per tradition.",
  "Reconciliation — Net Alignment + Contradiction Index; never false neutrality.",
  "Synthesis — practical, non-fatalistic guidance with source badges.",
  "Memory — versions, journal, reports, decision-cast archives."
];

const methodologyMath = {
  firstPrinciple: "Never confuse calculation with interpretation.",
  pipeline: steps,
  docs: [
    "docs/SYSTEMS_CODEX.md",
    "docs/COMPETITOR_MAP.md",
    "docs/SINGLE_INPUT_SCHEMA.md"
  ],
  demoKernelKeys: ["numerology", "western", "multiSystem", "reconciliations"]
};

export default function MethodologyPage() {
  const kernel = buildDemoKernel();

  return (
    <SiteShell
      eyebrow="Methodology · Systems Codex"
      title="Readable insight first. Practitioner proof underneath. Deterministic math always."
      description="Aethos is symbolic infrastructure: one input, multi-system calculation, transparent methodology, cross-system reconciliation, journal memory, and Decision Lens — not another black-box horoscope app."
    >
      <section className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Universal pipeline</h2>
        <div className="mt-4 grid gap-4">
          {steps.map((step, index) => (
            <div key={step} className="grid gap-3 rounded-md border border-[var(--line)] p-4 sm:grid-cols-[48px_1fr]">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgba(15,118,110,0.12)] text-sm font-semibold text-[var(--teal)]">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{step}</p>
                <p className="mt-1 text-sm leading-5 text-[var(--ink-soft)]">
                  <BookOpenCheck className="mr-2 inline h-4 w-4" aria-hidden="true" />
                  Stored with calculation metadata, confidence labels, and interpretation limits.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Transparent methodology</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Interpretation apps (Co–Star, The Pattern) hide the math. Calculation engines (Astro.com, Astro-Seek) overwhelm.
            Aethos bridges them: psychological clarity with a permanent <strong className="text-[var(--foreground)]">Show the Math</strong> path.
          </p>
          <div className="mt-4">
            <ShowTheMath
              title="Show the Math — demo reconciliation sample"
              description="Sample vectors and classification from the local demo kernel."
              data={{
                reconciliations: kernel.reconciliations.slice(0, 2),
                multiSystem: kernel.multiSystem.map((layer) => ({
                  systemKey: layer.systemKey,
                  status: layer.status,
                  withheld: layer.withheld
                }))
              }}
            />
          </div>
        </div>
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Codex documents</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--ink-soft)]">
            <li>
              <code className="text-[var(--ochre)]">docs/SYSTEMS_CODEX.md</code> — operating model
            </li>
            <li>
              <code className="text-[var(--ochre)]">docs/COMPETITOR_MAP.md</code> — 30-tool market map
            </li>
            <li>
              <code className="text-[var(--ochre)]">docs/SINGLE_INPUT_SCHEMA.md</code> — one intake schema
            </li>
            <li>
              <Link href="/decision-lens" className="font-semibold text-[var(--ochre)] hover:underline">
                /decision-lens
              </Link>{" "}
              — I Ching Decision Lens
            </li>
            <li>
              <Link href="/engine" className="font-semibold text-[var(--ochre)] hover:underline">
                /engine
              </Link>{" "}
              — full reconciliation view
            </li>
          </ul>
          <div className="mt-4">
            <ShowTheMath title="Show the Math — methodology metadata" data={methodologyMath} />
          </div>
        </div>
      </section>

      <ResponsibleUseBoundary />
    </SiteShell>
  );
}

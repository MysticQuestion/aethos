import { Database, FlaskConical, Gauge, Table2 } from "lucide-react";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { demoIntake } from "@/lib/aethos/demo";
import { createNatalChart } from "@/lib/aethos/astrology/natal";
import { generateTransitEvents } from "@/lib/aethos/astrology/transits";
import { aggregateThemeScores, generateTimingWindows } from "@/lib/aethos/astrology/timing-windows";
import type { NatalChartInput } from "@/lib/aethos/astrology/types";

export default async function TimingLabPage() {
  const labReferenceDate = new Date("2026-07-08T12:00:00.000Z");
  const input: NatalChartInput = {
    birthDate: demoIntake.birthDate,
    birthTimeKnown: false,
    birthLocationLabel: demoIntake.birthPlace ? `${demoIntake.birthPlace.city}, ${demoIntake.birthPlace.country}` : "Demo location",
    houseSystem: "whole_sign",
    zodiacMode: "tropical",
    calculationMode: "demo"
  };
  const natalChart = await createNatalChart(input);
  const { transitEvents } = await generateTransitEvents(natalChart, {
    startDate: new Date(labReferenceDate.getTime() - 7 * 86400000).toISOString(),
    endDate: new Date(labReferenceDate.getTime() + 60 * 86400000).toISOString()
  });
  const windows = generateTimingWindows(transitEvents);
  const themeScores = aggregateThemeScores(transitEvents);

  return (
    <SiteShell
      eyebrow="Timing Lab"
      title="A symbolic analytics cockpit for event windows, source events, calibration, and lab-mode data."
      description="Aethos generates timing windows from deterministic provider events. In this local build, outputs are demo samples, not Swiss Ephemeris calculations."
    >
      <ResponsibleUseBoundary />
      <section className="grid gap-5 lg:grid-cols-3">
        <article className="aethos-panel rounded-md p-5">
          <FlaskConical className="h-6 w-6 text-[var(--teal)]" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Timing Intelligence Overview</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            This lab produces event windows, not absolute predictions. Each window has start, peak, end,
            source events, intensity, confidence, rationale, and raw metadata.
          </p>
        </article>
        <article className="aethos-panel rounded-md p-5">
          <Gauge className="h-6 w-6 text-[var(--ochre)]" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Personal Calibration</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Learning mode is active until at least seven EMA check-ins exist. Journal correlation remains conservative.
          </p>
        </article>
        <article className="aethos-panel rounded-md p-5">
          <Database className="h-6 w-6 text-[var(--violet)]" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Lab Mode Transparency</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Provider: {natalChart.metadata.providerId}. Mode: {natalChart.metadata.calculationMode}. Swiss Ephemeris is not active.
          </p>
        </article>
      </section>

      <section className="grid gap-5">
        {windows.map((window) => (
          <article key={window.id} className="aethos-panel rounded-md p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{window.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{window.interpretiveSummary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge>{Math.round(window.intensityScore * 100)} intensity</StatusBadge>
                <StatusBadge>{Math.round(window.confidenceScore * 100)} confidence</StatusBadge>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-[var(--line)] p-3 text-sm">Start: {new Date(window.startDate).toLocaleDateString("en-US")}</div>
              <div className="rounded-md border border-[var(--line)] p-3 text-sm">Peak: {new Date(window.peakDate).toLocaleDateString("en-US")}</div>
              <div className="rounded-md border border-[var(--line)] p-3 text-sm">End: {new Date(window.endDate).toLocaleDateString("en-US")}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="aethos-panel rounded-md p-5">
        <div className="flex items-center gap-3">
          <Table2 className="h-5 w-5 text-[var(--teal)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Event Source Table</h2>
        </div>
        <div className="mt-5 overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              <tr>
                <th className="border-b border-[var(--line)] py-3 pr-4">Transit event</th>
                <th className="border-b border-[var(--line)] py-3 pr-4">Natal target</th>
                <th className="border-b border-[var(--line)] py-3 pr-4">Aspect</th>
                <th className="border-b border-[var(--line)] py-3 pr-4">Orb</th>
                <th className="border-b border-[var(--line)] py-3 pr-4">Exact date</th>
                <th className="border-b border-[var(--line)] py-3 pr-4">Theme contribution</th>
              </tr>
            </thead>
            <tbody>
              {transitEvents.map((event) => (
                <tr key={event.id}>
                  <td className="border-b border-[var(--line)] py-3 pr-4">{event.transitBody}</td>
                  <td className="border-b border-[var(--line)] py-3 pr-4">{event.natalTarget}</td>
                  <td className="border-b border-[var(--line)] py-3 pr-4">{event.aspectType}</td>
                  <td className="border-b border-[var(--line)] py-3 pr-4">{event.orb}</td>
                  <td className="border-b border-[var(--line)] py-3 pr-4">{new Date(event.exactAt).toLocaleDateString("en-US")}</td>
                  <td className="border-b border-[var(--line)] py-3 pr-4">
                    {Object.entries(event.themeContributions)
                      .map(([theme, score]) => `${theme}: ${score}`)
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Theme scores</h2>
          <div className="mt-4 grid gap-2">
            {themeScores.map((item) => (
              <div key={item.theme} className="flex items-center justify-between rounded-md border border-[var(--line)] p-3 text-sm">
                <span>{item.theme}</span>
                <span>{item.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Raw structured data</h2>
          <pre className="mt-4 max-h-[520px] overflow-auto rounded-md bg-[#05060b] p-4 text-xs leading-5">
            {JSON.stringify({ natalChart, transitEvents, windows }, null, 2)}
          </pre>
        </div>
      </section>
    </SiteShell>
  );
}

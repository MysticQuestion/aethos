"use client";

import { useMemo, useState } from "react";
import { Download, Globe2, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ShowTheMath } from "@/components/aethos/show-the-math";
import { AstrocartographyMap } from "@/components/aethos/astrocartography-map";
import { RelocationCompare } from "@/components/aethos/relocation-compare";
import type { AstrocartographyResult, AcgLineType } from "@/lib/aethos/astrology/astrocartography";
import type { NatalChart } from "@/lib/aethos/astrology/types";
import { escapeHtml, exportAstrocartographyAsPdf } from "@/lib/aethos/pdf/print-export";

const LINE_TYPES: AcgLineType[] = ["ASC", "DSC", "MC", "IC"];

type RelocationResponse = {
  natal: {
    place: { label?: string; latitude: number; longitude: number; timezone: string };
    chart: NatalChart;
    warnings: string[];
    providerRoute: string;
  };
  relocation: {
    place: { label?: string; latitude: number; longitude: number; timezone: string };
    chart: NatalChart;
    warnings: string[];
    providerRoute: string;
  };
  comparison: { note: string };
};

export function AstrocartographyWorkspace() {
  const [birthDate, setBirthDate] = useState("1992-04-18");
  const [birthTime, setBirthTime] = useState("14:30");
  const [birthTimeKnown, setBirthTimeKnown] = useState(true);
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [latitude, setLatitude] = useState("34.0522");
  const [longitude, setLongitude] = useState("-118.2437");
  const [relocLat, setRelocLat] = useState("40.7128");
  const [relocLon, setRelocLon] = useState("-74.0060");
  const [relocTz, setRelocTz] = useState("America/New_York");
  const [step, setStep] = useState("2");
  const [result, setResult] = useState<AstrocartographyResult | null>(null);
  const [relocation, setRelocation] = useState<RelocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<AcgLineType | "all">("all");

  const filteredLines = useMemo(() => {
    if (!result) return [];
    if (filter === "all") return result.lines;
    return result.lines.filter((line) => line.lineType === filter);
  }, [result, filter]);

  async function runLines() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/aethos/astrocartography", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime: birthTimeKnown ? birthTime : undefined,
          birthTimeKnown,
          timezone,
          latitude: Number(latitude),
          longitude: Number(longitude),
          houseSystem: "placidus",
          longitudeStepDegrees: Number(step),
          lineTypes: LINE_TYPES,
          requestedBodies: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"]
        })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Lines request failed (${response.status})`);
      }
      setResult((await response.json()) as AstrocartographyResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Astrocartography failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runRelocation() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/aethos/relocation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime: birthTimeKnown ? birthTime : undefined,
          birthTimeKnown,
          houseSystem: "placidus",
          zodiacMode: "tropical",
          natal: {
            label: "Birth place",
            latitude: Number(latitude),
            longitude: Number(longitude),
            timezone
          },
          relocation: {
            label: "Relocation",
            latitude: Number(relocLat),
            longitude: Number(relocLon),
            timezone: relocTz
          }
        })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Relocation request failed (${response.status})`);
      }
      setRelocation((await response.json()) as RelocationResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Relocation compare failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runAll() {
    await runLines();
    await runRelocation();
  }

  function exportPdf() {
    if (!result) return;
    const rows = filteredLines
      .map(
        (line) =>
          `<tr>
            <td>${escapeHtml(line.body)}</td>
            <td>${escapeHtml(line.lineType)}</td>
            <td>${line.geographicLongitude.toFixed(2)}°</td>
            <td>${line.sampleLatitude.toFixed(2)}°</td>
            <td>${line.residualOrbDegrees.toFixed(3)}°</td>
            <td>${escapeHtml(line.methodKey)}</td>
          </tr>`
      )
      .join("");
    const table = `
      <table>
        <thead><tr><th>Body</th><th>Line</th><th>Geo lon</th><th>Lat</th><th>Residual</th><th>Method</th></tr></thead>
        <tbody>${rows || "<tr><td colspan='6'>No lines</td></tr>"}</tbody>
      </table>
      <p style="margin-top:12px">${escapeHtml(result.responsibleUseNote)}</p>`;

    exportAstrocartographyAsPdf({
      title: "Aethos Astrocartography",
      subtitle: `Birth ${birthDate} ${birthTimeKnown ? birthTime : "(time unknown)"} · ${timezone}`,
      linesHtml: table,
      mapNote:
        "Interactive/SVG map is available in the app. Printed PDF includes the line table and method metadata. World map tiles and parans are future layers.",
      mathJson: JSON.stringify(
        {
          providerRoute: result.providerRoute,
          calculationMetadata: result.calculationMetadata,
          withheld: result.withheld,
          warnings: result.warnings,
          relocation: relocation
            ? {
                natal: relocation.natal.place,
                relocation: relocation.relocation.place,
                note: relocation.comparison.note
              }
            : null
        },
        null,
        2
      )
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="aethos-panel h-fit rounded-md p-5">
        <div className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-[var(--ochre)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Birth + locations</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Lines require known birth time. Relocation compare re-casts houses/angles at a second place for the same
          instant.
        </p>

        <div className="mt-5 grid gap-3 text-sm">
          <label className="grid gap-1">
            <span className="text-[var(--ink-soft)]">Birth date</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={birthTimeKnown} onChange={(e) => setBirthTimeKnown(e.target.checked)} />
            <span>Birth time known</span>
          </label>
          <label className="grid gap-1">
            <span className="text-[var(--ink-soft)]">Birth time</span>
            <input
              type="time"
              value={birthTime}
              disabled={!birthTimeKnown}
              onChange={(e) => setBirthTime(e.target.value)}
              className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 disabled:opacity-40"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[var(--ink-soft)]">Birth timezone (IANA)</span>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-[var(--ink-soft)]">Birth lat</span>
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[var(--ink-soft)]">Birth lon</span>
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
              />
            </label>
          </div>

          <div className="mt-2 rounded-md border border-[var(--line)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Relocation place</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-[var(--ink-soft)]">Reloc lat</span>
                <input
                  value={relocLat}
                  onChange={(e) => setRelocLat(e.target.value)}
                  className="min-h-10 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[var(--ink-soft)]">Reloc lon</span>
                <input
                  value={relocLon}
                  onChange={(e) => setRelocLon(e.target.value)}
                  className="min-h-10 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
                />
              </label>
            </div>
            <label className="mt-3 grid gap-1">
              <span className="text-[var(--ink-soft)]">Reloc timezone</span>
              <input
                value={relocTz}
                onChange={(e) => setRelocTz(e.target.value)}
                className="min-h-10 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
              />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-[var(--ink-soft)]">Longitude sample step (°)</span>
            <input
              value={step}
              onChange={(e) => setStep(e.target.value)}
              className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={runAll}
            className="min-h-11 w-full rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12] disabled:opacity-50"
          >
            {busy ? "Computing…" : "Compute lines + relocation"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={runLines}
              className="min-h-10 rounded-md border border-[var(--line)] px-3 text-xs font-semibold disabled:opacity-50"
            >
              Lines only
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={runRelocation}
              className="min-h-10 rounded-md border border-[var(--line)] px-3 text-xs font-semibold disabled:opacity-50"
            >
              Relocation only
            </button>
          </div>
          <button
            type="button"
            disabled={!result}
            onClick={exportPdf}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-semibold disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export PDF (print)
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--wine)]">{error}</p> : null}
      </section>

      <section className="grid gap-5">
        {result ? (
          <div className="aethos-panel rounded-md p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Map view</h2>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={result.providerRoute === "calculation_service" ? "agreement" : "tension"}>
                  {result.providerRoute}
                </StatusBadge>
                <StatusBadge tone="tension">{String(result.calculationMetadata.calculationMode ?? "unknown")}</StatusBadge>
              </div>
            </div>
            <AstrocartographyMap
              lines={result.lines}
              birthLatitude={Number(latitude)}
              birthLongitude={Number(longitude)}
              relocLatitude={Number(relocLat)}
              relocLongitude={Number(relocLon)}
              filter={filter}
            />
          </div>
        ) : null}

        <div className="aethos-panel rounded-md p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Planetary lines</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                ASC / DSC / MC / IC geographic longitudes with residual orbs.
              </p>
            </div>
          </div>

          {result ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${filter === "all" ? "border-[var(--ochre)]" : "border-[var(--line)]"}`}
                >
                  All
                </button>
                {LINE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilter(type)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${filter === type ? "border-[var(--ochre)]" : "border-[var(--line)]"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {result.withheld.length ? (
                <p className="mt-4 text-sm text-[var(--ink-soft)]">Withheld: {result.withheld.join("; ")}</p>
              ) : null}

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                    <tr className="border-b border-[var(--line)]">
                      <th className="py-2 pr-3 font-medium">Body</th>
                      <th className="py-2 pr-3 font-medium">Line</th>
                      <th className="py-2 pr-3 font-medium">Geo lon</th>
                      <th className="py-2 pr-3 font-medium">Sample lat</th>
                      <th className="py-2 pr-3 font-medium">Residual</th>
                      <th className="py-2 font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLines.map((line) => (
                      <tr key={line.lineId} className="border-b border-[var(--line)]/60">
                        <td className="py-2.5 pr-3 font-semibold capitalize">{line.body}</td>
                        <td className="py-2.5 pr-3">{line.lineType}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs">{line.geographicLongitude.toFixed(2)}°</td>
                        <td className="py-2.5 pr-3 font-mono text-xs">{line.sampleLatitude.toFixed(2)}°</td>
                        <td className="py-2.5 pr-3 font-mono text-xs">{line.residualOrbDegrees.toFixed(3)}°</td>
                        <td className="py-2.5 text-xs text-[var(--ink-soft)]">{line.methodKey}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredLines.length ? (
                  <p className="mt-4 text-sm text-[var(--ink-soft)]">No lines for this filter / input.</p>
                ) : null}
              </div>

              <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">{result.responsibleUseNote}</p>
              <div className="mt-5">
                <ShowTheMath title="Show the Math — ACG payload" data={result} />
              </div>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3 py-10 text-center text-sm text-[var(--ink-soft)]">
              <MapPin className="h-8 w-8 text-[var(--ochre)]" aria-hidden="true" />
              <p>Compute lines to populate the map and table.</p>
            </div>
          )}
        </div>

        <div className="aethos-panel rounded-md p-5">
          <h2 className="text-lg font-semibold">Natal vs relocation</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            Side-by-side houses and body samples for birth place vs relocated coordinates (same birth instant).
          </p>
          <div className="mt-5">
            {relocation ? (
              <RelocationCompare
                natal={relocation.natal}
                relocation={relocation.relocation}
                note={relocation.comparison.note}
              />
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">Run relocation compare to load both charts.</p>
            )}
          </div>
          {relocation ? (
            <div className="mt-5">
              <ShowTheMath title="Show the Math — relocation pair" data={relocation} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Globe2, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ShowTheMath } from "@/components/aethos/show-the-math";
import type { AstrocartographyResult, AcgLineType } from "@/lib/aethos/astrology/astrocartography";

const LINE_TYPES: AcgLineType[] = ["ASC", "DSC", "MC", "IC"];

export function AstrocartographyWorkspace() {
  const [birthDate, setBirthDate] = useState("1992-04-18");
  const [birthTime, setBirthTime] = useState("14:30");
  const [birthTimeKnown, setBirthTimeKnown] = useState(true);
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [latitude, setLatitude] = useState("34.0522");
  const [longitude, setLongitude] = useState("-118.2437");
  const [step, setStep] = useState("2");
  const [result, setResult] = useState<AstrocartographyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<AcgLineType | "all">("all");

  const filteredLines = useMemo(() => {
    if (!result) return [];
    if (filter === "all") return result.lines;
    return result.lines.filter((line) => line.lineType === filter);
  }, [result, filter]);

  async function run() {
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
        throw new Error(body?.message ?? `Request failed (${response.status})`);
      }
      setResult((await response.json()) as AstrocartographyResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Astrocartography failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="aethos-panel h-fit rounded-md p-5">
        <div className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-[var(--ochre)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Birth + location input</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Same single-input birth object as the rest of Aethos. Lines require known birth time.
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
            <span className="text-[var(--ink-soft)]">IANA timezone</span>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-[var(--ink-soft)]">Latitude</span>
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[var(--ink-soft)]">Longitude</span>
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
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

        <button
          type="button"
          disabled={busy}
          onClick={run}
          className="mt-5 min-h-11 w-full rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12] disabled:opacity-50"
        >
          {busy ? "Computing lines…" : "Compute planetary lines"}
        </button>
        {error ? <p className="mt-3 text-sm text-[var(--wine)]">{error}</p> : null}
      </section>

      <section className="grid gap-5">
        <div className="aethos-panel rounded-md p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Planetary lines</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                ASC / DSC / MC / IC geographic longitudes — scaffold method, residual orb shown for every line.
              </p>
            </div>
            {result ? (
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={result.providerRoute === "calculation_service" ? "agreement" : "tension"}>
                  {result.providerRoute}
                </StatusBadge>
                <StatusBadge tone="tension">
                  {String(result.calculationMetadata.calculationMode ?? "unknown")}
                </StatusBadge>
              </div>
            ) : null}
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
              {result.warnings.length ? (
                <ul className="mt-3 grid gap-1 text-xs text-[var(--ink-soft)]">
                  {result.warnings.map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-5">
                <ShowTheMath title="Show the Math — ACG payload" data={result} />
              </div>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3 py-10 text-center text-sm text-[var(--ink-soft)]">
              <MapPin className="h-8 w-8 text-[var(--ochre)]" aria-hidden="true" />
              <p>Run a computation to list planetary lines. Interactive world map is a later layer.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

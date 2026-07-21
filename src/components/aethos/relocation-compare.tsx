"use client";

import { StatusBadge } from "@/components/status-badge";
import type { NatalChart } from "@/lib/aethos/astrology/types";

type Side = {
  place: { label?: string; latitude: number; longitude: number; timezone: string };
  chart: NatalChart;
  warnings: string[];
  providerRoute: string;
};

function ChartCard({ title, side }: { title: string; side: Side }) {
  const angles = side.chart.positions.slice(0, 3);
  return (
    <div className="rounded-md border border-[var(--line)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <StatusBadge tone="tension">{side.providerRoute}</StatusBadge>
      </div>
      <p className="mt-2 text-xs text-[var(--ink-soft)]">
        {side.place.label ?? "Location"} · {side.place.latitude.toFixed(2)}°, {side.place.longitude.toFixed(2)}° ·{" "}
        {side.place.timezone}
      </p>
      <div className="mt-4 grid gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">Bodies (sample)</p>
        {angles.map((pos) => (
          <div key={pos.body} className="flex justify-between gap-3 text-sm">
            <span className="capitalize text-[var(--ink-soft)]">{pos.body}</span>
            <span className="font-mono text-xs">
              {pos.zodiac.formatted ?? `${pos.longitude.toFixed(2)}°`}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
          Houses ({side.chart.houses.length})
        </p>
        {side.chart.houses.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">Withheld / empty (need birth time + engine).</p>
        ) : (
          side.chart.houses.slice(0, 6).map((house) => (
            <div key={house.house} className="flex justify-between gap-3 text-sm">
              <span className="text-[var(--ink-soft)]">H{house.house}</span>
              <span className="font-mono text-xs">{house.zodiac.formatted ?? `${house.longitude.toFixed(2)}°`}</span>
            </div>
          ))
        )}
        {side.chart.houses.length > 6 ? (
          <p className="text-xs text-[var(--ink-soft)]">+ {side.chart.houses.length - 6} more in engine payload</p>
        ) : null}
      </div>
    </div>
  );
}

export function RelocationCompare({
  natal,
  relocation,
  note
}: {
  natal: Side;
  relocation: Side;
  note?: string;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Natal chart" side={natal} />
        <ChartCard title="Relocation chart" side={relocation} />
      </div>
      {note ? <p className="text-sm leading-6 text-[var(--ink-soft)]">{note}</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { ShowTheMath } from "@/components/aethos/show-the-math";
import type { SystemLayerSnapshot } from "@/lib/aethos/types";

function toneFor(status: SystemLayerSnapshot["status"]) {
  if (status === "v1") return "agreement" as const;
  if (status === "research_preview") return "tension" as const;
  return "paradox" as const;
}

export function SystemLayersPanel({ layers }: { layers: SystemLayerSnapshot[] }) {
  const [active, setActive] = useState(layers[0]?.systemKey ?? "numerology");
  const current = layers.find((layer) => layer.systemKey === active) ?? layers[0];

  if (!current) return null;

  return (
    <section className="aethos-panel rounded-md p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Multi-system layers</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            One profile, many systems — V1 layers are production baselines; research previews and withheld outputs stay
            explicit.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {layers.map((layer) => (
          <button
            key={layer.systemKey}
            type="button"
            onClick={() => setActive(layer.systemKey)}
            className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${
              active === layer.systemKey
                ? "border-[var(--ochre)] bg-[rgba(217,180,95,0.12)]"
                : "border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--foreground)]"
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-[var(--line)] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">{current.label}</h3>
          <StatusBadge tone={toneFor(current.status)}>{current.status.replaceAll("_", " ")}</StatusBadge>
          <StatusBadge tone="tension">{current.confidence} confidence</StatusBadge>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{current.summary}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {current.highlights.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-md border border-[var(--line)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">{item.label}</p>
              <p className="mt-2 text-lg font-semibold">{item.value}</p>
              {item.note ? <p className="mt-2 text-xs text-[var(--ink-soft)]">{item.note}</p> : null}
            </div>
          ))}
        </div>
        {current.withheld.length ? (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Withheld / not claimed</p>
            <ul className="mt-2 grid gap-1 text-sm text-[var(--ink-soft)]">
              {current.withheld.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-5">
          <ShowTheMath title="Show the Math — system layer" data={current} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useMemo } from "react";
import type { AstroCartographyLine, AcgLineType } from "@/lib/aethos/astrology/astrocartography";

const WIDTH = 960;
const HEIGHT = 480;

const BODY_COLORS: Record<string, string> = {
  sun: "#e8c547",
  moon: "#c9d4e8",
  mercury: "#9ad0b0",
  venus: "#e8a0bf",
  mars: "#e07a6a",
  jupiter: "#d4b483",
  saturn: "#a89f91",
  uranus: "#7ec8e3",
  neptune: "#6b8cae",
  pluto: "#9b7bb8"
};

function lonToX(lon: number): number {
  return ((lon + 180) / 360) * WIDTH;
}

function latToY(lat: number): number {
  return ((90 - lat) / 180) * HEIGHT;
}

function dashFor(lineType: AcgLineType): string | undefined {
  if (lineType === "ASC" || lineType === "DSC") return "6 4";
  if (lineType === "IC") return "2 3";
  return undefined; // MC solid
}

/**
 * Equirectangular SVG map scaffold — meridians for ACG lines, birth + relocation pins.
 * Not a tile basemap; good enough for line review and print export.
 */
export function AstrocartographyMap({
  lines,
  birthLatitude,
  birthLongitude,
  relocLatitude,
  relocLongitude,
  filter = "all"
}: {
  lines: AstroCartographyLine[];
  birthLatitude: number;
  birthLongitude: number;
  relocLatitude?: number;
  relocLongitude?: number;
  filter?: AcgLineType | "all";
}) {
  const visible = useMemo(
    () => (filter === "all" ? lines : lines.filter((line) => line.lineType === filter)),
    [lines, filter]
  );

  // Simple continent silhouettes as low-opacity path blobs (schematic, not geodetic).
  const land = useMemo(
    () => [
      // Americas rough
      "M 120 140 C 160 100 220 110 240 160 C 260 220 230 300 190 340 C 150 300 130 220 120 140 Z",
      // Europe/Africa rough
      "M 470 120 C 520 100 560 130 550 180 C 540 240 530 320 500 360 C 470 320 460 220 470 120 Z",
      // Asia rough
      "M 560 110 C 640 90 740 120 780 180 C 800 240 760 280 700 260 C 640 240 600 180 560 110 Z",
      // Australia rough
      "M 760 320 C 820 300 860 340 840 380 C 800 400 760 360 760 320 Z"
    ],
    []
  );

  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-[#0b1020]">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Astrocartography line map"
      >
        <defs>
          <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#121a33" />
            <stop offset="100%" stopColor="#0a0f1c" />
          </linearGradient>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#ocean)" />

        {/* graticule */}
        {Array.from({ length: 13 }, (_, i) => {
          const x = (i / 12) * WIDTH;
          return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={HEIGHT} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const y = (i / 6) * HEIGHT;
          return <line key={`h${i}`} x1={0} y1={y} x2={WIDTH} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
        })}

        {land.map((d, index) => (
          <path key={index} d={d} fill="rgba(90,110,140,0.18)" stroke="rgba(160,180,210,0.15)" strokeWidth={1} />
        ))}

        {/* equator */}
        <line x1={0} y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="rgba(217,180,95,0.25)" strokeWidth={1} strokeDasharray="4 6" />

        {visible.map((line) => {
          const x = lonToX(line.geographicLongitude);
          const color = BODY_COLORS[line.body] ?? "#d9b45f";
          return (
            <g key={line.lineId}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={HEIGHT}
                stroke={color}
                strokeWidth={line.lineType === "MC" ? 2 : 1.5}
                strokeDasharray={dashFor(line.lineType)}
                opacity={0.85}
              />
              <title>
                {line.body} {line.lineType} @ {line.geographicLongitude.toFixed(1)}° (orb {line.residualOrbDegrees.toFixed(2)}°)
              </title>
            </g>
          );
        })}

        {/* birth pin */}
        <g>
          <circle cx={lonToX(birthLongitude)} cy={latToY(birthLatitude)} r={6} fill="#d9b45f" stroke="#090a12" strokeWidth={1.5} />
          <text x={lonToX(birthLongitude) + 10} y={latToY(birthLatitude) + 4} fill="#f7f5ef" fontSize={12}>
            Birth
          </text>
        </g>

        {relocLatitude != null && relocLongitude != null ? (
          <g>
            <circle
              cx={lonToX(relocLongitude)}
              cy={latToY(relocLatitude)}
              r={6}
              fill="#5ec2b7"
              stroke="#090a12"
              strokeWidth={1.5}
            />
            <text x={lonToX(relocLongitude) + 10} y={latToY(relocLatitude) + 4} fill="#f7f5ef" fontSize={12}>
              Reloc
            </text>
          </g>
        ) : null}
      </svg>
      <div className="flex flex-wrap gap-3 border-t border-[var(--line)] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
        <span>Solid = MC</span>
        <span>Dashed = ASC/DSC</span>
        <span>Dotted = IC</span>
        <span>Ochre pin = birth</span>
        <span>Teal pin = relocation</span>
      </div>
    </div>
  );
}

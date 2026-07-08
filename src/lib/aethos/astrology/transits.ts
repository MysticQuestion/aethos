import { calculateAspect } from "./aspects";
import { attachCalculationMetadata } from "./metadata";
import { TRANSIT_BODIES } from "./planets";
import { demoEphemerisProvider } from "./providers/demo-ephemeris-provider";
import type { DateRange, EphemerisProvider, NatalChart, OrbConfig, RetrogradeEvent, TransitEvent } from "./types";

function addDays(date: string, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

export async function generateTransitEvents(
  natalChart: NatalChart,
  dateRange: DateRange,
  provider: EphemerisProvider = demoEphemerisProvider,
  orbConfig?: OrbConfig
): Promise<{ transitEvents: TransitEvent[]; retrogradeEvents: RetrogradeEvent[] }> {
  const peakDate = new Date(dateRange.startDate);
  peakDate.setUTCDate(peakDate.getUTCDate() + 14);
  const date = peakDate.toISOString();
  const transitPositions = await provider.getPlanetPositions({
    ...natalChart.input,
    bodies: TRANSIT_BODIES,
    date
  });

  const events: TransitEvent[] = [];
  const retrogrades: RetrogradeEvent[] = [];

  transitPositions.forEach((transit) => {
    const natalTarget = natalChart.positions.find((position) => position.body === "sun") ?? natalChart.positions[0];
    const aspect = calculateAspect(transit, natalTarget, orbConfig) ?? calculateAspect(transit, natalChart.positions[1], orbConfig);
    const metadata = attachCalculationMetadata({
      providerId: provider.id,
      providerVersion: provider.version,
      calculationMode: "demo",
      sourceInput: { natalChartId: natalChart.id, dateRange, transitBody: transit.body },
      timezone: natalChart.input.timezone,
      coordinates:
        natalChart.input.latitude !== undefined && natalChart.input.longitude !== undefined
          ? { latitude: natalChart.input.latitude, longitude: natalChart.input.longitude }
          : undefined,
      houseSystem: natalChart.input.houseSystem,
      zodiacMode: natalChart.input.zodiacMode,
      ephemerisSource: "deterministic-demo-provider",
      warnings: transit.warnings
    });

    if (aspect) {
      events.push({
        id: `transit-${transit.body}-${aspect.bodyB}-${aspect.type}-${metadata.inputHash.slice(0, 8)}`,
        eventType: "transit_aspect",
        transitBody: transit.body,
        natalTarget: aspect.bodyB,
        aspectType: aspect.type,
        orb: aspect.orb,
        exactAt: date,
        startsAt: addDays(date, -5),
        endsAt: addDays(date, 5),
        themeContributions: mapTransitToThemeScore(transit.body, aspect.type),
        rationale: `${transit.body} ${aspect.type} natal ${aspect.bodyB}; deterministic demo event for timing intelligence scaffolding.`,
        metadata
      });
    }

    if (transit.isRetrograde) {
      retrogrades.push({
        id: `retrograde-${transit.body}-${metadata.inputHash.slice(0, 8)}`,
        body: transit.body,
        startsAt: addDays(date, -10),
        endsAt: addDays(date, 10),
        stationType: "station_retrograde",
        metadata
      });
    }
  });

  return { transitEvents: events.slice(0, 8), retrogradeEvents: retrogrades.slice(0, 4) };
}

export function mapTransitToThemeScore(body: string, aspectType?: string) {
  const base = aspectType === "square" || aspectType === "opposition" ? 0.78 : 0.55;
  if (body === "mars") return { Agency: base, Conflict: base, "Decision Pressure": 0.64 };
  if (body === "saturn") return { Structure: base, "Decision Pressure": 0.58, "Material Stability": 0.5 };
  if (body === "venus") return { "Relational Patterns": base, "Material Stability": 0.42 };
  if (body === "mercury") return { Expression: base, "Decision Pressure": 0.44 };
  if (body === "moon") return { "Inner Life": base, Rest: 0.4 };
  if (body === "pluto") return { Renewal: base, Conflict: 0.45 };
  return { Renewal: 0.45, Visibility: 0.35 };
}

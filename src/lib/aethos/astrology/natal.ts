import { calculateAspects } from "./aspects";
import { NATAL_BODIES } from "./planets";
import { demoEphemerisProvider, getDemoProviderMetadata } from "./providers/demo-ephemeris-provider";
import type { EphemerisProvider, NatalChart, NatalChartInput } from "./types";

export async function createNatalChart(
  input: NatalChartInput,
  provider: EphemerisProvider = demoEphemerisProvider
): Promise<NatalChart> {
  const date = `${input.birthDate}T${input.birthTimeKnown && input.birthTime ? input.birthTime : "12:00"}:00`;
  const positions = await provider.getPlanetPositions({ ...input, bodies: NATAL_BODIES, date });
  const houses = provider.getHouses ? await provider.getHouses(input) : [];
  const aspects = calculateAspects(positions);
  const metadata =
    provider.id === demoEphemerisProvider.id ? getDemoProviderMetadata(input) : getDemoProviderMetadata(input);

  return {
    id: `natal-${metadata.inputHash.slice(0, 12)}`,
    input,
    positions,
    houses,
    aspects,
    metadata
  };
}

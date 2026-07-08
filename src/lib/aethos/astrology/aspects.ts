import { normalizeLongitude } from "./zodiac-format";
import type { Aspect, AspectType, CelestialPosition, OrbConfig } from "./types";

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180
};

export const DEFAULT_ORBS: Required<OrbConfig> = {
  conjunction: 8,
  sextile: 4,
  square: 6,
  trine: 6,
  opposition: 8
};

export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));
  return diff > 180 ? 360 - diff : diff;
}

export function calculateAspect(
  bodyA: CelestialPosition,
  bodyB: CelestialPosition,
  orbConfig: OrbConfig = DEFAULT_ORBS
): Aspect | null {
  const distance = angularDistance(bodyA.longitude, bodyB.longitude);
  const matches = Object.entries(ASPECT_ANGLES)
    .map(([type, angle]) => ({
      type: type as AspectType,
      angle,
      orb: Math.abs(distance - angle),
      maxOrb: orbConfig[type as AspectType] ?? DEFAULT_ORBS[type as AspectType]
    }))
    .filter((candidate) => candidate.orb <= candidate.maxOrb)
    .sort((a, b) => a.orb - b.orb);

  const match = matches[0];
  if (!match) return null;

  return {
    id: `${bodyA.body}-${bodyB.body}-${match.type}`,
    bodyA: bodyA.body,
    bodyB: bodyB.body,
    type: match.type,
    orb: Number(match.orb.toFixed(3)),
    exactAngle: match.angle,
    applying: Math.abs(bodyA.speed.longitudePerDay) >= Math.abs(bodyB.speed.longitudePerDay)
  };
}

export function calculateAspects(positions: CelestialPosition[], orbConfig?: OrbConfig): Aspect[] {
  const aspects: Aspect[] = [];
  for (let i = 0; i < positions.length; i += 1) {
    for (let j = i + 1; j < positions.length; j += 1) {
      const aspect = calculateAspect(positions[i], positions[j], orbConfig);
      if (aspect) aspects.push(aspect);
    }
  }
  return aspects;
}

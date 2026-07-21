import type { AethosBirthIntake } from "../types";
import { calculateWesternBaseline } from "../western";
import type { EngineLayerResult } from "./types";
import { isLowConfidenceMode } from "../intake";

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
] as const;

/**
 * Research preview: approximate sidereal solar sign via rough ayanamsa offset.
 * Not a production Swiss/Lahiri pipeline — Lagna withheld without real engine + time.
 */
export function calculateVedicBaseline(intake: AethosBirthIntake): EngineLayerResult {
  const western = calculateWesternBaseline(intake);
  const westernIndex = SIGNS.indexOf(western.sunSign as (typeof SIGNS)[number]);
  // ~24° Lahiri-class rough shift ≈ almost one sign back for solar baseline scaffold.
  const siderealIndex = westernIndex >= 0 ? (westernIndex + 11) % 12 : 0;
  const rashi = SIGNS[siderealIndex];
  const low = isLowConfidenceMode(intake);

  const withheld = ["Lagna (Ascendant)", "Navamsa", "Dasha timelines", "Full Lahiri Swiss positions"];
  if (low) {
    withheld.push("Any time-sensitive Vedic claim");
  }

  return {
    systemKey: "vedic_astrology",
    label: "Vedic (research preview)",
    status: low ? "withheld" : "research_preview",
    confidence: low ? "low" : "medium",
    summary: low
      ? "Vedic research layer limited to coarse solar Rashi scaffold; Lagna and dashas withheld without verified ephemeris and birth time."
      : `Approximate sidereal solar Rashi scaffold: ${rashi}. Lagna and dashas remain withheld until Swiss sidereal mode is verified.`,
    highlights: [
      { label: "Solar Rashi (approx)", value: rashi, note: "Rough ayanamsa scaffold" },
      { label: "Lagna", value: "withheld" },
      { label: "Dasha", value: "withheld" }
    ],
    symbolicKeys: low ? [] : [`vedic_rashi_${rashi.toLowerCase()}`],
    withheld,
    metadata: {
      systemKey: "vedic_astrology",
      methodKey: "approx_sidereal_solar_v0",
      engineVersion: "0.1.0-research",
      inputCompleteness: low ? "date_only" : "partial",
      restrictedOutputs: withheld,
      notes: [
        "Not Lahiri-certified Swiss output.",
        "Production path: calculation service zodiacMode=sidereal + verified ayanamsa."
      ]
    }
  };
}

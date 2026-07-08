import { isLowConfidenceMode } from "./intake";
import { calculateNumerology } from "./numerology";
import { calculateWesternBaseline } from "./western";
import { fragmentsToVectors, reconcileVectors } from "./reconciliation";
import { generateInsightCards } from "./insights";
import type { AethosBirthIntake } from "./types";

export const demoIntake: AethosBirthIntake = {
  displayName: "Aethos Demo Profile",
  birthDate: "1992-04-18",
  birthTimeConfidence: "unknown",
  birthPlace: {
    city: "Los Angeles",
    region: "CA",
    country: "United States"
  },
  fullBirthName: "Avery Morgan Vale",
  systemsEnabled: {
    westernAstrology: true,
    numerology: true,
    vedicAstrology: false,
    humanDesign: false,
    bazi: false,
    iChing: true
  },
  consent: {
    nonDeterministicDisclaimerAccepted: true,
    aiReflectionAllowed: false,
    journalAnalysisAllowed: false,
    practitionerSharingAllowed: false
  }
};

export function buildDemoKernel(intake: AethosBirthIntake = demoIntake) {
  const lowConfidenceMode = isLowConfidenceMode(intake);
  const numerology = calculateNumerology(intake, new Date("2026-07-08T12:00:00.000Z"));
  const western = calculateWesternBaseline(intake);
  const symbolicKeys = [...numerology.symbolicKeys, ...western.symbolicKeys];
  const vectors = fragmentsToVectors(symbolicKeys, lowConfidenceMode);
  const reconciliations = reconcileVectors(vectors);
  const insights = generateInsightCards(reconciliations);

  return {
    intake,
    lowConfidenceMode,
    numerology,
    western,
    vectors,
    reconciliations,
    insights
  };
}

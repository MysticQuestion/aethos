import { z } from "zod";
import type { AethosBirthIntake } from "./types";

export const birthIntakeSchema = z.object({
  displayName: z.string().min(1).max(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  birthTimeConfidence: z.enum(["exact", "approximate", "unknown"]),
  birthPlace: z
    .object({
      city: z.string().min(1),
      region: z.string().optional(),
      country: z.string().min(1),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      timezone: z.string().optional()
    })
    .optional(),
  fullBirthName: z.string().max(120).optional(),
  chosenName: z.string().max(120).optional(),
  currentLocation: z
    .object({
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
      timezone: z.string().optional()
    })
    .optional(),
  primaryIntention: z
    .enum(["self_understanding", "timing_clarity", "decision_support", "journaling", "practitioner_report"])
    .optional(),
  systemsEnabled: z.object({
    westernAstrology: z.boolean(),
    numerology: z.boolean(),
    vedicAstrology: z.boolean(),
    humanDesign: z.boolean(),
    bazi: z.boolean(),
    iChing: z.boolean()
  }),
  consent: z.object({
    nonDeterministicDisclaimerAccepted: z.boolean(),
    aiReflectionAllowed: z.boolean(),
    journalAnalysisAllowed: z.boolean(),
    practitionerSharingAllowed: z.boolean()
  })
});

export function parseBirthIntake(payload: unknown): AethosBirthIntake {
  const parsed = birthIntakeSchema.parse(payload);
  return {
    ...parsed,
    birthTime: parsed.birthTime || undefined
  };
}

export function getRestrictedOutputs(intake: AethosBirthIntake) {
  if (
    intake.birthTimeConfidence !== "unknown" &&
    intake.birthTime &&
    intake.birthPlace?.latitude !== undefined &&
    intake.birthPlace.longitude !== undefined
  ) {
    return [];
  }

  return [
    "Ascendant",
    "Houses",
    "Human Design Type",
    "Astrocartography",
    "Vedic Lagna",
    "BaZi Hour Pillar"
  ];
}

export function isLowConfidenceMode(intake: AethosBirthIntake) {
  return getRestrictedOutputs(intake).length > 0;
}

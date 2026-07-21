import type { AethosBirthIntake } from "../types";
import { isLowConfidenceMode } from "../intake";
import type { EngineLayerResult } from "./types";

/**
 * Human Design BodyGraph requires precise birth time and a verified ephemeris pipeline.
 * This scaffold only exposes what date-level data can support and withholds Type/Authority/Profile.
 */
export function calculateHumanDesign(intake: AethosBirthIntake): EngineLayerResult {
  const low = isLowConfidenceMode(intake);
  const hasCoords = Boolean(intake.birthPlace?.latitude && intake.birthPlace?.longitude);

  const withheld = [
    "Type",
    "Authority",
    "Profile",
    "Defined centers",
    "Channels / gates graph",
    "Incarnation Cross"
  ];

  if (low || !intake.birthTime) {
    return {
      systemKey: "human_design",
      label: "Human Design",
      status: "withheld",
      confidence: "low",
      summary:
        "Human Design Type, Authority, and Profile are withheld. Unknown or approximate birth time must not invent a BodyGraph.",
      highlights: [
        { label: "Type", value: "withheld" },
        { label: "Authority", value: "withheld" },
        { label: "Profile", value: "withheld" },
        {
          label: "Reason",
          value: low ? "birth time unknown/approximate" : "BodyGraph engine not production-verified"
        }
      ],
      symbolicKeys: [],
      withheld,
      metadata: {
        systemKey: "human_design",
        methodKey: "bodygraph_withhold_v0",
        engineVersion: "0.1.0-research",
        inputCompleteness: "date_only",
        restrictedOutputs: withheld,
        notes: [
          "Never default birth time to noon for Human Design.",
          "Production requires Swiss positions + design/personality calculation service."
        ]
      }
    };
  }

  return {
    systemKey: "human_design",
    label: "Human Design",
    status: "research_preview",
    confidence: "low",
    summary: hasCoords
      ? "Birth time and coordinates present, but BodyGraph production engine is not verified — Type/Authority still withheld."
      : "Birth time present but location precision incomplete — Type/Authority withheld.",
    highlights: [
      { label: "Type", value: "withheld (engine pending)" },
      { label: "Input time", value: intake.birthTime },
      { label: "Coordinates", value: hasCoords ? "provided" : "incomplete" }
    ],
    symbolicKeys: [],
    withheld,
    metadata: {
      systemKey: "human_design",
      methodKey: "bodygraph_withhold_v0",
      engineVersion: "0.1.0-research",
      inputCompleteness: hasCoords ? "partial" : "partial",
      restrictedOutputs: withheld,
      notes: ["Inputs look promising; calculation boundary not yet certified."]
    }
  };
}

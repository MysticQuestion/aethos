import type { CalculationMetadata, ConfidenceLevel } from "../types";

export type EngineStatus = "v1" | "research_preview" | "withheld" | "unavailable";

export type EngineLayerResult = {
  systemKey: string;
  label: string;
  status: EngineStatus;
  confidence: ConfidenceLevel;
  summary: string;
  highlights: Array<{ label: string; value: string; note?: string }>;
  symbolicKeys: string[];
  withheld: string[];
  metadata: CalculationMetadata;
};

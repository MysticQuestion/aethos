export type BirthTimeConfidence = "exact" | "approximate" | "unknown";

export type UserIntention =
  | "self_understanding"
  | "timing_clarity"
  | "decision_support"
  | "journaling"
  | "practitioner_report";

export type SymbolicSystem =
  | "western_astrology"
  | "human_design"
  | "numerology"
  | "journaling"
  | "vedic_astrology"
  | "bazi"
  | "i_ching";

export type ConfidenceLevel = "high" | "medium" | "low";

export type StorageMode = "local_demo" | "supabase";

export type SourceSystem =
  | "western_astrology"
  | "numerology"
  | "vedic_astrology"
  | "human_design"
  | "bazi"
  | "i_ching"
  | "journal";

export type Axis =
  | "pacing_momentum"
  | "boundary_attachment"
  | "processing_epistemology"
  | "form_adaptation";

export type CoreTheme =
  | "identity_output"
  | "emotional_relational"
  | "action_decision"
  | "timing_climate";

export type ReconciliationClassification =
  | "agreement"
  | "tension"
  | "paradox"
  | "mixed";

export type AethosBirthIntake = {
  displayName: string;
  birthDate: string;
  birthTime?: string;
  birthTimeConfidence: BirthTimeConfidence;
  birthPlace?: {
    city: string;
    region?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  fullBirthName?: string;
  chosenName?: string;
  currentLocation?: {
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
  };
  primaryIntention?: UserIntention;
  systemsEnabled: {
    westernAstrology: boolean;
    numerology: boolean;
    vedicAstrology: boolean;
    humanDesign: boolean;
    bazi: boolean;
    iChing: boolean;
  };
  consent: {
    nonDeterministicDisclaimerAccepted: boolean;
    aiReflectionAllowed: boolean;
    journalAnalysisAllowed: boolean;
    practitionerSharingAllowed: boolean;
  };
};

export type SystemLayerSnapshot = {
  systemKey: string;
  label: string;
  status: "v1" | "research_preview" | "withheld" | "unavailable";
  confidence: ConfidenceLevel;
  summary: string;
  highlights: Array<{ label: string; value: string; note?: string }>;
  withheld: string[];
};

export type AethosProfile = {
  id: string;
  displayName: string;
  isSample: boolean;
  generatedAt: string;
  intake: AethosBirthIntake;
  identitySummary: string;
  corePatternMap: Array<{
    label: string;
    value: string;
    confidence: ConfidenceLevel;
    source: string;
  }>;
  systemLayers: SystemLayerSnapshot[];
  strengths: string[];
  tensions: string[];
  timingSensitivities: string[];
  reflectionPrompts: string[];
};

export type TimingWindow = {
  id: string;
  title: string;
  timeframe: string;
  theme: CoreTheme;
  confidence: ConfidenceLevel;
  summary: string;
  reflectionPrompt: string;
};

export type JournalTheme =
  | "identity"
  | "timing"
  | "decision"
  | "relationship"
  | "energy"
  | "work"
  | "integration";

export type JournalEntry = {
  id: string;
  createdAt: string;
  mood: "steady" | "open" | "unclear" | "charged" | "low";
  theme: JournalTheme;
  decisionContext?: string;
  body: string;
  extractedThemes: JournalTheme[];
};

export type ReportType =
  | "core_brief"
  | "timing_brief"
  | "decision_lens"
  | "journal_pattern_summary"
  | "practitioner_overview"
  | "lab_mode_export";

export type AethosReport = {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  intakeSummary: string;
  coreProfileSummary: string;
  keyThemes: string[];
  timingContext: string;
  journalObservations: string[];
  confidenceNotes: string[];
  reflectionPrompts: string[];
  responsibleUseNote: string;
  markdown: string;
};

export type AethosState = {
  profile?: AethosProfile;
  journalEntries: JournalEntry[];
  reports: AethosReport[];
  updatedAt: string;
};

export type SemanticFragment = {
  symbolicKey: string;
  sourceSystem: SourceSystem;
  sourceObject: string;
  axis: Axis;
  themes: CoreTheme[];
  direction: number;
  defaultWeight: number;
  confidenceSensitivity: "low" | "medium" | "high";
  fragments: {
    nounPhrase: string;
    adjectivePhrase: string;
    coreImperative: string;
    cautionPhrase: string;
  };
  interpretationLimits: string[];
};

export type SymbolicVector = {
  symbolicKey: string;
  sourceSystem: SourceSystem;
  sourceObject: string;
  theme: CoreTheme;
  axis: Axis;
  direction: number;
  weight: number;
  confidence: number;
};

export type CalculationMetadata = {
  systemKey: string;
  methodKey: string;
  engineVersion: string;
  inputCompleteness: "complete" | "partial" | "date_only";
  restrictedOutputs: string[];
  notes: string[];
};

export type NumerologyResult = {
  lifePath: number;
  birthDay: number;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  expressionNumber?: number;
  soulUrge?: number;
  personalityNumber?: number;
  symbolicKeys: string[];
  metadata: CalculationMetadata;
};

export type WesternBaselineResult = {
  sunSign: string;
  moonSign?: string;
  moonStatus: "available" | "date_probability_only" | "unavailable";
  ascendantStatus: "available" | "withheld";
  housesStatus: "available" | "withheld";
  symbolicKeys: string[];
  metadata: CalculationMetadata;
};

export type ReconciliationRun = {
  theme: CoreTheme;
  axis: Axis;
  netAlignment: number;
  contradictionIndex: number;
  classification: ReconciliationClassification;
  vectors: SymbolicVector[];
};

export type InsightCardModel = {
  id: string;
  title: string;
  body: string;
  sources: string[];
  theme: CoreTheme;
  axis: Axis;
  confidenceLabel: "High" | "Medium" | "Low";
  classification: ReconciliationClassification;
  engineDrawer: ReconciliationRun & {
    interpretationLimits: string[];
    generatedFrom: "structured_vectors";
  };
};

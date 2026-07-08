export type EmaJournalEntry = {
  id: string;
  mood?: number;
  stress?: number;
  focus?: number;
  sleepQuality?: number;
  socialConnection?: number;
  conflictLevel?: number;
  creativity?: number;
  decisionPressure?: number;
  bodyEnergy?: number;
  clarity?: number;
  freeText?: string;
  tags: string[];
  linkedTimingWindowIds: string[];
  createdAt: string;
};

export type JournalAverages = {
  count: number;
  mood?: number;
  stress?: number;
  focus?: number;
  sleepQuality?: number;
  socialConnection?: number;
  conflictLevel?: number;
  creativity?: number;
  decisionPressure?: number;
  bodyEnergy?: number;
  clarity?: number;
};

export type CalibrationInsight = {
  status: "insufficient_data" | "early_learning" | "emerging_signal" | "stronger_basis";
  summary: string;
  baseline: JournalAverages;
  windowAverage?: JournalAverages;
};

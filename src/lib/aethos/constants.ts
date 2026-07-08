import type { ReportType, SymbolicSystem, UserIntention } from "./types";

export const RESPONSIBLE_USE_NOTE =
  "Aethos is designed for interpretation, reflection, and decision support. It does not provide medical, legal, financial, psychiatric, or guaranteed predictive advice.";

export const STORAGE_MODE_COPY = {
  local_demo: "Local mode: data is stored in this browser only.",
  supabase: "Supabase mode: public Supabase environment variables are configured."
} as const;

export const USER_INTENTIONS: Array<{ value: UserIntention; label: string; description: string }> = [
  {
    value: "self_understanding",
    label: "Self-understanding",
    description: "Map recurring identity patterns and reflective prompts."
  },
  {
    value: "timing_clarity",
    label: "Timing clarity",
    description: "Frame timing windows as context markers, not commands."
  },
  {
    value: "decision_support",
    label: "Decision support",
    description: "Compare tensions, constraints, and next reflective actions."
  },
  {
    value: "journaling",
    label: "Journaling",
    description: "Ground symbolic insight in lived observations over time."
  },
  {
    value: "practitioner_report",
    label: "Practitioner report",
    description: "Prepare structured summaries for collaborative review."
  }
];

export const SYMBOLIC_SYSTEMS: Array<{
  value: SymbolicSystem;
  label: string;
  status: "v1" | "research_preview" | "deferred";
}> = [
  { value: "western_astrology", label: "Western astrology", status: "v1" },
  { value: "human_design", label: "Human Design", status: "v1" },
  { value: "numerology", label: "Numerology", status: "v1" },
  { value: "journaling", label: "Journaling pattern tracking", status: "v1" },
  { value: "vedic_astrology", label: "Vedic astrology", status: "research_preview" },
  { value: "bazi", label: "BaZi", status: "research_preview" },
  { value: "i_ching", label: "I Ching", status: "research_preview" }
];

export const REPORT_TYPES: Array<{ value: ReportType; label: string; description: string }> = [
  {
    value: "core_brief",
    label: "Aethos Core Brief",
    description: "Identity summary, pattern map, strengths, tensions, and reflection prompts."
  },
  {
    value: "timing_brief",
    label: "Timing Brief",
    description: "Current context markers and next recommended reflection windows."
  },
  {
    value: "decision_lens",
    label: "Decision Lens",
    description: "Structured question framing for a live choice or constraint."
  },
  {
    value: "journal_pattern_summary",
    label: "Journal Pattern Summary",
    description: "Theme frequency, mood context, and grounded observations."
  },
  {
    value: "practitioner_overview",
    label: "Practitioner Overview",
    description: "A concise report for collaborative, non-diagnostic review."
  },
  {
    value: "lab_mode_export",
    label: "Lab Mode Export",
    description: "Raw calculation metadata, timing windows, theme scores, and interpretation boundaries."
  }
];

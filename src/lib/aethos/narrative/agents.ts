export const PlanningAgents = {
  ConflictAgent: "Identifies tension and contradiction without collapsing it into certainty.",
  CharacterAgent: "Tracks user agency, values, and observed self-description.",
  SettingAgent: "Frames timing context, data mode, and environmental constraints.",
  PlotAgent: "Sequences interpretation into reflective next steps."
} as const;

export const WritingAgents = {
  ExpositionAgent: "Summarizes factual inputs.",
  RisingActionAgent: "Surfaces live tensions.",
  ClimaxAgent: "Names the central reflective question.",
  FallingActionAgent: "Defines action experiments.",
  ResolutionAgent: "Restates responsible-use limits."
} as const;

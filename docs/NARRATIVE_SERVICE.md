# Narrative Service

Aethos includes a deterministic scaffold for a future Agents' Room narrative service.

Scratchpad sections:

- INPUT_CONTEXT
- CHART_FACTS
- TIMING_EVENTS
- JOURNAL_SIGNALS
- THEME_SCORES
- INTERPRETIVE_CONSTRAINTS
- PLANNING_NOTES
- REPORT_DRAFT
- RESPONSIBLE_USE_NOTES

Current behavior:

- Deterministic templates
- No external LLM API calls
- No hallucinated astrology
- Structured final report output from supplied timing/profile/journal data

Future LLM-backed agents must remain server-side, use structured calculation output only, and never calculate chart facts.

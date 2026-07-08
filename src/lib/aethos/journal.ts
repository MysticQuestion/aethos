import type { JournalEntry, JournalTheme } from "./types";

const THEME_KEYWORDS: Record<JournalTheme, string[]> = {
  identity: ["identity", "self", "name", "role", "pattern"],
  timing: ["timing", "wait", "window", "cycle", "season"],
  decision: ["decision", "choice", "choose", "option", "next"],
  relationship: ["relationship", "partner", "friend", "family", "team"],
  energy: ["energy", "tired", "charged", "mood", "body"],
  work: ["work", "career", "project", "client", "money"],
  integration: ["integrate", "practice", "repeat", "learn", "ground"]
};

export function extractJournalThemes(body: string, fallbackTheme: JournalTheme): JournalTheme[] {
  const normalized = body.toLowerCase();
  const matches = Object.entries(THEME_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([theme]) => theme as JournalTheme);

  return Array.from(new Set([fallbackTheme, ...matches])).slice(0, 4);
}

export function createJournalEntry(input: {
  mood: JournalEntry["mood"];
  theme: JournalTheme;
  decisionContext?: string;
  body: string;
}): JournalEntry {
  return {
    id: `journal-${Date.now()}`,
    createdAt: new Date().toISOString(),
    mood: input.mood,
    theme: input.theme,
    decisionContext: input.decisionContext?.trim() || undefined,
    body: input.body.trim(),
    extractedThemes: extractJournalThemes(input.body, input.theme)
  };
}

export function summarizeJournal(entries: JournalEntry[]) {
  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    entry.extractedThemes.forEach((theme) => {
      acc[theme] = (acc[theme] ?? 0) + 1;
    });
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([theme, count]) => `${theme}: ${count}`);
}

"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { EmptyState } from "./empty-state";
import { createJournalEntry } from "@/lib/aethos/journal";
import { loadLocalAethosState, saveLocalAethosState } from "@/lib/aethos/storage";
import type { JournalEntry, JournalTheme } from "@/lib/aethos/types";

export function JournalWorkspace() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadLocalAethosState().journalEntries);
  const [body, setBody] = useState("");
  const [theme, setTheme] = useState<JournalTheme>("identity");
  const [mood, setMood] = useState<JournalEntry["mood"]>("steady");
  const [decisionContext, setDecisionContext] = useState("");

  function submit() {
    if (!body.trim()) return;
    const entry = createJournalEntry({ body, theme, mood, decisionContext });
    const state = loadLocalAethosState();
    const nextEntries = [entry, ...state.journalEntries];
    saveLocalAethosState({ ...state, journalEntries: nextEntries });
    setEntries(nextEntries);
    setBody("");
    setDecisionContext("");
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <div className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Journal composer</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm">
            Mood tag
            <select value={mood} onChange={(event) => setMood(event.target.value as JournalEntry["mood"])} className="min-h-11 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3">
              {["steady", "open", "unclear", "charged", "low"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Theme tag
            <select value={theme} onChange={(event) => setTheme(event.target.value as JournalTheme)} className="min-h-11 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3">
              {["identity", "timing", "decision", "relationship", "energy", "work", "integration"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Decision context
            <input value={decisionContext} onChange={(event) => setDecisionContext(event.target.value)} className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3" placeholder="Optional question or choice" />
          </label>
          <label className="grid gap-2 text-sm">
            Entry
            <textarea value={body} onChange={(event) => setBody(event.target.value)} className="min-h-40 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] p-3 leading-6" placeholder="What pattern, decision, timing signal, or lived observation is present?" />
          </label>
          <button type="button" onClick={submit} className="min-h-11 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]">
            Save Entry Locally
          </button>
        </div>
      </div>
      <div className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Entry history</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Local mode preserves entries across refreshes in this browser.</p>
        <div className="mt-5 grid gap-3">
          {entries.length === 0 ? (
            <EmptyState icon={NotebookPen} title="No journal entries yet" detail="Add a reflection to begin grounding symbolic patterns in lived experience." />
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="rounded-md border border-[var(--line)] p-4">
                <div className="flex flex-wrap justify-between gap-2 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                  <span>{entry.mood}</span>
                  <span>{new Date(entry.createdAt).toLocaleString("en-US")}</span>
                </div>
                <p className="mt-3 text-sm leading-6">{entry.body}</p>
                <p className="mt-3 text-xs text-[var(--ink-soft)]">Extracted themes: {entry.extractedThemes.join(", ")}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Compass, Hourglass } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ShowTheMath } from "@/components/aethos/show-the-math";
import {
  castDecisionLens,
  decisionCastToJournalBody,
  isCastExpired,
  type DecisionCast
} from "@/lib/aethos/engines/decision-lens";
import { createJournalEntry } from "@/lib/aethos/journal";
import { emptyAethosState, loadLocalAethosState, saveLocalAethosState } from "@/lib/aethos/storage";

const STORAGE_KEY = "aethos.decision.cast.v1";

function loadLastCast(): DecisionCast | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DecisionCast;
  } catch {
    return null;
  }
}

function saveLastCast(cast: DecisionCast | null) {
  if (typeof window === "undefined") return;
  if (!cast) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cast));
}

export function DecisionLensWorkspace() {
  const [question, setQuestion] = useState("");
  const [cast, setCast] = useState<DecisionCast | null>(() => loadLastCast());
  const [error, setError] = useState<string | null>(null);
  const [archived, setArchived] = useState(false);

  const expired = useMemo(() => (cast ? isCastExpired(cast) : false), [cast]);

  function runCast() {
    setError(null);
    setArchived(false);
    try {
      const next = castDecisionLens(question);
      setCast(next);
      saveLastCast(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cast failed.");
    }
  }

  function archiveToJournal() {
    if (!cast) return;
    const entry = createJournalEntry({
      mood: "unclear",
      theme: "decision",
      decisionContext: cast.userQuestion,
      body: decisionCastToJournalBody(cast)
    });
    const previous = typeof window === "undefined" ? emptyAethosState() : loadLocalAethosState();
    saveLocalAethosState({
      ...previous,
      journalEntries: [entry, ...previous.journalEntries],
      updatedAt: new Date().toISOString()
    });
    setArchived(true);
  }

  function clearCast() {
    setCast(null);
    saveLastCast(null);
    setArchived(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="aethos-panel rounded-md p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Compass className="h-5 w-5 text-[var(--ochre)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Cast a Decision</h2>
          <StatusBadge tone="tension">ephemeral · 72h decay</StatusBadge>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          I Ching is a tactical Decision Lens — not a natal identity layer. It answers a specific question against your
          baseline without permanently rewriting multi-system vectors.
        </p>

        <label className="mt-5 grid gap-2 text-sm">
          <span className="font-semibold">Your question</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="min-h-28 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] p-3 leading-6"
            placeholder="e.g. Should I force the launch of this project this week?"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runCast}
            className="min-h-10 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]"
          >
            Cast Decision Lens
          </button>
          {cast ? (
            <>
              <button
                type="button"
                onClick={archiveToJournal}
                className="min-h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold"
              >
                Archive to journal
              </button>
              <button
                type="button"
                onClick={clearCast}
                className="min-h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-[var(--ink-soft)]"
              >
                Clear cast
              </button>
            </>
          ) : null}
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--wine)]">{error}</p> : null}
        {archived ? (
          <p className="mt-3 text-sm font-semibold text-[var(--teal)]">Archived to local journal (decision theme).</p>
        ) : null}

        {cast ? (
          <div className="mt-6 grid gap-4 rounded-md border border-[var(--line)] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={expired ? "paradox" : "agreement"}>
                {expired ? "decayed" : "active overlay"}
              </StatusBadge>
              <StatusBadge tone="tension">w = {cast.ephemeralWeight}</StatusBadge>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--ink-soft)]">
                <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
                expires {new Date(cast.expiresAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">
              <span className="font-semibold text-[var(--foreground)]">Q:</span> {cast.userQuestion}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-[var(--line)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Primary</p>
                <p className="mt-2 text-2xl font-semibold">#{cast.primaryHexagram}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {cast.upperTrigram} over {cast.lowerTrigram}
                </p>
              </div>
              <div className="rounded-md border border-[var(--line)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Relating</p>
                <p className="mt-2 text-2xl font-semibold">
                  {cast.relatingHexagram != null ? `#${cast.relatingHexagram}` : "—"}
                </p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {cast.changingLines.length ? `lines ${cast.changingLines.join(", ")}` : "no changing lines"}
                </p>
              </div>
              <div className="rounded-md border border-[var(--line)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Method</p>
                <p className="mt-2 text-sm font-semibold">{cast.methodKey}</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">{cast.engineVersion}</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[var(--foreground)]">{cast.synthesis}</p>
            <p className="text-xs leading-5 text-[var(--ink-soft)]">{cast.responsibleUseNote}</p>
            <ShowTheMath title="Show the Math — cast JSON" data={cast} />
          </div>
        ) : null}
      </section>

      <aside className="aethos-panel h-fit rounded-md p-5">
        <h2 className="text-lg font-semibold">Codex rules</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ink-soft)]">
          <li>• Ephemeral weight (0.95) for tactical overlay only</li>
          <li>• Does not rewrite natal Western / HD / BaZi baseline</li>
          <li>• 72-hour decay; archive to journal for memory</li>
          <li>• Calculation ≠ interpretation; synthesis is labeled reflective</li>
          <li>• Compare Cast I Ching / Online Clarity UX later for cast fidelity</li>
        </ul>
      </aside>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Download, FileText } from "lucide-react";
import { EmptyState } from "./empty-state";
import { REPORT_TYPES } from "@/lib/aethos/constants";
import { createSampleAethosProfile } from "@/lib/aethos/profile";
import { generateAethosReport } from "@/lib/aethos/reports";
import { loadLocalAethosState, saveLocalAethosState } from "@/lib/aethos/storage";
import type { AethosReport, ReportType } from "@/lib/aethos/types";

export function ReportsWorkspace() {
  const [reports, setReports] = useState<AethosReport[]>(() => loadLocalAethosState().reports);
  const [activeMarkdown, setActiveMarkdown] = useState("");
  const [activeReport, setActiveReport] = useState<AethosReport | null>(() => loadLocalAethosState().reports[0] ?? null);

  function generate(type: ReportType) {
    const state = loadLocalAethosState();
    const profile = state.profile ?? createSampleAethosProfile();
    const report = generateAethosReport(type, profile, state.journalEntries);
    const nextReports = [report, ...state.reports];
    saveLocalAethosState({ ...state, profile, reports: nextReports });
    setReports(nextReports);
    setActiveMarkdown(report.markdown);
    setActiveReport(report);
  }

  async function copyMarkdown() {
    if (!activeReport || typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(activeReport.markdown);
  }

  async function copyJson() {
    if (!activeReport || typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(JSON.stringify(activeReport, null, 2));
  }

  function downloadJson() {
    if (!activeReport) return;
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeReport.type}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_460px]">
      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_TYPES.map((type) => (
          <article key={type.value} className="aethos-panel rounded-md p-5">
            <h2 className="text-lg font-semibold">{type.label}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{type.description}</p>
            <button type="button" onClick={() => generate(type.value)} className="mt-5 min-h-10 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]">
              Generate
            </button>
          </article>
        ))}
      </div>
      <aside className="aethos-panel h-fit rounded-md p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Report preview</h2>
          {activeReport ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyMarkdown} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-semibold">
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Markdown
              </button>
              <button type="button" onClick={copyJson} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-semibold">
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                JSON
              </button>
              <button type="button" onClick={downloadJson} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-semibold">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download
              </button>
            </div>
          ) : null}
        </div>
        {activeMarkdown ? (
          <pre className="mt-4 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-md bg-[#05060b] p-4 text-xs leading-5 text-[#f7f1e3]">{activeMarkdown}</pre>
        ) : reports[0] ? (
          <pre className="mt-4 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-md bg-[#05060b] p-4 text-xs leading-5 text-[#f7f1e3]">{reports[0].markdown}</pre>
        ) : (
          <EmptyState icon={FileText} title="No report generated" detail="Choose a report type to create a clean Markdown preview from profile and journal data." />
        )}
      </aside>
    </section>
  );
}

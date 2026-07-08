"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { STORAGE_MODE_COPY } from "@/lib/aethos/constants";
import { clearLocalAethosState, getClientStorageMode, loadLocalAethosState } from "@/lib/aethos/storage";
import type { AethosState, StorageMode } from "@/lib/aethos/types";

export function SettingsPanel() {
  const [mode] = useState<StorageMode>(() => getClientStorageMode());
  const [state, setState] = useState<AethosState | null>(() => loadLocalAethosState());

  function clear() {
    clearLocalAethosState();
    setState(loadLocalAethosState());
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Data mode</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{STORAGE_MODE_COPY[mode]}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-[var(--line)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Profile</p>
            <p className="mt-2 text-2xl font-semibold">{state?.profile ? "1" : "0"}</p>
          </div>
          <div className="rounded-md border border-[var(--line)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Journal entries</p>
            <p className="mt-2 text-2xl font-semibold">{state?.journalEntries.length ?? 0}</p>
          </div>
          <div className="rounded-md border border-[var(--line)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Reports</p>
            <p className="mt-2 text-2xl font-semibold">{state?.reports.length ?? 0}</p>
          </div>
        </div>
      </div>
      <aside className="aethos-panel h-fit rounded-md p-5">
        <h2 className="text-lg font-semibold">Local data controls</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Clears only this browser’s local Aethos data. Supabase deletion should be handled through authenticated account workflows when configured.</p>
        <button type="button" onClick={clear} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-[rgba(214,106,154,0.45)] px-4 text-sm font-semibold text-[var(--wine)]">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear Local Data
        </button>
      </aside>
    </section>
  );
}

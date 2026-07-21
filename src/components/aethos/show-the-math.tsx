"use client";

import { useState } from "react";
import { Braces, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Transparent methodology: progressive disclosure of structured calculation / engine data.
 * Systems Codex — readable insight first, practitioner proof underneath.
 */
export function ShowTheMath({
  title = "Show the Math",
  description = "Structured calculation, vectors, and method metadata — not freeform invention.",
  data,
  defaultOpen = false
}: {
  title?: string;
  description?: string;
  data: unknown;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(9,10,18,0.35)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-h-11 items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <Braces className="h-4 w-4 text-[var(--ochre)]" aria-hidden="true" />
          {title}
        </span>
        {open ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
      </button>
      {open ? (
        <div className="border-t border-[var(--line)] px-4 py-3">
          <p className="text-xs leading-5 text-[var(--ink-soft)]">{description}</p>
          <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-[#191714] p-4 text-xs leading-5 text-[#f7f5ef]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

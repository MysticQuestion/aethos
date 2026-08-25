"use client";

import Link from "next/link";
import { Database, LoaderCircle, ShieldCheck, UserRoundPlus } from "lucide-react";
import { EmptyState } from "@/components/aethos/empty-state";
import { useActiveProfile } from "@/components/aethos/active-profile-provider";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { buildDemoKernel } from "@/lib/aethos/demo";

export default function EnginePage() {
  const { profile, natalChart, source, status } = useActiveProfile();
  const kernel = profile ? buildDemoKernel(profile.intake) : null;

  return (
    <SiteShell
      eyebrow="Practitioner-grade proof"
      title={profile ? `${profile.displayName} — Engine View` : "Engine View requires an active profile."}
      description="Inspect the structured vectors, weights, confidence, classification, and calculation provenance behind the active profile. Contradictions remain visible instead of being averaged into vague neutrality."
    >
      {status === "loading" ? (
        <div className="aethos-panel flex min-h-48 items-center justify-center rounded-md">
          <LoaderCircle className="h-6 w-6 animate-spin text-[var(--teal)]" aria-label="Loading active profile" />
        </div>
      ) : !profile || !kernel ? (
        <EmptyState
          icon={UserRoundPlus}
          title="No profile to inspect"
          detail="Complete onboarding first. Aethos will not display sample engine data as though it belongs to you."
          action={
            <Link href="/onboarding" className="rounded-md bg-[var(--ochre)] px-5 py-3 text-sm font-semibold text-[#090a12]">
              Create my profile
            </Link>
          }
        />
      ) : (
        <>
          <section className="rounded-md border border-[rgba(94,234,212,0.25)] bg-[rgba(94,234,212,0.07)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--teal)]">Active profile provenance</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {source === "cloud" ? "Authenticated cloud profile" : "Browser-local profile"} ·{" "}
                  {natalChart?.metadata.calculationMode ?? "baseline"} calculation mode ·{" "}
                  {natalChart?.metadata.providerId ?? "deterministic Phase 1 kernel"}
                </p>
              </div>
              <ShieldCheck className="h-6 w-6 text-[var(--teal)]" aria-hidden="true" />
            </div>
          </section>

          <section className="grid gap-5">
            {kernel.reconciliations.map((run) => (
              <article key={`${run.theme}-${run.axis}`} className="aethos-panel rounded-md p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgba(98,82,163,0.12)] text-[var(--violet)]">
                      <Database className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold">{run.theme.replaceAll("_", " ")}</h2>
                      <p className="text-sm text-[var(--ink-soft)]">{run.axis.replaceAll("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={run.classification}>{run.classification}</StatusBadge>
                    <StatusBadge>net {run.netAlignment}</StatusBadge>
                    <StatusBadge>variance {run.contradictionIndex}</StatusBadge>
                  </div>
                </div>
                <pre className="mt-5 overflow-auto rounded-md bg-[#191714] p-4 text-xs leading-5 text-[#f7f5ef]">
                  {JSON.stringify(run, null, 2)}
                </pre>
              </article>
            ))}
          </section>
        </>
      )}
    </SiteShell>
  );
}

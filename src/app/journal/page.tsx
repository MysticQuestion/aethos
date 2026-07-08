import { LockKeyhole, Server, Smartphone } from "lucide-react";
import { JournalWorkspace } from "@/components/aethos/journal-workspace";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";

const modes = [
  {
    title: "Private Mode",
    icon: LockKeyhole,
    detail: "Journal encrypted client-side. No server AI summary.",
    status: "Phase 1 policy"
  },
  {
    title: "Session Analysis Mode",
    icon: Server,
    detail: "User decrypts locally and sends selected entries for temporary analysis.",
    status: "Consent gated"
  },
  {
    title: "Local AI Mode",
    icon: Smartphone,
    detail: "Future desktop or mobile model analyzes entries without cloud transfer.",
    status: "Future"
  }
];

export default function JournalPage() {
  return (
    <SiteShell
      eyebrow="Journal privacy"
      title="Journal analysis must match the privacy claim."
      description="Create mood-tagged and theme-tagged reflections with local persistence. Pattern extraction remains transparent and privacy-aware."
    >
      <JournalWorkspace />
      <section className="grid gap-5 md:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <article key={mode.title} className="aethos-panel rounded-md p-5">
              <Icon className="h-6 w-6 text-[var(--teal)]" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">{mode.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{mode.detail}</p>
              <div className="mt-4">
                <StatusBadge>{mode.status}</StatusBadge>
              </div>
            </article>
          );
        })}
      </section>
      <section className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Journal entry contract</h2>
        <pre className="mt-4 overflow-auto rounded-md bg-[#191714] p-4 text-xs leading-5 text-[#f7f5ef]">
          {JSON.stringify(
            {
              entryType: "reflection",
              encryptionMode: "private",
              encryptedBody: "base64:aes-gcm-payload",
              plaintextBody: null,
              aiAnalysisAllowed: false,
              semanticTags: ["timing_climate", "decision_pressure"]
            },
            null,
            2
          )}
        </pre>
      </section>
    </SiteShell>
  );
}

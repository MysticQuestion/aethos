import { ReportsWorkspace } from "@/components/aethos/reports-workspace";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";

export default function ReportsPage() {
  return (
    <SiteShell
      eyebrow="Structured reports"
      title="Generate clean report previews from profile, timing, and journal data."
      description="Reports are deterministic Markdown outputs with print-to-PDF export (browser Save as PDF), plus JSON download for practitioners."
    >
      <ReportsWorkspace />
      <ResponsibleUseNote compact />
      <ResponsibleUseBoundary />
    </SiteShell>
  );
}

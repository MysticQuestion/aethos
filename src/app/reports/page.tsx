import { ReportsWorkspace } from "@/components/aethos/reports-workspace";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";

export default function ReportsPage() {
  return (
    <SiteShell
      eyebrow="Structured reports"
      title="Generate clean report previews from profile, timing, and journal data."
      description="Reports are deterministic Markdown/HTML-ready outputs. PDF export remains a deferred scaffold until the rendering pipeline is production-tested."
    >
      <ReportsWorkspace />
      <ResponsibleUseNote compact />
    </SiteShell>
  );
}

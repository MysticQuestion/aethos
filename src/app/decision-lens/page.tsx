import { DecisionLensWorkspace } from "@/components/aethos/decision-lens-workspace";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";

export default function DecisionLensPage() {
  return (
    <SiteShell
      eyebrow="Decision Lens"
      title="I Ching as a short-horizon tactical overlay — not a second natal chart."
      description="Competitors treat divination as a novelty silo. Aethos ties casts to a specific question, shows the math, decays the overlay, and archives into journal memory."
    >
      <DecisionLensWorkspace />
      <ResponsibleUseNote compact />
      <ResponsibleUseBoundary />
    </SiteShell>
  );
}

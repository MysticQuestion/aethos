import { AstrocartographyWorkspace } from "@/components/aethos/astrocartography-workspace";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";

export default function AstrocartographyPage() {
  return (
    <SiteShell
      eyebrow="Astrocartography scaffold"
      title="Planetary ASC / DSC / MC / IC lines from one birth input."
      description="Competitor lane: Astro.com AstroClick Travel and Astro-Seek maps. Aethos starts with deterministic line tables, residual orbs, withhold rules, and responsible-use framing — interactive map tiles come later."
    >
      <AstrocartographyWorkspace />
      <ResponsibleUseNote compact />
      <ResponsibleUseBoundary />
    </SiteShell>
  );
}

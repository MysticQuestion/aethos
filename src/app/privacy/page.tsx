import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { SettingsPanel } from "@/components/aethos/settings-panel";
import { SiteShell } from "@/components/site-shell";

export default function PrivacyPage() {
  return (
    <SiteShell
      eyebrow="Privacy and data rights"
      title="Birth data, journal entries, timing windows, and reports are treated as sensitive records."
      description="Aethos is designed to support export and deletion workflows without making fake compliance claims."
    >
      <SettingsPanel />
      <section className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Sensitive data categories</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["Birth date/time/location", "Journal entries", "Timing windows", "Reports"].map((item) => (
            <div key={item} className="rounded-md border border-[var(--line)] p-4 text-sm text-[var(--ink-soft)]">{item}</div>
          ))}
        </div>
      </section>
      <ResponsibleUseBoundary />
    </SiteShell>
  );
}

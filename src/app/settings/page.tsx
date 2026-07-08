import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SettingsPanel } from "@/components/aethos/settings-panel";
import { SiteShell } from "@/components/site-shell";
import { getSupabaseConfigStatus } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = getSupabaseConfigStatus();

  return (
    <SiteShell
      eyebrow="Settings"
      title="Profile, storage mode, privacy posture, and local data controls."
      description="Aethos supports local demo access without authentication and can move into Supabase mode when safe public environment variables are configured."
    >
      <SettingsPanel />
      <section className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Supabase configuration</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Status: {supabase.configured ? "configured" : "not configured"}. Required public variables: {supabase.requiredEnv.join(", ")}.
        </p>
      </section>
      <ResponsibleUseNote compact />
    </SiteShell>
  );
}

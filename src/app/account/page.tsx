import { AccountPanel } from "@/components/aethos/account-panel";
import { ResponsibleUseBoundary } from "@/components/aethos/responsible-use-boundary";
import { ResponsibleUseNote } from "@/components/aethos/responsible-use-note";
import { SiteShell } from "@/components/site-shell";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";

export default function AccountPage() {
  const supabase = getSupabaseConfigStatus();

  return (
    <SiteShell
      eyebrow="Account"
      title="Optional cloud account — local demo stays fully usable."
      description="Sign in when Supabase public env is configured to mirror profile, journal, and reports. Without auth, Aethos continues in browser-local mode."
    >
      <AccountPanel />
      <section className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Configuration</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Status: {supabase.configured ? "public Supabase env present" : "not configured"}. Required:{" "}
          {supabase.requiredEnv.join(", ")}. Protected product routes are not forced behind login; cloud sync is
          opt-in so practitioners and explorers can still use offline demo mode.
        </p>
      </section>
      <ResponsibleUseNote compact />
      <ResponsibleUseBoundary />
    </SiteShell>
  );
}

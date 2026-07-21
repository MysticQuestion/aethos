import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import type { AethosProfile, AethosReport, JournalEntry } from "../types";

export type SupabaseStoreStatus = {
  configured: boolean;
  writable: boolean;
  authenticated: boolean;
  userId?: string;
  warning?: string;
};

export function getSupabaseStoreStatus(user?: User | null): SupabaseStoreStatus {
  if (!hasSupabasePublicConfig()) {
    return {
      configured: false,
      writable: false,
      authenticated: false,
      warning:
        "Supabase public env is not configured. Local demo mode remains active."
    };
  }

  if (!user) {
    return {
      configured: true,
      writable: false,
      authenticated: false,
      warning:
        "Supabase is configured but no session is active. Sign in on /account to enable cloud persistence."
    };
  }

  return {
    configured: true,
    writable: true,
    authenticated: true,
    userId: user.id
  };
}

function clientOrThrow() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

export async function getBrowserSessionUser() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function upsertProfileRemote(profile: AethosProfile, userId: string) {
  const supabase = clientOrThrow();
  const preferredSystems = Object.entries(profile.intake.systemsEnabled)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  const { error } = await supabase.from("aethos_profiles").upsert(
    {
      id: profile.id,
      user_id: userId,
      display_name: profile.displayName,
      primary_intention: profile.intake.primaryIntention ?? null,
      preferred_systems: preferredSystems,
      profile_snapshot: profile,
      is_sample: profile.isSample,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (error) throw error;

  const intake = profile.intake;
  const birthRow = {
    profile_id: profile.id,
    user_id: userId,
    birth_date: intake.birthDate,
    birth_time: intake.birthTime ?? null,
    birth_time_known: intake.birthTimeConfidence === "exact",
    birth_location_label: intake.birthPlace
      ? [intake.birthPlace.city, intake.birthPlace.region, intake.birthPlace.country]
          .filter(Boolean)
          .join(", ")
      : null,
    latitude: intake.birthPlace?.latitude ?? null,
    longitude: intake.birthPlace?.longitude ?? null,
    timezone: intake.birthPlace?.timezone ?? null,
    original_input: intake,
    updated_at: new Date().toISOString()
  };

  const { error: intakeError } = await supabase
    .from("aethos_birth_intakes")
    .upsert(birthRow, { onConflict: "profile_id" });

  if (intakeError) throw intakeError;

  return { ok: true as const };
}

export async function loadProfileRemote(userId: string): Promise<AethosProfile | null> {
  const supabase = clientOrThrow();
  const { data, error } = await supabase
    .from("aethos_profiles")
    .select("profile_snapshot, display_name, is_sample, id, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (data.profile_snapshot && typeof data.profile_snapshot === "object") {
    return data.profile_snapshot as AethosProfile;
  }

  return null;
}

export async function saveJournalEntryRemote(entry: JournalEntry, profileId: string, userId: string) {
  const supabase = clientOrThrow();
  const { error } = await supabase.from("aethos_journal_entries").upsert(
    {
      id: entry.id,
      user_id: userId,
      profile_id: profileId,
      free_text: entry.body,
      mood_label: entry.mood,
      entry_theme: entry.theme,
      decision_context: entry.decisionContext ?? null,
      extracted_themes: entry.extractedThemes,
      tags: [entry.theme, ...entry.extractedThemes],
      created_at: entry.createdAt,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
  if (error) throw error;
  return { ok: true as const };
}

export async function loadJournalEntriesRemote(profileId: string, userId: string): Promise<JournalEntry[]> {
  const supabase = clientOrThrow();
  const { data, error } = await supabase
    .from("aethos_journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    mood: (row.mood_label as JournalEntry["mood"]) ?? "steady",
    theme: (row.entry_theme as JournalEntry["theme"]) ?? "identity",
    decisionContext: (row.decision_context as string | null) ?? undefined,
    body: (row.free_text as string) ?? "",
    extractedThemes: (row.extracted_themes as JournalEntry["extractedThemes"]) ?? []
  }));
}

export async function saveReportRemote(report: AethosReport, profileId: string, userId: string) {
  const supabase = clientOrThrow();
  const { error } = await supabase.from("aethos_reports").upsert(
    {
      id: report.id,
      user_id: userId,
      profile_id: profileId,
      report_type: report.type,
      title: report.title,
      report_markdown: report.markdown,
      report_json: report,
      responsible_use_note: report.responsibleUseNote,
      created_at: report.generatedAt,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
  if (error) throw error;
  return { ok: true as const };
}

export async function loadReportsRemote(profileId: string, userId: string): Promise<AethosReport[]> {
  const supabase = clientOrThrow();
  const { data, error } = await supabase
    .from("aethos_reports")
    .select("report_json, id, title, report_type, report_markdown, created_at")
    .eq("user_id", userId)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      if (row.report_json && typeof row.report_json === "object") {
        return row.report_json as AethosReport;
      }
      return null;
    })
    .filter((item): item is AethosReport => Boolean(item));
}

export async function syncLocalStateToRemote(input: {
  profile?: AethosProfile;
  journalEntries: JournalEntry[];
  reports: AethosReport[];
  userId: string;
}) {
  if (input.profile) {
    await upsertProfileRemote(input.profile, input.userId);
  }
  const profileId = input.profile?.id;
  if (!profileId) return { ok: true as const, synced: { journal: 0, reports: 0 } };

  for (const entry of input.journalEntries) {
    await saveJournalEntryRemote(entry, profileId, input.userId);
  }
  for (const report of input.reports) {
    await saveReportRemote(report, profileId, input.userId);
  }

  return {
    ok: true as const,
    synced: { journal: input.journalEntries.length, reports: input.reports.length }
  };
}

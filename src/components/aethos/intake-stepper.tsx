"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { USER_INTENTIONS, SYMBOLIC_SYSTEMS } from "@/lib/aethos/constants";
import { generateAethosProfile } from "@/lib/aethos/profile";
import { useActiveProfile } from "@/components/aethos/active-profile-provider";
import type { AethosBirthIntake, UserIntention } from "@/lib/aethos/types";
import type { NatalChart } from "@/lib/aethos/astrology/types";

const steps = ["Identity", "Birth data", "Focus", "Review"];
const SYSTEM_KEY_MAP = {
  western_astrology: "westernAstrology",
  numerology: "numerology",
  vedic_astrology: "vedicAstrology",
  human_design: "humanDesign",
  bazi: "bazi",
  i_ching: "iChing"
} as const;

export function IntakeStepper() {
  const router = useRouter();
  const { saveActiveProfile } = useActiveProfile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AethosBirthIntake>({
    displayName: "",
    birthDate: "",
    birthTimeConfidence: "unknown",
    fullBirthName: "",
    primaryIntention: "self_understanding",
    systemsEnabled: {
      westernAstrology: true,
      numerology: true,
      vedicAstrology: false,
      humanDesign: true,
      bazi: false,
      iChing: false
    },
    consent: {
      nonDeterministicDisclaimerAccepted: false,
      aiReflectionAllowed: false,
      journalAnalysisAllowed: false,
      practitionerSharingAllowed: false
    }
  });
  const [saved, setSaved] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function systemIsEnabled(value: string) {
    if (value === "journaling") return form.consent.journalAnalysisAllowed;
    const key = SYSTEM_KEY_MAP[value as keyof typeof SYSTEM_KEY_MAP];
    return key ? form.systemsEnabled[key] : false;
  }

  function toggleSystem(value: string) {
    if (value === "journaling") {
      setForm({ ...form, consent: { ...form.consent, journalAnalysisAllowed: !form.consent.journalAnalysisAllowed } });
      return;
    }
    const key = SYSTEM_KEY_MAP[value as keyof typeof SYSTEM_KEY_MAP];
    if (key) setForm({ ...form, systemsEnabled: { ...form.systemsEnabled, [key]: !form.systemsEnabled[key] } });
  }

  async function saveProfile() {
    if (!form.displayName.trim() || !form.birthDate || !form.consent.nonDeterministicDisclaimerAccepted) return;
    setSaving(true);
    setSyncNote(null);
    let natalChart: NatalChart | undefined;
    try {
      const birthPlace = form.birthPlace;
      const response = await fetch("/api/aethos/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: form.birthDate,
          birthTime: form.birthTime || undefined,
          birthTimeKnown: form.birthTimeConfidence === "exact" && Boolean(form.birthTime),
          birthLocationLabel: birthPlace ? [birthPlace.city, birthPlace.region, birthPlace.country].filter(Boolean).join(", ") : undefined,
          latitude: birthPlace?.latitude,
          longitude: birthPlace?.longitude,
          timezone: birthPlace?.timezone,
          houseSystem: "whole_sign",
          zodiacMode: "tropical",
          calculationMode: "demo"
        })
      });
      if (!response.ok) throw new Error("Chart calculation failed");
      natalChart = (await response.json()).natalChart as NatalChart;
    } catch {
      setSyncNote("The profile could not be calculated. Review the birth details and try again.");
      setSaving(false);
      return;
    }

    const profile = generateAethosProfile(
      {
        ...form,
        displayName: form.displayName || "Local Aethos Profile",
        birthPlace: form.birthPlace?.city ? form.birthPlace : undefined
      },
      false
    );
    const result = await saveActiveProfile(profile, natalChart);
    setSaved(true);
    setSaving(false);
    setSyncNote(result.note);
    window.setTimeout(() => router.push("/dashboard"), 700);
  }

  return (
    <section className="aethos-panel rounded-md p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Multi-step intake</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Local mode saves this profile in your browser.</p>
        </div>
        <span className="text-sm text-[var(--ink-soft)]">
          {step + 1} / {steps.length}
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--panel-muted)]">
        <div className="h-full bg-[var(--ochre)] transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-6">
        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Display name
              <input
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none"
                value={form.displayName}
                onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                placeholder="Name shown in Aethos"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Full birth name
              <input
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none"
                value={form.fullBirthName}
                onChange={(event) => setForm({ ...form, fullBirthName: event.target.value })}
                placeholder="Optional"
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Birth date
              <input
                type="date"
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none"
                value={form.birthDate}
                onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Birth time confidence
              <select
                className="min-h-11 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 outline-none"
                value={form.birthTimeConfidence}
                onChange={(event) =>
                  setForm({
                    ...form,
                    birthTimeConfidence: event.target.value as AethosBirthIntake["birthTimeConfidence"],
                    birthTime: event.target.value === "unknown" ? undefined : form.birthTime
                  })
                }
              >
                <option value="exact">Exact</option>
                <option value="approximate">Approximate</option>
                <option value="unknown">Unknown time</option>
              </select>
            </label>
            {form.birthTimeConfidence !== "unknown" ? <label className="grid gap-2 text-sm">
              Birth time
              <input type="time" required className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none" value={form.birthTime ?? ""} onChange={(event) => setForm({ ...form, birthTime: event.target.value })} />
            </label> : null}
            <label className="grid gap-2 text-sm">
              Birth city
              <input
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none"
                value={form.birthPlace?.city ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    birthPlace: { city: event.target.value, region: form.birthPlace?.region, country: form.birthPlace?.country ?? "United States" }
                  })
                }
              />
            </label>
            <label className="grid gap-2 text-sm">
              Birth region / state
              <input className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none" value={form.birthPlace?.region ?? ""} onChange={(event) => setForm({ ...form, birthPlace: { city: form.birthPlace?.city ?? "", region: event.target.value, country: form.birthPlace?.country ?? "" } })} />
            </label>
            <label className="grid gap-2 text-sm">
              Birth country
              <input
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none"
                value={form.birthPlace?.country ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    birthPlace: { city: form.birthPlace?.city ?? "", region: form.birthPlace?.region, country: event.target.value }
                  })
                }
              />
            </label>
            <label className="grid gap-2 text-sm">Birth timezone (IANA)<input placeholder="America/Los_Angeles" className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none" value={form.birthPlace?.timezone ?? ""} onChange={(event) => setForm({ ...form, birthPlace: { city: form.birthPlace?.city ?? "", region: form.birthPlace?.region, country: form.birthPlace?.country ?? "", timezone: event.target.value } })} /></label>
            <label className="grid gap-2 text-sm">Latitude<input type="number" step="any" min="-90" max="90" className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none" value={form.birthPlace?.latitude ?? ""} onChange={(event) => setForm({ ...form, birthPlace: { city: form.birthPlace?.city ?? "", region: form.birthPlace?.region, country: form.birthPlace?.country ?? "", timezone: form.birthPlace?.timezone, latitude: event.target.value === "" ? undefined : Number(event.target.value), longitude: form.birthPlace?.longitude } })} /></label>
            <label className="grid gap-2 text-sm">Longitude<input type="number" step="any" min="-180" max="180" className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3 outline-none" value={form.birthPlace?.longitude ?? ""} onChange={(event) => setForm({ ...form, birthPlace: { city: form.birthPlace?.city ?? "", region: form.birthPlace?.region, country: form.birthPlace?.country ?? "", timezone: form.birthPlace?.timezone, latitude: form.birthPlace?.latitude, longitude: event.target.value === "" ? undefined : Number(event.target.value) } })} /></label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold">Primary intention</p>
              <div className="mt-3 grid gap-2">
                {USER_INTENTIONS.map((intention) => (
                  <button
                    key={intention.value}
                    type="button"
                    onClick={() => setForm({ ...form, primaryIntention: intention.value as UserIntention })}
                    className={`rounded-md border p-3 text-left text-sm ${
                      form.primaryIntention === intention.value ? "border-[var(--ochre)] bg-[rgba(217,180,95,0.1)]" : "border-[var(--line)]"
                    }`}
                  >
                    <span className="font-semibold">{intention.label}</span>
                    <span className="mt-1 block text-[var(--ink-soft)]">{intention.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Preferred systems</p>
              <div className="mt-3 grid gap-2">
                {SYMBOLIC_SYSTEMS.map((system) => (
                  <button key={system.value} type="button" aria-pressed={systemIsEnabled(system.value)} onClick={() => toggleSystem(system.value)} className={`rounded-md border p-3 text-left text-sm ${systemIsEnabled(system.value) ? "border-[var(--ochre)] bg-[rgba(217,180,95,0.1)]" : "border-[var(--line)]"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{system.label}</span>
                      <span className="text-xs text-[var(--ink-soft)]">{system.status.replace("_", " ")}</span>
                    </div>
                    {system.status === "research_preview" ? <span className="mt-2 block text-xs leading-5 text-[var(--ink-soft)]">Preference recorded; this research system will not contribute permanent natal claims.</span> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-md border border-[var(--line)] p-5">
            <p className="text-sm font-semibold">Ready to create local profile</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Aethos will save a usable local profile, with unknown birth-time restrictions applied automatically.
            </p>
            <div className="mt-5 grid gap-3">
              <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1" checked={form.consent.nonDeterministicDisclaimerAccepted} onChange={(event) => setForm({ ...form, consent: { ...form.consent, nonDeterministicDisclaimerAccepted: event.target.checked } })} /><span><strong>Required:</strong> I understand Aethos provides symbolic interpretation and reflection—not deterministic, medical, legal, or financial advice.</span></label>
              <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1" checked={form.consent.aiReflectionAllowed} onChange={(event) => setForm({ ...form, consent: { ...form.consent, aiReflectionAllowed: event.target.checked } })} /><span>Allow AI-assisted reflective synthesis for this profile.</span></label>
              <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1" checked={form.consent.journalAnalysisAllowed} onChange={(event) => setForm({ ...form, consent: { ...form.consent, journalAnalysisAllowed: event.target.checked } })} /><span>Allow journal entries to inform pattern analysis.</span></label>
            </div>
            {saved ? (
              <div className="mt-4 grid gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--teal)]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Profile saved locally.
                </p>
                {syncNote ? <p className="text-sm leading-6 text-[var(--ink-soft)]">{syncNote}</p> : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          className="min-h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving || !form.displayName.trim() || !form.birthDate || !form.consent.nonDeterministicDisclaimerAccepted || (form.birthTimeConfidence !== "unknown" && !form.birthTime)}
            className="min-h-10 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Calculating and saving…" : "Create Active Profile"}
          </button>
        )}
      </div>
    </section>
  );
}

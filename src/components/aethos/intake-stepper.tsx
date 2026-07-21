"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { USER_INTENTIONS, SYMBOLIC_SYSTEMS } from "@/lib/aethos/constants";
import { demoIntake } from "@/lib/aethos/demo";
import { generateAethosProfile } from "@/lib/aethos/profile";
import { emptyAethosState, loadLocalAethosState, saveLocalAethosState } from "@/lib/aethos/storage";
import { mirrorProfileToCloud } from "@/lib/aethos/storage/storage-router";
import type { AethosBirthIntake, UserIntention } from "@/lib/aethos/types";

const steps = ["Identity", "Birth data", "Focus", "Review"];

export function IntakeStepper() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AethosBirthIntake>({
    ...demoIntake,
    displayName: "",
    birthDate: "1992-04-18",
    fullBirthName: "",
    primaryIntention: "self_understanding",
    systemsEnabled: {
      westernAstrology: true,
      numerology: true,
      vedicAstrology: false,
      humanDesign: true,
      bazi: false,
      iChing: false
    }
  });
  const [saved, setSaved] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  async function saveProfile() {
    const profile = generateAethosProfile(
      {
        ...form,
        displayName: form.displayName || "Local Aethos Profile",
        birthPlace: form.birthPlace?.city ? form.birthPlace : undefined
      },
      false
    );
    const previous = typeof window === "undefined" ? emptyAethosState() : loadLocalAethosState();
    saveLocalAethosState({
      ...previous,
      profile,
      updatedAt: new Date().toISOString()
    });
    setSaved(true);
    try {
      const mirror = await mirrorProfileToCloud(profile);
      setSyncNote(
        mirror.mirrored
          ? "Also mirrored to Supabase for your signed-in account."
          : "Saved locally. Cloud mirror skipped (sign in on Account when ready)."
      );
    } catch {
      setSyncNote("Saved locally. Cloud mirror failed — check Account / Supabase status.");
    }
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
                  <div key={system.value} className="rounded-md border border-[var(--line)] p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{system.label}</span>
                      <span className="text-xs text-[var(--ink-soft)]">{system.status.replace("_", " ")}</span>
                    </div>
                  </div>
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
            className="min-h-10 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12]"
          >
            Create Local Profile
          </button>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import {
  getSupabaseStoreStatus,
  syncLocalStateToRemote
} from "@/lib/aethos/storage/supabase-store";
import { loadLocalAethosState } from "@/lib/aethos/storage";
import { pullCloudStateIntoLocal } from "@/lib/aethos/storage/storage-router";

export function AccountPanel() {
  const config = getSupabaseConfigStatus();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const storeStatus = getSupabaseStoreStatus(user);

  async function sendMagicLink() {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const redirectTo = `${window.location.origin}/auth/callback?next=/account`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo }
      });
      if (error) throw error;
      setMessage("Magic link sent. Check your email to finish signing in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithPassword() {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage("Signed in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signUpWithPassword() {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const redirectTo = `${window.location.origin}/auth/callback?next=/account`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo }
      });
      if (error) throw error;
      setMessage("Account created. Confirm email if required by your Supabase project, then sign in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-up failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage("Signed out. Local demo data remains in this browser.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-out failed.");
    } finally {
      setBusy(false);
    }
  }

  async function pushLocal() {
    setBusy(true);
    setMessage(null);
    try {
      if (!user) throw new Error("Sign in first.");
      const state = loadLocalAethosState();
      const result = await syncLocalStateToRemote({
        profile: state.profile,
        journalEntries: state.journalEntries,
        reports: state.reports,
        userId: user.id
      });
      setMessage(
        state.profile
          ? `Pushed local profile, ${result.synced.journal} journal entries, and ${result.synced.reports} reports.`
          : "No local profile to push. Complete onboarding first."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Push failed.");
    } finally {
      setBusy(false);
    }
  }

  async function pullRemote() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await pullCloudStateIntoLocal();
      if (!result.pulled) {
        setMessage(result.reason);
        return;
      }
      setMessage(
        `Pulled profile ${result.profileId} (${result.journalCount} journal, ${result.reportCount} reports) into local storage.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pull failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!config.configured) {
    return (
      <section className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Account & cloud sync</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Supabase is not configured. Set <code className="text-[var(--ochre)]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-[var(--ochre)]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, apply migrations under{" "}
          <code className="text-[var(--ochre)]">supabase/</code>, then restart the dev server. Local demo mode keeps
          working without an account.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="aethos-panel rounded-md p-5">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          {user
            ? `Signed in as ${user.email ?? user.id}. Cloud writes are enabled for your profiles.`
            : "Sign in to mirror local profile, journal, and reports to Supabase. Local demo mode stays available either way."}
        </p>

        {!user ? (
          <div className="mt-5 grid gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("magic")}
                className={`min-h-9 rounded-md border px-3 text-sm ${mode === "magic" ? "border-[var(--ochre)]" : "border-[var(--line)]"}`}
              >
                Magic link
              </button>
              <button
                type="button"
                onClick={() => setMode("password")}
                className={`min-h-9 rounded-md border px-3 text-sm ${mode === "password" ? "border-[var(--ochre)]" : "border-[var(--line)]"}`}
              >
                Email & password
              </button>
            </div>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--ink-soft)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
                autoComplete="email"
              />
            </label>
            {mode === "password" ? (
              <label className="grid gap-2 text-sm">
                <span className="text-[var(--ink-soft)]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-3"
                  autoComplete="current-password"
                />
              </label>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {mode === "magic" ? (
                <button
                  type="button"
                  disabled={busy || !email}
                  onClick={sendMagicLink}
                  className="min-h-10 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12] disabled:opacity-50"
                >
                  Send magic link
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={busy || !email || !password}
                    onClick={signInWithPassword}
                    className="min-h-10 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12] disabled:opacity-50"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    disabled={busy || !email || !password}
                    onClick={signUpWithPassword}
                    className="min-h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold disabled:opacity-50"
                  >
                    Create account
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={pushLocal}
              className="min-h-10 rounded-md bg-[var(--ochre)] px-4 text-sm font-semibold text-[#090a12] disabled:opacity-50"
            >
              Push local → cloud
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={pullRemote}
              className="min-h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold disabled:opacity-50"
            >
              Pull cloud → local
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={signOut}
              className="min-h-10 rounded-md border border-[rgba(214,106,154,0.45)] px-4 text-sm font-semibold text-[var(--wine)] disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        )}

        {message ? <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{message}</p> : null}
      </div>

      <aside className="aethos-panel h-fit rounded-md p-5">
        <h2 className="text-lg font-semibold">Persistence status</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--ink-soft)]">Configured</dt>
            <dd>{storeStatus.configured ? "yes" : "no"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--ink-soft)]">Authenticated</dt>
            <dd>{storeStatus.authenticated ? "yes" : "no"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--ink-soft)]">Cloud writable</dt>
            <dd>{storeStatus.writable ? "yes" : "no"}</dd>
          </div>
        </dl>
        {storeStatus.warning ? (
          <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">{storeStatus.warning}</p>
        ) : (
          <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">
            Apply <code>supabase/migrations</code> so profile_snapshot and journal columns exist.
          </p>
        )}
      </aside>
    </section>
  );
}

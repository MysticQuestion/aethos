import type { AethosState, StorageMode } from "./types";

export const AETHOS_STORAGE_KEY = "aethos.local.state.v1";

export function getStorageMode(): StorageMode {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return "supabase";
  }
  return "local_demo";
}

export function getClientStorageMode(): StorageMode {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return "supabase";
  }
  return "local_demo";
}

export function emptyAethosState(): AethosState {
  return {
    journalEntries: [],
    reports: [],
    updatedAt: new Date().toISOString()
  };
}

export function loadLocalAethosState(): AethosState {
  if (typeof window === "undefined") return emptyAethosState();
  const raw = window.localStorage.getItem(AETHOS_STORAGE_KEY);
  if (!raw) return emptyAethosState();
  try {
    return JSON.parse(raw) as AethosState;
  } catch {
    return emptyAethosState();
  }
}

export function saveLocalAethosState(state: AethosState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    AETHOS_STORAGE_KEY,
    JSON.stringify({
      ...state,
      updatedAt: new Date().toISOString()
    })
  );
}

export function clearLocalAethosState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AETHOS_STORAGE_KEY);
}

export function getSupabaseStoreStatus() {
  return {
    configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    writable: false,
    warning:
      "Supabase persistence is schema-ready but not wired to authenticated writes in this local build. Local demo mode remains active."
  };
}

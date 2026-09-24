const CANONICAL_SUPABASE_URL = "https://kbeubcvayuvgboxzwcnj.supabase.co";
const CANONICAL_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_W2N75zkn7StF0Rr9BFbNHA_qfYkQ-kW";
const RETIRED_SUPABASE_REFS = ["dbaqdsxvrhayqhrnrrmr","bloosvdgawzjdxeoujik"];

export function getSupabasePublicEnv() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const configuredUrlIsRetired = RETIRED_SUPABASE_REFS.some((ref) => configuredUrl.includes(ref));

  const url = !configuredUrl || configuredUrlIsRetired ? CANONICAL_SUPABASE_URL : configuredUrl;
  const anonKey =
    !configuredKey || configuredUrlIsRetired ? CANONICAL_SUPABASE_PUBLISHABLE_KEY : configuredKey;

  return { url, anonKey };
}

export function hasSupabasePublicConfig() {
  const { url, anonKey } = getSupabasePublicEnv();
  return Boolean(url && anonKey);
}

export function getSupabaseConfigStatus() {
  const { url, anonKey } = getSupabasePublicEnv();
  return {
    configured: Boolean(url && anonKey),
    urlConfigured: Boolean(url),
    anonKeyConfigured: Boolean(anonKey),
  };
}

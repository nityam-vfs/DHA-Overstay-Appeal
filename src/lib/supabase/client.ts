import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "appeal-documents";

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let cachedClient: SupabaseClient | null = null;

/** Returns the browser Supabase client, or null when env vars are not configured (demo mode). */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(url!, anonKey!, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}

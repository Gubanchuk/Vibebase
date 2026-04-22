"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side singleton. Env vars bake in at build time via the
 * `NEXT_PUBLIC_` prefix.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars missing on client.");
  }
  cached = createBrowserClient(url, key);
  return cached;
}

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * SERVICE_ROLE client — bypasses RLS. ONLY import from scripts/* or
 * server-only code that explicitly needs elevated access (user creation,
 * radar sync, admin operations). Never expose to client bundle.
 */
export function getSupabaseAdmin() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin not configured — SUPABASE_SERVICE_ROLE_KEY missing."
    );
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

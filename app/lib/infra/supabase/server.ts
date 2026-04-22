import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Server-side Supabase client for Next.js App Router route handlers and
 * Server Components. Reads the cookie jar via `cookies()` and refreshes
 * the session if needed.
 */
export async function getSupabaseServer() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase not configured — NEXT_PUBLIC_SUPABASE_URL/ANON_KEY missing."
    );
  }
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Can be called from a Server Component where setting cookies
            // is not possible — safe to ignore when middleware refreshes.
          }
        },
      },
    }
  );
}

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/infra/supabase/server";
import type { AuthContext, UserId } from "./types";

/**
 * Kept only for fixtures/seed data — NOT used for auth. Any UI that
 * needs the logged-in user must call `requireAuth()` instead.
 */
export const MOCK_USER: AuthContext = {
  userId: "00000000-0000-0000-0000-000000000001" as UserId,
  email: "an.guban79@gmail.com",
  displayName: "Андрей",
};

/**
 * Server-side auth guard. Throws (via redirect) to /sign-in if no session.
 * Returns a strongly-typed `AuthContext` when authenticated.
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return {
    userId: user.id as UserId,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "User",
  };
}

/**
 * Same as `requireAuth` but returns `null` instead of redirecting.
 * Useful for route handlers that must return JSON rather than HTML.
 */
export async function tryAuth(): Promise<AuthContext | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    userId: user.id as UserId,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "User",
  };
}

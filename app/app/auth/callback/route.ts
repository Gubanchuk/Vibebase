import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/infra/supabase/server";

/**
 * OAuth / magic-link / email-confirm callback. Exchanges `code` for a
 * session, then redirects to `/dashboard` (or whatever `next` was).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}

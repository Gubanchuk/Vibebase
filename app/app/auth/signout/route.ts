import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/infra/supabase/server";

/**
 * Sign out endpoint — POST only. Ревокает Supabase session и редиректит
 * на /sign-in. Использует post-form из любой клиентской кнопки.
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  const url = new URL("/sign-in", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sign out and return the user to the landing page. POST so this can't be
 * triggered by a stray <img> tag or a CSRF GET; the customer/admin/cook
 * top-bar uses a form with method="post".
 */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

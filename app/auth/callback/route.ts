import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types/database";

function consoleRouteForRole(role: Role): string {
  return role === "admin" ? "/admin" : role === "cook" ? "/cook" : "/customer";
}

/**
 * Magic-link callback. Supabase emails contain a link with a `code` query
 * param. We exchange that code for a session, look up the user's role, and
 * redirect to the matching console.
 *
 * Also tolerates older `token_hash` + `type=magiclink` style links.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const errorParam = searchParams.get("error_description") || searchParams.get("error");

  if (errorParam) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", errorParam);
    return NextResponse.redirect(url);
  }

  const supabase = createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL("/login", origin);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "magiclink" | "email" | "signup" | "recovery" | "invite",
      token_hash: tokenHash,
    });
    if (error) {
      const url = new URL("/login", origin);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url);
    }
  } else {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  // Session established. Look up role and route accordingly.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=no_session", origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/?error=deactivated", origin));
  }

  // Respect `next` only if it's a valid same-origin path and matches the user's role.
  const target = (() => {
    if (next && next.startsWith("/")) {
      const requiredForNext = next.startsWith("/admin")
        ? "admin"
        : next.startsWith("/cook")
        ? "cook"
        : next.startsWith("/customer")
        ? "customer"
        : null;
      if (!requiredForNext || requiredForNext === profile.role) return next;
    }
    return consoleRouteForRole(profile.role as Role);
  })();

  return NextResponse.redirect(new URL(target, origin));
}

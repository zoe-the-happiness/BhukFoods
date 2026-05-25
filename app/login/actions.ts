"use server";

import { headers } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Send a Supabase Auth magic link via email. The redirect URL points at
 * /auth/callback which exchanges the OTP code for a session and routes
 * the user to their role-specific console.
 *
 * `next` is the optional path the user originally tried to reach.
 */
export async function sendMagicLink({
  email,
  next,
}: {
  email: string;
  next?: string;
}): Promise<Result> {
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const supabase = createSupabaseServerClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    headers().get("origin") ||
    "http://localhost:3000";

  const callback = new URL("/auth/callback", origin);
  if (next) callback.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callback.toString(),
      // shouldCreateUser: false — accounts are created by admin activation,
      // not by visitors. If the email doesn't exist as an auth user, the
      // request silently succeeds and no email is sent (Supabase default).
      shouldCreateUser: false,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

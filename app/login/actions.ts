"use server";

import { headers } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };
type SignInResult = { ok: true; redirect: string } | { ok: false; error: string };

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

/**
 * Direct email + password sign-in. Used by test accounts and by anyone who
 * sets a password on their auth user. Returns the role-specific landing URL
 * so the client can router.replace() to it without an extra round-trip.
 */
export async function signInWithPassword({
  email,
  password,
  next,
}: {
  email: string;
  password: string;
  next?: string;
}): Promise<SignInResult> {
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!password) return { ok: false, error: "Please enter your password." };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Sign-in failed" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { ok: false, error: "This account is not active." };
  }

  const consoleRoute =
    profile.role === "admin"
      ? "/admin"
      : profile.role === "cook"
      ? "/cook"
      : "/customer";

  // Honour `next` only if it matches the user's role.
  const safeNext = (() => {
    if (!next || !next.startsWith("/")) return null;
    if (next.startsWith("/admin") && profile.role !== "admin") return null;
    if (next.startsWith("/cook") && profile.role !== "cook") return null;
    if (next.startsWith("/customer") && profile.role !== "customer") return null;
    return next;
  })();

  return { ok: true, redirect: safeNext ?? consoleRoute };
}

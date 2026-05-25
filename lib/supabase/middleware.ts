import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import type { Role } from "@/lib/types/database";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PUBLIC_PATHS = ["/", "/login", "/join", "/auth/callback", "/auth/signout"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // static assets / Next internals — middleware matcher already excludes most
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return true;
  }
  return false;
}

function consoleRouteForRole(role: Role): string {
  return role === "admin" ? "/admin" : role === "cook" ? "/cook" : "/customer";
}

function requiredRoleForPath(pathname: string): Role | null {
  if (pathname === "/customer" || pathname.startsWith("/customer/")) return "customer";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/cook" || pathname.startsWith("/cook/")) return "cook";
  return null;
}

/**
 * Refreshes the Supabase session cookie and enforces role-based route
 * protection. Returns the response that should be sent to the client.
 *
 * - Public routes (landing, /login, /join, /auth/*) pass through.
 * - Protected routes (/customer, /admin, /cook) require an authenticated
 *   session AND a matching role; otherwise redirect to /login or to the
 *   user's own console.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Must call getUser() so the session cookie refreshes (do NOT use getSession in middleware).
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const requiredRole = requiredRoleForPath(pathname);

  if (!user) {
    if (isPublicPath(pathname)) return response;
    // Send unauthenticated users to /login (preserve where they were going).
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // User is signed in. Look up their role from the profiles table.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    // Deactivated or no profile — sign them out and send to landing.
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If a signed-in user hits /login, send them to their own console.
  if (pathname === "/login") {
    return NextResponse.redirect(new URL(consoleRouteForRole(profile.role as Role), request.url));
  }

  if (requiredRole && requiredRole !== profile.role) {
    return NextResponse.redirect(
      new URL(consoleRouteForRole(profile.role as Role), request.url),
    );
  }

  return response;
}

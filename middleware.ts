import { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/**
 * Run on every request EXCEPT static assets, Next internals, the public
 * favicon, AND any /api/* path. API routes do their own auth (Bearer
 * tokens for cron, Supabase server client for push). Letting the
 * middleware redirect them to /login would break the cron flow.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|map)$).*)"],
};

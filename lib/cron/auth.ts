import { NextRequest, NextResponse } from "next/server";

/**
 * Cron-only routes accept either:
 *   1. Authorization: Bearer <CRON_SECRET>   (pg_cron + manual ops)
 *   2. Vercel's built-in cron header         (vercel.json crons)
 */
export function authorizeCron(request: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization") ?? "";
  if (secret && provided === `Bearer ${secret}`) return null;

  if (request.headers.get("x-vercel-cron")) return null;

  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

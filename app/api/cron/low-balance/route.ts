import { NextRequest, NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron/auth";
import { sendMail } from "@/lib/email/resend";
import { renderTemplate } from "@/lib/email/render";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const UPI_NUMBER = "7595923777";

/**
 * Job D — Weekly low-balance nudge, every Monday 19:00 IST.
 * Customers under 10 days remaining get an email.
 */
export async function POST(request: NextRequest) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  const { data: customers } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "customer")
    .eq("is_active", true);

  let notified = 0;
  let failed = 0;
  const skipped: string[] = [];

  for (const c of customers ?? []) {
    const [{ data: bal }, { data: days }] = await Promise.all([
      admin.rpc("get_meal_balance", { p_user_id: c.id }),
      admin.rpc("days_remaining", { p_user_id: c.id }),
    ]);
    if (Number(days ?? 0) >= 10) {
      skipped.push(c.id);
      continue;
    }
    if (!c.email) continue;
    try {
      const tpl = await renderTemplate("low_balance", {
        full_name: c.full_name ?? "",
        meal_balance: Number(bal ?? 0),
        days_remaining: Number(days ?? 0),
        upi_id: UPI_NUMBER,
        site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhukfoods.com",
      });
      await sendMail({ to: c.email, subject: tpl.subject, text: tpl.text });
      notified++;
    } catch (err) {
      console.error("[low-balance] send failed for", c.email, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, notified, failed, skipped_active: skipped.length });
}

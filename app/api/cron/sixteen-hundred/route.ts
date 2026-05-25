import { NextRequest, NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron/auth";
import { sendMail } from "@/lib/email/resend";
import { renderTemplate } from "@/lib/email/render";
import { sendPushToAdmin, sendPushToCooks, sendPushToUsers } from "@/lib/push/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatIstDateBn, formatIstDateEn } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * Job B — 16:00 IST. The customer self-cancel cutoff has just passed for
 * tomorrow's headcount. Email every customer their tomorrow status, and
 * email the admin the headcount snapshot. Web Push hooks live in Step 10.
 */
export async function POST(request: NextRequest) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  const { data: todayResp } = await admin.rpc("ist_today");
  const today = String(todayResp);
  const tomorrow = (() => {
    const [y, m, d] = today.split("-").map(Number);
    const t = new Date(y, m - 1, d + 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();

  // Pull tomorrow's eaters + off list.
  const [{ data: eaters }, { data: offsRaw }, { data: customers }] = await Promise.all([
    admin.rpc("customers_eating_on", { p_service_date: tomorrow }),
    admin
      .from("meal_exceptions")
      .select("user_id, service_date, kind, profiles!meal_exceptions_user_id_fkey(full_name, college, workplace)")
      .eq("service_date", tomorrow)
      .not("user_id", "is", null),
    admin
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "customer")
      .eq("is_active", true),
  ]);

  const offIds = new Set((offsRaw ?? []).map((o) => o.user_id as string));

  const dateEn = formatIstDateEn(tomorrow);
  const dateBn = formatIstDateBn(tomorrow);

  // Per-customer email.
  let customerSent = 0;
  let customerFail = 0;
  for (const c of customers ?? []) {
    if (!c.email) continue;
    const isOff = offIds.has(c.id);
    const willEat = !isOff;
    const status = willEat
      ? "Yes, your meal is scheduled."
      : "No meal — you cancelled (or admin marked you off).";
    const reason = willEat ? "" : "If this is a mistake, contact 75959 23777.";

    const [{ data: bal }, { data: days }] = await Promise.all([
      admin.rpc("get_meal_balance", { p_user_id: c.id }),
      admin.rpc("days_remaining", { p_user_id: c.id }),
    ]);

    try {
      const tpl = await renderTemplate("tomorrow_customer", {
        full_name: c.full_name ?? "",
        tomorrow_date: dateEn,
        tomorrow_date_bn: dateBn,
        tomorrow_status: status,
        tomorrow_reason: reason,
        meal_balance: Number(bal ?? 0),
        days_remaining: Number(days ?? 0),
      });
      await sendMail({ to: c.email, subject: tpl.subject, text: tpl.text });
      customerSent++;
    } catch (err) {
      customerFail++;
      console.error("[16:00] tomorrow_customer send failed for", c.email, err);
    }
  }

  // Admin snapshot.
  type Eater = { full_name: string | null; college: string | null; workplace: string | null; phone: string | null };
  const eatingList = (eaters as unknown as Eater[] | null ?? [])
    .map((e, i) => `${i + 1}. ${e.full_name ?? "—"}${e.college ? ` — ${e.college}` : e.workplace ? ` — ${e.workplace}` : ""}${e.phone ? ` · ${e.phone}` : ""}`)
    .join("\n");

  type Off = { kind: string; profiles: { full_name: string | null }[] | { full_name: string | null } | null };
  const offList = (offsRaw as unknown as Off[] | null ?? [])
    .map((o, i) => {
      const fp = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
      return `${i + 1}. ${fp?.full_name ?? "—"} — ${o.kind === "customer_cancel" ? "self-cancelled" : "admin marked off"}`;
    })
    .join("\n");

  try {
    const tpl = await renderTemplate("tomorrow_admin", {
      tomorrow_date: dateEn,
      headcount: eaters?.length ?? 0,
      eating_count: eaters?.length ?? 0,
      eating_list: eatingList || "—",
      off_count: offsRaw?.length ?? 0,
      off_list: offList || "—",
    });
    await sendMail({
      to: process.env.ADMIN_EMAIL || "bhukfoods@gmail.com",
      subject: tpl.subject,
      text: tpl.text,
    });
  } catch (err) {
    console.error("[16:00] tomorrow_admin send failed:", err);
  }

  // Web Push fanout.
  const eatingIds = new Set(
    (eaters as unknown as Array<{ user_id: string }> | null ?? []).map((e) => e.user_id),
  );
  const eatingUserIds = (customers ?? []).map((c) => c.id).filter((id) => eatingIds.has(id) && !offIds.has(id));
  const offUserIds = (customers ?? []).map((c) => c.id).filter((id) => offIds.has(id));

  const pushResults = await Promise.allSettled([
    sendPushToUsers(eatingUserIds, {
      title: "Tomorrow's meal is on",
      body: `Bhuk Foods · ${dateEn}. Tap to see your calendar.`,
      url: "/customer",
      tag: `tomorrow-${tomorrow}`,
    }),
    sendPushToUsers(offUserIds, {
      title: "Tomorrow you are off",
      body: `${dateEn}: no meal. Plan extends by one day.`,
      url: "/customer",
      tag: `tomorrow-${tomorrow}`,
    }),
    sendPushToAdmin({
      title: "Tomorrow's headcount",
      body: `${eaters?.length ?? 0} eating, ${offsRaw?.length ?? 0} off. Sheet locks at 16:30 IST.`,
      url: "/admin/stats",
      tag: `tomorrow-${tomorrow}`,
    }),
    sendPushToCooks({
      title: `Cook ${eaters?.length ?? 0} for tomorrow`,
      body: dateEn,
      url: "/cook",
      tag: `tomorrow-${tomorrow}`,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    date: tomorrow,
    customer_sent: customerSent,
    customer_failed: customerFail,
    headcount: eaters?.length ?? 0,
    off_count: offsRaw?.length ?? 0,
    push: pushResults.map((r) => (r.status === "fulfilled" ? r.value : { error: String(r.reason) })),
  });
}

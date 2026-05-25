import { NextRequest, NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Job A — Daily meal charge.
 *
 * Runs 22:30 IST (after dinner). For every active customer:
 *  - skip Sunday
 *  - skip if a global exception exists for today
 *  - skip if the customer has a personal exception
 *  - skip if meal_balance < (100 + delivery_fee_per_day)
 *  - skip if a meal_charge already exists for (user_id, today) — idempotent
 *  - insert meal_charge ₹100 in meal bucket
 *  - insert delivery_charge ₹delivery_fee_per_day if non-zero
 */
export async function POST(request: NextRequest) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  const { data: todayResp } = await admin.rpc("ist_today");
  const today = String(todayResp);

  // Skip whole job on Sundays.
  const [y, m, d] = today.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  if (dow === 0) {
    return NextResponse.json({ ok: true, date: today, skipped: "sunday" });
  }

  // Skip whole job if today is a global exception.
  const { data: globalEx } = await admin
    .from("meal_exceptions")
    .select("id")
    .eq("service_date", today)
    .is("user_id", null)
    .maybeSingle();
  if (globalEx) {
    return NextResponse.json({ ok: true, date: today, skipped: "global_off" });
  }

  // Pull active customers + the ones who already have a meal_charge today
  // and the ones with a personal exception.
  const [
    { data: customers },
    { data: chargedToday },
    { data: offToday },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, delivery_fee_per_day")
      .eq("role", "customer")
      .eq("is_active", true),
    admin
      .from("ledger")
      .select("user_id")
      .eq("entry_date", today)
      .eq("type", "meal_charge"),
    admin
      .from("meal_exceptions")
      .select("user_id")
      .eq("service_date", today)
      .not("user_id", "is", null),
  ]);

  const alreadyCharged = new Set((chargedToday ?? []).map((r) => r.user_id));
  const personalOff = new Set((offToday ?? []).map((r) => r.user_id as string));

  const charged: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  const insufficient: string[] = [];

  for (const c of customers ?? []) {
    if (alreadyCharged.has(c.id)) {
      skipped.push({ id: c.id, reason: "already_charged" });
      continue;
    }
    if (personalOff.has(c.id)) {
      skipped.push({ id: c.id, reason: "personal_off" });
      continue;
    }
    const fee = c.delivery_fee_per_day ?? 0;
    const { data: bal } = await admin.rpc("get_meal_balance", { p_user_id: c.id });
    const balance = Number(bal ?? 0);
    const needed = 100 + fee;
    if (balance < needed) {
      insufficient.push(c.id);
      continue;
    }

    const inserts: Array<Record<string, unknown>> = [
      {
        user_id: c.id,
        entry_date: today,
        bucket: "meal",
        type: "meal_charge",
        amount: 100,
        note: "Auto-charge for service day",
      },
    ];
    if (fee > 0) {
      inserts.push({
        user_id: c.id,
        entry_date: today,
        bucket: "meal",
        type: "delivery_charge",
        amount: fee,
        note: "Auto delivery charge for service day",
      });
    }
    const { error } = await admin.from("ledger").insert(inserts);
    if (error) {
      skipped.push({ id: c.id, reason: `error: ${error.message}` });
      continue;
    }
    charged.push(c.id);
  }

  return NextResponse.json({
    ok: true,
    date: today,
    charged: charged.length,
    skipped_count: skipped.length,
    insufficient: insufficient.length,
    detail: { skipped, insufficient },
  });
}

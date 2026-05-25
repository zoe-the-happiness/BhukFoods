"use server";

import { revalidatePath } from "next/cache";

import { sendPushToAdmin, sendPushToAllCustomers } from "@/lib/push/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatIstDateEn } from "@/lib/time";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Cook panic button — declares the kitchen closed for today.
 * RLS allows cook role to insert cook_leave_global for service_date = ist_today().
 * Then push every customer + admin so they don't show up expecting a meal.
 */
export async function cookPanic(): Promise<Result> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Compute IST today via RPC so the server, not the cook's machine, decides.
  const { data: today, error: tErr } = await supabase.rpc("ist_today");
  if (tErr || !today) return { ok: false, error: tErr?.message ?? "ist_today failed" };

  const { error } = await supabase.from("meal_exceptions").insert({
    user_id: null,
    service_date: today,
    kind: "cook_leave_global",
    note: "Cook absent — declared from cook console",
    created_by: user.id,
  });
  if (error) {
    // Unique partial index will return 23505 if today is already global-off.
    if ((error as { code?: string }).code === "23505") {
      // Already closed for today — still re-broadcast in case earlier pushes missed.
    } else {
      return { ok: false, error: error.message };
    }
  }

  const dateEn = formatIstDateEn(today);
  await Promise.allSettled([
    sendPushToAllCustomers({
      title: "Today's meal is cancelled",
      body: `${dateEn} — the kitchen is closed today. No charge; your plan extends by one day.`,
      url: "/customer",
      tag: `global-off-${today}`,
    }),
    sendPushToAdmin({
      title: "Cook declared today off",
      body: `${dateEn}: all customers notified, no charges will run tonight.`,
      url: "/admin/closed",
      tag: `global-off-${today}`,
    }),
  ]);

  revalidatePath("/cook");
  return { ok: true };
}

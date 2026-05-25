"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Cook panic button — declares the kitchen closed for today.
 * RLS allows cook role to insert cook_leave_global for service_date = ist_today().
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
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/cook");
  return { ok: true };
}

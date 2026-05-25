"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

/** Insert a `customer_cancel` for `serviceDate`. RLS enforces the 16:00 cutoff. */
export async function cancelMeal(serviceDate: string): Promise<Result> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("meal_exceptions").insert({
    user_id: user.id,
    service_date: serviceDate,
    kind: "customer_cancel",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/customer");
  revalidatePath("/customer/ledger");
  return { ok: true };
}

/** Delete a customer_cancel row (un-cancel). Allowed only while cutoff is open. */
export async function uncancelMeal(serviceDate: string): Promise<Result> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase
    .from("meal_exceptions")
    .delete()
    .eq("user_id", user.id)
    .eq("service_date", serviceDate)
    .eq("kind", "customer_cancel");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/customer");
  return { ok: true };
}

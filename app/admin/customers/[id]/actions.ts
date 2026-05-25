"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendMail } from "@/lib/email/resend";
import { renderTemplate } from "@/lib/email/render";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { istToday } from "@/lib/time";

type Result = { ok: true } | { ok: false; error: string };

export const DAMAGE_ITEMS: Record<string, { label: string; amount: number }> = {
  small_container: { label: "Small container", amount: 25 },
  medium_container: { label: "Medium container", amount: 50 },
  lid: { label: "Container lid", amount: 50 },
  large_container: { label: "Large container", amount: 100 },
  carrier_bag: { label: "Carrier bag", amount: 75 },
  full_kit: { label: "Full tiffin kit replacement", amount: 250 },
};

async function adminGuard() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Admin only");
  return { adminId: user.id };
}

const AmountSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().int().min(1).max(100000),
  note: z.string().max(200).optional().or(z.literal("")),
});

export async function addMoney(formData: FormData): Promise<Result> {
  const parsed = AmountSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { adminId } = await adminGuard();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("ledger").insert({
    user_id: parsed.data.userId,
    bucket: "meal",
    type: "credit",
    amount: parsed.data.amount,
    note: parsed.data.note || "Cash/UPI credit",
    created_by: adminId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/customers/${parsed.data.userId}`);
  return { ok: true };
}

export async function refundMoney(formData: FormData): Promise<Result> {
  const parsed = AmountSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { adminId } = await adminGuard();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("ledger").insert({
    user_id: parsed.data.userId,
    bucket: "meal",
    type: "refund",
    amount: parsed.data.amount,
    note: parsed.data.note || "Refund issued",
    created_by: adminId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/customers/${parsed.data.userId}`);
  return { ok: true };
}

const DamageSchema = z.object({
  userId: z.string().uuid(),
  itemKey: z.string().refine((v) => v in DAMAGE_ITEMS, "Unknown damage item"),
  quantity: z.coerce.number().int().min(1).max(20),
  note: z.string().max(200).optional().or(z.literal("")),
});

export async function reportDamage(formData: FormData): Promise<Result> {
  const fileBlob = formData.get("photo");
  const parsed = DamageSchema.safeParse({
    userId: formData.get("userId"),
    itemKey: formData.get("itemKey"),
    quantity: formData.get("quantity"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { adminId } = await adminGuard();
  const admin = createSupabaseAdminClient();
  const def = DAMAGE_ITEMS[parsed.data.itemKey]!;

  let photoPath: string | null = null;
  if (fileBlob instanceof File && fileBlob.size > 0) {
    const filename = `${parsed.data.userId}/${Date.now()}-${parsed.data.itemKey}.${
      fileBlob.type === "image/png" ? "png" : fileBlob.type === "image/webp" ? "webp" : "jpg"
    }`;
    const arrayBuf = await fileBlob.arrayBuffer();
    const { error: upErr } = await admin.storage
      .from("damage-photos")
      .upload(filename, new Uint8Array(arrayBuf), {
        contentType: fileBlob.type || "image/jpeg",
        upsert: false,
      });
    if (upErr) return { ok: false, error: `photo upload: ${upErr.message}` };
    photoPath = filename;
  }

  const amount = def.amount * parsed.data.quantity;
  const { error } = await admin.from("ledger").insert({
    user_id: parsed.data.userId,
    bucket: "sd",
    type: "damage_deduction",
    amount,
    damage_item: def.label,
    damage_qty: parsed.data.quantity,
    photo_url: photoPath,
    note: parsed.data.note || null,
    created_by: adminId,
  });
  if (error) return { ok: false, error: error.message };

  // Customer notification email.
  const { data: cust } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", parsed.data.userId)
    .single();
  const { data: sd } = await admin.rpc("get_sd_balance", { p_user_id: parsed.data.userId });
  if (cust?.email) {
    try {
      const tpl = await renderTemplate("damage_notice", {
        full_name: cust.full_name ?? "",
        damage_amount: amount,
        damage_item: def.label,
        damage_qty: parsed.data.quantity,
        sd_balance: Number(sd ?? 0),
      });
      await sendMail({ to: cust.email, subject: tpl.subject, text: tpl.text });
    } catch (err) {
      console.error("[damage] notice email failed:", err);
    }
  }

  revalidatePath(`/admin/customers/${parsed.data.userId}`);
  return { ok: true };
}

const OffSchema = z.object({
  userId: z.string().uuid(),
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(200).optional().or(z.literal("")),
});

export async function markUserOff(formData: FormData): Promise<Result> {
  const parsed = OffSchema.safeParse({
    userId: formData.get("userId"),
    serviceDate: formData.get("serviceDate"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { adminId } = await adminGuard();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("meal_exceptions").upsert(
    {
      user_id: parsed.data.userId,
      service_date: parsed.data.serviceDate,
      kind: "admin_user_off",
      note: parsed.data.note || null,
      created_by: adminId,
    },
    { onConflict: "user_id,service_date" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/customers/${parsed.data.userId}`);
  return { ok: true };
}

export async function processExit(formData: FormData): Promise<Result> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, error: "Missing userId" };
  const { adminId } = await adminGuard();
  const admin = createSupabaseAdminClient();

  const { data: profile } = await admin.from("profiles").select("*").eq("id", userId).single();
  if (!profile) return { ok: false, error: "Profile missing" };
  if (!profile.is_active) return { ok: false, error: "Already exited" };

  const [{ data: mealBal }, { data: sdBal }] = await Promise.all([
    admin.rpc("get_meal_balance", { p_user_id: userId }),
    admin.rpc("get_sd_balance", { p_user_id: userId }),
  ]);
  const meal = Number(mealBal ?? 0);
  const sd = Number(sdBal ?? 0);

  const inserts: Array<Record<string, unknown>> = [];
  if (meal > 0) {
    inserts.push({
      user_id: userId,
      bucket: "meal",
      type: "refund",
      amount: meal,
      note: "Exit — meal balance returned",
      created_by: adminId,
    });
  }
  if (sd > 0) {
    inserts.push({
      user_id: userId,
      bucket: "sd",
      type: "sd_refund",
      amount: sd,
      note: "Exit — security deposit returned",
      created_by: adminId,
    });
  }
  if (inserts.length > 0) {
    const { error } = await admin.from("ledger").insert(inserts);
    if (error) return { ok: false, error: `ledger refund: ${error.message}` };
  }

  const { error: deErr } = await admin
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId);
  if (deErr) return { ok: false, error: `deactivate: ${deErr.message}` };

  // Build a small ledger summary for the email body.
  const { data: rows } = await admin
    .from("ledger")
    .select("entry_date, bucket, type, amount, balance_after, note")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const summary = (rows ?? [])
    .slice(-20)
    .map(
      (r) =>
        `  ${r.entry_date}  ${r.bucket.padEnd(4)}  ${r.type.padEnd(18)}  ₹${String(r.amount).padStart(5)}  bal ₹${r.balance_after}${r.note ? `  · ${r.note}` : ""}`,
    )
    .join("\n");

  if (profile.email) {
    try {
      const tpl = await renderTemplate("exit_statement", {
        full_name: profile.full_name ?? "",
        date: istToday(),
        refund_meal: meal,
        refund_sd: sd,
        refund_total: meal + sd,
        ledger_summary: summary,
      });
      await sendMail({ to: profile.email, subject: tpl.subject, text: tpl.text });
    } catch (err) {
      console.error("[exit] email failed:", err);
    }
  }

  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/customers");
  return { ok: true };
}

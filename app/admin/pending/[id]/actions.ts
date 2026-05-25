"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendMail } from "@/lib/email/resend";
import { renderTemplate } from "@/lib/email/render";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

const UPI_NUMBER = "7595923777";

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Admin only");
  return { user, supabase };
}

const QuoteSchema = z.object({
  pendingId: z.string().uuid(),
  deliveryFeePerDay: z.coerce.number().int().min(0).max(2000),
});

/**
 * Compute + persist a quote on the pending row, and email the customer the
 * "quote" template. Pending status moves to `quoted`.
 */
export async function generateQuote(formData: FormData): Promise<Result> {
  const parsed = QuoteSchema.safeParse({
    pendingId: formData.get("pendingId"),
    deliveryFeePerDay: formData.get("deliveryFeePerDay"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { pendingId, deliveryFeePerDay } = parsed.data;
  await requireAdmin();

  const admin = createSupabaseAdminClient();
  const { data: pending, error: pErr } = await admin
    .from("pending_subscribers")
    .select("*")
    .eq("id", pendingId)
    .single();
  if (pErr || !pending) return { ok: false, error: pErr?.message ?? "Pending row missing" };
  if (pending.status === "activated") {
    return { ok: false, error: "Customer is already activated" };
  }

  const mealTotal = 26 * 100;
  const deliveryTotal = 26 * deliveryFeePerDay;
  const sd = pending.delivery_mode === "blpga_onsite" ? 0 : 250;
  const total = mealTotal + deliveryTotal + sd;

  const upiLink = `upi://pay?pa=${UPI_NUMBER}@upi&pn=Bhuk%20Foods&am=${total}&cu=INR`;

  // Persist computed values.
  const { error: upErr } = await admin
    .from("pending_subscribers")
    .update({
      delivery_fee_per_day: deliveryFeePerDay,
      quote_total: total,
      quote_sent_at: new Date().toISOString(),
      status: "quoted",
    })
    .eq("id", pendingId);
  if (upErr) return { ok: false, error: upErr.message };

  // Email the customer.
  const { subject, text } = await renderTemplate("quote", {
    full_name: pending.full_name,
    quote_meal_total: mealTotal,
    delivery_fee_per_day: deliveryFeePerDay,
    quote_delivery_total: deliveryTotal,
    quote_sd: sd,
    quote_total: total,
    upi_id: UPI_NUMBER,
    upi_link: upiLink,
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhukfoods.com",
  });
  try {
    await sendMail({ to: pending.email, subject, text });
  } catch (err) {
    console.error("[admin/pending/quote] email send failed:", err);
    // Quote is saved either way; admin can re-send.
    return { ok: false, error: "Quote saved but email failed: " + (err as Error).message };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/pending/${pendingId}`);
  return { ok: true };
}

/**
 * Activate the customer. Creates an auth.user, inserts profile and initial
 * ledger credits, then emails a magic link via Resend so they can sign in.
 * Idempotent on email — if the auth user already exists we reuse it.
 */
export async function activateSubscriber(formData: FormData): Promise<Result> {
  const pendingId = String(formData.get("pendingId") ?? "");
  if (!pendingId) return { ok: false, error: "Missing pendingId" };
  await requireAdmin();

  const admin = createSupabaseAdminClient();
  const { data: pending, error: pErr } = await admin
    .from("pending_subscribers")
    .select("*")
    .eq("id", pendingId)
    .single();
  if (pErr || !pending) return { ok: false, error: pErr?.message ?? "Pending row missing" };
  if (pending.status === "activated") {
    return { ok: false, error: "Already activated" };
  }
  if (pending.delivery_fee_per_day == null) {
    return { ok: false, error: "Set delivery_fee_per_day first via Generate Quote" };
  }

  // 1. Create or look up the auth user.
  let userId: string;
  {
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === pending.email.toLowerCase(),
    );
    if (existing) {
      userId = existing.id;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: pending.email,
        email_confirm: true,
      });
      if (error || !data.user) return { ok: false, error: error?.message ?? "createUser failed" };
      userId = data.user.id;
    }
  }

  // 2. Upsert the profile (merge-duplicates on id).
  const profileRow = {
    id: userId,
    full_name: pending.full_name,
    display_name: pending.full_name,
    email: pending.email,
    phone: pending.phone,
    whatsapp: pending.whatsapp,
    role: "customer" as const,
    is_active: true,
    is_student: pending.is_student,
    college: pending.college,
    year_of_study: pending.year_of_study,
    profession: pending.profession,
    workplace: pending.workplace,
    delivery_mode: pending.delivery_mode,
    delivery_fee_per_day: pending.delivery_fee_per_day,
    google_maps_url: pending.google_maps_url,
    delivery_address: pending.delivery_address,
    landmark: pending.landmark,
    parent_name: pending.parent_name,
    parent_phone: pending.parent_phone,
    food_preference: pending.food_preference,
    allergies: pending.allergies,
    start_date: pending.start_date,
  };
  const { error: upErr } = await admin
    .from("profiles")
    .upsert(profileRow, { onConflict: "id" });
  if (upErr) return { ok: false, error: `profile upsert: ${upErr.message}` };

  // 3. Initial ledger credits (idempotent: skip if a `credit` already exists).
  const { data: existingCredit } = await admin
    .from("ledger")
    .select("id")
    .eq("user_id", userId)
    .eq("bucket", "meal")
    .eq("type", "credit")
    .limit(1)
    .maybeSingle();

  if (!existingCredit) {
    const mealCredit = 26 * 100 + 26 * (pending.delivery_fee_per_day ?? 0);
    const inserts: Array<Record<string, unknown>> = [
      {
        user_id: userId,
        bucket: "meal",
        type: "credit",
        amount: mealCredit,
        note: `Activation credit — month 1 (26 meals + ${26 * (pending.delivery_fee_per_day ?? 0)} delivery)`,
      },
    ];
    if (pending.delivery_mode !== "blpga_onsite") {
      inserts.push({
        user_id: userId,
        bucket: "sd",
        type: "sd_deposit",
        amount: 250,
        note: "Security deposit — tiffin containers + carrier bag",
      });
    }
    const { error: ledErr } = await admin.from("ledger").insert(inserts);
    if (ledErr) return { ok: false, error: `ledger insert: ${ledErr.message}` };
  }

  // 4. Mark pending as activated.
  await admin
    .from("pending_subscribers")
    .update({ status: "activated", activated_user_id: userId })
    .eq("id", pendingId);

  // 5. Email a magic link via Resend with our branded template.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhukfoods.com";
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: pending.email,
    options: { redirectTo: `${siteUrl}/auth/callback` },
  });
  if (linkErr || !link?.properties?.action_link) {
    console.error("[activate] generateLink failed:", linkErr);
    // Activation is durable — but the admin will need to resend manually.
    revalidatePath("/admin");
    revalidatePath(`/admin/pending/${pendingId}`);
    return { ok: false, error: "Activated, but failed to email magic link: " + (linkErr?.message ?? "unknown") };
  }

  const { subject, text } = await renderTemplate("magic_link", {
    full_name: pending.full_name,
    magic_link_url: link.properties.action_link,
    site_url: siteUrl,
  });
  try {
    await sendMail({ to: pending.email, subject, text });
  } catch (err) {
    console.error("[activate] magic link email failed:", err);
    revalidatePath("/admin");
    revalidatePath(`/admin/pending/${pendingId}`);
    return { ok: false, error: "Activated, but magic-link email failed: " + (err as Error).message };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/pending/${pendingId}`);
  return { ok: true };
}

export async function rejectPending(formData: FormData): Promise<Result> {
  const pendingId = String(formData.get("pendingId") ?? "");
  if (!pendingId) return { ok: false, error: "Missing pendingId" };
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("pending_subscribers")
    .update({ status: "rejected" })
    .eq("id", pendingId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath(`/admin/pending/${pendingId}`);
  return { ok: true };
}

"use server";

import { z } from "zod";

import { sendMail } from "@/lib/email/resend";
import { renderTemplate } from "@/lib/email/render";
import { deliveryBlock, deliveryLabel, studentBlock } from "@/lib/email/blocks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Simplified schema (2026-05-25):
 * - Student question is optional. College + year of study are kept but
 *   optional (so a student can leave them blank).
 * - Profession + workplace fields removed entirely.
 * - Parent / guardian fields removed.
 * - Food preference removed.
 * - Delivery address required for both self-pickup AND home-delivery
 *   (anyone not living at BLPGA needs to give us an address).
 */
const Schema = z
  .object({
    is_student: z.enum(["yes", "no"]).optional().or(z.literal("")),
    college: z.string().max(120).optional().or(z.literal("")),
    year_of_study: z.string().max(40).optional().or(z.literal("")),

    full_name: z.string().min(2).max(120),
    phone: z.string().min(7).max(20),
    email: z.string().email().max(200),
    whatsapp: z.string().max(20).optional().or(z.literal("")),

    delivery_mode: z.enum(["blpga_onsite", "self_pickup", "home_delivery"]),
    google_maps_url: z.string().url().optional().or(z.literal("")),

    delivery_address: z.string().max(500).optional().or(z.literal("")),
    landmark: z.string().max(200).optional().or(z.literal("")),

    allergies: z.string().max(500).optional().or(z.literal("")),

    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),

    agree: z.literal("on"),
  })
  .superRefine((v, ctx) => {
    if (v.delivery_mode === "home_delivery") {
      if (!v.google_maps_url) {
        ctx.addIssue({ code: "custom", path: ["google_maps_url"], message: "Maps URL required for home delivery" });
      }
      if (!v.delivery_address) {
        ctx.addIssue({ code: "custom", path: ["delivery_address"], message: "Address required for home delivery" });
      }
    }
    if (v.delivery_mode === "self_pickup" && !v.delivery_address) {
      ctx.addIssue({
        code: "custom",
        path: ["delivery_address"],
        message: "Where do you live? We need this in case we have to find you in an emergency.",
      });
    }
  });

type Result = { ok: true; pendingId: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitJoin(formData: FormData): Promise<Result> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_";
      fieldErrors[path] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const v = parsed.data;

  const supabase = createSupabaseAdminClient();
  const isStudent =
    v.is_student === "yes" ? true : v.is_student === "no" ? false : null;

  const insertRow = {
    full_name: v.full_name.trim(),
    phone: v.phone.trim(),
    email: v.email.trim().toLowerCase(),
    whatsapp: v.whatsapp || v.phone,
    is_student: isStudent,
    college: isStudent ? v.college?.trim() || null : null,
    year_of_study: isStudent ? v.year_of_study?.trim() || null : null,
    profession: null,
    workplace: null,
    delivery_mode: v.delivery_mode,
    google_maps_url: v.google_maps_url || null,
    delivery_address: v.delivery_address?.trim() || null,
    landmark: v.landmark?.trim() || null,
    parent_name: null,
    parent_phone: null,
    food_preference: null,
    allergies: v.allergies?.trim() || null,
    start_date: v.start_date || null,
    status: "pending" as const,
  };

  const { data: row, error } = await supabase
    .from("pending_subscribers")
    .insert(insertRow)
    .select("id")
    .single();

  if (error || !row) {
    return { ok: false, error: error?.message ?? "Failed to record subscription request." };
  }

  // Merge data shared by both the customer copy and the admin notice.
  const sharedTags = {
    full_name: insertRow.full_name,
    phone: insertRow.phone,
    email: insertRow.email,
    whatsapp: insertRow.whatsapp,
    student_block: studentBlock(insertRow),
    delivery_mode_label: deliveryLabel(insertRow.delivery_mode),
    delivery_block: deliveryBlock(insertRow),
    delivery_address: insertRow.delivery_address ?? "",
    landmark: insertRow.landmark ?? "",
    maps_url: insertRow.google_maps_url ?? "",
    food_preference: "",
    allergies: insertRow.allergies ?? "—",
    start_date: insertRow.start_date ?? "Not specified",
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhukfoods.com",
    pending_id: row.id,
  };

  try {
    const [forCustomer, forAdmin] = await Promise.all([
      renderTemplate("form_copy", sharedTags),
      renderTemplate("admin_new_subscriber", sharedTags),
    ]);
    await Promise.all([
      sendMail({ to: insertRow.email, subject: forCustomer.subject, text: forCustomer.text }),
      sendMail({
        to: process.env.ADMIN_EMAIL || "bhukfoods@gmail.com",
        subject: forAdmin.subject,
        text: forAdmin.text,
      }),
    ]);
  } catch (err) {
    console.error("[join] email send failed", err);
    return { ok: true, pendingId: row.id };
  }

  return { ok: true, pendingId: row.id };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Schema = z.object({
  key: z.string().min(1),
  subject: z.string().min(1).max(300),
  body_text: z.string().min(1).max(10000),
});

type Result = { ok: true } | { ok: false; error: string };

export async function saveTemplate(formData: FormData): Promise<Result> {
  const parsed = Schema.safeParse({
    key: formData.get("key"),
    subject: formData.get("subject"),
    body_text: formData.get("body_text"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { ok: false, error: "Admin only" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("email_templates")
    .update({
      subject: parsed.data.subject,
      body_text: parsed.data.body_text,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("key", parsed.data.key);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${parsed.data.key}`);
  return { ok: true };
}

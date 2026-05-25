import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EmailTemplateKey } from "@/lib/types/database";

/**
 * Loads an email template by key from public.email_templates and substitutes
 * `{{tag}}` placeholders. Unknown tags render as empty strings so missing
 * data never leaks placeholders into the body.
 *
 * Conditional sections (e.g. `{{student_block}}`) are pre-computed by the
 * caller and supplied as a single string in `data`.
 */
export async function renderTemplate(
  key: EmailTemplateKey,
  data: Record<string, string | number | null | undefined>,
): Promise<{ subject: string; text: string }> {
  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("email_templates")
    .select("subject, body_text")
    .eq("key", key)
    .single();
  if (error || !row) {
    throw new Error(`email template "${key}" not found: ${error?.message ?? "no row"}`);
  }
  return {
    subject: merge(row.subject, data),
    text: merge(row.body_text, data),
  };
}

function merge(template: string, data: Record<string, string | number | null | undefined>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    const v = data[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";

import { TemplateEditor } from "./template-editor";
import type { EmailTemplateKey } from "@/lib/types/database";

export const dynamic = "force-dynamic";

const VALID_KEYS: EmailTemplateKey[] = [
  "magic_link",
  "form_copy",
  "admin_new_subscriber",
  "quote",
  "tomorrow_customer",
  "tomorrow_admin",
  "low_balance",
  "cook_sheet_admin",
  "exit_statement",
  "damage_notice",
];

export default async function TemplateEditorPage({ params }: { params: { key: string } }) {
  if (!(VALID_KEYS as readonly string[]).includes(params.key)) {
    redirect("/admin/templates");
  }
  const { supabase } = await requireRole("admin", `/admin/templates/${params.key}`);
  const { data: row } = await supabase
    .from("email_templates")
    .select("*")
    .eq("key", params.key)
    .single();
  if (!row) redirect("/admin/templates");

  return (
    <div className="px-[14px] mt-[6px]">
      <Link
        href="/admin/templates"
        className="text-bhuk-terra text-[12px] font-bold flex items-center gap-1 no-underline"
      >
        <ArrowLeft size={13} /> Back to templates
      </Link>
      <TemplateEditor template={row} />
    </div>
  );
}

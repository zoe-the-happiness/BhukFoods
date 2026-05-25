import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";
import { formatIstDateEn } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Email templates" };

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  magic_link: "Sent when a customer requests a login link.",
  form_copy: "Copy of /join form, mailed back to the subscriber on submit.",
  admin_new_subscriber: "Notification to ADMIN_EMAIL when /join is submitted.",
  quote: "Quote with UPI link, sent when admin generates a quote.",
  tomorrow_customer: "Daily 16:00 IST notice to each customer about tomorrow.",
  tomorrow_admin: "Daily 16:00 IST headcount snapshot to admin.",
  low_balance: "Weekly Mon 19:00 IST nudge to customers under 10 days.",
  cook_sheet_admin: "16:30 IST cook sheet PDF attached, sent to admin + printer.",
  exit_statement: "Final ledger summary sent when admin processes exit.",
  damage_notice: "Sent when a damage_deduction is posted.",
};

export default async function AdminTemplatesList() {
  const { supabase } = await requireRole("admin", "/admin/templates");
  const { data: rows } = await supabase
    .from("email_templates")
    .select("id, key, subject, updated_at")
    .order("key");

  return (
    <div className="px-[14px] mt-[6px]">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Email templates</div>
      <div className="text-[11.5px] text-bhuk-ink2">
        Edit subject + body. Use {"{{tag}}"} placeholders. Changes apply to the next send.
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {(rows ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/admin/templates/${r.key}`}
            className="bg-white border border-bhuk-line rounded-[13px] px-[14px] py-[12px] flex items-center gap-3 no-underline"
          >
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[13px] text-bhuk-ink">{r.key}</div>
              <div className="text-[11px] text-bhuk-off-ink mt-[2px] truncate">
                {TEMPLATE_DESCRIPTIONS[r.key] ?? "—"}
              </div>
              <div className="text-[10px] text-bhuk-off-ink mt-[2px]">
                Subject: {r.subject}
              </div>
              <div className="text-[9.5px] text-bhuk-off-ink mt-[2px]">
                Updated {formatIstDateEn(r.updated_at)}
              </div>
            </div>
            <ChevronRight size={16} className="text-bhuk-off-ink" />
          </Link>
        ))}
      </div>
    </div>
  );
}

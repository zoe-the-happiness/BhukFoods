"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import type { EmailTemplate } from "@/lib/types/database";

import { saveTemplate } from "./actions";

/**
 * Sample merge data used in the preview pane so admins can see the rendered
 * output without leaving the editor. Keys NOT in this map render blank.
 */
const SAMPLE: Record<string, string> = {
  full_name: "Ritesh Roy",
  phone: "98765 43210",
  whatsapp: "98765 43210",
  email: "ritesh@example.com",
  student_block: "College: NIT Agarpara\nYear: 2nd",
  delivery_mode_label: "Home delivery",
  delivery_block: "Address: 43, Matangini Hazra Pally\nLandmark: Near BSS Road",
  delivery_address: "43, Matangini Hazra Pally",
  landmark: "Near BSS Road",
  maps_url: "https://maps.app.goo.gl/example",
  food_preference: "nonveg",
  allergies: "Lactose-sensitive",
  start_date: "2026-06-01",
  site_url: "https://www.bhukfoods.com",
  pending_id: "00000000-0000-0000-0000-000000000000",
  magic_link_url: "https://www.bhukfoods.com/auth/callback?code=…",
  quote_meal_total: "2600",
  delivery_fee_per_day: "30",
  quote_delivery_total: "780",
  quote_sd: "250",
  quote_total: "3630",
  upi_id: "7595923777",
  upi_link: "upi://pay?pa=7595923777@upi&pn=Bhuk%20Foods&am=3630&cu=INR",
  tomorrow_date: "Tue, 26 May 2026",
  tomorrow_date_bn: "মঙ্গল, ২৬ মে ২০২৬",
  tomorrow_status: "Yes, your meal is scheduled.",
  tomorrow_reason: "",
  meal_balance: "1800",
  days_remaining: "18",
  headcount: "23",
  eating_count: "23",
  eating_list: "1. Ritesh Roy — NIT Agarpara\n2. Priyanka Sen — JIS",
  off_count: "2",
  off_list: "1. Amit Das — travelling home",
  damage_amount: "50",
  damage_item: "Container lid",
  damage_qty: "1",
  sd_balance: "200",
  refund_meal: "400",
  refund_sd: "250",
  refund_total: "650",
  ledger_summary: "  2026-06-01  meal  credit            ₹2600  bal ₹2600",
  date: "2026-06-15",
};

function merge(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => SAMPLE[k] ?? `«${k}»`);
}

export function TemplateEditor({ template }: { template: EmailTemplate }) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body_text);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSave() {
    setError(null);
    setInfo(null);
    const fd = new FormData();
    fd.set("key", template.key);
    fd.set("subject", subject);
    fd.set("body_text", body);
    startTransition(async () => {
      const r = await saveTemplate(fd);
      if (r.ok) setInfo("Saved. Future sends will use this version.");
      else setError(r.error);
    });
  }

  return (
    <div className="mt-3 space-y-4">
      <div>
        <div className="font-serif font-bold text-[18px] text-bhuk-maroon">
          {template.key}
        </div>
        <div className="text-[11px] text-bhuk-off-ink mt-1">
          Merge tags: {template.merge_tags.length === 0 ? "—" : template.merge_tags.join(", ")}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-[12px] font-bold text-bhuk-ink2 mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-[12px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[13.5px] bg-white outline-none"
          />
          <label className="block text-[12px] font-bold text-bhuk-ink2 mb-1 mt-3">
            Body (plain text)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={18}
            className="w-full px-[12px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[12.5px] bg-white outline-none font-mono"
          />
        </div>
        <div>
          <div className="text-[12px] font-bold text-bhuk-ink2 mb-1">Live preview (sample data)</div>
          <div className="bg-bhuk-cream rounded-[10px] border border-bhuk-line p-3 text-[12.5px] text-bhuk-ink whitespace-pre-wrap font-mono">
            <div className="font-extrabold mb-1">{merge(subject)}</div>
            <div className="border-t border-bhuk-line my-2" />
            {merge(body)}
          </div>
          <div className="text-[10.5px] text-bhuk-off-ink mt-2 leading-relaxed">
            Tags not in the sample map render as «tag» so you can see unbound
            variables. Real sends substitute live data.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="px-[16px] py-[10px] bg-bhuk-maroon text-white font-extrabold text-[13px] rounded-[10px] cursor-pointer disabled:opacity-60 flex items-center gap-2"
        >
          <Save size={14} /> {isPending ? "Saving…" : "Save changes"}
        </button>
        {info ? <span className="text-[12px] text-bhuk-green-ink">{info}</span> : null}
        {error ? <span className="text-[12px] text-bhuk-terra">{error}</span> : null}
      </div>
    </div>
  );
}

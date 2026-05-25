import Link from "next/link";
import { ChevronRight, CheckCircle2, Inbox } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";
import { formatIstDateEn } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pending subscribers" };

const STATUS_LABEL: Record<string, string> = {
  pending: "New",
  quoted: "Quote sent",
  activated: "Activated",
  rejected: "Rejected",
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-bhuk-amber-bg text-bhuk-amber-ink",
  quoted: "bg-bhuk-green-bg text-bhuk-green-ink",
  activated: "bg-bhuk-green-bg text-bhuk-green-ink",
  rejected: "bg-bhuk-off text-bhuk-off-ink",
};

export default async function AdminPendingList() {
  const { supabase } = await requireRole("admin", "/admin");
  const { data: rows } = await supabase
    .from("pending_subscribers")
    .select("id, full_name, email, phone, delivery_mode, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="px-[14px] mt-[6px]">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">
        Pending subscribers
      </div>
      <div className="text-[11.5px] text-bhuk-ink2">
        Form submissions awaiting your quote and activation.
      </div>

      {(rows ?? []).length === 0 ? (
        <div className="mt-6 bg-white border border-bhuk-line rounded-card p-6 text-center">
          <Inbox className="mx-auto text-bhuk-off-ink mb-2" size={28} />
          <div className="text-[13px] text-bhuk-ink2">No subscription requests yet.</div>
          <div className="text-[11px] text-bhuk-off-ink mt-1">
            They will appear here as soon as someone submits at /join.
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {rows!.map((r) => (
            <Link
              key={r.id}
              href={`/admin/pending/${r.id}`}
              className="bg-white border border-bhuk-line rounded-[13px] px-[14px] py-[12px] flex items-center gap-3 no-underline"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-extrabold text-[13px] text-bhuk-ink truncate">
                    {r.full_name}
                  </span>
                  <span
                    className={`text-[9.5px] font-extrabold px-[6px] py-[2px] rounded-full ${
                      STATUS_TONE[r.status] ?? STATUS_TONE.pending
                    }`}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
                <div className="text-[11.5px] text-bhuk-off-ink mt-[2px] truncate">
                  {r.phone} · {r.email}
                </div>
                <div className="text-[10.5px] text-bhuk-off-ink mt-[1px]">
                  {formatIstDateEn(r.created_at)} · {labelFor(r.delivery_mode)}
                </div>
              </div>
              {r.status === "activated" ? (
                <CheckCircle2 size={16} className="text-bhuk-green" />
              ) : (
                <ChevronRight size={16} className="text-bhuk-off-ink" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function labelFor(mode: string): string {
  return (
    {
      blpga_onsite: "BLPGA on-site",
      self_pickup: "Self-pickup",
      home_delivery: "Home delivery",
    } as Record<string, string>
  )[mode] ?? mode;
}

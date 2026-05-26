import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";
import { formatIstDateEn } from "@/lib/time";

import { PendingActions } from "./pending-actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pending subscriber" };

const DELIVERY_LABEL: Record<string, string> = {
  blpga_onsite: "Living at BLPGA",
  self_pickup: "Self-pickup at kitchen",
  home_delivery: "Home delivery",
};

export default async function PendingDetail({ params }: { params: { id: string } }) {
  const { supabase } = await requireRole("admin", `/admin/pending/${params.id}`);
  const { data: p } = await supabase
    .from("pending_subscribers")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!p) redirect("/admin");

  return (
    <div className="px-[14px] mt-[6px]">
      <Link
        href="/admin"
        className="text-bhuk-terra text-[12px] font-bold flex items-center gap-1 no-underline"
      >
        <ArrowLeft size={13} /> Back to pending
      </Link>

      <div className="mt-3 bg-white border border-bhuk-line rounded-[14px] p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="font-serif font-bold text-[18px] text-bhuk-maroon truncate">
            {p.full_name}
          </div>
          <span
            className={`text-[10px] font-extrabold px-[8px] py-[3px] rounded-full ${
              p.status === "activated"
                ? "bg-bhuk-green-bg text-bhuk-green-ink"
                : p.status === "quoted"
                ? "bg-bhuk-amber-bg text-bhuk-amber-ink"
                : p.status === "rejected"
                ? "bg-bhuk-off text-bhuk-off-ink"
                : "bg-bhuk-cream text-bhuk-maroon"
            }`}
          >
            {p.status.toUpperCase()}
          </span>
        </div>
        <div className="text-[12px] text-bhuk-ink2 mt-1">
          Submitted {formatIstDateEn(p.created_at)}
        </div>

        <div className="mt-4 grid gap-2 text-[12.5px]">
          <Row label="Phone" value={p.phone} />
          <Row label="WhatsApp" value={p.whatsapp ?? "—"} />
          <Row label="Email" value={p.email} />
          {p.is_student ? (
            <>
              <Row label="College" value={p.college ?? "—"} />
              <Row label="Year" value={p.year_of_study ?? "—"} />
            </>
          ) : (
            <>
              <Row label="Profession" value={p.profession ?? "—"} />
              <Row label="Workplace" value={p.workplace ?? "—"} />
            </>
          )}
          <Row label="Delivery" value={DELIVERY_LABEL[p.delivery_mode] ?? p.delivery_mode} />
          {p.delivery_mode === "home_delivery" ? (
            <>
              {p.google_maps_url ? (
                <div className="flex justify-between items-start gap-3">
                  <span className="text-bhuk-off-ink font-semibold">Maps</span>
                  <a
                    href={p.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-bhuk-terra font-bold flex items-center gap-1 text-right max-w-[60%] truncate"
                  >
                    <MapPin size={12} /> Open in Maps
                  </a>
                </div>
              ) : null}
              <Row label="Address" value={p.delivery_address ?? "—"} multiline />
              {p.landmark ? <Row label="Landmark" value={p.landmark} /> : null}
            </>
          ) : null}
          {p.parent_name || p.parent_phone ? (
            <Row
              label="Parent / guardian"
              value={`${p.parent_name ?? "—"}${p.parent_phone ? ` (${p.parent_phone})` : ""}`}
            />
          ) : null}
          <Row label="Food preference" value={p.food_preference ?? "—"} />
          {p.allergies ? <Row label="Allergies / notes" value={p.allergies} multiline /> : null}
          {p.start_date ? <Row label="Preferred start" value={formatIstDateEn(p.start_date)} /> : null}
        </div>
      </div>

      <PendingActions
        pendingId={p.id}
        initialFee={p.delivery_fee_per_day}
        status={p.status}
        isBlpga={p.delivery_mode === "blpga_onsite"}
      />
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div
      className={`flex ${
        multiline ? "flex-col gap-1" : "justify-between gap-3"
      } items-${multiline ? "start" : "center"}`}
    >
      <span className="text-bhuk-off-ink font-semibold">{label}</span>
      <span className={`text-bhuk-ink ${multiline ? "" : "text-right max-w-[60%]"}`}>
        {value}
      </span>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";
import { formatIstDateEn } from "@/lib/time";
import type { LedgerRow, Profile } from "@/lib/types/database";

import { CustomerActions } from "./customer-actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Customer" };

const TYPE_LABEL: Record<string, string> = {
  credit: "Credit",
  meal_charge: "Meal",
  delivery_charge: "Delivery",
  refund: "Refund",
  adjustment: "Adjustment",
  sd_deposit: "Deposit",
  damage_deduction: "Damage",
  sd_refund: "Deposit returned",
};

const TYPE_COLOR: Record<string, string> = {
  credit: "text-bhuk-green",
  meal_charge: "text-bhuk-terra",
  delivery_charge: "text-bhuk-terra",
  refund: "text-bhuk-amber",
  adjustment: "text-bhuk-off-ink",
  sd_deposit: "text-bhuk-green",
  damage_deduction: "text-bhuk-terra",
  sd_refund: "text-bhuk-amber",
};

const TYPE_SIGN: Record<string, string> = {
  credit: "+",
  meal_charge: "−",
  delivery_charge: "−",
  refund: "−",
  adjustment: "+",
  sd_deposit: "+",
  damage_deduction: "−",
  sd_refund: "−",
};

export default async function AdminCustomerDetail({ params }: { params: { id: string } }) {
  const { supabase } = await requireRole("admin", `/admin/customers/${params.id}`);
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single<Profile>();
  if (!profile || profile.role !== "customer") redirect("/admin/customers");

  const [
    { data: mealBal },
    { data: sdBal },
    { data: daysRem },
    { data: ledger },
  ] = await Promise.all([
    supabase.rpc("get_meal_balance", { p_user_id: profile.id }),
    supabase.rpc("get_sd_balance", { p_user_id: profile.id }),
    supabase.rpc("days_remaining", { p_user_id: profile.id }),
    supabase
      .from("ledger")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  return (
    <div className="px-[14px] mt-[6px]">
      <Link
        href="/admin/customers"
        className="text-bhuk-terra text-[12px] font-bold flex items-center gap-1 no-underline"
      >
        <ArrowLeft size={13} /> Back to customers
      </Link>

      <div className="mt-3 bg-white border border-bhuk-line rounded-[14px] p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-[42px] h-[42px] rounded-[11px] flex items-center justify-center ${
              profile.is_active ? "bg-bhuk-green-bg" : "bg-bhuk-off"
            }`}
          >
            <User
              size={20}
              className={profile.is_active ? "text-bhuk-green-ink" : "text-bhuk-off-ink"}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-[15px] text-bhuk-ink truncate">
              {profile.full_name}
              {!profile.is_active ? (
                <span className="ml-2 text-[10px] font-bold text-bhuk-off-ink uppercase">
                  Inactive
                </span>
              ) : null}
            </div>
            <div className="text-[11.5px] text-bhuk-off-ink truncate">
              {profile.email}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Tile label="Meal days" value={String(Number(daysRem ?? 0))} highlight />
          <Tile label="Meal balance" value={`₹${Number(mealBal ?? 0)}`} highlight />
          <Tile label="SD balance" value={`₹${Number(sdBal ?? 0)}`} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
          <Row label="Phone" value={profile.phone ?? "—"} />
          <Row label="WhatsApp" value={profile.whatsapp ?? "—"} />
          {profile.is_student ? (
            <>
              <Row label="College" value={profile.college ?? "—"} />
              <Row label="Year" value={profile.year_of_study ?? "—"} />
            </>
          ) : (
            <>
              <Row label="Profession" value={profile.profession ?? "—"} />
              <Row label="Workplace" value={profile.workplace ?? "—"} />
            </>
          )}
          <Row
            label="Delivery"
            value={
              ({
                blpga_onsite: "BLPGA on-site",
                self_pickup: "Self-pickup",
                home_delivery: "Home delivery",
              } as Record<string, string>)[profile.delivery_mode ?? ""] ?? "—"
            }
          />
          <Row label="Fee / day" value={`₹${profile.delivery_fee_per_day}`} />
        </div>
        {profile.delivery_address ? (
          <Row label="Address" value={profile.delivery_address} multiline />
        ) : null}
      </div>

      <CustomerActions userId={profile.id} isActive={profile.is_active} />

      <div className="mt-4 bg-white border border-bhuk-line rounded-[14px]">
        <div className="px-4 pt-3 pb-1 font-serif font-bold text-[15px] text-bhuk-maroon">
          Full ledger
        </div>
        {(ledger as LedgerRow[] | null ?? []).map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center gap-2 px-4 py-[10px] ${
              i > 0 ? "border-t border-bhuk-off" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-[12px] text-bhuk-ink">
                  {r.entry_date}
                </span>
                <span className="text-[10px] uppercase font-bold text-bhuk-off-ink">
                  {r.bucket}
                </span>
                <span className={`text-[10px] font-bold ${TYPE_COLOR[r.type] ?? ""}`}>
                  {TYPE_LABEL[r.type] ?? r.type}
                </span>
              </div>
              {r.note ? (
                <div className="text-[10.5px] text-bhuk-off-ink truncate mt-[1px]">
                  {r.note}
                  {r.damage_item
                    ? ` · ${r.damage_item}${r.damage_qty ? ` × ${r.damage_qty}` : ""}`
                    : ""}
                </div>
              ) : null}
            </div>
            <div className="text-right">
              <div
                className={`font-serif font-bold text-[13px] ${TYPE_COLOR[r.type] ?? ""}`}
              >
                {TYPE_SIGN[r.type] ?? ""}₹{r.amount}
              </div>
              <div className="text-[9.5px] text-bhuk-off-ink">
                bal ₹{r.balance_after}
              </div>
            </div>
          </div>
        ))}
        {((ledger as LedgerRow[] | null) ?? []).length === 0 ? (
          <div className="p-4 text-[12px] text-bhuk-off-ink text-center">
            No entries yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-bhuk-cream rounded-[11px] p-[10px]">
      <div className="text-[9.5px] text-bhuk-off-ink font-bold uppercase">{label}</div>
      <div
        className={`font-serif font-bold mt-[2px] ${
          highlight ? "text-bhuk-maroon text-[19px]" : "text-bhuk-ink text-[15px]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div
      className={`flex ${
        multiline ? "flex-col gap-1 col-span-2 mt-2" : "justify-between gap-2"
      } items-${multiline ? "start" : "center"} text-[12px]`}
    >
      <span className="text-bhuk-off-ink font-semibold">{label}</span>
      <span className={`text-bhuk-ink ${multiline ? "" : "text-right truncate max-w-[60%]"}`}>
        {value}
      </span>
    </div>
  );
}

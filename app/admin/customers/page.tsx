import Link from "next/link";
import { Search, User } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

type Listing = {
  id: string;
  full_name: string | null;
  phone: string | null;
  college: string | null;
  workplace: string | null;
  is_active: boolean;
  meal_balance: number;
  days_remaining: number;
};

export default async function AdminCustomersList({
  searchParams,
}: {
  searchParams: { q?: string; inactive?: string };
}) {
  const { supabase } = await requireRole("admin", "/admin/customers");
  const q = (searchParams.q ?? "").trim();
  const showInactive = searchParams.inactive === "1";

  let qb = supabase
    .from("profiles")
    .select("id, full_name, phone, college, workplace, is_active, delivery_fee_per_day")
    .eq("role", "customer")
    .order("full_name");
  if (!showInactive) qb = qb.eq("is_active", true);
  if (q) {
    qb = qb.or(
      `full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,college.ilike.%${q}%,workplace.ilike.%${q}%`,
    );
  }
  const { data: profiles } = await qb;

  // Pull balances + days via RPCs in parallel.
  const enriched: Listing[] = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const [{ data: balance }, { data: days }] = await Promise.all([
        supabase.rpc("get_meal_balance", { p_user_id: p.id }),
        supabase.rpc("days_remaining", { p_user_id: p.id }),
      ]);
      return {
        id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        college: p.college,
        workplace: p.workplace,
        is_active: p.is_active,
        meal_balance: Number(balance ?? 0),
        days_remaining: Number(days ?? 0),
      };
    }),
  );

  return (
    <div className="px-[14px] mt-[6px]">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Customers</div>
          <div className="text-[11.5px] text-bhuk-ink2">
            {enriched.length} {showInactive ? "total (incl. inactive)" : "active"}
          </div>
        </div>
        <Link
          href={showInactive ? "/admin/customers" : "/admin/customers?inactive=1"}
          className="text-[11px] text-bhuk-terra font-bold"
        >
          {showInactive ? "Hide inactive" : "Show inactive"}
        </Link>
      </div>

      <form className="relative mt-3" action="/admin/customers" method="get">
        <Search size={14} className="absolute left-3 top-3 text-bhuk-off-ink" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone, email, college, workplace"
          className="w-full pl-[34px] pr-3 py-[10px] border-[1.5px] border-bhuk-line rounded-[11px] text-[13px] bg-white outline-none focus:border-bhuk-maroon"
        />
        {showInactive ? <input type="hidden" name="inactive" value="1" /> : null}
      </form>

      <div className="mt-3 flex flex-col gap-2">
        {enriched.map((c) => {
          const low = c.days_remaining < 10;
          return (
            <Link
              key={c.id}
              href={`/admin/customers/${c.id}`}
              className="bg-white border border-bhuk-line rounded-[13px] px-[14px] py-[12px] flex items-center gap-[11px] no-underline"
            >
              <div
                className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${
                  c.is_active ? (low ? "bg-bhuk-amber-bg" : "bg-bhuk-green-bg") : "bg-bhuk-off"
                }`}
              >
                <User size={17} className={c.is_active ? (low ? "text-bhuk-amber-ink" : "text-bhuk-green-ink") : "text-bhuk-off-ink"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-[13px] text-bhuk-ink truncate">
                  {c.full_name ?? "—"}
                </div>
                <div className="text-[11px] text-bhuk-off-ink mt-[1px] truncate">
                  {(c.college || c.workplace) ?? ""} · {c.phone}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-serif font-bold text-[18px] ${
                    low && c.is_active ? "text-bhuk-amber-ink" : "text-bhuk-maroon"
                  }`}
                >
                  {c.days_remaining}
                </div>
                <div className="text-[10px] text-bhuk-off-ink">
                  days · ₹{c.meal_balance}
                </div>
              </div>
            </Link>
          );
        })}
        {enriched.length === 0 ? (
          <div className="mt-6 bg-white border border-bhuk-line rounded-card p-6 text-center text-[12.5px] text-bhuk-ink2">
            {q ? `No matches for "${q}".` : "No customers yet — activate one in Pending."}
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { AlertTriangle, Sun, TrendingUp, Users, Utensils } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";
import { istToday } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stats" };

export default async function AdminStatsPage() {
  const { supabase } = await requireRole("admin", "/admin/stats");
  const today = istToday();
  const tomorrow = (() => {
    const [y, m, d] = today.split("-").map(Number);
    const t = new Date(y, m - 1, d + 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();

  // Headcounts via the customers_eating_on(date) SECURITY DEFINER function.
  const [{ data: todayEaters }, { data: tomorrowEaters }, { data: customers }] = await Promise.all([
    supabase.rpc("customers_eating_on", { p_service_date: today }),
    supabase.rpc("customers_eating_on", { p_service_date: tomorrow }),
    supabase
      .from("profiles")
      .select("id, delivery_fee_per_day")
      .eq("role", "customer")
      .eq("is_active", true),
  ]);

  let totalMeal = 0;
  let totalSd = 0;
  let lowBalance = 0;
  for (const c of customers ?? []) {
    const [{ data: m }, { data: s }, { data: d }] = await Promise.all([
      supabase.rpc("get_meal_balance", { p_user_id: c.id }),
      supabase.rpc("get_sd_balance", { p_user_id: c.id }),
      supabase.rpc("days_remaining", { p_user_id: c.id }),
    ]);
    totalMeal += Number(m ?? 0);
    totalSd += Number(s ?? 0);
    if (Number(d ?? 0) < 10) lowBalance++;
  }

  const customerCount = customers?.length ?? 0;
  const estMonthlyRevenue = customerCount * 2600;
  const totalDeliveryPerDay = (customers ?? []).reduce(
    (s, c) => s + (c.delivery_fee_per_day ?? 0),
    0,
  );

  return (
    <div className="px-[14px] mt-[6px]">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Stats</div>
      <div className="text-[11.5px] text-bhuk-ink2">Snapshot of the business right now.</div>

      <div className="grid grid-cols-2 gap-[9px] mt-3">
        <Big icon={Utensils} color="text-bhuk-green" label="Eating today" value={String(todayEaters?.length ?? 0)} />
        <Big icon={Sun} color="text-bhuk-terra" label="Eating tomorrow" value={String(tomorrowEaters?.length ?? 0)} />
        <Big icon={Users} color="text-bhuk-maroon" label="Active customers" value={String(customerCount)} />
        <Big icon={AlertTriangle} color="text-bhuk-amber" label="Low balance" value={String(lowBalance)} />
      </div>

      <div className="mt-3 bg-white border border-bhuk-line rounded-[14px] p-4 space-y-2">
        <Row label="Total meal balance (all customers)" value={`₹${totalMeal}`} highlight />
        <Row label="Meal-days outstanding" value={`${Math.floor(totalMeal / 100)} days`} />
        <Row label="Total security deposits held" value={`₹${totalSd}`} />
        <Row label="Total delivery fees / day" value={`₹${totalDeliveryPerDay}`} />
        <Row label="Estimated monthly revenue" value={`₹${estMonthlyRevenue}`} />
      </div>

      <div className="mt-3 bg-bhuk-cream rounded-[12px] p-3 text-[11.5px] text-bhuk-ink2">
        <TrendingUp className="inline mr-1" size={12} /> Estimated revenue assumes every active customer renews 2,600/month — adjust by hand for delivery fees + active-fraction once we have a few months of data.
      </div>
    </div>
  );
}

function Big({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: typeof Users;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-[13px] border border-bhuk-line p-[13px]">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-extrabold text-bhuk-off-ink uppercase tracking-wide">
          {label}
        </span>
        <Icon size={13} className={color} />
      </div>
      <div className={`font-serif font-bold text-[32px] mt-[5px] leading-none ${color}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-[3px]">
      <span className="text-[12px] text-bhuk-off-ink font-semibold">{label}</span>
      <span
        className={`text-[13px] font-extrabold ${
          highlight ? "text-bhuk-maroon font-serif" : "text-bhuk-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

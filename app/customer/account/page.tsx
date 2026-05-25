import { CustomerAccountCard } from "@/components/customer/account-card";
import { requireRole } from "@/lib/auth-guards";
import { istToday } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata = { title: "Account" };

export default async function CustomerAccountPage() {
  const { profile, supabase } = await requireRole("customer", "/customer/account");
  const [{ data: mealBalance }, { data: sdBalance }, { data: daysRem }] = await Promise.all([
    supabase.rpc("get_meal_balance", { p_user_id: profile.id }),
    supabase.rpc("get_sd_balance", { p_user_id: profile.id }),
    supabase.rpc("days_remaining", { p_user_id: profile.id }),
  ]);

  // Quick last-funded-day estimate (re-used from /customer page).
  const { data: chargeRows } = await supabase
    .from("ledger")
    .select("entry_date")
    .eq("user_id", profile.id)
    .eq("type", "meal_charge");
  const { data: exRows } = await supabase
    .from("meal_exceptions")
    .select("service_date, kind, user_id");
  const today = istToday();
  const served = new Set((chargeRows ?? []).map((r) => r.entry_date));
  const cancels = new Set(
    (exRows ?? []).filter((r) => r.user_id === profile.id && r.kind === "customer_cancel").map((r) => r.service_date),
  );
  const adminOffs = new Set(
    (exRows ?? []).filter((r) => r.user_id === profile.id && r.kind === "admin_user_off").map((r) => r.service_date),
  );
  const globalOffs = new Set(
    (exRows ?? []).filter((r) => r.user_id === null).map((r) => r.service_date),
  );

  const lastDay = lastFundedDay({
    today,
    fundedDays: Number(daysRem ?? 0),
    served,
    cancels,
    adminOffs,
    globalOffs,
  });

  return (
    <div className="px-[14px]">
      <CustomerAccountCard
        profile={profile}
        mealBalance={Number(mealBalance ?? 0)}
        sdBalance={Number(sdBalance ?? 0)}
        daysRemaining={Number(daysRem ?? 0)}
        lastDay={lastDay}
      />
    </div>
  );
}

function lastFundedDay(args: {
  today: string;
  fundedDays: number;
  served: Set<string>;
  cancels: Set<string>;
  adminOffs: Set<string>;
  globalOffs: Set<string>;
}): string | null {
  if (args.fundedDays <= 0) return null;
  const [y, m, d] = args.today.split("-").map(Number);
  let cur = new Date(y, m - 1, d);
  let f = 0;
  let last: string | null = null;
  for (let i = 0; i < 365 && f < args.fundedDays; i++) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    const isSun = cur.getDay() === 0;
    if (!isSun && !args.globalOffs.has(key) && !args.cancels.has(key) && !args.adminOffs.has(key) && !args.served.has(key)) {
      f++;
      last = key;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return last;
}

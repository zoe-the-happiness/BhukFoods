import { BalanceCard, LowBalanceCallout } from "@/components/customer/balance-card";
import { CustomerCalendar } from "@/components/customer/month-calendar";
import { requireRole } from "@/lib/auth-guards";
import { istNow, istToday, TZ } from "@/lib/time";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function CustomerHome() {
  const { profile, supabase } = await requireRole("customer", "/customer");

  // Today in IST (date string) + a wall-clock IST timestamp for cutoff checks
  // on the client. We never trust the browser's clock.
  const today = istToday();
  const istNowStr = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss");

  // Balances + days remaining via RPC.
  const [{ data: mealBalance }, { data: daysRem }] = await Promise.all([
    supabase.rpc("get_meal_balance", { p_user_id: profile.id }),
    supabase.rpc("days_remaining", { p_user_id: profile.id }),
  ]);

  // Pull the customer's meal_charge dates (served) — RLS lets them read own rows.
  const { data: chargeRows } = await supabase
    .from("ledger")
    .select("entry_date")
    .eq("user_id", profile.id)
    .eq("type", "meal_charge");

  // Pull exceptions: customer's own + every global one. RLS already restricts the rows
  // a customer can see, so a generic select returns exactly what we want.
  const { data: exRows } = await supabase
    .from("meal_exceptions")
    .select("service_date, kind, user_id");

  const servedDates = (chargeRows ?? []).map((r) => r.entry_date);
  const customerCancels = (exRows ?? [])
    .filter((r) => r.user_id === profile.id && r.kind === "customer_cancel")
    .map((r) => r.service_date);
  const adminOffs = (exRows ?? [])
    .filter((r) => r.user_id === profile.id && r.kind === "admin_user_off")
    .map((r) => r.service_date);
  const globalOffs = (exRows ?? [])
    .filter((r) => r.user_id === null)
    .map((r) => r.service_date);

  const fundedDays = Number(daysRem ?? 0);
  const meal = Number(mealBalance ?? 0);

  // Compute last funded day for the BalanceCard's "Valid till" line.
  // Use the same walk as the calendar — limited to ~365 days.
  const lastDay = computeLastFundedDay({
    today,
    fundedDays,
    served: new Set(servedDates),
    cancels: new Set(customerCancels),
    adminOffs: new Set(adminOffs),
    globalOffs: new Set(globalOffs),
  });

  return (
    <div className="px-[14px]">
      <BalanceCard fundedDays={fundedDays} mealBalance={meal} lastDay={lastDay} />
      {fundedDays < 10 ? <LowBalanceCallout mealBalance={meal} /> : null}
      <CustomerCalendar
        today={today}
        servedDates={servedDates}
        customerCancels={customerCancels}
        adminOffs={adminOffs}
        globalOffs={globalOffs}
        fundedDays={fundedDays}
        istNow={istNowStr}
      />
    </div>
  );
}

function computeLastFundedDay(args: {
  today: string;
  fundedDays: number;
  served: Set<string>;
  cancels: Set<string>;
  adminOffs: Set<string>;
  globalOffs: Set<string>;
}): string | null {
  if (args.fundedDays <= 0) return null;
  const [y, m, d] = args.today.split("-").map(Number);
  let cursor = new Date(y, m - 1, d);
  let funded = 0;
  let last: string | null = null;
  for (let i = 0; i < 365 && funded < args.fundedDays; i++) {
    const key = format(cursor);
    const isSun = cursor.getDay() === 0;
    if (
      !isSun &&
      !args.globalOffs.has(key) &&
      !args.cancels.has(key) &&
      !args.adminOffs.has(key) &&
      !args.served.has(key)
    ) {
      funded++;
      last = key;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return last;
}

function format(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

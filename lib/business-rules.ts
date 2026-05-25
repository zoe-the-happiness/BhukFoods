/**
 * Core Bhuk Foods business-rule helpers (mirrored to JSX reference).
 *
 * All dates are IST strings (`yyyy-MM-dd`). Time-zone logic NEVER trusts the
 * browser; the server passes "today" to the client as a string.
 */

import { addDays, isSunday, parseISO } from "date-fns";

export type DayState =
  | "void"        // outside the current month grid cell
  | "off"         // Sunday (always off) or pre-start
  | "globaloff"   // declared closed for everyone
  | "adminoff"    // admin marked this customer off
  | "cancelled"   // customer-cancelled
  | "served"      // already eaten (meal_charge exists)
  | "today"       // = today, funded
  | "upcoming"    // future, funded
  | "plain";      // future, unfunded

export type CalendarInput = {
  today: string;                  // IST today, yyyy-MM-dd
  servedDates: Set<string>;       // dates with a meal_charge
  customerCancels: Set<string>;   // dates this customer cancelled
  adminOffs: Set<string>;         // dates admin marked this customer off
  globalOffs: Set<string>;        // dates with a global meal exception (or Sunday — added inline)
  fundedDays: number;             // floor(meal_balance / (100 + delivery_fee_per_day))
  startDate?: string | null;      // customer's start_date (optional)
};

/**
 * Compute the set of future service dates the customer's balance covers,
 * skipping Sundays, global exceptions, customer cancellations, and admin
 * offs. Walks forward day-by-day starting today; caps at 365 days.
 */
export function computeFundedDates(input: CalendarInput): Set<string> {
  const { today, servedDates, customerCancels, adminOffs, globalOffs, fundedDays } = input;
  const out = new Set<string>();
  if (fundedDays <= 0) return out;
  let d = parseISO(today);
  for (let guard = 0; guard < 365 && out.size < fundedDays; guard++) {
    const key = toDateString(d);
    if (
      !isSunday(d) &&
      !globalOffs.has(key) &&
      !customerCancels.has(key) &&
      !adminOffs.has(key) &&
      !servedDates.has(key)
    ) {
      out.add(key);
    }
    d = addDays(d, 1);
  }
  return out;
}

export function dayState(
  date: Date,
  monthCursor: number,
  input: CalendarInput,
  fundedSet: Set<string>,
): DayState {
  if (date.getMonth() !== monthCursor) return "void";
  if (isSunday(date)) return "off";
  const key = toDateString(date);
  if (input.globalOffs.has(key)) return "globaloff";
  if (input.customerCancels.has(key)) return "cancelled";
  if (input.adminOffs.has(key)) return "adminoff";
  if (input.servedDates.has(key)) return "served";
  if (fundedSet.has(key)) return key === input.today ? "today" : "upcoming";
  return "plain";
}

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export function fromDateString(s: string): Date {
  // Treat YYYY-MM-DD as a local date (no TZ shift).
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Pure cutoff check matching the SQL `can_customer_cancel(date)` function.
 * `nowIst` is a JS Date already shifted to Asia/Kolkata (i.e. the IST wall
 * clock interpreted as a local Date). `serviceDate` is yyyy-MM-dd.
 */
export function canCustomerCancel(serviceDate: string, nowIst: Date): boolean {
  const service = fromDateString(serviceDate);
  const cutoff = addDays(service, -1);
  cutoff.setHours(16, 0, 0, 0);
  return service > stripTime(nowIst) && nowIst < cutoff;
}

function stripTime(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

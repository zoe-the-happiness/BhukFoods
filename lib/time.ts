/**
 * All time logic is anchored to Asia/Kolkata (IST = UTC+05:30, no DST).
 * Browser clocks are NEVER trusted — UI just renders whatever the server tells it.
 */
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export const TZ = "Asia/Kolkata";
export const CUTOFF_HOUR = 16;        // 16:00 IST — customer self-cancel deadline
export const GRACE_END_HOUR = 16;     // 16:30 IST — admin grace window ends
export const GRACE_END_MIN = 30;

export function istNow(): Date {
  return toZonedTime(new Date(), TZ);
}

export function istToday(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
}

export function istDateStr(d: Date): string {
  return formatInTimeZone(d, TZ, "yyyy-MM-dd");
}

export function formatIstDateEn(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00+05:30") : d;
  return formatInTimeZone(dt, TZ, "EEE, d LLL yyyy");
}

export function isSundayIst(date: string): boolean {
  const dt = new Date(date + "T00:00:00+05:30");
  return toZonedTime(dt, TZ).getDay() === 0;
}

/**
 * Customer self-cancel cutoff:
 * current IST time must be strictly before 16:00 IST on (serviceDate - 1).
 */
export function canCustomerCancel(serviceDate: string): boolean {
  const now = istNow();
  const cutoff = new Date(serviceDate + "T00:00:00+05:30");
  cutoff.setUTCDate(cutoff.getUTCDate() - 1);
  cutoff.setUTCHours(CUTOFF_HOUR - 5, -30, 0, 0); // 16:00 IST in UTC = 10:30 UTC
  return now.getTime() < cutoff.getTime();
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const BN_WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

export function toBengaliNumerals(s: string | number): string {
  return String(s).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function formatIstDateBn(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00+05:30") : d;
  const z = toZonedTime(dt, TZ);
  const day = toBengaliNumerals(z.getDate());
  const month = BN_MONTHS[z.getMonth()];
  const year = toBengaliNumerals(z.getFullYear());
  const wd = BN_WEEKDAYS[z.getDay()];
  return `${wd}, ${day} ${month} ${year}`;
}

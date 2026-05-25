"use client";

import { AlertTriangle, Phone, Wallet } from "lucide-react";

import { useLang, useT } from "@/lib/i18n/lang-provider";
import { toBengaliNumerals } from "@/lib/time";
import { formatIstDateEn, formatIstDateBn } from "@/lib/time";

/**
 * Calendar header card — green/maroon when healthy, amber/yellow when low.
 * Mirrors the balance card in design/bhuk_foods_app.jsx (CustomerCalendar).
 */
export function BalanceCard({
  fundedDays,
  mealBalance,
  lastDay,
}: {
  fundedDays: number;
  mealBalance: number;
  lastDay: string | null;
}) {
  const t = useT();
  const { lang } = useLang();
  const low = fundedDays < 10;
  const num = (n: number | string) => (lang === "bn" ? toBengaliNumerals(n) : String(n));
  const rupee = (n: number) => `₹${num(n)}`;

  const lastDayStr = lastDay
    ? lang === "bn"
      ? formatIstDateBn(lastDay)
      : formatIstDateEn(lastDay)
    : "—";

  return (
    <div
      className={`mt-1 rounded-card px-[18px] py-4 ${
        low ? "bg-bhuk-amber-bg" : "bg-bhuk-maroon"
      }`}
    >
      <div className="flex items-center gap-[7px]">
        <Wallet size={14} className={low ? "text-bhuk-amber-ink" : "text-bhuk-saffron"} />
        <span
          className={`text-[11.5px] font-extrabold ${
            low ? "text-bhuk-amber-ink" : "text-bhuk-saffron"
          }`}
        >
          {t("MEAL DAYS LEFT", "মিল দিন বাকি")}
        </span>
      </div>
      <div className="flex items-baseline gap-[7px] mt-[3px]">
        <span
          className={`font-serif font-bold text-[48px] leading-none ${
            low ? "text-bhuk-amber-ink" : "text-white"
          }`}
        >
          {num(fundedDays)}
        </span>
        <span
          className={`text-[13px] font-semibold ${
            low ? "text-bhuk-amber-ink" : "text-[#F0D9B0]"
          }`}
        >
          {t("days", "দিন")}
        </span>
      </div>
      <div
        className={`flex justify-between mt-[7px] text-[11.5px] ${
          low ? "text-bhuk-amber-ink" : "text-[#F0D9B0]"
        }`}
      >
        <span>{t(`Valid till: ${lastDayStr}`, `মেয়াদ: ${lastDayStr} পর্যন্ত`)}</span>
        <span>
          {t(`Balance ${rupee(mealBalance)}`, `ব্যালান্স ${rupee(mealBalance)}`)}
        </span>
      </div>
    </div>
  );
}

export function LowBalanceCallout({ mealBalance }: { mealBalance: number }) {
  const t = useT();
  const { lang } = useLang();
  const rupee = (n: number) => `₹${lang === "bn" ? toBengaliNumerals(n) : n}`;
  return (
    <div className="mt-[9px] bg-white border-[1.5px] border-bhuk-amber rounded-[13px] px-3 py-[10px] flex gap-[9px]">
      <AlertTriangle size={17} className="text-bhuk-amber shrink-0 mt-[1px]" />
      <div>
        <div className="font-extrabold text-[12.5px] text-bhuk-amber-ink">
          {t("Low balance — please recharge", "মিল দিন কমে গেছে — রিচার্জ করুন")}
        </div>
        <div className="text-[11.5px] text-bhuk-ink2 mt-[1px] leading-snug">
          {t(
            <>Less than 10 days left. Pay {rupee(2600)} to add 26 more days. </>,
            <>১০ দিনের কম বাকি। ₹২৬০০ দিলে আরও ২৬ দিন যোগ হবে। </>,
          )}
          <a
            href="tel:+917595923777"
            className="text-bhuk-terra font-bold no-underline"
          >
            <Phone size={10} className="inline" /> {t("75959 23777", "৭৫৯৫৯ ২৩৭৭৭")}
          </a>
        </div>
      </div>
    </div>
  );
}

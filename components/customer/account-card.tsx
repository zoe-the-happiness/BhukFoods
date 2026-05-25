"use client";

import { Phone } from "lucide-react";

import { useLang, useT } from "@/lib/i18n/lang-provider";
import { formatIstDateBn, formatIstDateEn, toBengaliNumerals } from "@/lib/time";
import type { Profile } from "@/lib/types/database";

export function CustomerAccountCard({
  profile,
  mealBalance,
  sdBalance,
  daysRemaining,
  lastDay,
}: {
  profile: Profile;
  mealBalance: number;
  sdBalance: number;
  daysRemaining: number;
  lastDay: string | null;
}) {
  const t = useT();
  const { lang } = useLang();
  const num = (n: number | string) => (lang === "bn" ? toBengaliNumerals(n) : String(n));
  const rupee = (n: number) => `₹${num(n)}`;
  const lastDayStr = lastDay
    ? lang === "bn"
      ? formatIstDateBn(lastDay)
      : formatIstDateEn(lastDay)
    : "—";

  const deliveryLabel = profile.delivery_mode
    ? ({
        blpga_onsite: t("BLPGA on-site", "BLPGA-তে আছেন"),
        self_pickup: t("Self-pickup", "নিজে এসে নেবেন"),
        home_delivery: t("Home delivery", "বাড়িতে ডেলিভারি"),
      } as const)[profile.delivery_mode]
    : "—";

  return (
    <div className="mt-[6px]">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">
        {t("My account", "আমার অ্যাকাউন্ট")}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-[10px]">
        <BalanceTile
          en="Meal balance"
          bn="মিল ব্যালান্স"
          value={rupee(mealBalance)}
          sub={t(`${num(daysRemaining)} days left`, `${num(daysRemaining)} দিন বাকি`)}
        />
        <BalanceTile
          en="Security deposit"
          bn="জামানত"
          value={rupee(sdBalance)}
          sub={t("refundable", "ফেরতযোগ্য")}
        />
      </div>

      <div className="mt-3 bg-white rounded-[14px] border border-bhuk-line p-4">
        <Row label={t("Name", "নাম")} value={profile.full_name ?? "—"} />
        {profile.is_student ? (
          <>
            <Row label={t("College", "কলেজ")} value={profile.college ?? "—"} />
            <Row label={t("Year", "বর্ষ")} value={profile.year_of_study ?? "—"} />
          </>
        ) : (
          <>
            <Row label={t("Profession", "পেশা")} value={profile.profession ?? "—"} />
            <Row label={t("Workplace", "কর্মস্থল")} value={profile.workplace ?? "—"} />
          </>
        )}
        <Row label={t("Phone", "ফোন")} value={profile.phone ?? "—"} />
        <Row label={t("Delivery", "ডেলিভারি")} value={String(deliveryLabel)} />
        {profile.delivery_fee_per_day > 0 ? (
          <Row
            label={t("Delivery fee / day", "প্রতি দিনের ডেলিভারি")}
            value={rupee(profile.delivery_fee_per_day)}
          />
        ) : null}
        <Row label={t("Plan ends", "মেয়াদ শেষ")} value={lastDayStr} highlight />
      </div>

      <div className="mt-3 bg-bhuk-green-bg border-[1.5px] border-bhuk-green rounded-[14px] p-[14px] flex gap-[10px]">
        <Phone size={18} className="text-bhuk-green-ink shrink-0" />
        <div>
          <div className="font-extrabold text-[13px] text-bhuk-green-ink">
            {t("Recharge or need help?", "রিচার্জ বা সাহায্য?")}
          </div>
          <div className="text-[12px] text-bhuk-ink2 mt-[2px] leading-relaxed">
            {t(
              <>
                Send {rupee(2600)} by UPI/bank to <b>75959 23777</b>. We verify and credit
                26 days.
              </>,
              <>
                UPI/ব্যাঙ্কে ₹২৬০০ পাঠান <b>৭৫৯৫৯ ২৩৭৭৭</b> এ, আমরা যাচাই করে ২৬ দিন যোগ করব।
              </>,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceTile({
  en,
  bn,
  value,
  sub,
}: {
  en: string;
  bn: string;
  value: string;
  sub: string;
}) {
  const t = useT();
  return (
    <div className="bg-white rounded-[13px] border border-bhuk-line p-[13px]">
      <div className="text-[11px] font-extrabold text-bhuk-off-ink uppercase tracking-wide">
        {t(en, bn)}
      </div>
      <div className="font-serif font-bold text-[28px] text-bhuk-maroon mt-[3px] leading-none">
        {value}
      </div>
      <div className="text-[11px] text-bhuk-ink2 mt-[3px]">{sub}</div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-[9px] border-t border-bhuk-off first:border-t-0">
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

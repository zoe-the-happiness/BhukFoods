"use client";

import { Check, Lock, X } from "lucide-react";

import { useLang } from "@/lib/i18n/lang-provider";
import { toBengaliNumerals } from "@/lib/time";
import type { DayState } from "@/lib/business-rules";

type Props = {
  date: Date;
  state: DayState;
  canCancel: boolean;
  onClick?: () => void;
};

export function DayCell({ date, state, canCancel, onClick }: Props) {
  const { lang } = useLang();
  const day = lang === "bn" ? toBengaliNumerals(date.getDate()) : String(date.getDate());

  if (state === "void") return <div className="aspect-square" />;

  // Layered class strings keep the variant visuals identical to the JSX paste.
  let base =
    "aspect-square rounded-[9px] flex flex-col items-center justify-center text-[12.5px] font-bold relative";
  let badge: React.ReactNode = null;
  let clickable = false;

  if (state === "off" || state === "globaloff") {
    base += " bg-bhuk-off text-bhuk-off-ink font-semibold";
  } else if (state === "plain") {
    base += " bg-[#FAF4E6] text-[#C9BFA8]";
  } else if (state === "served") {
    base += " bg-bhuk-green-bg text-bhuk-green-ink";
    badge = <Check size={10} className="absolute top-[3px] right-[3px] text-bhuk-green" />;
  } else if (state === "today") {
    base += " bg-bhuk-green text-white";
    badge = (
      <span className="text-[7px] font-extrabold mt-[1px]">
        {lang === "bn" ? "আজ" : "TODAY"}
      </span>
    );
  } else if (state === "upcoming") {
    base += " bg-bhuk-green text-white cursor-pointer";
    clickable = true;
    badge = canCancel ? (
      <span className="text-[7px] font-bold mt-[1px] opacity-90">
        {lang === "bn" ? "বাতিল?" : "CANCEL?"}
      </span>
    ) : (
      <Lock size={9} className="absolute top-[3px] right-[3px] text-white/90" />
    );
  } else if (state === "cancelled") {
    base += " bg-white text-bhuk-terra border-[1.4px] border-dashed border-bhuk-terra";
    badge = <X size={9} className="absolute top-[3px] right-[3px] text-bhuk-terra" />;
  } else if (state === "adminoff") {
    base += " bg-white text-bhuk-off-ink border-[1.4px] border-dashed border-bhuk-off-ink";
    badge = <X size={9} className="absolute top-[3px] right-[3px] text-bhuk-off-ink" />;
  }

  // Today gets the saffron ring on top of green.
  if (state === "today") {
    base += " ring-[2.5px] ring-bhuk-saffron";
  }

  return (
    <div onClick={clickable ? onClick : undefined} className={base}>
      <span>{day}</span>
      {badge}
    </div>
  );
}

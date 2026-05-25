"use client";

import { Check } from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";

export function CalendarLegend() {
  const t = useT();
  const items = [
    { color: "bg-bhuk-green", label: t("Meal day", "মিল দিন") },
    { color: "bg-bhuk-green-bg", label: t("Done", "হয়ে গেছে"), check: true },
    { color: "bg-white", label: t("Cancelled", "বাতিল"), ring: true },
    { color: "bg-bhuk-off", label: t("Closed", "বন্ধ") },
  ];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-[5px] mt-[10px] pt-[9px] border-t border-bhuk-off">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-[5px]">
          <div
            className={`w-3 h-3 rounded-[3.5px] flex items-center justify-center ${it.color} ${
              it.ring ? "border-[1.4px] border-dashed border-bhuk-terra" : "border border-bhuk-line"
            }`}
          >
            {it.check ? <Check size={8} className="text-bhuk-green" /> : null}
          </div>
          <span className="text-[10px] font-bold text-bhuk-ink2">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";

import { useLang, useT } from "@/lib/i18n/lang-provider";
import {
  formatIstDateBn,
  formatIstDateEn,
  toBengaliNumerals,
} from "@/lib/time";
import type { LedgerBucket, LedgerRow } from "@/lib/types/database";

type Cfg = { color: string; sign: string; en: string; bn: string };

const TYPE_CFG: Record<string, Cfg> = {
  credit:           { color: "text-bhuk-green",    sign: "+", en: "Money added",     bn: "টাকা যোগ" },
  meal_charge:      { color: "text-bhuk-terra",    sign: "−", en: "Meal charge",     bn: "মিল চার্জ" },
  delivery_charge:  { color: "text-bhuk-terra",    sign: "−", en: "Delivery charge", bn: "ডেলিভারি চার্জ" },
  refund:           { color: "text-bhuk-amber",    sign: "−", en: "Refund",          bn: "ফেরত" },
  adjustment:       { color: "text-bhuk-off-ink",  sign: "+", en: "Adjustment",      bn: "সংশোধন" },
  sd_deposit:       { color: "text-bhuk-green",    sign: "+", en: "Deposit",         bn: "জমা" },
  damage_deduction: { color: "text-bhuk-terra",    sign: "−", en: "Damage charge",   bn: "ক্ষতিপূরণ" },
  sd_refund:        { color: "text-bhuk-amber",    sign: "−", en: "Deposit returned",bn: "ডিপোজিট ফেরত" },
};

export function CustomerLedgerList({ rows }: { rows: LedgerRow[] }) {
  const t = useT();
  const { lang } = useLang();
  const [bucket, setBucket] = useState<LedgerBucket>("meal");
  const [desc, setDesc] = useState(true);

  const filtered = rows.filter((r) => r.bucket === bucket);
  const sorted = [...filtered].sort((a, b) => {
    const ka = `${a.entry_date}${a.id}`;
    const kb = `${b.entry_date}${b.id}`;
    return desc ? kb.localeCompare(ka) : ka.localeCompare(kb);
  });

  const num = (n: number | string) => (lang === "bn" ? toBengaliNumerals(n) : String(n));
  const rupee = (n: number) => `₹${num(n)}`;

  return (
    <div className="mt-[6px]">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-serif font-bold text-[20px] text-bhuk-maroon">
            {t("Account ledger", "অ্যাকাউন্ট খতিয়ান")}
          </div>
          <div className="text-[11.5px] text-bhuk-ink2 mt-[1px]">
            {t("Every transaction on your account", "আপনার সব টাকা-পয়সার হিসাব")}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDesc((d) => !d)}
          className="bg-white border border-bhuk-line px-[10px] py-[6px] rounded-[9px] text-[11px] font-bold text-bhuk-ink2 cursor-pointer"
        >
          {desc ? t("Newest first", "নতুন প্রথমে") : t("Oldest first", "পুরানো প্রথমে")}
        </button>
      </div>

      <div className="mt-3 flex gap-[5px] bg-bhuk-cream p-[3px] rounded-[9px]">
        {(
          [
            { k: "meal" as const, en: "Meal ledger", bn: "মিল খতিয়ান" },
            { k: "sd" as const, en: "Security deposit", bn: "জামানত" },
          ]
        ).map((opt) => (
          <button
            key={opt.k}
            type="button"
            onClick={() => setBucket(opt.k)}
            className={`flex-1 py-[7px] rounded-[7px] text-[12px] font-extrabold cursor-pointer ${
              bucket === opt.k
                ? "bg-white text-bhuk-maroon shadow-card"
                : "bg-transparent text-bhuk-off-ink"
            }`}
          >
            {t(opt.en, opt.bn)}
          </button>
        ))}
      </div>

      <div className="mt-3 bg-white rounded-[14px] border border-bhuk-line">
        {sorted.map((r, i) => {
          const cfg = TYPE_CFG[r.type] ?? TYPE_CFG.adjustment;
          const note = r.note ?? "";
          const dateStr =
            lang === "bn" ? formatIstDateBn(r.entry_date) : formatIstDateEn(r.entry_date);
          return (
            <div
              key={r.id}
              className={`flex items-center gap-[10px] px-[13px] py-[11px] ${
                i > 0 ? "border-t border-bhuk-off" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-[7px]">
                  <span className="font-extrabold text-[12.5px] text-bhuk-ink">{dateStr}</span>
                  <span className={`text-[10.5px] font-bold ${cfg.color}`}>
                    {t(cfg.en, cfg.bn)}
                  </span>
                </div>
                {note ? (
                  <div className="text-[10.5px] text-bhuk-off-ink mt-[2px] truncate">
                    {note}
                    {r.damage_item ? ` · ${r.damage_item}${r.damage_qty ? ` × ${r.damage_qty}` : ""}` : null}
                  </div>
                ) : null}
              </div>
              <div className="text-right">
                <div className={`font-serif font-bold text-[14px] ${cfg.color}`}>
                  {cfg.sign}
                  {rupee(r.amount)}
                </div>
                <div className="text-[10px] text-bhuk-off-ink mt-[1px]">
                  {t(`Balance ${rupee(r.balance_after)}`, `বাকি ${rupee(r.balance_after)}`)}
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 ? (
          <div className="p-5 text-center text-bhuk-off-ink text-[12px]">
            {t("No entries yet", "কোনো এন্ট্রি নেই")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

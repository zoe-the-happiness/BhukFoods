"use client";

import { addDays, addMonths, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { CalendarLegend } from "@/components/customer/legend";
import { DayCell } from "@/components/customer/day-cell";
import { CancelModal } from "@/components/customer/cancel-modal";
import { useLang, useT } from "@/lib/i18n/lang-provider";
import {
  type CalendarInput,
  computeFundedDates,
  dayState,
  fromDateString,
  toDateString,
} from "@/lib/business-rules";

import { cancelMeal, uncancelMeal } from "@/app/customer/actions";

const MONTHS_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const MONTHS_BN = [
  "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
  "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর",
];
const WD_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const WD_BN = ["রবি","সোম","মঙ্গল","বুধ","বৃহঃ","শুক্র","শনি"];

export function CustomerCalendar({
  today,
  servedDates,
  customerCancels,
  adminOffs,
  globalOffs,
  fundedDays,
  /**
   * IST 'now' wall-clock (yyyy-MM-ddTHH:mm:ss). Used for the 16:00 cutoff
   * check on the client; server-side RLS rejects too-late cancellations
   * regardless, but we hide the CANCEL? badge for locked days.
   */
  istNow,
}: {
  today: string;
  servedDates: string[];
  customerCancels: string[];
  adminOffs: string[];
  globalOffs: string[];
  fundedDays: number;
  istNow: string;
}) {
  const t = useT();
  const { lang } = useLang();
  const months = lang === "bn" ? MONTHS_BN : MONTHS_EN;
  const weekdays = lang === "bn" ? WD_BN : WD_EN;

  const todayDate = useMemo(() => fromDateString(today), [today]);
  const istNowDate = useMemo(() => new Date(istNow), [istNow]);

  const [cursor, setCursor] = useState(startOfMonth(todayDate));
  const [confirm, setConfirm] = useState<
    | { mode: "cancel" | "uncancel"; date: string }
    | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const input: CalendarInput = useMemo(
    () => ({
      today,
      servedDates: new Set(servedDates),
      customerCancels: new Set(customerCancels),
      adminOffs: new Set(adminOffs),
      globalOffs: new Set(globalOffs),
      fundedDays,
    }),
    [today, servedDates, customerCancels, adminOffs, globalOffs, fundedDays],
  );

  const fundedSet = useMemo(() => computeFundedDates(input), [input]);

  // 6 rows × 7 cols grid starting on Sunday of the first week.
  const first = useMemo(() => startOfMonth(cursor), [cursor]);
  const gridStart = useMemo(() => addDays(first, -first.getDay()), [first]);
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [gridStart],
  );

  function onDayClick(date: Date) {
    const key = toDateString(date);
    const state = dayState(date, cursor.getMonth(), input, fundedSet);
    if (state === "upcoming") {
      if (cancelOk(key, istNowDate)) setConfirm({ mode: "cancel", date: key });
    } else if (state === "cancelled") {
      if (cancelOk(key, istNowDate)) setConfirm({ mode: "uncancel", date: key });
    }
  }

  function submitConfirm() {
    if (!confirm) return;
    startTransition(async () => {
      const r =
        confirm.mode === "cancel"
          ? await cancelMeal(confirm.date)
          : await uncancelMeal(confirm.date);
      if (r?.ok) setConfirm(null);
    });
  }

  return (
    <div className="mt-[10px] bg-white rounded-card border border-bhuk-line p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="w-7 h-7 rounded-[8px] border border-bhuk-line bg-white flex items-center justify-center cursor-pointer text-bhuk-maroon"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="font-serif font-bold text-[15.5px] text-bhuk-maroon">
          {months[cursor.getMonth()]} {cursor.getFullYear()}
        </div>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="w-7 h-7 rounded-[8px] border border-bhuk-line bg-white flex items-center justify-center cursor-pointer text-bhuk-maroon"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-[3px]">
        {weekdays.map((w, i) => (
          <div
            key={i}
            className={`text-center text-[10px] font-extrabold pb-[2px] ${
              i === 0 ? "text-bhuk-off-ink" : "text-bhuk-terra"
            }`}
          >
            {w}
          </div>
        ))}
        {cells.map((d, i) => (
          <DayCell
            key={i}
            date={d}
            state={dayState(d, cursor.getMonth(), input, fundedSet)}
            canCancel={cancelOk(toDateString(d), istNowDate)}
            onClick={() => onDayClick(d)}
          />
        ))}
      </div>

      <CalendarLegend />

      <div className="text-[10.5px] text-bhuk-off-ink mt-[6px] leading-snug">
        {t(
          "Tap a green day to cancel it — must be before 4 PM the day before. After 4 PM the day is 🔒 locked.",
          "সবুজ দিনে ট্যাপ করে মিল বাতিল করা যায়, আগের দিন ৪টার আগে। ৪টার পরে 🔒 লক।",
        )}
      </div>

      {confirm ? (
        <CancelModal
          serviceDate={confirm.date}
          mode={confirm.mode}
          isPending={isPending}
          onClose={() => setConfirm(null)}
          onConfirm={submitConfirm}
        />
      ) : null}
    </div>
  );
}

function cancelOk(serviceDateStr: string, nowIst: Date): boolean {
  const service = fromDateString(serviceDateStr);
  const cutoff = addDays(service, -1);
  cutoff.setHours(16, 0, 0, 0);
  const todayMid = new Date(nowIst);
  todayMid.setHours(0, 0, 0, 0);
  return service > todayMid && nowIst < cutoff;
}

"use client";

import { AlertTriangle } from "lucide-react";

import { useLang, useT } from "@/lib/i18n/lang-provider";
import { formatIstDateBn, formatIstDateEn } from "@/lib/time";

type Mode = "cancel" | "uncancel";

export function CancelModal({
  serviceDate,
  mode,
  isPending,
  onClose,
  onConfirm,
}: {
  serviceDate: string;
  mode: Mode;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const pretty = lang === "bn" ? formatIstDateBn(serviceDate) : formatIstDateEn(serviceDate);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#2A1E16]/55 flex items-center justify-center p-6 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-card p-[22px] max-w-[340px] w-full shadow-toast"
      >
        <div className="w-[42px] h-[42px] rounded-[11px] bg-bhuk-amber-bg flex items-center justify-center mb-[11px]">
          <AlertTriangle size={21} className="text-bhuk-amber-ink" />
        </div>
        <div className="font-serif font-bold text-[17px] text-bhuk-maroon">
          {mode === "cancel"
            ? t("Cancel this meal?", "মিল বাতিল করবেন?")
            : t("Un-cancel this meal?", "বাতিল ফেরাবেন?")}
        </div>
        <div className="text-[13px] text-bhuk-ink2 mt-[5px] leading-relaxed">
          {mode === "cancel"
            ? t(
                <>
                  The meal on <b>{pretty}</b> will be cancelled. This day will move to the
                  end of your plan. Once cancelled, it cannot be undone after 4 PM the day
                  before.
                </>,
                <>
                  <b>{pretty}</b> তারিখের মিল বাতিল হবে। এই দিনটি পিছিয়ে মেয়াদের শেষে যোগ
                  হবে। আগের দিন ৪টার পরে আর ফেরানো যাবে না।
                </>,
              )
            : t(
                <>
                  Restore the meal on <b>{pretty}</b>?
                </>,
                <>
                  <b>{pretty}</b> তারিখের মিল আবার চালু করবেন?
                </>,
              )}
        </div>
        <div className="flex gap-[9px] mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-[11px] rounded-[10px] border-[1.5px] border-bhuk-line bg-white text-bhuk-ink font-bold text-[13px] cursor-pointer disabled:opacity-50"
          >
            {t("Keep it", "থাক")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-[11px] rounded-[10px] border-0 bg-bhuk-terra text-white font-extrabold text-[13px] cursor-pointer disabled:opacity-50"
          >
            {isPending
              ? t("Saving…", "সংরক্ষণ হচ্ছে…")
              : mode === "cancel"
              ? t("Yes, cancel", "হ্যাঁ, বাতিল করুন")
              : t("Yes, restore", "হ্যাঁ, চালু করুন")}
          </button>
        </div>
      </div>
    </div>
  );
}

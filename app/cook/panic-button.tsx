"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";

import { cookPanic } from "./actions";

export function CookPanicButton() {
  const t = useT();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000); // auto-cancel confirmation state
      return;
    }
    startTransition(async () => {
      const r = await cookPanic();
      if (r.ok) {
        setDone(true);
      } else {
        setError(r.error);
      }
      setConfirming(false);
    });
  }

  if (done) {
    return (
      <div className="mt-3 bg-bhuk-green-bg border-[1.5px] border-bhuk-green rounded-[14px] p-4 text-[13px] text-bhuk-green-ink">
        {t(
          "Today is closed for everyone. All customers and the admin have been notified.",
          "আজ সবার জন্য বন্ধ। সব গ্রাহক এবং অ্যাডমিনকে জানানো হয়েছে।",
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 bg-bhuk-amber-bg border-[1.5px] border-bhuk-amber rounded-[14px] p-3">
      <div className="font-extrabold text-[13px] text-bhuk-amber-ink flex items-center gap-[6px]">
        <AlertTriangle size={15} /> {t("Can't come in today?", "আজ আসতে পারবেন না?")}
      </div>
      <div className="text-[11.5px] text-bhuk-ink2 mt-[3px] leading-snug">
        {t(
          "Tapping this cancels every customer's meal for today. No one is charged. Everyone is notified.",
          "এই বোতাম চাপলে সব গ্রাহকের আজকের মিল বাতিল, কোনো চার্জ নেই, সবাইকে জানানো হবে।",
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="w-full mt-[9px] py-[10px] border-0 bg-bhuk-amber text-white font-extrabold text-[13px] rounded-[9px] cursor-pointer disabled:opacity-60"
      >
        {isPending
          ? t("Closing today…", "বন্ধ ঘোষণা হচ্ছে…")
          : confirming
          ? t("Tap again to confirm", "আবার ট্যাপ করে নিশ্চিত করুন")
          : t("I'm absent today — close for everyone", "আমি আজ অনুপস্থিত — সবার জন্য বন্ধ")}
      </button>
      {error ? <div className="text-[11.5px] text-bhuk-terra mt-2">{error}</div> : null}
    </div>
  );
}

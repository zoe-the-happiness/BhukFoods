"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Send, XCircle } from "lucide-react";

import { activateSubscriber, generateQuote, rejectPending } from "./actions";

export function PendingActions({
  pendingId,
  initialFee,
  status,
  isBlpga,
}: {
  pendingId: string;
  initialFee: number | null;
  status: string;
  isBlpga: boolean;
}) {
  const [fee, setFee] = useState<string>(initialFee != null ? String(initialFee) : isBlpga ? "0" : "30");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function call(action: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }>, extra: Record<string, string> = {}) {
    setError(null);
    setInfo(null);
    const fd = new FormData();
    fd.set("pendingId", pendingId);
    for (const [k, v] of Object.entries(extra)) fd.set(k, v);
    startTransition(async () => {
      const r = await action(fd);
      if (r.ok) {
        setInfo("Done.");
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  const feeNum = parseInt(fee || "0", 10) || 0;
  const meal = 26 * 100;
  const delivery = 26 * feeNum;
  const sd = isBlpga ? 0 : 250;
  const total = meal + delivery + sd;

  return (
    <div className="mt-3 bg-white border border-bhuk-line rounded-[14px] p-4 space-y-4">
      <div>
        <div className="font-serif font-bold text-[15px] text-bhuk-maroon">
          Quote
        </div>
        <div className="text-[11.5px] text-bhuk-ink2 mt-1">
          Delivery fee is per day, charged on each meal day along with the
          ₹100 meal charge. Set 0 for BLPGA or self-pickup.
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[12px] text-bhuk-ink2">Delivery / day</span>
          <span className="text-[14px] text-bhuk-ink">₹</span>
          <input
            type="number"
            min={0}
            step={1}
            value={fee}
            onChange={(e) => setFee(e.target.value.replace(/[^0-9]/g, ""))}
            disabled={isBlpga}
            className="w-[80px] px-[10px] py-[8px] border-[1.5px] border-bhuk-line rounded-[8px] text-[14px] bg-white outline-none disabled:bg-bhuk-cream disabled:text-bhuk-off-ink"
          />
          {isBlpga ? (
            <span className="text-[11px] text-bhuk-off-ink">(BLPGA — fixed at ₹0)</span>
          ) : null}
        </div>

        <div className="mt-3 bg-bhuk-cream rounded-[10px] p-3 text-[12.5px] font-mono space-y-1">
          <Row label="Meals    26 × ₹100" value={`₹${meal}`} />
          <Row label={`Delivery 26 × ₹${feeNum}`} value={`₹${delivery}`} />
          <Row label="Security deposit" value={`₹${sd}`} />
          <div className="border-t border-bhuk-line my-1" />
          <Row label="Total now" value={`₹${total}`} bold />
        </div>

        <button
          type="button"
          onClick={() => call(generateQuote, { deliveryFeePerDay: String(feeNum) })}
          disabled={isPending || status === "activated"}
          className="w-full mt-3 py-[12px] bg-bhuk-green text-white rounded-[10px] font-extrabold text-[13px] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Send size={15} />
          {isPending ? "Sending…" : status === "quoted" ? "Re-send quote email" : "Save & send quote email"}
        </button>
      </div>

      <div className="border-t border-bhuk-off pt-4">
        <div className="font-serif font-bold text-[15px] text-bhuk-maroon">
          Activate (after payment received)
        </div>
        <div className="text-[11.5px] text-bhuk-ink2 mt-1">
          Creates the auth user, inserts the profile, posts the initial
          credit + deposit, and emails a magic-link.
        </div>
        <button
          type="button"
          onClick={() => call(activateSubscriber)}
          disabled={isPending || status === "activated" || initialFee == null}
          className="w-full mt-3 py-[12px] bg-bhuk-maroon text-white rounded-[10px] font-extrabold text-[13px] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={15} />
          {status === "activated" ? "Already activated" : isPending ? "Activating…" : "Activate"}
        </button>
        {initialFee == null ? (
          <div className="text-[11px] text-bhuk-amber-ink mt-2">
            Generate a quote first so the customer knows the price.
          </div>
        ) : null}
      </div>

      <div className="border-t border-bhuk-off pt-4">
        <button
          type="button"
          onClick={() => call(rejectPending)}
          disabled={isPending || status === "activated"}
          className="w-full py-[10px] border border-bhuk-line bg-white text-bhuk-ink2 rounded-[10px] font-bold text-[12px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <XCircle size={14} />
          Reject (won't activate, no email)
        </button>
      </div>

      {error ? (
        <div className="text-[12px] text-bhuk-terra bg-bhuk-amber-bg rounded-[8px] p-2">
          {error}
        </div>
      ) : null}
      {info ? (
        <div className="text-[12px] text-bhuk-green-ink bg-bhuk-green-bg rounded-[8px] p-2">
          {info}
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-bhuk-maroon" : "text-bhuk-ink"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

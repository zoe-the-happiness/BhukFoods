"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CalendarOff,
  Camera,
  LogOut,
  MinusCircle,
  Plus,
} from "lucide-react";

import {
  addMoney,
  DAMAGE_ITEMS,
  markUserOff,
  processExit,
  refundMoney,
  reportDamage,
} from "./actions";

type Mode = "credit" | "refund";

export function CustomerActions({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function call(action: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }>, fd: FormData) {
    setError(null);
    setInfo(null);
    fd.set("userId", userId);
    startTransition(async () => {
      const r = await action(fd);
      if (r.ok) {
        setInfo("Saved.");
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      {isActive ? (
        <>
          <MoneyForm onSubmit={(fd, mode) => call(mode === "credit" ? addMoney : refundMoney, fd)} disabled={isPending} />
          <OffForm onSubmit={(fd) => call(markUserOff, fd)} disabled={isPending} />
          <DamageForm onSubmit={(fd) => call(reportDamage, fd)} disabled={isPending} />
          <ExitForm onSubmit={(fd) => call(processExit, fd)} disabled={isPending} />
        </>
      ) : (
        <div className="bg-bhuk-off rounded-[12px] p-4 text-[12.5px] text-bhuk-off-ink">
          This customer has been exited. The ledger is preserved and read-only.
        </div>
      )}

      {error ? (
        <div className="text-[12px] text-bhuk-terra bg-bhuk-amber-bg rounded-[8px] p-2">{error}</div>
      ) : null}
      {info ? (
        <div className="text-[12px] text-bhuk-green-ink bg-bhuk-green-bg rounded-[8px] p-2">{info}</div>
      ) : null}
    </div>
  );
}

function MoneyForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (fd: FormData, mode: Mode) => void;
  disabled: boolean;
}) {
  const [mode, setMode] = useState<Mode>("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  return (
    <form
      className="bg-white border border-bhuk-line rounded-[14px] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!amount) return;
        const fd = new FormData();
        fd.set("amount", amount);
        fd.set("note", note);
        onSubmit(fd, mode);
        setAmount("");
        setNote("");
      }}
    >
      <div className="font-serif font-bold text-[15px] text-bhuk-maroon">
        Add money / Refund
      </div>
      <div className="flex gap-[5px] mt-2 bg-bhuk-cream p-[3px] rounded-[9px]">
        {(
          [
            { k: "credit" as const, l: "Add money" },
            { k: "refund" as const, l: "Refund" },
          ]
        ).map((o) => (
          <button
            key={o.k}
            type="button"
            onClick={() => setMode(o.k)}
            className={`flex-1 py-[7px] rounded-[7px] text-[12px] font-extrabold ${
              mode === o.k
                ? "bg-white text-bhuk-maroon shadow-card"
                : "text-bhuk-off-ink"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="Amount (₹)"
        inputMode="numeric"
        className="w-full mt-3 px-[12px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[14px] bg-white outline-none"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (UPI ref, payer name, …)"
        className="w-full mt-2 px-[12px] py-[9px] border-[1.5px] border-bhuk-line rounded-[10px] text-[12.5px] bg-white outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !amount}
        className={`w-full mt-3 py-[11px] border-0 text-white font-extrabold text-[13.5px] rounded-[10px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
          mode === "credit" ? "bg-bhuk-green" : "bg-bhuk-amber"
        }`}
      >
        {mode === "credit" ? <Plus size={15} /> : <MinusCircle size={15} />}
        {mode === "credit" ? `Add ₹${amount || "…"}` : `Refund ₹${amount || "…"}`}
      </button>
    </form>
  );
}

function OffForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (fd: FormData) => void;
  disabled: boolean;
}) {
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  return (
    <form
      className="bg-white border border-bhuk-line rounded-[14px] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!date) return;
        const fd = new FormData();
        fd.set("serviceDate", date);
        fd.set("note", note);
        onSubmit(fd);
        setDate("");
        setNote("");
      }}
    >
      <div className="font-serif font-bold text-[15px] text-bhuk-maroon">
        Mark this customer off
      </div>
      <div className="text-[11.5px] text-bhuk-ink2 mt-1 leading-snug">
        Use when the student is unwell or away and couldn't cancel themselves.
        Admin has no 4 PM limit.
      </div>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full mt-3 px-[12px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[13px] bg-white outline-none"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Reason (optional)"
        className="w-full mt-2 px-[12px] py-[9px] border-[1.5px] border-bhuk-line rounded-[10px] text-[12.5px] bg-white outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !date}
        className="w-full mt-3 py-[11px] bg-bhuk-terra text-white font-extrabold text-[13.5px] rounded-[10px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <CalendarOff size={15} />
        Mark off
      </button>
    </form>
  );
}

function DamageForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (fd: FormData) => void;
  disabled: boolean;
}) {
  const [itemKey, setItemKey] = useState("small_container");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const amount = DAMAGE_ITEMS[itemKey]?.amount ?? 0;
  const total = amount * (parseInt(qty || "1", 10) || 1);

  return (
    <form
      className="bg-white border border-bhuk-line rounded-[14px] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set("itemKey", itemKey);
        fd.set("quantity", qty);
        fd.set("note", note);
        if (photo) fd.set("photo", photo);
        onSubmit(fd);
        setItemKey("small_container");
        setQty("1");
        setNote("");
        setPhoto(null);
      }}
      encType="multipart/form-data"
    >
      <div className="font-serif font-bold text-[15px] text-bhuk-maroon flex items-center gap-2">
        <AlertTriangle size={16} className="text-bhuk-amber" /> Report damage
      </div>
      <div className="text-[11.5px] text-bhuk-ink2 mt-1 leading-snug">
        Deducted from the security deposit. Photo optional but recommended.
      </div>
      <select
        value={itemKey}
        onChange={(e) => setItemKey(e.target.value)}
        className="w-full mt-3 px-[10px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[13px] bg-white outline-none"
      >
        {Object.entries(DAMAGE_ITEMS).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label} — ₹{v.amount}
          </option>
        ))}
      </select>
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          min={1}
          max={20}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-[80px] px-[10px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[14px] bg-white outline-none"
        />
        <div className="flex-1 self-center text-[13px] text-bhuk-ink">
          Total to deduct: <b className="text-bhuk-maroon">₹{total}</b>
        </div>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (where it broke, etc.)"
        className="w-full mt-2 px-[12px] py-[9px] border-[1.5px] border-bhuk-line rounded-[10px] text-[12.5px] bg-white outline-none"
      />
      <label className="mt-2 flex items-center gap-2 text-[12px] text-bhuk-ink2">
        <Camera size={14} />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="text-[11px]"
        />
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="w-full mt-3 py-[11px] bg-bhuk-amber text-white font-extrabold text-[13.5px] rounded-[10px] cursor-pointer disabled:opacity-50"
      >
        Deduct ₹{total}
      </button>
    </form>
  );
}

function ExitForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (fd: FormData) => void;
  disabled: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <form
      className="bg-white border border-bhuk-line rounded-[14px] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirming) {
          setConfirming(true);
          return;
        }
        const fd = new FormData();
        onSubmit(fd);
        setConfirming(false);
      }}
    >
      <div className="font-serif font-bold text-[15px] text-bhuk-maroon">
        Process exit
      </div>
      <div className="text-[11.5px] text-bhuk-ink2 mt-1 leading-snug">
        Refunds remaining meal balance + security deposit, marks the
        customer inactive, and emails an exit statement. Cannot be undone.
      </div>
      <button
        type="submit"
        disabled={disabled}
        className={`w-full mt-3 py-[11px] text-white font-extrabold text-[13.5px] rounded-[10px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
          confirming ? "bg-bhuk-maroon" : "bg-[#5C4632]"
        }`}
      >
        <LogOut size={14} />
        {confirming ? "Tap again to confirm exit" : "Process exit"}
      </button>
    </form>
  );
}

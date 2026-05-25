"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";

import { useT } from "@/lib/i18n/lang-provider";

type Status = "loading" | "unsupported" | "denied" | "disabled" | "enabled";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Norm = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Norm);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const t = useT();
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "enabled" : "disabled");
    })().catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    setError(null);
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "disabled");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const r = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!r.ok) {
        await sub.unsubscribe();
        throw new Error(`subscribe failed: ${r.status}`);
      }
      setStatus("enabled");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setError(null);
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("disabled");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;
  if (status === "unsupported") {
    return (
      <div className="text-[11px] text-bhuk-off-ink">
        {t(
          "This browser doesn't support push notifications.",
          "এই ব্রাউজারে পুশ নোটিফিকেশন সমর্থিত নয়।",
        )}
      </div>
    );
  }
  if (status === "denied") {
    return (
      <div className="text-[11px] text-bhuk-amber-ink">
        {t(
          "You blocked notifications for this site. Enable them in browser settings, then refresh.",
          "এই সাইটের জন্য নোটিফিকেশন ব্লক করা আছে। ব্রাউজার সেটিংসে অনুমতি দিয়ে রিফ্রেশ করুন।",
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={status === "enabled" ? disable : enable}
        disabled={busy}
        className={`flex items-center gap-2 px-3 py-[8px] rounded-[10px] text-[12px] font-extrabold border ${
          status === "enabled"
            ? "border-bhuk-green text-bhuk-green-ink bg-bhuk-green-bg"
            : "border-bhuk-line text-bhuk-ink2 bg-white"
        }`}
      >
        {status === "enabled" ? <Bell size={13} /> : <BellOff size={13} />}
        {busy
          ? t("Working…", "অপেক্ষা করুন…")
          : status === "enabled"
          ? t("Notifications on", "নোটিফিকেশন চালু")
          : t("Turn on notifications", "নোটিফিকেশন চালু করুন")}
      </button>
      {error ? <div className="text-[11px] text-bhuk-terra mt-1">{error}</div> : null}
    </div>
  );
}

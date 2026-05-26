"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "bhuk-install-dismissed-at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// Routes where the install banner would be premature or distracting:
// signed-out flows, the subscribe form, the auth callback, the marketing
// landing, and the blog. The banner only adds value once the user is in
// their own console and likely to come back.
const SUPPRESS_PREFIXES = ["/login", "/auth", "/join", "/blog"];
function isSuppressed(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  return SUPPRESS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Shows a discrete "Install Bhuk Foods" banner when the browser fires
 * beforeinstallprompt. Dismissed banners stay hidden for ~30 days.
 * Renders nothing on iOS / already-installed / browsers without the event.
 */
export function PwaInstallPrompt() {
  const t = useT();
  const pathname = usePathname();
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setEvt(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !evt) return null;
  if (isSuppressed(pathname)) return null;

  return (
    <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-[calc(100%-28px)] max-w-[460px] bg-bhuk-maroon text-white rounded-card p-3 z-30 flex items-center gap-3 shadow-toast">
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-[13px]">
          {t("Install Bhuk Foods", "Bhuk Foods ইনস্টল করুন")}
        </div>
        <div className="text-[11.5px] text-[#F0D9B0] leading-snug">
          {t(
            "Add to your home screen for one-tap access to the calendar.",
            "হোম স্ক্রিনে যোগ করে এক ট্যাপে ক্যালেন্ডার খুলুন।",
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={async () => {
          await evt.prompt();
          await evt.userChoice;
          setEvt(null);
        }}
        className="bg-white text-bhuk-maroon font-extrabold text-[12px] px-3 py-2 rounded-[8px] border-0 cursor-pointer flex items-center gap-1"
      >
        <Download size={13} /> {t("Install", "ইনস্টল")}
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(DISMISSED_KEY, String(Date.now()));
          setEvt(null);
        }}
        className="bg-transparent border-0 text-[#F0D9B0] cursor-pointer p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}

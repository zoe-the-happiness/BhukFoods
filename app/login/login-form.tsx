"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";

import { LangToggle } from "@/components/lang-toggle";
import { useT } from "@/lib/i18n/lang-provider";

import { sendMagicLink, signInWithPassword } from "./actions";

type Mode = "magic" | "password";

/**
 * Mirrors LoginScreen in design/bhuk_foods_app.jsx, minus the demo role
 * picker. Two states: form, and "Check your email" confirmation.
 */
export function LoginForm({
  next,
  initialError = null,
}: {
  next?: string;
  initialError?: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) return;
    startTransition(async () => {
      if (mode === "password") {
        const res = await signInWithPassword({ email: trimmed, password, next });
        if (res.ok) {
          router.replace(res.redirect);
          router.refresh();
        } else {
          setError(res.error ?? t("Sign-in failed.", "লগইন ব্যর্থ হয়েছে।"));
        }
        return;
      }
      const res = await sendMagicLink({ email: trimmed, next });
      if (res?.ok) {
        setSent(true);
      } else {
        setError(res?.error ?? t("Something went wrong. Try again.", "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।"));
      }
    });
  }

  return (
    <div className="min-h-screen px-[18px] pt-[20px] pb-[40px] flex flex-col items-center">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="bg-transparent border-0 text-bhuk-terra text-[12.5px] font-bold cursor-pointer p-0 flex items-center gap-[5px] no-underline"
          >
            <ArrowLeft size={13} /> {t("Back to home", "হোমে ফিরে যান")}
          </Link>
          <LangToggle />
        </div>

        <div className="text-center mt-5 mb-6">
          <div className="font-serif font-bold text-[30px] text-bhuk-maroon -tracking-[0.5px] leading-none">
            Bhuk Foods
          </div>
          <div className="text-[12px] text-bhuk-terra font-semibold mt-[3px]">
            {t("Home-style food · NIT & JIS Agarpara", "ঘরোয়া খাবার · NIT & JIS Agarpara")}
          </div>
        </div>

        {!sent ? (
          <form
            onSubmit={submit}
            className="bg-white rounded-card p-[22px] border border-bhuk-line"
          >
            <div className="font-serif font-bold text-[17px] text-bhuk-maroon mb-[5px]">
              {t("Sign in", "লগইন করুন")}
            </div>
            <div className="text-[12.5px] text-bhuk-ink2 mb-[14px] leading-relaxed">
              {mode === "magic"
                ? t(
                    "Enter your email. We'll send you a login link. No password needed.",
                    "ইমেইল দিন, আমরা লগইন লিংক পাঠাব। কোনো পাসওয়ার্ড লাগবে না।",
                  )
                : t(
                    "Enter your email and password.",
                    "আপনার ইমেইল এবং পাসওয়ার্ড দিন।",
                  )}
            </div>
            <input
              type="email"
              required
              placeholder="your@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-[13px] py-[12px] border-[1.5px] border-bhuk-line rounded-[11px] text-[14px] outline-none mb-[10px] focus:border-bhuk-maroon transition-colors"
            />
            {mode === "password" ? (
              <input
                type="password"
                required
                placeholder={t("Password", "পাসওয়ার্ড") as string}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-[13px] py-[12px] border-[1.5px] border-bhuk-line rounded-[11px] text-[14px] outline-none mb-[10px] focus:border-bhuk-maroon transition-colors"
              />
            ) : null}
            {error ? (
              <div className="text-[12px] text-bhuk-maroon mb-[10px]">{error}</div>
            ) : null}
            <button
              type="submit"
              disabled={isPending || !email.trim() || (mode === "password" && !password)}
              className="w-full py-[12px] border-0 bg-bhuk-maroon text-white font-extrabold text-[14px] rounded-[11px] cursor-pointer flex items-center justify-center gap-[6px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mode === "password" ? <KeyRound size={15} /> : <Mail size={15} />}
              {isPending
                ? mode === "password"
                  ? t("Signing in…", "লগইন হচ্ছে…")
                  : t("Sending…", "পাঠানো হচ্ছে…")
                : mode === "password"
                ? t("Sign in", "লগইন করুন")
                : t("Send me a login link", "লগইন লিংক পাঠান")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "magic" ? "password" : "magic");
                setError(null);
                setPassword("");
              }}
              className="w-full mt-[10px] bg-transparent border-0 text-bhuk-terra text-[12px] font-bold cursor-pointer"
            >
              {mode === "magic"
                ? t("Use password instead", "পাসওয়ার্ড দিয়ে লগইন করুন")
                : t("Use a magic-link email instead", "ইমেইল লিংক দিয়ে লগইন করুন")}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-card p-[22px] border border-bhuk-line text-center">
            <div className="w-[50px] h-[50px] rounded-[13px] bg-bhuk-green-bg mx-auto mb-[10px] flex items-center justify-center">
              <Mail size={24} className="text-bhuk-green-ink" />
            </div>
            <div className="font-serif font-bold text-[17px] text-bhuk-maroon">
              {t("Check your email", "ইমেইল চেক করুন")}
            </div>
            <div className="text-[12.5px] text-bhuk-ink2 mt-[5px] leading-relaxed">
              {t(
                <>
                  We sent a login link to <b>{email}</b>.
                </>,
                <>
                  <b>{email}</b> এ লগইন লিংক পাঠানো হয়েছে।
                </>,
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setError(null);
              }}
              className="mt-[12px] bg-transparent border-0 text-bhuk-terra font-bold text-[12px] cursor-pointer"
            >
              {t("← Try a different email", "← আবার চেষ্টা")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

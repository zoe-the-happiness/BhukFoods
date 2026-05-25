"use client";

import Link from "next/link";
import { User } from "lucide-react";

import { LangToggle } from "@/components/lang-toggle";
import { useT } from "@/lib/i18n/lang-provider";

export function LandingNav() {
  const t = useT();
  return (
    <nav className="sticky top-0 z-30 bg-bhuk-cream/95 backdrop-blur border-b border-bhuk-line">
      <div className="max-w-[1080px] mx-auto px-4 py-[11px] flex items-center justify-between gap-3">
        <div className="font-serif font-bold text-[20px] text-bhuk-maroon -tracking-[0.3px]">
          Bhuk Foods
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/#pricing"
            className="hidden sm:inline-flex text-[12.5px] font-extrabold text-bhuk-ink2 hover:text-bhuk-maroon no-underline"
          >
            {t("Pricing", "মূল্য")}
          </Link>
          <Link
            href="/blog"
            className="hidden sm:inline-flex text-[12.5px] font-extrabold text-bhuk-ink2 hover:text-bhuk-maroon no-underline"
          >
            {t("Blog", "ব্লগ")}
          </Link>
          <LangToggle />
          <Link
            href="/login"
            className="bg-bhuk-maroon text-white px-[13px] py-[8px] rounded-[9px] text-[12.5px] font-extrabold flex items-center gap-[5px] no-underline"
          >
            <User size={13} /> {t("Login", "লগইন")}
          </Link>
        </div>
      </div>
    </nav>
  );
}

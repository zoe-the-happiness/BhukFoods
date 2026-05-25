"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Receipt, User } from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";

const TABS = [
  { href: "/customer", icon: Calendar, en: "Calendar", bn: "ক্যালেন্ডার" },
  { href: "/customer/ledger", icon: Receipt, en: "Ledger", bn: "খতিয়ান" },
  { href: "/customer/account", icon: User, en: "Me", bn: "আমি" },
] as const;

export function CustomerBottomTabs() {
  const t = useT();
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-bhuk-line z-20">
      <div className="max-w-[480px] mx-auto grid grid-cols-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = path === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-[10px] pb-[8px] flex flex-col items-center gap-[2px] ${
                active ? "text-bhuk-maroon" : "text-bhuk-off-ink"
              }`}
            >
              <Icon size={18} />
              <span className="text-[10.5px] font-extrabold">{t(tab.en, tab.bn)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

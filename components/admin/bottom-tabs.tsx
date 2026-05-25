"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarOff,
  FileText,
  Inbox,
  TrendingUp,
  Users,
} from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";

const TABS = [
  { href: "/admin", icon: Inbox, en: "Pending", bn: "অপেক্ষমাণ", match: (p: string) => p === "/admin" || p.startsWith("/admin/pending") },
  { href: "/admin/customers", icon: Users, en: "Customers", bn: "গ্রাহক", match: (p: string) => p.startsWith("/admin/customers") },
  { href: "/admin/closed", icon: CalendarOff, en: "Closed", bn: "বন্ধ", match: (p: string) => p.startsWith("/admin/closed") },
  { href: "/admin/templates", icon: FileText, en: "Emails", bn: "ইমেইল", match: (p: string) => p.startsWith("/admin/templates") },
  { href: "/admin/stats", icon: TrendingUp, en: "Stats", bn: "হিসাব", match: (p: string) => p.startsWith("/admin/stats") },
] as const;

export function AdminBottomTabs() {
  const t = useT();
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-bhuk-line z-20">
      <div className="max-w-[480px] mx-auto grid grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(path);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-[10px] pb-[8px] flex flex-col items-center gap-[2px] ${
                active ? "text-bhuk-maroon" : "text-bhuk-off-ink"
              }`}
            >
              <Icon size={17} />
              <span className="text-[9.5px] font-extrabold">{t(tab.en, tab.bn)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

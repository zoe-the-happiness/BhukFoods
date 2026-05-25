"use client";

import { ShieldCheck, User, ChefHat, type LucideIcon } from "lucide-react";

import { LangToggle } from "@/components/lang-toggle";
import { SignOutForm } from "@/components/sign-out-form";
import { useT } from "@/lib/i18n/lang-provider";
import type { Role } from "@/lib/types/database";

const ROLE_ICON: Record<Role, LucideIcon> = {
  admin: ShieldCheck,
  customer: User,
  cook: ChefHat,
};

/**
 * Mirrors TopBar in design/bhuk_foods_app.jsx — Bhuk Foods wordmark + role
 * label + display name + language toggle + logout.
 */
export function RoleTopBar({
  role,
  displayName,
}: {
  role: Role;
  displayName: string | null;
}) {
  const t = useT();
  const Icon = ROLE_ICON[role];
  const roleLabel = t(
    role === "admin" ? "Admin" : role === "cook" ? "Kitchen" : "Customer",
    role === "admin" ? "অ্যাডমিন" : role === "cook" ? "রান্নাঘর" : "গ্রাহক",
  );

  return (
    <div className="px-4 pt-[14px] pb-[10px] flex justify-between items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="font-serif font-bold text-[20px] text-bhuk-maroon leading-none">
          Bhuk Foods
        </div>
        <div className="flex items-center gap-[5px] mt-[3px] min-w-0">
          <Icon size={11} className="text-bhuk-terra" />
          <span className="text-[11px] text-bhuk-terra font-bold">{roleLabel}</span>
          {displayName ? (
            <span className="text-[11px] text-bhuk-off-ink whitespace-nowrap overflow-hidden text-ellipsis">
              · {displayName}
            </span>
          ) : null}
        </div>
      </div>
      <LangToggle />
      <SignOutForm />
    </div>
  );
}

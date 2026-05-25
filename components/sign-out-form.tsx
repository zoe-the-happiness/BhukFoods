"use client";

import { LogOut } from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";

/**
 * Renders a tiny POST form so we can sign out without exposing the route to
 * CSRF GET requests. Used by every authenticated console's top bar.
 */
export function SignOutForm() {
  const t = useT();
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="flex items-center gap-1 border border-bhuk-line bg-white px-[10px] py-[7px] rounded-[9px] text-[11px] font-bold cursor-pointer text-bhuk-ink2"
      >
        <LogOut size={12} />
        {t("Logout", "লগআউট")}
      </button>
    </form>
  );
}

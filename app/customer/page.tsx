import { redirect } from "next/navigation";

import { RoleTopBar } from "@/components/role-top-bar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerHome() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/customer");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, display_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "customer") redirect("/");

  return (
    <div className="max-w-[480px] mx-auto pb-[88px]">
      <RoleTopBar role="customer" displayName={profile.full_name ?? profile.display_name} />
      <div className="px-4 mt-4 space-y-3">
        <h1 className="font-serif text-2xl text-bhuk-maroon">Customer console</h1>
        <p className="text-bhuk-ink2 text-sm leading-relaxed">
          You're signed in. The calendar, ledger, and account tabs land with Step 3.
        </p>
      </div>
    </div>
  );
}

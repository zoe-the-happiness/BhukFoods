import { redirect } from "next/navigation";

import { RoleTopBar } from "@/components/role-top-bar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CookHome() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cook");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, display_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "cook") redirect("/");

  // Spec: display name in the top bar comes from profiles.display_name ("Cook 1", "Cook 2"…)
  return (
    <div className="max-w-[480px] mx-auto pb-[88px]">
      <RoleTopBar role="cook" displayName={profile.display_name ?? profile.full_name} />
      <div className="px-4 mt-4 space-y-3">
        <h1 className="font-serif text-2xl text-bhuk-maroon">Kitchen console</h1>
        <p className="text-bhuk-ink2 text-sm leading-relaxed">
          You're signed in. Today and tomorrow headcount, off list, tomorrow
          menu and the "I'm absent today" panic button land with Step 8.
        </p>
      </div>
    </div>
  );
}

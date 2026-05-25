import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types/database";

type Guarded = {
  user: { id: string; email?: string | null };
  profile: Profile;
  supabase: ReturnType<typeof createSupabaseServerClient>;
};

/**
 * Server-side guard. Used at the top of every protected page.
 *
 * - Not signed in → redirect to /login with `next` param.
 * - Profile missing / deactivated → redirect to / and clear the session.
 * - Wrong role → bounce to the role's own console root.
 */
export async function requireRole(role: Role, currentPath: string): Promise<Guarded> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/");
  }
  if (profile.role !== role) {
    redirect(
      profile.role === "admin" ? "/admin" : profile.role === "cook" ? "/cook" : "/customer",
    );
  }
  return { user, profile, supabase };
}

import { RoleTopBar } from "@/components/role-top-bar";
import { AdminBottomTabs } from "@/components/admin/bottom-tabs";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("admin", "/admin");
  return (
    <div className="max-w-[480px] mx-auto pb-[88px]">
      <RoleTopBar role="admin" displayName={profile.full_name ?? profile.display_name} />
      {children}
      <AdminBottomTabs />
    </div>
  );
}

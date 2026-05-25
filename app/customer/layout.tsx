import { RoleTopBar } from "@/components/role-top-bar";
import { CustomerBottomTabs } from "@/components/customer/bottom-tabs";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("customer", "/customer");
  return (
    <div className="max-w-[480px] mx-auto pb-[88px]">
      <RoleTopBar role="customer" displayName={profile.full_name ?? profile.display_name} />
      {children}
      <CustomerBottomTabs />
    </div>
  );
}

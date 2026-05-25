import { CustomerLedgerList } from "@/components/customer/ledger-list";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ledger" };

export default async function CustomerLedgerPage() {
  const { profile, supabase } = await requireRole("customer", "/customer/ledger");
  const { data: rows } = await supabase
    .from("ledger")
    .select("*")
    .eq("user_id", profile.id);
  return (
    <div className="px-[14px]">
      <CustomerLedgerList rows={rows ?? []} />
    </div>
  );
}

import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

export default async function AdminCustomersStub() {
  await requireRole("admin", "/admin/customers");
  return (
    <div className="px-[14px] mt-2">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Customers</div>
      <div className="text-[12.5px] text-bhuk-ink2 mt-1">
        Searchable customer list with money + damage + exit lands in Step 6.
      </div>
    </div>
  );
}

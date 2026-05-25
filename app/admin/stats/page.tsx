import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stats" };

export default async function AdminStatsStub() {
  await requireRole("admin", "/admin/stats");
  return (
    <div className="px-[14px] mt-2">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Stats</div>
      <div className="text-[12.5px] text-bhuk-ink2 mt-1">
        Headcount today/tomorrow, low-balance count, revenue estimate — Step 7.
      </div>
    </div>
  );
}

import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Closed days" };

export default async function AdminClosedStub() {
  await requireRole("admin", "/admin/closed");
  return (
    <div className="px-[14px] mt-2">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Closed days</div>
      <div className="text-[12.5px] text-bhuk-ink2 mt-1">
        Declare global meal exceptions (cook leave / festival) — lands in Step 7.
      </div>
    </div>
  );
}

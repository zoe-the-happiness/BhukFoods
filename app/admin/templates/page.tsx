import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Email templates" };

export default async function AdminTemplatesStub() {
  await requireRole("admin", "/admin/templates");
  return (
    <div className="px-[14px] mt-2">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Email templates</div>
      <div className="text-[12.5px] text-bhuk-ink2 mt-1">
        Editable subject + body with live preview — lands in Step 7.
      </div>
    </div>
  );
}

import { revalidatePath } from "next/cache";
import { CalendarOff } from "lucide-react";

import { requireRole } from "@/lib/auth-guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatIstDateEn, istToday } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Closed days" };

async function declareClosedDay(formData: FormData) {
  "use server";
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("admin only");

  const date = String(formData.get("service_date") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("meal_exceptions").upsert(
    {
      user_id: null,
      service_date: date,
      kind: "cook_leave_global",
      note: note || null,
      created_by: user.id,
    },
    { onConflict: "service_date" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/closed");
}

async function removeClosedDay(formData: FormData) {
  "use server";
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("admin only");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing id");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("meal_exceptions").delete().eq("id", id).is("user_id", null);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/closed");
}

export default async function AdminClosedDays() {
  const { supabase } = await requireRole("admin", "/admin/closed");
  const today = istToday();
  const { data: upcoming } = await supabase
    .from("meal_exceptions")
    .select("id, service_date, note, created_at")
    .is("user_id", null)
    .gte("service_date", today)
    .order("service_date");

  return (
    <div className="px-[14px] mt-[6px]">
      <div className="font-serif font-bold text-[20px] text-bhuk-maroon">Closed days</div>
      <div className="text-[11.5px] text-bhuk-ink2">
        Cook leave, festival, kitchen maintenance. Customers are not charged
        and their plan automatically extends.
      </div>

      <form action={declareClosedDay} className="mt-3 bg-white border border-bhuk-line rounded-[14px] p-4">
        <input
          type="date"
          name="service_date"
          required
          min={today}
          className="w-full px-[12px] py-[11px] border-[1.5px] border-bhuk-line rounded-[10px] text-[13.5px] bg-white outline-none"
        />
        <input
          name="note"
          placeholder="Reason (e.g. cook leave, festival)"
          className="w-full mt-2 px-[12px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[13px] bg-white outline-none"
        />
        <button
          type="submit"
          className="w-full mt-3 py-[12px] bg-bhuk-maroon text-white font-extrabold text-[13.5px] rounded-[10px] cursor-pointer flex items-center justify-center gap-2"
        >
          <CalendarOff size={15} /> Declare day off
        </button>
      </form>

      <div className="mt-3 bg-white border border-bhuk-line rounded-[14px]">
        <div className="px-4 pt-3 pb-1 font-serif font-bold text-[14px] text-bhuk-maroon">
          Upcoming closed days
        </div>
        {(upcoming ?? []).length === 0 ? (
          <div className="p-4 text-[12px] text-bhuk-off-ink">No closed days scheduled.</div>
        ) : (
          upcoming!.map((row) => (
            <form
              key={row.id}
              action={removeClosedDay}
              className="flex justify-between items-center px-4 py-[10px] border-t border-bhuk-off"
            >
              <input type="hidden" name="id" value={row.id} />
              <div>
                <div className="font-extrabold text-[12.5px] text-bhuk-ink">
                  {formatIstDateEn(row.service_date)}
                </div>
                {row.note ? (
                  <div className="text-[10.5px] text-bhuk-off-ink mt-[1px]">{row.note}</div>
                ) : null}
              </div>
              <button
                type="submit"
                className="text-[11px] font-bold text-bhuk-terra bg-transparent border-0 cursor-pointer"
              >
                Remove
              </button>
            </form>
          ))
        )}
      </div>
    </div>
  );
}

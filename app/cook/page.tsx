import { Lock } from "lucide-react";

import { RoleTopBar } from "@/components/role-top-bar";
import { CookPanicButton } from "./panic-button";
import { requireRole } from "@/lib/auth-guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { istToday } from "@/lib/time";
import { menuForDay } from "@/lib/menu";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kitchen" };

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function CookHome() {
  const { profile } = await requireRole("cook", "/cook");
  const today = istToday();
  const tomorrow = nextDay(today);

  // Cook RLS only exposes their own profile + global meal_exceptions. The
  // headcount data we want (per-customer names) needs to bypass RLS. The
  // service-role admin client is server-only and the cook never sees the
  // raw query — we only render the aggregate.
  const admin = createSupabaseAdminClient();

  const [{ data: todayEaters }, { data: tomorrowEaters }, { data: todayOffs }, { data: tomorrowOffs }] =
    await Promise.all([
      admin.rpc("customers_eating_on", { p_service_date: today }),
      admin.rpc("customers_eating_on", { p_service_date: tomorrow }),
      admin
        .from("meal_exceptions")
        .select("service_date, user_id, kind, note, profiles!meal_exceptions_user_id_fkey(full_name, college, workplace)")
        .eq("service_date", today)
        .not("user_id", "is", null),
      admin
        .from("meal_exceptions")
        .select("service_date, user_id, kind, note, profiles!meal_exceptions_user_id_fkey(full_name, college, workplace)")
        .eq("service_date", tomorrow)
        .not("user_id", "is", null),
    ]);

  // Cook sheet locks at 16:30 IST; show a lock badge on tomorrow's tile
  // when the cutoff is past so cooks don't get confused.
  const tomorrowMenu = menuForDay(tomorrow);
  const tomorrowWd = (() => {
    const [y, m, d] = tomorrow.split("-").map(Number);
    return new Date(y, m - 1, d).getDay();
  })();

  return (
    <div className="max-w-[480px] mx-auto pb-12">
      <RoleTopBar role="cook" displayName={profile.display_name ?? profile.full_name} />

      <div className="px-[14px] mt-[6px]">
        <div className="font-serif font-bold text-[20px] text-bhuk-maroon">
          Today &amp; tomorrow
        </div>
        <div className="text-[11.5px] text-bhuk-ink2">
          How many meals the kitchen has to prepare.
        </div>

        <div className="grid grid-cols-2 gap-[10px] mt-3">
          <div className="bg-bhuk-green rounded-[14px] p-[14px] text-white">
            <div className="text-[10.5px] font-extrabold text-bhuk-saffron tracking-wide">
              TODAY'S MEALS
            </div>
            <div className="font-serif font-bold text-[42px] leading-none mt-[4px]">
              {todayEaters?.length ?? 0}
            </div>
            <div className="text-[11px] text-[#E4F0DD] mt-[4px]">
              customers · 2 meals each
            </div>
          </div>
          <div className="bg-bhuk-maroon rounded-[14px] p-[14px] text-white">
            <div className="text-[10.5px] font-extrabold text-bhuk-saffron tracking-wide">
              TOMORROW
            </div>
            <div className="font-serif font-bold text-[42px] leading-none mt-[4px]">
              {tomorrowEaters?.length ?? 0}
            </div>
            <div className="text-[11px] text-[#F0D9B0] mt-[4px] flex items-center gap-[4px]">
              <Lock size={11} /> locked at 4 PM
            </div>
          </div>
        </div>

        {tomorrowMenu ? (
          <div className="mt-3 bg-white border border-bhuk-line rounded-[14px] p-[14px]">
            <div className="font-serif font-bold text-[15px] text-bhuk-maroon">
              Tomorrow's menu · {WEEKDAYS_EN[tomorrowWd]}
            </div>
            <div className="mt-2 text-[13px] text-bhuk-ink2 leading-relaxed">
              <div>
                <b className="text-bhuk-terra">Brunch ·</b> {tomorrowMenu.brunch_en}
              </div>
              <div className="mt-[4px]">
                <b className="text-bhuk-green-ink">Dinner ·</b> {tomorrowMenu.dinner_en}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 bg-bhuk-cream border border-bhuk-line rounded-[14px] p-[14px] text-[12.5px] text-bhuk-off-ink">
            Tomorrow is Sunday — no service.
          </div>
        )}

        <OffList title="Not eating today" rows={todayOffs ?? []} />
        <OffList title="Not eating tomorrow" rows={tomorrowOffs ?? []} />

        <CookPanicButton />
      </div>
    </div>
  );
}

type ProfileShort = { full_name: string | null; college: string | null; workplace: string | null };
type OffRow = {
  user_id: string | null;
  kind: string;
  note: string | null;
  // PostgREST returns the joined relation as an array when the FK isn't unique.
  profiles: ProfileShort | ProfileShort[] | null;
};

function firstProfile(p: OffRow["profiles"]): ProfileShort | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

function OffList({ title, rows }: { title: string; rows: OffRow[] }) {
  return (
    <div className="mt-3 bg-white border border-bhuk-line rounded-[14px] p-[14px]">
      <div className="font-serif font-bold text-[14px] text-bhuk-maroon">{title}</div>
      {rows.length === 0 ? (
        <div className="text-[12px] text-bhuk-off-ink mt-[6px]">
          No one — everyone is eating.
        </div>
      ) : (
        rows.map((r, i) => {
          const p = firstProfile(r.profiles);
          return (
            <div
              key={`${r.user_id}-${i}`}
              className="flex justify-between items-center py-[7px] border-t border-bhuk-off"
            >
              <div>
                <span className="font-extrabold text-[12.5px] text-bhuk-ink">
                  {p?.full_name ?? "—"}
                </span>
                {p?.college || p?.workplace ? (
                  <span className="text-[10.5px] text-bhuk-off-ink ml-2">
                    {p?.college ?? p?.workplace}
                  </span>
                ) : null}
              </div>
              <span className="text-[10.5px] text-bhuk-off-ink">
                {r.kind === "customer_cancel"
                  ? "self-cancelled"
                  : r.kind === "admin_user_off"
                  ? "admin marked off"
                  : "—"}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

function nextDay(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  const x = new Date(y, m - 1, day + 1);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

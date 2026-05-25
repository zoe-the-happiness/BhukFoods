import { NextRequest, NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron/auth";
import { sendMail } from "@/lib/email/resend";
import { renderTemplate } from "@/lib/email/render";
import { sendPushToAdmin, sendPushToCooks } from "@/lib/push/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildCookSheetPdf } from "@/lib/cron/cook-sheet-pdf";
import { menuForDay } from "@/lib/menu";
import { formatIstDateBn, formatIstDateEn } from "@/lib/time";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Job C — 16:30 IST. The headcount for tomorrow has now locked. Generate a
 * one-page cook sheet PDF, upload to the cook-sheets storage bucket, email
 * to the kitchen Epson printer (auto-print) + admin (CC).
 */
export async function POST(request: NextRequest) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  const { data: todayResp } = await admin.rpc("ist_today");
  const today = String(todayResp);
  const tomorrow = nextDay(today);

  // Eating list (rich rows) + off list with profile join.
  const [{ data: eaters }, { data: offsRaw }] = await Promise.all([
    admin.rpc("customers_eating_on", { p_service_date: tomorrow }),
    admin
      .from("meal_exceptions")
      .select("kind, note, profiles!meal_exceptions_user_id_fkey(full_name)")
      .eq("service_date", tomorrow)
      .not("user_id", "is", null),
  ]);

  const menu = menuForDay(tomorrow);

  type EaterRow = {
    full_name: string | null;
    phone: string | null;
    delivery_mode: string | null;
    delivery_address: string | null;
    landmark: string | null;
    college: string | null;
    workplace: string | null;
    food_preference: string | null;
  };

  type OffRow = {
    kind: string;
    note: string | null;
    profiles: { full_name: string | null }[] | { full_name: string | null } | null;
  };

  const off = (offsRaw as unknown as OffRow[] | null ?? []).map((o) => {
    const p = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
    return { full_name: p?.full_name ?? null, kind: o.kind, note: o.note };
  });

  const pdfBytes = await buildCookSheetPdf({
    serviceDate: tomorrow,
    dateEn: formatIstDateEn(tomorrow),
    dateBn: formatIstDateBn(tomorrow),
    headcount: eaters?.length ?? 0,
    eating: (eaters as unknown as EaterRow[] | null ?? []),
    off,
    menu: menu ? { brunch: menu.brunch_en, dinner: menu.dinner_en } : null,
  });

  const buffer = Buffer.from(pdfBytes);

  // Upload to Storage (private bucket; admin RLS).
  const storagePath = `cook-sheets/${tomorrow}.pdf`;
  const { error: upErr } = await admin.storage
    .from("cook-sheets")
    .upload(`${tomorrow}.pdf`, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (upErr) {
    console.error("[cook-sheet] storage upload failed:", upErr);
  }

  // Record / refresh cook_sheets row.
  await admin
    .from("cook_sheets")
    .upsert(
      {
        service_date: tomorrow,
        pdf_storage_path: storagePath,
        headcount: eaters?.length ?? 0,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "service_date" },
    );

  // Email the PDF.
  const recipients: string[] = [];
  const adminEmail = process.env.ADMIN_EMAIL;
  const printerEmail = process.env.EPSON_PRINTER_EMAIL;
  if (printerEmail) recipients.push(printerEmail);

  try {
    const tpl = await renderTemplate("cook_sheet_admin", {
      tomorrow_date: formatIstDateEn(tomorrow),
      headcount: eaters?.length ?? 0,
    });
    await sendMail({
      to: recipients.length ? recipients : [adminEmail || "bhukfoods@gmail.com"],
      cc: adminEmail && recipients.length ? [adminEmail] : undefined,
      subject: tpl.subject,
      text: tpl.text,
      attachments: [
        {
          filename: `bhuk-foods-${tomorrow}.pdf`,
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (err) {
    console.error("[cook-sheet] email failed:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }

  // Web Push to admin + cook ("Cook sheet locked. Tomorrow: X meals.")
  await Promise.allSettled([
    sendPushToAdmin({
      title: "Cook sheet locked",
      body: `Tomorrow: ${eaters?.length ?? 0} meals · ${formatIstDateEn(tomorrow)}`,
      url: "/admin/stats",
      tag: `cook-sheet-${tomorrow}`,
    }),
    sendPushToCooks({
      title: `Cook ${eaters?.length ?? 0} for tomorrow`,
      body: `Sheet locked · ${formatIstDateEn(tomorrow)}`,
      url: "/cook",
      tag: `cook-sheet-${tomorrow}`,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    date: tomorrow,
    headcount: eaters?.length ?? 0,
    storage_path: storagePath,
  });
}

function nextDay(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  const x = new Date(y, m - 1, day + 1);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

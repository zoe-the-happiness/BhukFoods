import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CookSheetData = {
  serviceDate: string;
  dateEn: string;
  dateBn: string;
  headcount: number;
  eating: Array<{
    full_name: string | null;
    phone: string | null;
    delivery_mode: string | null;
    delivery_address: string | null;
    landmark: string | null;
    college: string | null;
    workplace: string | null;
    food_preference: string | null;
  }>;
  off: Array<{
    full_name: string | null;
    kind: string;
    note?: string | null;
  }>;
  menu: { brunch: string; dinner: string } | null;
};

/**
 * StandardFonts.Helvetica only supports the WinAnsi character set. Anything
 * outside that — em/en dashes, ellipsis, curly quotes, Bengali script, the
 * ₹ glyph — throws "WinAnsi cannot encode" and crashes the PDF build.
 *
 * `safe()` rewrites every string we draw into ASCII-safe equivalents.
 * We don't embed a TTF here because the cook sheet is a daily operational
 * artefact, not a customer-facing brand piece — readability beats
 * typography, and the printer doesn't care.
 */
function safe(input: string | null | undefined): string {
  if (input == null) return "";
  return input
    .replace(/[‘’‚‛]/g, "'")  // curly singles → '
    .replace(/[“”„‟]/g, '"')  // curly doubles → "
    .replace(/[–—―]/g, "-")         // en/em dash, horizontal bar → -
    .replace(/…/g, "...")                     // ellipsis → ...
    .replace(/·/g, "*")                       // middle dot → *
    .replace(/•/g, "*")                       // bullet → *
    .replace(/[₹]/g, "Rs.")                   // ₹ → Rs.
    .replace(/[ ]/g, " ")                     // non-breaking space → space
    .replace(/[^\x20-\x7E]/g, "?");                // anything else (Bengali, etc.) → ?
}

/**
 * Builds a single A4 landscape page so the eating list fits side-by-side
 * with the off list. Returns the raw PDF bytes.
 */
export async function buildCookSheetPdf(data: CookSheetData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.17, 0.12, 0.09);
  const maroon = rgb(0.55, 0.15, 0.08);
  const off = rgb(0.6, 0.57, 0.5);

  const drawText = (text: string, opts: Parameters<typeof page.drawText>[1]) =>
    page.drawText(safe(text), opts);

  const margin = 28;
  let y = 595 - margin;

  // Header
  drawText("Bhuk Foods - Cook Sheet", { x: margin, y: y - 4, size: 22, font: fb, color: maroon });
  y -= 32;
  drawText(`For ${data.dateEn}`, { x: margin, y, size: 12, font: f, color: ink });
  drawText(`(${data.dateBn})`, { x: margin + 200, y, size: 12, font: f, color: off });
  y -= 20;

  // Headcount big number
  drawText("Headcount:", { x: margin, y, size: 12, font: f, color: ink });
  drawText(String(data.headcount), { x: margin + 90, y: y - 6, size: 28, font: fb, color: maroon });
  y -= 36;

  // Menu
  if (data.menu) {
    drawText("Tomorrow's menu:", { x: margin, y, size: 11, font: fb, color: ink });
    y -= 14;
    drawText(`Brunch * ${truncate(data.menu.brunch, 110)}`, { x: margin, y, size: 10, font: f, color: ink });
    y -= 13;
    drawText(`Dinner * ${truncate(data.menu.dinner, 110)}`, { x: margin, y, size: 10, font: f, color: ink });
    y -= 22;
  }

  // Two-column lists
  const colLeftX = margin;
  const colRightX = 842 / 2 + 8;
  const startY = y;

  drawText(`Eating (${data.eating.length})`, { x: colLeftX, y: startY, size: 13, font: fb, color: maroon });
  let leftY = startY - 16;
  for (let i = 0; i < data.eating.length; i++) {
    const e = data.eating[i];
    if (leftY < margin) break;
    const line1 = `${i + 1}. ${e.full_name ?? "-"}${e.phone ? ` * ${e.phone}` : ""}`;
    const line2 = [
      e.college || e.workplace,
      e.delivery_mode === "blpga_onsite" ? "BLPGA" : e.delivery_mode === "self_pickup" ? "self-pickup" : null,
      e.delivery_mode === "home_delivery" && e.delivery_address
        ? `${truncate(e.delivery_address, 50)}${e.landmark ? ` (${truncate(e.landmark, 28)})` : ""}`
        : null,
      e.food_preference === "veg" ? "VEG" : null,
    ]
      .filter(Boolean)
      .join(" * ");
    drawText(truncate(line1, 90), { x: colLeftX, y: leftY, size: 9.5, font: fb, color: ink });
    leftY -= 11;
    if (line2) {
      drawText(truncate(line2, 110), { x: colLeftX + 6, y: leftY, size: 9, font: f, color: off });
      leftY -= 11;
    }
    leftY -= 3;
  }

  drawText(`Off (${data.off.length})`, { x: colRightX, y: startY, size: 13, font: fb, color: maroon });
  let rightY = startY - 16;
  for (let i = 0; i < data.off.length; i++) {
    if (rightY < margin) break;
    const o = data.off[i];
    drawText(
      `${i + 1}. ${o.full_name ?? "-"} - ${o.kind === "customer_cancel" ? "self-cancelled" : o.kind === "admin_user_off" ? "admin off" : o.kind}`,
      { x: colRightX, y: rightY, size: 9.5, font: f, color: ink },
    );
    rightY -= 12;
    if (o.note) {
      drawText(truncate(o.note, 80), { x: colRightX + 6, y: rightY, size: 9, font: f, color: off });
      rightY -= 12;
    }
  }

  // Footer
  drawText("Mon-Sat service * Sunday off * Bhuk Foods, 43 Matangini Hazra Pally, Agarpara", {
    x: margin,
    y: margin - 12,
    size: 8,
    font: f,
    color: off,
  });

  return await doc.save();
}

function truncate(s: string, n: number): string {
  // Use "..." (3 dots) instead of the U+2026 ellipsis so safe() doesn't have to.
  return s.length > n ? s.slice(0, n - 1) + "..." : s;
}

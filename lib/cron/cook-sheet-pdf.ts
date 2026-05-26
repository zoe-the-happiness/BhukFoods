// Polyfill required by @pdf-lib/fontkit's CJS bundle on Vercel's Node runtime.
// Fontkit was compiled with regenerator-runtime references but doesn't ship the
// polyfill itself, so without this the function throws a ReferenceError on
// first import. Must be the very first import so it runs before fontkit loads.
import "regenerator-runtime/runtime";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, rgb } from "pdf-lib";

import { toBengaliNumerals } from "@/lib/time";

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
  /** From lib/menu.ts. Both en + bn captions are passed; the PDF prints bn. */
  menu: { brunchBn: string; dinnerBn: string; brunchEn: string; dinnerEn: string } | null;
};

/**
 * Builds the daily cook sheet PDF in Bengali (with English fall-throughs for
 * place names like "BLPGA" or "NIT Agarpara" — Noto Sans Bengali covers
 * Latin glyphs in addition to Bengali script).
 *
 * Font: Noto Sans Bengali variable, bundled at lib/cron/fonts/. The variable
 * font supports every weight via OpenType variations; we use a single weight
 * for the whole sheet and use font-size + colour for hierarchy instead of a
 * separate Bold cut.
 *
 * On Vercel the font file ships in the /api/cron/cook-sheet function bundle
 * via next.config.mjs > experimental.outputFileTracingIncludes.
 */
let _fontBytes: Uint8Array | null = null;
function loadFontBytes(): Uint8Array {
  if (_fontBytes) return _fontBytes;
  const p = join(process.cwd(), "lib/cron/fonts/NotoSansBengali-Regular.ttf");
  _fontBytes = readFileSync(p);
  return _fontBytes;
}

/** Bengali numerals helper bound to a particular boolean toggle. */
const bn = (n: number | string) => toBengaliNumerals(n);

export async function buildCookSheetPdf(data: CookSheetData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font: PDFFont = await doc.embedFont(loadFontBytes(), { subset: true });

  const page = doc.addPage([842, 595]); // A4 landscape

  const ink = rgb(0.17, 0.12, 0.09);
  const maroon = rgb(0.55, 0.15, 0.08);
  const off = rgb(0.6, 0.57, 0.5);

  // Wrapper so every drawText call uses the Bengali font.
  const draw = (
    text: string,
    opts: { x: number; y: number; size: number; color?: ReturnType<typeof rgb> },
  ) =>
    page.drawText(text, {
      x: opts.x,
      y: opts.y,
      size: opts.size,
      font,
      color: opts.color ?? ink,
    });

  const margin = 28;
  let y = 595 - margin;

  // HEADER — big maroon Bengali title
  draw("Bhuk Foods · রান্নার তালিকা", { x: margin, y: y - 4, size: 24, color: maroon });
  y -= 32;
  draw(`তারিখ: ${data.dateBn}`, { x: margin, y, size: 13 });
  draw(`(${data.dateEn})`, { x: margin + 320, y, size: 12, color: off });
  y -= 22;

  // HEADCOUNT — big bold-feeling number
  draw("মোট সংখ্যা:", { x: margin, y, size: 13 });
  draw(bn(data.headcount), { x: margin + 110, y: y - 8, size: 30, color: maroon });
  y -= 38;

  // MENU — Bengali brunch + dinner
  if (data.menu) {
    draw("আগামীকালের মেনু:", { x: margin, y, size: 12, color: maroon });
    y -= 15;
    draw(`ব্রাঞ্চ · ${truncate(data.menu.brunchBn, 88)}`, { x: margin, y, size: 11 });
    y -= 14;
    draw(`ডিনার · ${truncate(data.menu.dinnerBn, 88)}`, { x: margin, y, size: 11 });
    y -= 24;
  }

  // TWO COLUMNS — eating + off
  const colLeftX = margin;
  const colRightX = 842 / 2 + 8;
  const startY = y;

  draw(`খাবেন (${bn(data.eating.length)})`, {
    x: colLeftX,
    y: startY,
    size: 14,
    color: maroon,
  });
  let leftY = startY - 18;
  for (let i = 0; i < data.eating.length; i++) {
    const e = data.eating[i];
    if (leftY < margin) break;
    const idx = bn(i + 1);
    const line1 = `${idx}. ${e.full_name ?? "—"}${e.phone ? `  ·  ${e.phone}` : ""}`;
    const segments = [
      e.college || e.workplace,
      e.delivery_mode === "blpga_onsite"
        ? "BLPGA"
        : e.delivery_mode === "self_pickup"
        ? "নিজে আসবেন"
        : null,
      e.delivery_mode === "home_delivery" && e.delivery_address
        ? `${truncate(e.delivery_address, 48)}${e.landmark ? ` (${truncate(e.landmark, 26)})` : ""}`
        : null,
      e.food_preference === "veg" ? "নিরামিষ" : null,
    ].filter(Boolean) as string[];
    draw(truncate(line1, 78), { x: colLeftX, y: leftY, size: 10.5 });
    leftY -= 12;
    if (segments.length) {
      draw(truncate(segments.join(" · "), 96), {
        x: colLeftX + 6,
        y: leftY,
        size: 9.5,
        color: off,
      });
      leftY -= 12;
    }
    leftY -= 3;
  }

  draw(`খাবেন না (${bn(data.off.length)})`, {
    x: colRightX,
    y: startY,
    size: 14,
    color: maroon,
  });
  let rightY = startY - 18;
  for (let i = 0; i < data.off.length; i++) {
    if (rightY < margin) break;
    const o = data.off[i];
    const reason =
      o.kind === "customer_cancel"
        ? "নিজে বাতিল করেছেন"
        : o.kind === "admin_user_off"
        ? "অ্যাডমিন বন্ধ রেখেছে"
        : o.kind;
    draw(`${bn(i + 1)}. ${o.full_name ?? "—"} · ${reason}`, {
      x: colRightX,
      y: rightY,
      size: 10.5,
    });
    rightY -= 12;
    if (o.note) {
      draw(truncate(o.note, 80), { x: colRightX + 6, y: rightY, size: 9.5, color: off });
      rightY -= 12;
    }
  }

  // FOOTER
  draw(
    "সোম–শনি পরিষেবা · রবিবার বন্ধ · Bhuk Foods · ৪৩, মাতঙ্গিনী হাজরা পল্লী, আগরপাড়া",
    { x: margin, y: margin - 12, size: 8.5, color: off },
  );

  return await doc.save();
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

"use client";

import { useLang } from "@/lib/i18n/lang-provider";

/**
 * EN / বাং pill toggle. Mirrors the LangToggle in design/bhuk_foods_app.jsx.
 *
 * `dark` variant is used over coloured backgrounds (e.g. hero), `light` is the
 * default for paper-white surfaces.
 */
export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();

  const wrap = dark
    ? "bg-white/10 border border-white/20"
    : "bg-white border border-bhuk-line";

  const activeColors = dark
    ? "bg-white text-bhuk-maroon"
    : "bg-bhuk-maroon text-white";

  const inactiveColors = dark
    ? "text-white"
    : "text-bhuk-ink2";

  return (
    <div className={`inline-flex items-center rounded-pill p-[3px] ${wrap}`}>
      {(
        [
          { k: "en" as const, lbl: "EN", fontClass: "" },
          { k: "bn" as const, lbl: "বাং", fontClass: "font-bn" },
        ]
      ).map((opt) => {
        const active = lang === opt.k;
        return (
          <button
            key={opt.k}
            onClick={() => setLang(opt.k)}
            className={`px-[11px] py-[5px] rounded-pill text-[11.5px] font-extrabold tracking-[0.3px] transition-colors ${
              active ? activeColors : `bg-transparent ${inactiveColors}`
            } ${opt.fontClass}`}
            type="button"
          >
            {opt.lbl}
          </button>
        );
      })}
    </div>
  );
}

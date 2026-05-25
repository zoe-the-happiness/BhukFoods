"use client";

import { useT } from "@/lib/i18n/lang-provider";
import { Check, type LucideIcon } from "lucide-react";

/**
 * Section title and content building blocks used by the landing page.
 * Kept as a single client component because every block reads useT().
 */

export function SectionTitle({ en, bn }: { en: string; bn: string }) {
  const t = useT();
  return (
    <h2 className="font-serif font-bold text-[22px] text-bhuk-maroon -tracking-[0.3px] m-0">
      {t(en, bn)}
    </h2>
  );
}

export function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="bg-white border border-bhuk-line rounded-[13px] px-[14px] py-[12px]">
      <div className="font-serif font-bold text-[22px] text-bhuk-maroon leading-none">
        {n}
      </div>
      <div className="text-[11.5px] text-bhuk-ink2 font-semibold mt-1">{l}</div>
    </div>
  );
}

export function StepCard({ n, t: title, d }: { n: string; t: string; d: string }) {
  return (
    <div className="bg-white border border-bhuk-line rounded-[14px] p-4">
      <div className="w-[30px] h-[30px] rounded-[9px] bg-bhuk-maroon text-white flex items-center justify-center font-extrabold font-serif">
        {n}
      </div>
      <div className="font-serif font-bold text-[15px] text-bhuk-ink mt-[10px]">
        {title}
      </div>
      <div className="text-[12.5px] text-bhuk-ink2 mt-[5px] leading-relaxed">
        {d}
      </div>
    </div>
  );
}

export function Bullet({ t: text }: { t: string }) {
  return (
    <div className="flex gap-2 items-start">
      <Check size={16} className="text-bhuk-green shrink-0 mt-[1px]" />
      <span className="text-[13px] text-bhuk-ink leading-relaxed">{text}</span>
    </div>
  );
}

export function InfoCard({
  icon: Icon,
  t: title,
  v,
  sub,
}: {
  icon: LucideIcon;
  t: string;
  v: string;
  sub: string;
}) {
  return (
    <div className="bg-white border border-bhuk-line rounded-[13px] p-[14px]">
      <div className="flex items-center gap-[7px]">
        <Icon size={14} className="text-bhuk-terra" />
        <span className="text-[11.5px] font-extrabold text-bhuk-off-ink tracking-wide">
          {title}
        </span>
      </div>
      <div className="font-serif font-bold text-bhuk-maroon text-[15px] mt-[5px]">
        {v}
      </div>
      <div className="text-[11.5px] text-bhuk-ink2 mt-[3px]">{sub}</div>
    </div>
  );
}

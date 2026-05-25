"use client";

import { ExternalLink, Star } from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";
import { ik } from "@/lib/photos";
import { REVIEWS, type Review } from "@/lib/reviews";

/**
 * Auto-scrolling, hover-to-pause Google reviews marquee. Pure CSS animation
 * (no JS) — we render the deck twice in a row and translate the wrapper
 * -50% to make the loop seamless.
 */
export function ReviewsMarquee() {
  const t = useT();

  // Two passes of the deck makes the loop seamless when translated -50%.
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <div className="mt-[14px]">
      <div className="flex items-center gap-2 text-[12px] text-bhuk-ink2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className="text-bhuk-saffron fill-bhuk-saffron" />
          ))}
        </div>
        <span className="font-semibold">
          {t(
            "Verified reviews on Google",
            "Google-এ যাচাইকৃত রিভিউ",
          )}
        </span>
      </div>

      <div
        className="relative mt-3 overflow-hidden"
        // Soft fade edges so cards don't get clipped abruptly.
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%)",
        }}
      >
        <div className="bhuk-marquee-track flex gap-4 w-max">
          {loop.map((r, i) => (
            <ReviewCard key={`${r.name}-${i}`} review={r} />
          ))}
        </div>
      </div>

      <div className="mt-3 text-[12px] text-bhuk-off-ink">
        {t(
          "Hover to pause.",
          "মাউস হোভার করলে থামবে।",
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const t = useT();
  return (
    <a
      href={review.reviewUrl}
      target="_blank"
      rel="noreferrer"
      className="shrink-0 w-[260px] sm:w-[300px] bg-white border border-bhuk-line rounded-card overflow-hidden no-underline hover:border-bhuk-maroon transition-colors flex flex-col"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ik(review.imageUrl, "w-640,q-80,f-auto")}
        alt={t(`Google review by ${review.name}`, `${review.name}-এর Google রিভিউ`) as string}
        loading="lazy"
        className="w-full h-[300px] sm:h-[340px] object-contain bg-white"
      />
      <div className="px-3 py-2 border-t border-bhuk-off flex items-center justify-between gap-2 mt-auto">
        <div className="text-[12.5px] font-extrabold text-bhuk-ink truncate">
          — {review.name}
        </div>
        <span className="text-[10.5px] text-bhuk-terra font-bold flex items-center gap-[3px] whitespace-nowrap">
          {t("Read on Google", "Google-এ পড়ুন")} <ExternalLink size={10} />
        </span>
      </div>
    </a>
  );
}

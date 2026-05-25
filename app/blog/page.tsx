import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { LandingNav } from "@/components/landing/nav";
import { POSTS } from "@/lib/blog/registry";
import { ik, IK, PHOTOS } from "@/lib/photos";
import { formatIstDateEn } from "@/lib/time";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata = {
  title: "Blog · stop cooking, start living",
  description:
    "Field notes from Bhuk Foods — India's first kitchen substitution service, run out of a FSSAI-registered kitchen in Agarpara, Kolkata.",
  openGraph: {
    type: "website",
    title: "Bhuk Foods blog",
    description:
      "Founder notes, kitchen logistics, and the economics of a real ₹100 meal — from the kitchen at 43, Matangini Hazra Pally.",
  },
};

const SITE = "https://www.bhukfoods.com";

export default function BlogIndex() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${SITE}/blog#blog`,
        name: "Bhuk Foods Blog",
        description:
          "Field notes from Bhuk Foods — India's first kitchen substitution service in Agarpara, Kolkata.",
        url: `${SITE}/blog`,
        inLanguage: "en-IN",
        blogPost: POSTS.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.publishedAt,
          url: `${SITE}/blog/${p.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Bhuk Foods", item: SITE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <LandingNav />
      <main className="max-w-[920px] mx-auto px-[18px] py-10">
        <header className="mb-8">
          <div className="text-[11px] font-extrabold text-bhuk-terra tracking-wider">
            BHUK FOODS · BLOG
          </div>
          <h1 className="font-serif font-bold text-[34px] text-bhuk-maroon mt-2 -tracking-[0.4px]">
            Stop cooking, start living.
          </h1>
          <p className="text-[14.5px] text-bhuk-ink2 mt-2 max-w-[640px] leading-relaxed">
            We don&apos;t sell a tiffin. We sell the kitchen back. These are the field
            notes — how the rules work, why the prices are what they are, what happens
            inside the kitchen at 43, Matangini Hazra Pally.
          </p>
        </header>

        <ol className="list-none flex flex-col gap-4">
          {POSTS.map((post) => {
            const hero = PHOTOS.blogHero[post.slug];
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block bg-white border border-bhuk-line rounded-card no-underline hover:border-bhuk-maroon transition-colors overflow-hidden grid md:grid-cols-[280px_1fr] gap-0"
                >
                  {hero ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ik(hero, IK.thumb)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full max-h-[220px] md:max-h-none object-cover aspect-[16/10] md:aspect-auto"
                    />
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] text-bhuk-off-ink font-bold">
                      <span>{formatIstDateEn(post.publishedAt)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {post.readMinutes} min
                      </span>
                    </div>
                    <h2 className="font-serif font-bold text-[22px] text-bhuk-maroon mt-2 -tracking-[0.2px] leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-[14px] text-bhuk-ink2 leading-relaxed mt-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-3 text-[12.5px] text-bhuk-terra font-bold flex items-center gap-1">
                      Read more <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 bg-bhuk-cream border border-bhuk-line rounded-card p-5">
          <div className="font-serif font-bold text-[18px] text-bhuk-maroon">
            Ready to stop cooking?
          </div>
          <p className="text-[13.5px] text-bhuk-ink2 mt-1">
            Two meals a day, Mon–Sat, all-inclusive.{" "}
            <Link href="/#pricing" className="text-bhuk-terra font-bold underline underline-offset-2">
              See full pricing →
            </Link>
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/join"
              className="bg-bhuk-maroon text-white px-5 py-3 rounded-[11px] font-extrabold text-[14px] no-underline"
            >
              Subscribe →
            </Link>
            <a
              href="https://wa.me/917595923777"
              className="bg-white border-[1.5px] border-bhuk-line text-bhuk-ink px-5 py-3 rounded-[11px] font-extrabold text-[14px] no-underline"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

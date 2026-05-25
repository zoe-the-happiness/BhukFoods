import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { LandingNav } from "@/components/landing/nav";
import { POSTS, postBySlug, siteUrlForPost } from "@/lib/blog/registry";
import { formatIstDateEn } from "@/lib/time";

export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = postBySlug(params.slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: siteUrlForPost(post.slug) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: siteUrlForPost(post.slug),
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = postBySlug(params.slug);
  if (!post) notFound();
  const Body = post.body;

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <LandingNav />
      <article className="max-w-[720px] mx-auto px-[18px] py-10">
        <Link
          href="/blog"
          className="text-bhuk-terra text-[12.5px] font-bold flex items-center gap-1 no-underline"
        >
          <ArrowLeft size={13} /> All posts
        </Link>

        <header className="mt-4">
          <div className="flex items-center gap-2 text-[11.5px] text-bhuk-off-ink font-bold">
            <span>{formatIstDateEn(post.publishedAt)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {post.readMinutes} min read
            </span>
          </div>
          <h1 className="font-serif font-bold text-[32px] text-bhuk-maroon mt-3 -tracking-[0.4px] leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="mt-6">
          <Body />
        </div>

        <div className="mt-10 pt-6 border-t border-bhuk-off">
          <div className="bg-bhuk-cream rounded-card p-5">
            <div className="font-serif font-bold text-[17px] text-bhuk-maroon">
              Want this in your life?
            </div>
            <p className="text-[13.5px] text-bhuk-ink2 mt-1 leading-relaxed">
              ₹2,600 a month buys 26 days × 2 meals. BLPGA residents pay nothing for
              delivery. Self-pickup and home delivery available across Agarpara and
              the north suburbs.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <Link
                href="/join"
                className="bg-bhuk-maroon text-white px-5 py-2.5 rounded-[10px] font-extrabold text-[13.5px] no-underline"
              >
                Subscribe →
              </Link>
              <a
                href="tel:+917595923777"
                className="bg-white border border-bhuk-line text-bhuk-ink px-5 py-2.5 rounded-[10px] font-extrabold text-[13.5px] no-underline"
              >
                Call 75959 23777
              </a>
            </div>
          </div>
        </div>

        {others.length > 0 ? (
          <div className="mt-10">
            <div className="text-[11px] font-extrabold text-bhuk-off-ink tracking-wider">
              MORE FROM THE BLOG
            </div>
            <ul className="list-none flex flex-col gap-3 mt-3">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="block bg-white border border-bhuk-line rounded-[12px] px-4 py-3 no-underline hover:border-bhuk-maroon transition-colors"
                  >
                    <div className="text-[13px] font-extrabold text-bhuk-ink">
                      {p.title}
                    </div>
                    <div className="text-[11.5px] text-bhuk-off-ink mt-1">
                      {p.excerpt}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>
    </>
  );
}

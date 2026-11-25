import type { Metadata } from "next";
import Link from "next/link";
import { EDITORIAL_BLOG_POSTS } from "@/lib/data/blogAndLegal";
import { buildCanonicalUrl } from "@/lib/seo/routeRegistry";

export const metadata: Metadata = {
  title: "Influencer Pazarlama ve UGC Rehberi — Blog",
  description:
    "Influencer reklamı nasıl verilir, fiyatlar nasıl hesaplanır, UGC içerik üreticileriyle nasıl çalışılır ve Ticaret Bakanlığı reklam mevzuatı rehberleri.",
  alternates: { canonical: buildCanonicalUrl("/tr/blog") },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">
        InfluNex Blog & GEO Bilgi Merkezi
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Editoryal kontrolden geçmiş, gerçek platform kurallarına ve Türkiye
        reklam mevzuatına dayanan influencer pazarlama rehberleri.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {EDITORIAL_BLOG_POSTS.map((post) => (
          <article
            key={post.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {post.categorySlug}
              </span>
              <h2 className="mt-1.5 text-lg font-bold text-slate-900">
                <Link
                  href={`/tr/blog/${post.slug}`}
                  className="hover:text-indigo-600"
                >
                  {post.titleTr}
                </Link>
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {post.summaryTr}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>{post.authorName}</span>
              <Link
                href={`/tr/blog/${post.slug}`}
                className="font-bold text-indigo-600 hover:underline"
              >
                Rehberi Oku →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

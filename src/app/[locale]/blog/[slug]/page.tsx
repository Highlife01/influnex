import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EDITORIAL_BLOG_POSTS } from "@/lib/data/blogAndLegal";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildCanonicalUrl, SITE_BASE_URL } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return { title: "Yazı Bulunamadı", robots: { index: false, follow: false } };
  }
  return {
    title: post.titleTr,
    description: post.summaryTr,
    alternates: { canonical: buildCanonicalUrl(`/tr/blog/${post.slug}`) },
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_BASE_URL}/tr/blog/${post.slug}#article`,
    headline: post.titleTr,
    description: post.summaryTr,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.authorName,
      url: SITE_BASE_URL,
    },
    publisher: { "@id": `${SITE_BASE_URL}/#organization` },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "InfluNex", path: "/tr" },
    { name: "Blog", path: "/tr/blog" },
    { name: post.titleTr, path: `/tr/blog/${post.slug}` },
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link href="/tr" className="hover:text-indigo-600">
          InfluNex
        </Link>{" "}
        /{" "}
        <Link href="/tr/blog" className="hover:text-indigo-600">
          Blog
        </Link>{" "}
        / <span className="font-semibold text-slate-800">{post.titleTr}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
        {post.titleTr}
      </h1>
      <p className="mt-2 text-xs text-slate-500">
        Yazar: {post.authorName} • Son Güncelleme:{" "}
        {post.updatedAt.slice(0, 10)}
      </p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        {post.contentTr.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-bold text-slate-900">
          İlgili Kategori ve Influencer Listeleri
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {post.relatedPaths.map((rel) => (
            <Link
              key={rel.href}
              href={rel.href}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-indigo-700 hover:border-indigo-400"
            >
              {rel.label} →
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

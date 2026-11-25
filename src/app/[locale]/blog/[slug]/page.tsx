import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EDITORIAL_BLOG_POSTS } from "@/lib/data/blogAndLegal";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildHreflangAlternates, SITE_BASE_URL } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const post = EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return { title: "Yazı Bulunamadı", robots: { index: false, follow: false } };
  }
  return {
    title: locale === "tr" ? post.titleTr : post.titleEn,
    description: locale === "tr" ? post.summaryTr : post.summaryEn,
    alternates: buildHreflangAlternates(
      `/tr/blog/${post.slug}`,
      `/en/blog/${post.slug}`,
      locale
    ),
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const post = EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_BASE_URL}/${locale}/blog/${post.slug}#article`,
    headline: locale === "tr" ? post.titleTr : post.titleEn,
    description: locale === "tr" ? post.summaryTr : post.summaryEn,
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
    { name: "InfluNex", path: `/${locale}` },
    { name: "Blog", path: `/${locale}/blog` },
    {
      name: locale === "tr" ? post.titleTr : post.titleEn,
      path: `/${locale}/blog/${post.slug}`,
    },
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
        <Link href={`/${locale}`} className="hover:text-indigo-600">
          InfluNex
        </Link>{" "}
        /{" "}
        <Link href={`/${locale}/blog`} className="hover:text-indigo-600">
          Blog
        </Link>{" "}
        /{" "}
        <span className="font-semibold text-slate-800">
          {locale === "tr" ? post.titleTr : post.titleEn}
        </span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
        {locale === "tr" ? post.titleTr : post.titleEn}
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import { profile } from "@/data/profile";
import { formatPostDate, getAllPosts, getPost } from "@/lib/blog/posts";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const { meta } = post;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      url: `/blog/${slug}`,
      publishedTime: meta.date,
      authors: [profile.name],
      tags: meta.tags,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { meta, Content } = post;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    author: { "@type": "Person", name: profile.name },
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    keywords: meta.tags.join(", "),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <p className="ps-eyebrow">
        <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>
          ← Blog
        </Link>
      </p>
      <h1 className="ps-title">{meta.title}</h1>
      <p className="ps-lede">{meta.description}</p>
      <p className="blog-card-meta" style={{ marginTop: 16 }}>
        {formatPostDate(meta.date)} · {meta.readingMinutes} min read
      </p>
      <ul className="ps-tags">
        {meta.tags.map((tag) => (
          <li key={tag} className="ps-tag">
            {tag}
          </li>
        ))}
      </ul>

      <article className="blog-prose">
        <Content />
      </article>
    </PageShell>
  );
}

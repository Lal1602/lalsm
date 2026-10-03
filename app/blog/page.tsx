import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { formatPostDate, getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes from building an immersive WebGL portfolio: performance profiling, animation and the AI assistant.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <PageShell>
      <p className="ps-eyebrow">{"// Field notes"}</p>
      <h1 className="ps-title">Blog</h1>
      <p className="ps-lede">
        Notes from building this site: what was measured, what was cut, and what I would do differently.
      </p>

      {posts.length === 0 ? (
        <p className="ps-lede" style={{ marginTop: 40 }}>
          No posts yet — check back soon.
        </p>
      ) : (
        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-card-meta">
                  {formatPostDate(post.date)} · {post.readingMinutes} min read
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-desc">{post.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

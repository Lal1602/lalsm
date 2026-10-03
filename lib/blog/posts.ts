import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";

/**
 * Blog posts are MDX files in content/blog. Each one exports a `meta` object
 * (title, description, date, tags); the file name is the URL slug. No frontmatter
 * plugin needed — `export const meta = {...}` at the top of the file is plain MDX.
 */

export interface PostMeta {
  title: string;
  description: string;
  /** ISO date, e.g. "2026-10-03". */
  date: string;
  tags: string[];
  /** Hidden from the list, sitemap and static params while true. */
  draft?: boolean;
}

export interface PostSummary extends PostMeta {
  slug: string;
  readingMinutes: number;
}

interface PostModule {
  default: ComponentType;
  meta: PostMeta;
}

const CONTENT_DIR = join(process.cwd(), "content", "blog");

function listSlugs(): string[] {
  try {
    return readdirSync(CONTENT_DIR)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

async function load(slug: string): Promise<PostModule | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return (await import(`@/content/blog/${slug}.mdx`)) as PostModule;
  } catch {
    return null;
  }
}

/** ~200 words per minute, counted off the raw source so no rendering is needed. */
async function estimateMinutes(slug: string): Promise<number> {
  const { readFile } = await import("node:fs/promises");
  try {
    const raw = await readFile(join(CONTENT_DIR, `${slug}.mdx`), "utf8");
    const words = raw.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  } catch {
    return 1;
  }
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const posts = await Promise.all(
    listSlugs().map(async (slug): Promise<PostSummary | null> => {
      const mod = await load(slug);
      if (!mod?.meta || mod.meta.draft) return null;
      return { slug, ...mod.meta, readingMinutes: await estimateMinutes(slug) };
    }),
  );

  return posts
    .filter((p): p is PostSummary => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  const mod = await load(slug);
  if (!mod?.meta || mod.meta.draft) return null;
  return {
    meta: { slug, ...mod.meta, readingMinutes: await estimateMinutes(slug) } satisfies PostSummary,
    Content: mod.default,
  };
}

export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

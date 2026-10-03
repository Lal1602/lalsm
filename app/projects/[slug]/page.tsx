import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import { getAdjacentProjects, getProject, projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.desc,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — project by Bilal`,
      description: project.desc,
      url: `/projects/${slug}`,
      images: [{ url: project.image, alt: `${project.title} screenshot` }],
    },
    twitter: { card: "summary_large_image", images: [project.image] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  const adjacent = getAdjacentProjects(slug);
  if (!project || !adjacent) notFound();

  const tech = project.tech.split(",").map((t) => t.trim()).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.fullDesc,
    image: absoluteUrl(project.image),
    url: absoluteUrl(`/projects/${slug}`),
    author: { "@type": "Person", name: profile.name },
    keywords: tech.join(", "),
    ...(project.link ? { sameAs: project.link } : {}),
  };

  return (
    <PageShell width="wide">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <p className="ps-eyebrow">
        <Link href="/projects" style={{ color: "inherit", textDecoration: "none" }}>
          ← All projects
        </Link>
      </p>
      <h1 className="ps-title">{project.title}</h1>
      <p className="ps-lede">{project.desc}</p>

      <ul className="ps-tags" aria-label="Technologies used">
        {tech.map((t) => (
          <li key={t} className="ps-tag">
            {t}
          </li>
        ))}
      </ul>

      <div className="ps-actions">
        {project.link && (
          <a className="ps-btn" href={project.link} target="_blank" rel="noopener noreferrer">
            Launch live demo ↗
          </a>
        )}
        <Link className="ps-btn ps-btn--ghost" href="/#projects">
          See it in the 3D gallery
        </Link>
      </div>

      <div className="case-hero">
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          fill
          priority
          sizes="(max-width: 1080px) 100vw, 1080px"
        />
      </div>

      <section className="case-section" style={{ maxWidth: "70ch" }}>
        <h2>About this project</h2>
        <p>{project.fullDesc}</p>
      </section>

      <nav className="case-pager" aria-label="More projects">
        <Link href={`/projects/${adjacent.prev.slug}`}>
          <small>← Previous</small>
          {adjacent.prev.title}
        </Link>
        <Link href={`/projects/${adjacent.next.slug}`} className="is-next">
          <small>Next →</small>
          {adjacent.next.title}
        </Link>
      </nav>
    </PageShell>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Games, WebGL experiments, portfolios and full-stack builds by Bilal Sanayu Majid.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsIndex() {
  return (
    <PageShell width="wide">
      <p className="ps-eyebrow">{"// Archive"}</p>
      <h1 className="ps-title">Projects</h1>
      <p className="ps-lede">
        {projects.length} things I have built — from Phaser games to GSAP-heavy portfolios. The 3D film strip on the
        home page shows the same list.
      </p>

      <ul className="case-index">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/projects/${project.slug}`}>
              <div className="case-index-thumb">
                <Image
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  fill
                  sizes="(max-width: 600px) 100vw, 320px"
                />
              </div>
              <div className="case-index-body">
                <strong>{project.title}</strong>
                <span>{project.desc}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

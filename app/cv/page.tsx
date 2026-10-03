import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import PrintButton from "@/components/site/PrintButton";
import { achievements } from "@/data/achievements";
import { education, featuredProjectSlugs, profile, skillGroups, timeline } from "@/data/profile";
import { getProject } from "@/data/projects";

export const metadata: Metadata = {
  title: "Curriculum Vitae",
  description: `${profile.name} — ${profile.role}. Skills, education, training, projects and certificates.`,
  alternates: { canonical: "/cv" },
};

export default function CvPage() {
  const featured = featuredProjectSlugs.map((slug) => getProject(slug)).filter((p) => p !== undefined);

  return (
    <PageShell width="reading">
      <div className="ps-actions" style={{ marginTop: 0, marginBottom: 24 }}>
        <a className="ps-btn" href="/cv.pdf" download="Bilal-Sanayu-Majid-CV.pdf">
          Download PDF ↓
        </a>
        <PrintButton />
      </div>

      <article className="cvp-sheet">
        <h1 className="cvp-name">{profile.name}</h1>
        <p className="cvp-role">{profile.role}</p>
        <ul className="cvp-contact">
          <li>{profile.location}</li>
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.github}>github.com/{profile.github.split("/").pop()}</a>
          </li>
        </ul>

        <h2 className="cvp-h">Profile</h2>
        <p className="cvp-item" style={{ color: "var(--text-muted)" }}>
          {profile.summary}
        </p>

        <h2 className="cvp-h">Skills</h2>
        {skillGroups.map((group) => (
          <p className="cvp-skill" key={group.label}>
            <b>{group.label}</b>
            <span style={{ color: "var(--text-muted)" }}>{group.items.join(", ")}</span>
          </p>
        ))}

        <h2 className="cvp-h">Education</h2>
        {education.map((item) => (
          <div className="cvp-item" key={item.school}>
            <div className="cvp-item-head">
              <strong>{item.school}</strong>
              <span>{item.period}</span>
            </div>
            <p>{item.program}</p>
          </div>
        ))}

        <h2 className="cvp-h">Training, certification &amp; competition</h2>
        {[...timeline].reverse().map((item) => (
          <div className="cvp-item" key={`${item.role}-${item.year}`}>
            <div className="cvp-item-head">
              <strong>
                {item.role} — {item.institution}
              </strong>
              <span>{item.year}</span>
            </div>
            <p>{item.desc}</p>
          </div>
        ))}

        <h2 className="cvp-h">Selected projects</h2>
        {featured.map((project) => (
          <div className="cvp-item" key={project.slug}>
            <div className="cvp-item-head">
              <strong>{project.title}</strong>
              {project.link && <span>{project.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>}
            </div>
            <p>
              {project.desc} ({project.tech})
            </p>
          </div>
        ))}

        <h2 className="cvp-h">Certificates &amp; awards</h2>
        <ul style={{ listStyle: "none", marginTop: 10 }}>
          {achievements.map((a) => (
            <li className="cvp-item-head" key={a.title} style={{ marginTop: 6 }}>
              <span style={{ color: "var(--text-main)", fontFamily: "var(--font-body)", fontSize: "0.98rem" }}>
                {a.title}
              </span>
              <span>{a.meta}</span>
            </li>
          ))}
        </ul>
      </article>
    </PageShell>
  );
}

import PageShell from "@/components/site/PageShell";
import PrintButton from "@/components/site/PrintButton";
import { CV_LANGS, cvContact, cvPath, cvPdfName, cvPdfPath, getCv, type CvLang } from "@/data/cv";
import { profile } from "@/data/profile";

/**
 * The CV as a page, in one language. /cv and /cv/id both render this; the PDFs at /cv.pdf and /cv-id.pdf are built
 * from the same data (lib/cv/buildCvPdf.ts). The language switch is two plain links, so it works without script and
 * each language has its own address to share.
 */
export default function CvSheet({ lang }: { lang: CvLang }) {
  const c = getCv(lang);
  const other: CvLang = lang === "en" ? "id" : "en";
  const github = `github.com/${profile.github.split("/").pop()}`;

  return (
    <PageShell width="reading">
      <div className="ps-actions cvp-bar">
        <nav className="cvp-lang" aria-label={c.ui.switchLabel}>
          {CV_LANGS.map((l) => (
            <a
              key={l}
              href={cvPath(l)}
              hrefLang={l}
              lang={l}
              aria-current={l === lang ? "page" : undefined}
              className="cvp-lang-opt"
            >
              {l.toUpperCase()}
              <span>{getCv(l).label}</span>
            </a>
          ))}
        </nav>
        <a className="ps-btn" href={cvPdfPath(lang)} download={cvPdfName(lang)}>
          {c.ui.download} ↓
        </a>
        <PrintButton label={c.ui.print} />
        <a className="cvp-other" href={cvPdfPath(other)} download={cvPdfName(other)} lang={other}>
          {c.ui.otherDownload} ↓
        </a>
      </div>

      <article className="cvp-sheet" lang={c.tag}>
        <header className="cvp-top">
          <h1 className="cvp-name">{profile.name}</h1>
          <p className="cvp-role">{profile.role}</p>
          <ul className="cvp-contact">
            <li>{profile.location}</li>
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={cvContact.websiteUrl}>{cvContact.website}</a>
            </li>
            <li>
              <a href={profile.github}>{github}</a>
            </li>
          </ul>
          <p className="cvp-else">{c.elsewhere}</p>
        </header>

        <section aria-labelledby="cvp-profile">
          <h2 className="cvp-h" id="cvp-profile">
            {c.headings.profile}
          </h2>
          <p className="cvp-lead">{c.summary}</p>
        </section>

        <section aria-labelledby="cvp-education">
          <h2 className="cvp-h" id="cvp-education">
            {c.headings.education}
          </h2>
          {c.education.map((item) => (
            <div className="cvp-item" key={item.school}>
              <div className="cvp-item-head">
                <strong>{item.school}</strong>
                <span>{item.period}</span>
              </div>
              <p>{[item.program, ...item.notes].join(" · ")}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="cvp-experience">
          <h2 className="cvp-h" id="cvp-experience">
            {c.headings.experience}
          </h2>
          {c.experience.map((item) => (
            <div className="cvp-item" key={`${item.title}-${item.org}`}>
              <div className="cvp-item-head">
                <strong>{item.title}</strong>
                <span>{item.period}</span>
              </div>
              <p className="cvp-sub">{item.org}</p>
              <ul className="cvp-list">
                {item.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section aria-labelledby="cvp-projects">
          <h2 className="cvp-h" id="cvp-projects">
            {c.headings.projects}
          </h2>
          {c.projects.map((project) => (
            <div className="cvp-item" key={project.title}>
              <div className="cvp-item-head">
                <strong>{project.title}</strong>
                {project.link && <a href={project.link}>{project.link.replace(/^https?:\/\//, "")}</a>}
              </div>
              <p className="cvp-sub">{project.stack}</p>
              <p>{project.desc}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="cvp-skills">
          <h2 className="cvp-h" id="cvp-skills">
            {c.headings.skills}
          </h2>
          <dl className="cvp-skills">
            {c.skills.map((group) => (
              <div key={group.label}>
                <dt>{group.label}</dt>
                <dd>{group.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="cvp-credentials">
          <h2 className="cvp-h" id="cvp-credentials">
            {c.headings.credentials}
          </h2>
          <ul className="cvp-list cvp-list--wide">
            {c.credentials.map((item) => (
              <li key={item.title}>
                <span>
                  <b>{item.title}</b>
                  <em>{item.issuer}</em>
                </span>
                {item.year && <small>{item.year}</small>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cvp-languages">
          <h2 className="cvp-h" id="cvp-languages">
            {c.headings.languages}
          </h2>
          <ul className="cvp-list cvp-list--wide">
            {c.languages.map((item) => (
              <li key={item.name}>
                <span>
                  <b>{item.name}</b>
                  <em>{item.level}</em>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </PageShell>
  );
}

"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import PlateGallery from "./PlateGallery";
import ProjectsBackdrop from "./ProjectsBackdrop";
import AccretionHorizonSeam from "./AccretionHorizonSeam";
import { projects, type Project } from "@/data/projects";
import { OPEN_PROJECT_EVENT } from "@/lib/chat/runActions";
import { track } from "@/lib/analytics";
import { useLite } from "@/lib/lite";
import "./lite.css";

export default function ProjectsSection() {
  const [mounted, setMounted] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { lite } = useLite();

  useEffect(() => {
    // The portal modal and the seam canvas need a real DOM, so they render after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // The plates are drawn in WebGL, so the AI assistant cannot click one. It
  // dispatches this event instead and we open the matching project ourselves.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const title = String((event as CustomEvent<{ title?: string }>).detail?.title ?? "").toLowerCase();
      if (!title) return;
      const match =
        projects.find((p) => p.title.toLowerCase() === title) ??
        projects.find((p) => p.title.toLowerCase().includes(title) || title.includes(p.title.toLowerCase()));
      if (match) setActiveProject(match);
    };
    window.addEventListener(OPEN_PROJECT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PROJECT_EVENT, onOpen);
  }, []);

  return (
    <section className="section cosmic-projects-section" id="projects" aria-label="Projects Section">
      {/* ── Seamless Accretion Wave & Horizon Telemetry Seam (Lower Half) ── */}
      {mounted && <AccretionHorizonSeam part="lower" />}

      <ProjectsBackdrop />

      {/* Top Viewport HUD Frame */}
      <div className="cosmos-top-frame" aria-hidden="true">
        <div className="cosmos-corner-bracket is-tl"></div>
        <div className="cosmos-frame-line"></div>
      </div>

      <div className="container cosmic-projects-container" style={{ position: "relative", zIndex: 10 }}>
        <div className="project-cosmic-header">
          <div className="project-title-row">
            <h2 className="project-serif-title">PROJECTS</h2>
            <div className="project-header-meta">
              <span className="meta-subtext">observatory plate archive</span>
              {lite ? (
                <span className="meta-instruction">{"// TAP A PROJECT TO OPEN ITS ARCHIVE RECORD"}</span>
              ) : (
                <>
                  <span className="meta-instruction meta-instruction--wide">
                    {"// DRAG THE RAIL, USE ← → OR CLICK A PLATE"}
                  </span>
                  <span className="meta-instruction meta-instruction--narrow">
                    {"// SWIPE THE RAIL • TAP THE PLATE TO OPEN IT"}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="project-index-line">
            <span className="index-label">COSMIC DATABASE / INDEX [{projects.length}]</span>
            <div className="index-hairline"></div>
          </div>
        </div>

        <PlateGallery onOpen={setActiveProject} />
      </div>

      {/* Details overlay modal */}
      {activeProject && mounted && createPortal(
        <ProjectDetailModal
          key={activeProject.slug}
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />,
        document.body
      )}
    </section>
  );
}

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [screenshotIdx, setScreenshotIdx] = useState(0);

  return (
    <div className="project-detail-modal" onClick={onClose}>
      <div className="modal-backdrop"></div>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" aria-label="Close project details" onClick={onClose}>
          <ion-icon suppressHydrationWarning name="close-outline"></ion-icon>
        </button>
        <div className="modal-body">
          <div className="modal-image-wrap">
            <Image
              src={
                project.screenshots && project.screenshots.length > 0
                  ? project.screenshots[screenshotIdx]?.image || project.image
                  : project.image
              }
              alt={
                project.screenshots && project.screenshots.length > 0
                  ? project.screenshots[screenshotIdx]?.alt || project.title
                  : project.title
              }
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className="modal-img-gradient"></div>

            {project.screenshots && project.screenshots.length > 0 && (
              <div className="modal-screenshot-hud">
                <div className="modal-screenshot-caption">
                  <span className="modal-screenshot-fig">
                    FIG. {String(screenshotIdx + 1).padStart(2, "0")} / {String(project.screenshots.length).padStart(2, "0")}
                  </span>
                  <span className="modal-screenshot-label">
                    {project.screenshots[screenshotIdx]?.caption}
                  </span>
                </div>

                {project.screenshots.length > 1 && (
                  <div className="modal-screenshot-controls">
                    <button
                      type="button"
                      className="modal-screenshot-nav-btn"
                      aria-label="Previous screenshot"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScreenshotIdx((prev) => (prev - 1 + project.screenshots!.length) % project.screenshots!.length);
                      }}
                    >
                      ‹
                    </button>
                    <div className="modal-screenshot-dots">
                      {project.screenshots.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Show figure ${i + 1}`}
                          className={`modal-screenshot-dot ${i === screenshotIdx ? "is-active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setScreenshotIdx(i);
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="modal-screenshot-nav-btn"
                      aria-label="Next screenshot"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScreenshotIdx((prev) => (prev + 1) % project.screenshots!.length);
                      }}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-info">
            <p className="modal-eyebrow">{"// Cosmic archive record"}</p>
            <h3 className="modal-title">{project.title}</h3>

            <div className="modal-tech-tags">
              {project.tech.split(",").map((tech, idx) => (
                <span className="tech-badge" key={idx}>
                  {tech.trim()}
                </span>
              ))}
            </div>

            <p className="modal-desc">{project.fullDesc}</p>

            <div className="modal-actions">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("project_live_demo", { project: project.title })}
                  className="btn-launch-live"
                >
                  <span>Launch Live Demo</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: "8px" }}
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              )}
              <Link
                href={`/projects/${project.slug}`}
                className="btn-launch-live btn-case-study"
                onClick={() => track("project_case_study", { project: project.title })}
              >
                <span>View Case Study</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

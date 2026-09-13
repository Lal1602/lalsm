"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export interface DossierProject {
  title: string;
  desc: string;
  fullDesc: string;
  tech: string;
  image: string;
  link: string;
}

interface Props {
  project: DossierProject;
  index: number;
  total: number;
  designation: string;
  onClose: () => void;
}

/**
 * ProjectDossier — the archive record that opens when a focused card is
 * committed. Built as a modal dialog rather than a page: focus is trapped,
 * Escape closes, and the underlying orbit keeps its scroll position.
 */
export default function ProjectDossier({ project, index, total, designation, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Minimal focus trap — the panel only ever holds a handful of controls.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const stack = project.tech
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="cosmos-dossier" role="presentation" onClick={onClose}>
      <div className="cosmos-dossier-veil" />
      <div
        className="cosmos-dossier-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cosmos-dossier-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="cosmos-dossier-corner is-tl" aria-hidden="true" />
        <span className="cosmos-dossier-corner is-tr" aria-hidden="true" />
        <span className="cosmos-dossier-corner is-bl" aria-hidden="true" />
        <span className="cosmos-dossier-corner is-br" aria-hidden="true" />

        <header className="cosmos-dossier-bar">
          <span className="cosmos-code">
            RECORD {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
          <span className="cosmos-code cosmos-code-dim">{designation}</span>
          <button
            className="cosmos-dossier-close"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close project record"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="cosmos-dossier-body">
          <div className="cosmos-dossier-plate">
            <Image
              src={project.image}
              alt={`${project.title} interface`}
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
            />
            <span className="cosmos-dossier-scan" aria-hidden="true" />
            <span className="cosmos-dossier-plate-edge" aria-hidden="true" />
          </div>

          <div className="cosmos-dossier-info">
            <p className="cosmos-code cosmos-dossier-eyebrow">// TRANSMISSION DECODED</p>
            <h3 className="cosmos-dossier-title" id="cosmos-dossier-title">
              {project.title}
            </h3>
            <p className="cosmos-dossier-lede">{project.fullDesc}</p>

            <p className="cosmos-code cosmos-dossier-label">COMPOSITION</p>
            <ul className="cosmos-dossier-stack">
              {stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <a
              className="cosmos-dossier-launch"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Enter the build</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

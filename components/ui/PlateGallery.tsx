"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import { whenWarm } from "@/lib/warmup";
import { useLite } from "@/lib/lite";
import type { PlateRenderer } from "@/lib/plates/PlateRenderer";

interface PlateGalleryProps {
  onOpen: (project: Project) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");
/** Give the preloader's warm-up this long to hand over a renderer before making our own. */
const WARM_WAIT_MS = 9000;

/**
 * Projects as an archive of observatory plates hung on a rail. The plates are drawn
 * by one WebGL draw call (lib/plates); everything a visitor reads or operates is
 * real DOM: the number, title, tags, the buttons, the tick rail. That keeps it
 * accessible and indexable, and it means the canvas never has to carry text.
 *
 * Lite mode, a missing WebGL, or a lost context shows the plain grid instead.
 */
export default function PlateGallery({ onOpen }: PlateGalleryProps) {
  const { lite } = useLite();
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PlateRenderer | null>(null);
  const openRef = useRef(onOpen);
  const [failed, setFailed] = useState(false);
  const [focus, setFocus] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    openRef.current = onOpen;
  }, [onOpen]);

  const grid = lite || failed;

  useEffect(() => {
    if (grid) return;
    // useLite reads the server's answer during hydration, so on a Lite page this
    // effect runs once before the grid takes over. Do not build a renderer for that.
    const isLite = () => document.documentElement.getAttribute("data-lite") === "1";
    if (isLite()) return;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let renderer: PlateRenderer | null = null;

    (async () => {
      try {
        // The warm-up normally finished this behind the preloader.
        let r = await Promise.race([
          whenWarm<PlateRenderer | null>("plates"),
          new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), WARM_WAIT_MS)),
        ]);
        // null: the warm-up was deliberately skipped (Lite). undefined: it timed out or failed.
        if (!r && isLite()) return;
        if (!r) {
          const { getPlateRenderer } = await import("@/lib/plates/PlateRenderer");
          r = await getPlateRenderer(projects);
        }
        if (cancelled || !hostRef.current || !stageRef.current) return;
        renderer = r;
        rendererRef.current = r;
        r.onFocus = setFocus;
        r.onSelect = (i) => openRef.current(projects[i]);
        r.onFail = () => setFailed(true);
        r.attach(hostRef.current);
        setFocus(r.focusIndex());
        if (r.revealed) setRevealed(true);

        io = new IntersectionObserver(
          ([entry]) => {
            r.setVisible(entry.isIntersecting);
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !r.revealed) {
              r.playReveal();
              setRevealed(true);
            }
          },
          { threshold: [0, 0.25], rootMargin: "120px 0px" },
        );
        io.observe(stageRef.current);
      } catch (error) {
        console.warn("[PlateGallery] falling back to the grid:", error);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      io?.disconnect();
      if (renderer) {
        renderer.setVisible(false);
        renderer.onFocus = renderer.onSelect = renderer.onFail = undefined;
        renderer.detach();
      }
      rendererRef.current = null;
    };
  }, [grid]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const r = rendererRef.current;
    if (!r) return;
    switch (e.key) {
      case "ArrowRight":
        r.step(1);
        break;
      case "ArrowLeft":
        r.step(-1);
        break;
      case "Home":
        r.goTo(0);
        break;
      case "End":
        r.goTo(projects.length - 1);
        break;
      case "Enter":
      case " ":
        openRef.current(projects[r.focusIndex()]);
        break;
      default:
        return;
    }
    e.preventDefault();
  }, []);

  if (grid) return <PlateGrid onOpen={onOpen} />;

  const current = projects[focus] ?? projects[0];
  const tags = current.tech.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="plate-gallery" data-motion data-revealed={revealed ? "true" : "false"}>
      <div
        ref={stageRef}
        className="plate-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Project plates. Use the left and right arrow keys to browse, Enter to open the record."
        onKeyDown={onKeyDown}
      >
        <div className="plate-numeral" aria-hidden="true">
          <span key={focus}>{pad(focus + 1)}</span>
        </div>

        {/* The rail the plates hang from: one hairline arc with a few ticks, static. */}
        <svg className="plate-rail" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 8 Q500 56 1000 8" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: 21 }, (_, i) => {
            const x = i * 50;
            const t = x / 1000;
            const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 56 + t * t * 8;
            return (
              <line key={i} x1={x} y1={y} x2={x} y2={y + (i % 5 === 0 ? 9 : 4)} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            );
          })}
        </svg>

        <div ref={hostRef} className="plate-host" />
      </div>

      <div className="plate-info">
        <div className="plate-info-main" key={focus}>
          <p className="plate-eyebrow">
            PLATE {pad(focus + 1)} <i>/</i> {pad(projects.length)}
          </p>
          <h3 className="plate-title">{current.title}</h3>
          <p className="plate-desc">{current.desc}</p>
        </div>
        <div className="plate-info-side" key={`s${focus}`}>
          <ul className="plate-tech" aria-label="Technologies">
            {tags.slice(0, 4).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="plate-actions">
            <button type="button" className="plate-open" onClick={() => onOpen(current)}>
              Open record
            </button>
            <Link className="plate-case" href={`/projects/${current.slug}`}>
              Case study
            </Link>
          </div>
        </div>
      </div>

      <div className="plate-controls">
        <button type="button" className="plate-step" aria-label="Previous plate" onClick={() => rendererRef.current?.step(-1)}>
          <span aria-hidden="true">←</span>
        </button>
        <ol className="plate-ticks" aria-label="Choose a plate">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <button
                type="button"
                aria-label={`${pad(i + 1)} ${p.title}`}
                aria-current={i === focus ? "true" : undefined}
                onClick={() => rendererRef.current?.goTo(i)}
              />
            </li>
          ))}
        </ol>
        <button type="button" className="plate-step" aria-label="Next plate" onClick={() => rendererRef.current?.step(1)}>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* Crawlers and screen readers get the whole archive, not only the plate in view. */}
      <nav className="plate-sr" aria-label="All projects">
        <ul>
          {projects.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`}>{p.title}</Link>: {p.desc}
            </li>
          ))}
        </ul>
      </nav>
      <p className="plate-sr" aria-live="polite">
        {`Plate ${focus + 1} of ${projects.length}: ${current.title}`}
      </p>
    </div>
  );
}

/** The plain grid: Lite mode, no WebGL, or a lost context. */
function PlateGrid({ onOpen }: { onOpen: (project: Project) => void }) {
  return (
    <ul className="lite-projects">
      {projects.map((project, i) => (
        <li key={project.slug}>
          <button type="button" className="lite-project-card" onClick={() => onOpen(project)} aria-label={`Open ${project.title}`}>
            <span className="lite-project-thumb">
              <Image src={project.image} alt="" fill sizes="(max-width: 600px) 50vw, 240px" />
              <em className="lite-project-no" aria-hidden="true">
                {pad(i + 1)}
              </em>
            </span>
            <span className="lite-project-body">
              <strong>{project.title}</strong>
              <span>{project.desc}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

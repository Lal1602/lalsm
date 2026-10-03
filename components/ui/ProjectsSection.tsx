"use client";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import Image from "next/image";
import FilmScene from "./FilmScene";
import CosmicBackdrop from "./CosmicBackdrop";
import AccretionHorizonSeam from "./AccretionHorizonSeam";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import { OPEN_PROJECT_EVENT } from "@/lib/chat/runActions";
import { track } from "@/lib/analytics";
import { useLite } from "@/lib/lite";
import "./lite.css";

export default function ProjectsSection() {
  const [mounted, setMounted] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const { lite } = useLite();
  const [canvasInView, setCanvasInView] = useState(false);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  // Dynamic telemetry states for the bottom gyroscope widget
  const [orbitalDeg, setOrbitalDeg] = useState(90);
  const [coordIndex, setCoordIndex] = useState(21);

  // References to share dynamic, high-performance scroll values across R3F and DOM
  const scrollRef = useRef({
    current: 0,
    target: 0,
    isDragging: false,
    lastX: 0,
    velocity: 0,
    dragDistance: 0,
  });

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // WebGL and the portal modal need a real DOM, so they only render after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // The film strip is drawn in WebGL, so the AI assistant cannot click a DOM card.
  // It dispatches this event instead and we open the matching project ourselves.
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

  // Frame observer to pause WebGL rendering when outside viewport
  useEffect(() => {
    const wrap = canvasWrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      ([entry]) => setCanvasInView(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [mounted, lite]);

  // Periodic telemetry updater based on scroll angle
  useEffect(() => {
    if (!mounted) return;
    let rId: number;
    let lastDeg = -1;

    const tick = () => {
      const cur = scrollRef.current.current;
      const MathPI2 = Math.PI * 2;
      const norm = (((cur % MathPI2) + MathPI2) % MathPI2) / MathPI2;
      const deg = Math.round(norm * 360);
      if (deg !== lastDeg) {
        lastDeg = deg;
        setOrbitalDeg(deg);
        setCoordIndex((Math.round(norm * (projects.length - 1)) % projects.length) + 1);
      }
      rId = requestAnimationFrame(tick);
    };

    rId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rId);
  }, [mounted]);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    scrollRef.current.isDragging = true;
    scrollRef.current.lastX = e.clientX;
    scrollRef.current.dragDistance = 0;
    scrollRef.current.velocity = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!scrollRef.current.isDragging) return;
    const deltaX = e.clientX - scrollRef.current.lastX;
    scrollRef.current.lastX = e.clientX;

    scrollRef.current.dragDistance += Math.abs(deltaX);

    const sensitivity = 0.003;
    scrollRef.current.target -= deltaX * sensitivity;
    scrollRef.current.velocity = -deltaX * sensitivity;
  };

  const handlePointerUp = () => {
    if (scrollRef.current.isDragging) {
      scrollRef.current.isDragging = false;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isDesktop) return;
    const sensitivity = 0.001;
    scrollRef.current.target += e.deltaY * sensitivity;
  };

  return (
    <section
      className="section cosmic-projects-section"
      id="projects"
      aria-label="Projects Section"
    >
      {/* ── Seamless Accretion Wave & Horizon Telemetry Seam (Lower Half) ── */}
      {mounted && !lite && <AccretionHorizonSeam part="lower" />}

      {/* 1. Deep Space Atmospheric Canvas & Nebula Backdrop */}
      {mounted && !lite && <CosmicBackdrop />}

      {/* 2. Top Viewport HUD Frame */}
      <div className="cosmos-top-frame" aria-hidden="true">
        <div className="cosmos-corner-bracket is-tl"></div>
        <div className="cosmos-frame-line"></div>
      </div>

      {/* Upper-Right Mid Space Monospace Label */}
      <div className="cosmos-archive-tag" aria-hidden="true">
        ARCHIVE_X-01
      </div>

      <div className="container cosmic-projects-container" style={{ position: "relative", zIndex: 10 }}>
        {/* 3. High-Fashion Editorial Serif Section Title & Metadata */}
        <div className="project-cosmic-header">
          <div className="project-title-row">
            <h2 className="project-serif-title">PROJECTS</h2>
            <div className="project-header-meta">
              <span className="meta-subtext">microscopic subtext</span>
              <span className="meta-instruction">
                {lite
                  ? "// TAP A PROJECT TO OPEN ITS ARCHIVE RECORD"
                  : isDesktop
                    ? "// GRAB & DRAG OR SCROLL TO SPIN VINTAGE FILM STRIP"
                    : "// SWIPE LEFT/RIGHT • TAP TO EXPAND ARCHIVE RECORD"}
              </span>
            </div>
          </div>
          <div className="project-index-line">
            <span className="index-label">COSMIC DATABASE / INDEX [{projects.length}]</span>
            <div className="index-hairline"></div>
          </div>
        </div>

        {lite ? (
          // Lite gallery: plain DOM cards, no WebGL canvas, no drag physics.
          <ul className="lite-projects">
            {projects.map((project) => (
              <li key={project.slug}>
                <button
                  type="button"
                  className="lite-project-card"
                  onClick={() => setActiveProject(project)}
                  aria-label={`Open ${project.title}`}
                >
                  <span className="lite-project-thumb">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 50vw, 240px"
                    />
                  </span>
                  <span className="lite-project-body">
                    <strong>{project.title}</strong>
                    <span>{project.desc}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
          {/* 4. 3D WebGL Canvas Container with Cyber-Glass Monitors */}
          <div
            ref={canvasWrapRef}
            className="project-3d-canvas-wrap"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            style={{ touchAction: isDesktop ? "none" : "pan-y" }}
          >
            {mounted && (
              <Canvas
                camera={{ position: [0, 0, 4.0], fov: 50 }}
                dpr={[1, 1.5]}
                frameloop={canvasInView ? "always" : "never"}
                gl={{ alpha: true, antialias: true, stencil: false }}
                style={{ background: "transparent", touchAction: isDesktop ? "none" : "pan-y" }}
              >
                <FilmScene
                  projects={projects}
                  onSelectProject={(proj) => setActiveProject(proj)}
                  scrollRef={scrollRef}
                  progressRef={progressRef}
                />
              </Canvas>
            )}
          </div>

          {/* 6. Sleek Cosmic Progress Bar & Drag Indicator */}
          <div className="project-loop-bar-container">
            <div className="project-loop-bar-hud">
              <span className="hud-code">• // {projects.length} PROJECTS //</span>
              <div className="project-loop-bar-track">
                <div ref={progressRef} className="project-loop-bar-fill"></div>
              </div>
              <span className="hud-code">DRAG TO EXPLORE THE GALAXY</span>
            </div>
          </div>

          {/* 7. Bottom Celestial Gyroscope / Orbital Instrument Widget */}
          <div className="cosmos-gyroscope-widget" aria-hidden="true">
            <div className="gyro-readout left">
              <span className="gyro-val">{orbitalDeg}° ORBITAL</span>
              <span className="gyro-sub">STR106</span>
            </div>

            <div className="gyro-orb-wrap">
              <div className="gyro-orb">
                <div className="gyro-ring"></div>
                <div className="gyro-core-glow"></div>
              </div>
            </div>

            <div className="gyro-readout right">
              <span className="gyro-val">
                {String(coordIndex).padStart(2, "0")} COORDINATE
              </span>
              <span className="gyro-sub">0E</span>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Cyberpunk details overlay modal */}
      {activeProject && mounted && createPortal(
        <div className="project-detail-modal" onClick={() => setActiveProject(null)}>
          <div className="modal-backdrop"></div>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" aria-label="Close project details" onClick={() => setActiveProject(null)}>
              <ion-icon suppressHydrationWarning name="close-outline"></ion-icon>
            </button>
            <div className="modal-body">
              <div className="modal-image-wrap">
                <Image
                  src={activeProject.image}
                  alt={activeProject.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
                <div className="modal-img-gradient"></div>
              </div>
              <div className="modal-info">
                <p className="modal-eyebrow">{"// Cosmic archive record"}</p>
                <h3 className="modal-title">{activeProject.title}</h3>

                <div className="modal-tech-tags">
                  {activeProject.tech.split(",").map((tech, idx) => (
                    <span className="tech-badge" key={idx}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>

                <p className="modal-desc">{activeProject.fullDesc}</p>

                <div className="modal-actions">
                  {activeProject.link && (
                    <a
                      href={activeProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("project_live_demo", { project: activeProject.title })}
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
                    href={`/projects/${activeProject.slug}`}
                    className="btn-launch-live btn-case-study"
                    onClick={() => track("project_case_study", { project: activeProject.title })}
                  >
                    <span>View Case Study</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

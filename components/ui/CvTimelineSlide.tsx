"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import horizonScrollState from "@/lib/horizonScrollState";

// ─── Data ────────────────────────────────────────────────────────────────────
// Ordered OLDEST → NEWEST  (index 0 = first to fly out)
const TIMELINE_DATA = [
  {
    year: "2023 – 2024",
    role: "Game & Android Graduate",
    institution: "Timedoor Academy",
    desc: "Completed advanced training in JavaScript game development (Phaser 3) and mobile app development (Android Studio).",
    badge: "Academy Graduate",
  },
  {
    year: "2024",
    role: "Certified Junior Programmer",
    institution: "BNSP Indonesia",
    desc: "National competency certificate validating expertise in programming, databases, and software design standards.",
    badge: "National Cert",
  },
  {
    year: "2024",
    role: "Juara Harapan 2 — Web Tech",
    institution: "LKS Competition Surabaya",
    desc: "Won 2nd Runner-up Merit Prize at city level in Web Technologies, building modular frontends under competitive time constraints.",
    badge: "Competition",
  },
  {
    year: "2024 – Present",
    role: "Informatics Engineering Student",
    institution: "EPIS / PENS Surabaya",
    desc: "Focusing on software architecture, algorithms, dynamic web applications, and immersive 3D/WebGL experiences.",
    badge: "Current",
  },
];

// ─── Stack positions (before any card flies) ─────────────────────────────────
// Cards start stacked at x≈390 (center of the 1000px container) so they're
// visible from the start and don't overflow left or right
const STACK_ORIGIN_X = 390; // px from left of .cv-card-stack
const STACK_POS = [
  { x: STACK_ORIGIN_X + 0,  y: 0,  scale: 1.00, ry: 0    },
  { x: STACK_ORIGIN_X + 5,  y: 9,  scale: 0.97, ry: -1.5 },
  { x: STACK_ORIGIN_X + 10, y: 18, scale: 0.94, ry: -3   },
  { x: STACK_ORIGIN_X + 15, y: 27, scale: 0.91, ry: -4.5 },
];

// ─── Final card positions (absolute x from left of .cv-card-stack) ──────────
// 4 cards × 220px + 3 gaps × 40px = 1000px total → fits exactly in container
// Oldest (idx 0) is leftmost, newest (idx 3) is rightmost
const CARD_GAP = 40;
const CARD_W   = 220;
const FINAL_POS = [
  { x: 0,                          y: 0 },
  { x: CARD_W + CARD_GAP,          y: 0 },
  { x: (CARD_W + CARD_GAP) * 2,    y: 0 },
  { x: (CARD_W + CARD_GAP) * 3,    y: 0 },
];

// ─── Progress windows: when each card enters / lands ─────────────────────────
// Career slide occupies global progress 0.5 → 1.0  →  sub-progress 0.0 → 1.0
const CARD_WINDOWS = [
  { enter: 0.15, land: 0.38 },
  { enter: 0.35, land: 0.54 },
  { enter: 0.52, land: 0.70 },
  { enter: 0.68, land: 0.87 },
];

const LINE_WINDOWS = [
  { start: 0.38, end: 0.54 },
  { start: 0.54, end: 0.70 },
  { start: 0.70, end: 0.87 },
];

// ─── Per-card color accents (for landed glow) ────────────────────────────────
const CARD_COLORS = [
  "rgba(0, 243, 255, 0.7)",   // Timedoor — cyan
  "rgba(255, 215, 0, 0.7)",   // BNSP — gold
  "rgba(188, 19, 254, 0.7)",  // LKS — purple
  "rgba(0, 243, 255, 1)",     // PENS — intense cyan
];

// ─── Cubic ease-in-out helper ─────────────────────────────────────────────────
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CvTimelineSlide() {
  const slideRef   = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const cvCardRef  = useRef<HTMLDivElement>(null);
  const lineRef01  = useRef<HTMLDivElement>(null);
  const lineRef12  = useRef<HTMLDivElement>(null);
  const lineRef23  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slide = slideRef.current;
    if (!slide) return;

    // Collect elements
    const cards    = Array.from(slide.querySelectorAll<HTMLElement>(".cv-card"));
    const headers  = Array.from(slide.querySelectorAll<HTMLElement>(".cv-header-anim"));
    const hint     = hintRef.current;
    const cvCard   = cvCardRef.current;
    const lineSegs = [lineRef01.current, lineRef12.current, lineRef23.current];

    // ── Initial hidden state ──────────────────────────────────────────────────
    // Cards start INVISIBLE so they don't bleed into the previous slide.
    // They fade in as soon as the career slide sub-progress > 0.
    gsap.set(headers, { opacity: 0, y: 22 });
    if (hint)   gsap.set(hint,   { opacity: 0 });
    if (cvCard) gsap.set(cvCard, { opacity: 0, x: 32 });
    lineSegs.forEach(seg => seg && gsap.set(seg, { scaleX: 0, opacity: 0, transformOrigin: "left center" }));

    cards.forEach((card, i) => {
      const sp = STACK_POS[i]!;
      gsap.set(card, {
        x: sp.x, y: sp.y, scale: sp.scale,
        rotationY: sp.ry, rotationZ: 0,
        opacity: 0,           // hidden until career slide is reached
        zIndex: 4 - i,
        transformPerspective: 900,
        transformOrigin: "50% 50%",
      });
      card.classList.remove("is-landed");
    });

    // ── Core update function (called every frame via onProgressUpdate) ────────
    function updateByProgress(globalProgress: number) {
      // Career slide = second of 2 slides on desktop, but ONLY slide on mobile.
      const isMobile = window.matchMedia("(max-width: 968px)").matches;
      
      let p;
      if (isMobile) {
        p = gsap.utils.clamp(0, 1, globalProgress);
      } else {
        // sub-progress range: 0.5 → 1.0 on desktop
        p = gsap.utils.clamp(0, 1, (globalProgress - 0.5) / 0.5);
      }

      // Cards: make them visible as soon as the career slide begins (p > 0)
      // This also means they're invisible when p === 0 (still on previous slide)
      const stackVisible = p > 0.001 ? 1 : 0;

      // Headers
      const hProg = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 0.14, 0, 1, p));
      gsap.set(headers, { opacity: hProg, y: (1 - hProg) * 22 });

      // Hint — fade in then out
      if (hint) {
        const hintIn  = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 0.08, 0, 1, p));
        const hintOut = gsap.utils.clamp(0, 1, 1 - gsap.utils.mapRange(0.08, 0.22, 0, 1, p));
        gsap.set(hint, { opacity: Math.min(hintIn, hintOut) });
      }

      // Cards — invisible until career slide is reached
      cards.forEach((card, i) => {
        const win = CARD_WINDOWS[i]!;
        const sp  = STACK_POS[i]!;
        const fp  = FINAL_POS[i]!;

        if (p <= win.enter) {
          // Still in stack — visible only when this slide is active
          gsap.set(card, {
            x: sp.x, y: sp.y,
            scale: sp.scale,
            rotationY: sp.ry,
            rotationZ: 0,
            zIndex: 4 - i,
            opacity: stackVisible,
          });
          card.classList.remove("is-landed");

        } else if (p > win.enter && p < win.land) {
          // In flight — t ∈ [0, 1]
          const t      = gsap.utils.mapRange(win.enter, win.land, 0, 1, p);
          const eased  = easeInOut(t);
          const curX   = sp.x + (fp.x - sp.x) * eased;
          let extraY   = 0, rz = 0, ry = 0;
          let scaleVal = sp.scale + (1 - sp.scale) * eased;

          if (i === 0) {
            // Timedoor — "Pelajar Bersemangat": parabola up, stretch mid-air
            extraY    = -Math.sin(t * Math.PI) * 38;
            ry        = Math.sin(t * Math.PI) * -16;
            scaleVal *= 1 + Math.sin(t * Math.PI) * 0.09;
          } else if (i === 1) {
            // BNSP — "Profesional Tenang": banking only, no bounce
            ry = Math.sin(t * Math.PI * 0.8) * 9;
          } else if (i === 2) {
            // LKS — "Kompetitor Berapi": arc + rotZ (like a card tossed on table)
            extraY = -Math.sin(t * Math.PI * 0.7) * 22;
            rz     = Math.sin(t * Math.PI) * 11;
          } else if (i === 3) {
            // PENS — "Puncak Perjalanan": anticipation crouch → rise with gravitas
            if (t < 0.18) {
              const t0 = t / 0.18;
              extraY   = t0 * 22;                   // crouch down
              scaleVal = sp.scale - t0 * 0.07;       // squash
            } else {
              const t1 = (t - 0.18) / 0.82;
              extraY   = 22 - t1 * 22;              // rise back up
              scaleVal = (sp.scale - 0.07) + t1 * (1 - sp.scale + 0.07);
            }
          }

          gsap.set(card, {
            x: curX,
            y: sp.y + extraY,
            scale: scaleVal,
            rotationY: ry,
            rotationZ: rz,
            zIndex: 10 + i,
          });
          card.classList.remove("is-landed");

        } else {
          // Landed
          gsap.set(card, {
            x: fp.x, y: fp.y,
            scale: 1,
            rotationY: 0,
            rotationZ: 0,
            zIndex: i + 1,
          });
          card.classList.add("is-landed");
        }
      });

      // Timeline line segments
      lineSegs.forEach((seg, i) => {
        if (!seg) return;
        const win    = LINE_WINDOWS[i]!;
        const segP   = gsap.utils.clamp(0, 1, gsap.utils.mapRange(win.start, win.end, 0, 1, p));
        gsap.set(seg, { scaleX: segP, opacity: segP, transformOrigin: "left center" });
      });

      // CV Download card — last to appear
      if (cvCard) {
        const cvP = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.88, 0.97, 0, 1, p));
        gsap.set(cvCard, { opacity: cvP, x: (1 - cvP) * 32 });
      }
    }

    // ── Subscribe to per-frame progress from ScrollTrigger ────────────────────
    horizonScrollState.onProgressUpdate = updateByProgress;

    // If the page was already scrolled into the career slide (e.g. refresh), catch up instantly
    if (horizonScrollState.progress > 0) {
      updateByProgress(horizonScrollState.progress);
    }

    // Mobile fallback — IntersectionObserver is no longer needed because GSAP scroll-pinning now runs on mobile.
    return () => {
      horizonScrollState.onProgressUpdate = null;
    };
  }, []);

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="horizon-slide slide--cv" ref={slideRef}>
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute", top: "10%", left: "18%",
          width: "420px", height: "420px",
          background: "rgba(0, 243, 255, 0.045)",
          borderRadius: "50%", filter: "blur(120px)",
          pointerEvents: "none", zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "5%", right: "15%",
          width: "300px", height: "300px",
          background: "rgba(188, 19, 254, 0.03)",
          borderRadius: "50%", filter: "blur(100px)",
          pointerEvents: "none", zIndex: 1,
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT (≤ 968px)
          – Sticky header with "Career Pathway" text
          – Horizontal swipe-able cards rail
          – Hidden on desktop via CSS (.cv-mobile-sticky-header { display: none })
          ════════════════════════════════════════════════════════════════════ */}
      <div className="cv-mobile-sticky-header">
        <p className="slide-badge">{`// EXPERIENCE & TIMELINE`}</p>
        <h2
          className="slide-title"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          CAREER{" "}
          <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.7)" }}>
            PATHWAY
          </span>
        </h2>
        <p className="slide-description">
          A brief overview of my academic background at PENS, official certification records, and student competency achievements.
        </p>
      </div>

      <div className="cv-mobile-cards-rail">
        {TIMELINE_DATA.map((item, idx) => (
          <div className="cv-mobile-card" key={idx}>
            <div
              className="cv-mobile-card-glow"
              style={{ background: CARD_COLORS[idx] }}
            />
            <p className="cv-mobile-card-year">{item.year}</p>
            <span className="cv-mobile-card-badge">{item.badge}</span>
            <div className="cv-mobile-card-divider" />
            <h3 className="cv-mobile-card-role">{item.role}</h3>
            <p className="cv-mobile-card-institution">{item.institution}</p>
            <p className="cv-mobile-card-desc">{item.desc}</p>
          </div>
        ))}
        {/* CV download card */}
        <div className="cv-mobile-download-card">
          <div>
            <p style={{ fontFamily: "var(--font-code)", fontSize: "0.6rem", color: "rgba(255,255,255,0.28)", margin: "0 0 6px" }}>
              {`// FILE_DOCUMENT`}
            </p>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "white", margin: "0 0 6px" }}>
              CURRICULUM VITAE
            </h4>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Download professional resume summary (PDF, ~180 KB).
            </p>
          </div>
          <a
            href="https://drive.google.com/file/d/16mvFW569lf6yUzMRpEQUMY-NVJ4t41kZ/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ fontSize: "0.72rem", padding: "8px 12px", textAlign: "center", display: "block" }}
          >
            Get Resume PDF
          </a>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (> 968px)
          – Full GSAP animated horizontal card stack
          – Hidden on mobile via CSS (.cv-timeline-area { display: none })
          ════════════════════════════════════════════════════════════════════ */}
      <div className="horizon-slide-content" style={{ zIndex: 2, width: "100%" }}>
        {/* ── Headers ───────────────────────────────────────────────────────── */}
        <p className="slide-badge cv-header-anim">{`// EXPERIENCE & TIMELINE`}</p>
        <h2
          className="slide-title cv-header-anim"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          CAREER{" "}
          <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.7)" }}>
            PATHWAY
          </span>
        </h2>
        <p className="slide-description cv-header-anim">
          A brief overview of my academic background at PENS, official certification records, and student competency achievements.
        </p>

        {/* ── Scroll hint ───────────────────────────────────────────────────── */}
        <div className="cv-scroll-hint" ref={hintRef} aria-hidden="true">
          <div className="cv-hint-wheel">
            <div className="cv-hint-dot" />
          </div>
          <span className="cv-hint-text">scroll to unfold my journey</span>
          <div className="cv-hint-arrows">
            <span>↓</span>
            <span>↓</span>
            <span>↓</span>
          </div>
        </div>

        {/* ── Card stack + timeline area ────────────────────────────────────── */}
        <div
          className="cv-timeline-area"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1120px",
            display: "flex",
            alignItems: "flex-start",
            gap: "32px",
            marginTop: "8px",
          }}
        >
          {/* Stack container — all cards absolutely positioned here */}
          <div className="cv-card-stack">
            {TIMELINE_DATA.map((item, idx) => (
              <div
                key={idx}
                className="cv-card"
                data-index={String(idx)}
                style={{ "--card-color": CARD_COLORS[idx] } as React.CSSProperties}
              >
                {/* Shimmer rotating border */}
                <div className="cv-card-shimmer" />

                {/* Timeline connector dot */}
                <div className="cv-card-connector-dot" />

                <div className="cv-card-inner">
                  {/* Meta row: year + badge */}
                  <div className="cv-card-meta">
                    <span className="cv-card-year">{item.year}</span>
                    <span className="cv-card-badge">{item.badge}</span>
                  </div>

                  {/* Divider */}
                  <div className="cv-card-divider" />

                  {/* Role & institution */}
                  <h3 className="cv-card-role">{item.role}</h3>
                  <p className="cv-card-institution">{item.institution}</p>

                  {/* Description */}
                  <p className="cv-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}

            {/* Timeline connector lines */}
            <div ref={lineRef01} className="cv-line-seg" style={{ left: "110px" }} />
            <div ref={lineRef12} className="cv-line-seg" style={{ left: "370px" }} />
            <div ref={lineRef23} className="cv-line-seg" style={{ left: "630px" }} />
          </div>

          {/* CV Download card */}
          <div
            className="glass-card cv-download-card"
            ref={cvCardRef}
            style={{
              flexShrink: 0,
              width: "210px",
              padding: "20px",
              border: "1px dashed rgba(255,255,255,0.12)",
              background: "rgba(255, 255, 255, 0.01)",
              borderRadius: "14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
              alignSelf: "center",
            }}
          >
            <div>
              <p style={{ fontFamily: "var(--font-code)", fontSize: "0.62rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
                {`// FILE_DOCUMENT`}
              </p>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "white", margin: "8px 0 4px" }}>
                CURRICULUM VITAE
              </h4>
              <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", lineHeight: "1.45" }}>
                Download professional resume summary (PDF, ~180 KB).
              </p>
            </div>
            <a
              href="https://drive.google.com/file/d/16mvFW569lf6yUzMRpEQUMY-NVJ4t41kZ/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                fontSize: "0.72rem",
                padding: "8px 12px",
                textAlign: "center",
                display: "block",
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "white",
              }}
            >
              Get Resume PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

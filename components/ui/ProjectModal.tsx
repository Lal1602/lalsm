"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ModalData {
  title: string;
  desc: string;
  tech: string;
  image: string;
  link: string;
}

interface Props {
  data: ModalData | null;
  cardRect: DOMRect | null;
  onClose: () => void;
}

export default function ProjectModal({ data, cardRect, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !overlayRef.current || !contentRef.current) return;
    const overlay = overlayRef.current;
    const content = contentRef.current;

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Fade + scale in — clean entrance, no morphing from card position
    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(
      content,
      { opacity: 0, scale: 0.92, y: 24 },
      { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: "power3.out" }
    );

    overlay.classList.add("active");
  }, [data]);

  function handleClose() {
    if (!overlayRef.current || !contentRef.current) return;
    const overlay = overlayRef.current;
    const content = contentRef.current;

    gsap.to(content, { opacity: 0, scale: 0.94, y: 16, duration: 0.28, ease: "power2.in" });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        overlay.style.display = "none";
        overlay.classList.remove("active");
        document.body.style.overflow = "";
        onClose();
      },
    });
  }

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!data) return null;

  const techItems = data.tech ? data.tech.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div
      className="ach-modal-overlay"
      id="projectModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achModalTitle"
      ref={overlayRef}
      style={{ display: "none" }}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div className="ach-modal-card" ref={contentRef}>

        {/* ── Close button ─────────────────────────────────────────── */}
        <button
          className="ach-modal-close"
          aria-label="Close"
          onClick={handleClose}
        >
          {/* @ts-ignore */}
          <ion-icon suppressHydrationWarning name="close-outline" aria-hidden="true" />
        </button>

        {/* ── Image pane ───────────────────────────────────────────── */}
        {data.image && (
          <div className="ach-modal-img-pane">
            <img
              src={data.image}
              alt={data.title}
              className="ach-modal-img"
            />
            {/* Gradient scrim for text legibility */}
            <div className="ach-modal-img-scrim" />
          </div>
        )}

        {/* ── Info pane ────────────────────────────────────────────── */}
        <div className="ach-modal-info">
          {/* Eyebrow */}
          <p className="ach-modal-eyebrow">// Certificate &amp; Achievement</p>

          {/* Title */}
          <h3 id="achModalTitle" className="ach-modal-title">
            {data.title}
          </h3>

          {/* Tech/tag badges */}
          {techItems.length > 0 && (
            <div className="ach-modal-tags">
              {techItems.map((t) => (
                <span key={t} className="ach-modal-tag">{t}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="ach-modal-desc">{data.desc}</p>

          {/* CTA */}
          <a
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ach-modal-cta"
            aria-label={`View full certificate for ${data.title}`}
          >
            {/* @ts-ignore */}
            <ion-icon suppressHydrationWarning name="open-outline" aria-hidden="true" />
            View Full Certificate
          </a>
        </div>

      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
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

    gsap.set(overlay, { opacity: 0 });

    if (cardRect) {
      gsap.set(content, {
        position: "fixed",
        left: cardRect.left,
        top: cardRect.top,
        width: cardRect.width,
        height: cardRect.height,
        xPercent: 0,
        yPercent: 0,
        margin: 0,
        scale: 1,
        opacity: 1,
        borderRadius: "15px",
      });
    } else {
      gsap.set(content, { scale: 0.85, opacity: 0 });
    }

    gsap.to(overlay, { opacity: 1, duration: 0.35, ease: "power2.out" });

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = vw > 768 ? 600 : vw * 0.9;

    gsap.to(content, {
      left: vw / 2,
      top: vh / 2,
      xPercent: -50,
      yPercent: -50,
      width: w,
      height: "auto",
      borderRadius: "20px",
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "power3.inOut",
    });

    overlay.classList.add("active");
  }, [data, cardRect]);

  function handleClose() {
    if (!overlayRef.current || !contentRef.current) return;
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (cardRect) {
      gsap.to(content, {
        left: cardRect.left,
        top: cardRect.top,
        xPercent: 0,
        yPercent: 0,
        width: cardRect.width,
        height: cardRect.height,
        borderRadius: "15px",
        duration: 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.to(content, {
            opacity: 0,
            duration: 0.15,
            onComplete: () => {
              gsap.set(content, { clearProps: "all" });
              overlay.style.display = "none";
              overlay.classList.remove("active");
              document.body.style.overflow = "auto";
              onClose();
            },
          });
        },
      });
      gsap.to(overlay, { opacity: 0, duration: 0.38, ease: "power2.in" });
    } else {
      gsap.to(overlay, { opacity: 0, duration: 0.3 });
      gsap.to(content, {
        opacity: 0,
        scale: 0.85,
        duration: 0.3,
        onComplete: () => {
          gsap.set(content, { clearProps: "all" });
          overlay.style.display = "none";
          overlay.classList.remove("active");
          document.body.style.overflow = "auto";
          onClose();
        },
      });
    }
  }

  if (!data) return null;

  const techItems = data.tech ? data.tech.split(",").map((t) => t.trim()) : [];

  return (
    <div
      className="modal-overlay"
      id="projectModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      ref={overlayRef}
      style={{ display: "none" }}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div className="modal-content" data-lenis-prevent ref={contentRef}>
        <button className="close-modal" id="closeModalBtn" aria-label="Close Modal" onClick={handleClose}>
          {/* @ts-ignore */}
          <ion-icon suppressHydrationWarning name="close-outline" aria-hidden="true"></ion-icon>
        </button>
        {data.image && (
          <img id="modalImg" src={data.image} alt="Project or Certificate Preview" className="modal-img" />
        )}
        <div className="modal-body">
          <h3 id="modalTitle" className="modal-title">{data.title}</h3>
          {techItems.length > 0 && (
            <div id="modalTechContainer">
              <div id="modalTech" className="modal-tech">
                {techItems.map((t) => (
                  <span key={t} className="tech-badge">{t}</span>
                ))}
              </div>
            </div>
          )}
          <p id="modalDesc" className="modal-desc">{data.desc}</p>
          <a id="modalLink" href={data.link} target="_blank" rel="noopener noreferrer" className="btn" style={{ marginTop: "15px" }}>
            View Full Certificate / Project
          </a>
        </div>
      </div>
    </div>
  );
}

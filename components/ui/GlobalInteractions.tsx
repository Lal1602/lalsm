"use client";
import { useEffect, useState } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import ProjectModal from "./ProjectModal";

interface ModalData {
  title: string;
  desc: string;
  tech: string;
  image: string;
  link: string;
}

function createBurst(x: number, y: number) {
  const colors = ["#00f3ff", "#bc13fe", "#ffd700"];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "burst-particle";
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const velocity = 30 + Math.random() * 50;
    gsap.set(p, { x, y, opacity: 1, scale: 1 });
    gsap.to(p, {
      x: x + Math.cos(angle) * velocity,
      y: y + Math.sin(angle) * velocity,
      opacity: 0, scale: 0,
      duration: 0.6 + Math.random() * 0.4,
      ease: "power2.out",
      onComplete: () => p.remove(),
    });
  }
}

export default function GlobalInteractions() {
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Particle burst on button clicks
    function onBurstClick(e: MouseEvent) {
      const target = e.target as Element;
      if (target.closest(".btn") || target.closest("button")) {
        createBurst(e.clientX, e.clientY);
      }
    }

    // Modal delegation
    function onCardClick(e: MouseEvent) {
      const target = e.target as Element;
      const marqueeCard = target.closest<HTMLElement>(".marquee-card");
      const projectBtn = target.closest(".btn-quick-view") || target.closest(".project-card a");
      const projectCard = target.closest<HTMLElement>(".project-card") || target.closest<HTMLElement>(".achievement-card");
      const card = marqueeCard || (projectBtn ? projectCard : null);
      if (!card) return;
      e.preventDefault();

      const rect = card.getBoundingClientRect();
      const data: ModalData = {
        title: card.dataset.title || "",
        desc: card.dataset.desc || "",
        tech: card.dataset.tech || "",
        image: card.dataset.image || "",
        link: card.dataset.link || "#",
      };
      setCardRect(rect);
      setModalData(data);
    }

    // Tilt cards
    function onTiltMove(e: MouseEvent) {
      const card = (e.target as Element).closest<HTMLElement>(".tilt-card");
      if (card) {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 20;
        const y = (e.clientY - top - height / 2) / 20;
        card.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.02)`;
      }
    }
    function onTiltOut(e: MouseEvent) {
      const card = (e.target as Element).closest<HTMLElement>(".tilt-card");
      if (card) card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    }

    // Spotlight card hover border glow
    function onSpotlightMove(e: MouseEvent) {
      const card = (e.target as Element).closest<HTMLElement>(".glass-card, .project-card, .achievement-card, .about-layer-card, .workflow-step-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    }

    document.addEventListener("click", onBurstClick);
    document.addEventListener("click", onCardClick);
    document.addEventListener("mousemove", onTiltMove);
    document.addEventListener("mouseout", onTiltOut);
    document.addEventListener("mousemove", onSpotlightMove);

    return () => {
      document.removeEventListener("click", onBurstClick);
      document.removeEventListener("click", onCardClick);
      document.removeEventListener("mousemove", onTiltMove);
      document.removeEventListener("mouseout", onTiltOut);
      document.removeEventListener("mousemove", onSpotlightMove);
    };
  }, []);

  return (
    <>
      {modalData && (
        <ProjectModal
          data={modalData}
          cardRect={cardRect}
          onClose={() => { setModalData(null); setCardRect(null); }}
        />
      )}
    </>
  );
}

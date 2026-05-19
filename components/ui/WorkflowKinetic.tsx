"use client";
import { useEffect } from "react";
import gsap from "gsap";

const ANIM = [
  {
    accent: "cyan",
    enter: (chars: HTMLElement[]) =>
      gsap.timeline({ overwrite: "auto" as const })
        .to(chars, { backgroundSize: "100% 110%", y: -7, duration: 0.5, stagger: { each: 0.042, from: "start" as const, ease: "power1.inOut" }, ease: "power2.out" })
        .to(chars, { y: 0, duration: 0.35, stagger: { each: 0.025, from: "start" as const }, ease: "power2.inOut" }, "-=0.28"),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", y: 0, duration: 0.28, stagger: { each: 0.022, from: "end" as const }, overwrite: "auto" as const }),
  },
  {
    accent: "gold",
    enter: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 110%", duration: 0.48, stagger: { each: 0.05, from: "center" as const }, ease: "power2.out", overwrite: "auto" as const }),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", duration: 0.32, stagger: { each: 0.04, from: "center" as const }, overwrite: "auto" as const }),
  },
  {
    accent: "purple",
    enter: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 110%", scaleY: 1.06, duration: 0.32, stagger: { each: 0.028, from: "random" as const }, ease: "power1.out", overwrite: "auto" as const, onComplete: () => gsap.to(chars, { scaleY: 1, duration: 0.2 }) }),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", scaleY: 1, duration: 0.22, stagger: { each: 0.02, from: "random" as const }, overwrite: "auto" as const }),
  },
  {
    accent: "orange",
    enter: (chars: HTMLElement[]) =>
      gsap.timeline({ overwrite: "auto" as const })
        .to(chars, { y: -14, duration: 0.18, stagger: { each: 0.007, from: "start" as const }, ease: "power3.in" })
        .to(chars, { backgroundSize: "100% 110%", y: 0, duration: 0.28, stagger: { each: 0.007, from: "start" as const }, ease: "power3.out" }, "-=0.06"),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", y: 0, duration: 0.2, stagger: { each: 0.009, from: "end" as const }, ease: "power2.in", overwrite: "auto" as const }),
  },
];

function splitChars(item: HTMLElement): HTMLElement[] {
  const chars: HTMLElement[] = [];
  Array.from(item.childNodes).forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const text = node.textContent || "";
    if (!text.trim()) return;
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      if (ch === " ") {
        frag.appendChild(document.createTextNode(" "));
      } else {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        frag.appendChild(span);
        chars.push(span);
      }
    }
    node.replaceWith(frag);
  });
  return chars;
}

export default function WorkflowKinetic() {
  useEffect(() => {
    const floatingCard = document.querySelector<HTMLElement>(".floating-workflow-card");
    const items = document.querySelectorAll<HTMLElement>(".workflow-text-item");
    if (!floatingCard || !items.length) return;

    const xTo = gsap.quickTo(floatingCard, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(floatingCard, "y", { duration: 0.45, ease: "power3" });

    items.forEach((item, index) => {
      const chars = splitChars(item);
      const anim = ANIM[index] || ANIM[0];
      let activeTween: gsap.core.Tween | gsap.core.Timeline | null = null;

      item.addEventListener("mouseenter", () => {
        if (activeTween) { activeTween.kill(); activeTween = null; }
        activeTween = anim.enter(chars);

        const iconEl = floatingCard.querySelector<HTMLElement>(".float-icon");
        const titleEl = floatingCard.querySelector<HTMLElement>(".float-title");
        const descEl = floatingCard.querySelector<HTMLElement>(".float-desc");
        if (iconEl) iconEl.setAttribute("name", item.dataset.icon || "");
        if (titleEl) titleEl.textContent = item.dataset.title || "";
        if (descEl) descEl.textContent = item.dataset.desc || "";

        floatingCard.classList.remove("accent-cyan", "accent-gold", "accent-purple", "accent-orange");
        floatingCard.classList.add(`accent-${anim.accent}`);
        gsap.to(floatingCard, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(1.4)" });
      });

      item.addEventListener("mousemove", (e) => {
        xTo(e.clientX + 24);
        yTo(e.clientY + 24);
      });

      item.addEventListener("mouseleave", () => {
        if (activeTween) { activeTween.kill(); activeTween = null; }
        activeTween = anim.leave(chars);
        gsap.to(floatingCard, { opacity: 0, scale: 0.82, duration: 0.2, ease: "power2.in" });
      });
    });
  }, []);

  return null;
}

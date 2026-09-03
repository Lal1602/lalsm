"use client";
import React, { useState, useEffect, useRef } from "react";
import InteractiveProcessItem from "./InteractiveProcessItem";
import DynamicConduit from "./DynamicConduit";
import HolographicCard from "./HolographicCard";

const STEPS = [
  {
    num: "01",
    label: "Discovery",
    icon: "search-outline",
    title: "Discovery Phase",
    desc: "We perform a deep dive into requirements, user persona research, and competitor analysis to map out the overall project trajectory before writing a single line of code.",
  },
  {
    num: "02",
    label: "Design",
    icon: "color-palette-outline",
    title: "High-Fidelity Design",
    desc: "Crafting modern, immersive cyberpunk UI mockups, fluid prototypes, and dynamic user flows that align mathematically with your branding identity.",
  },
  {
    num: "03",
    label: "Development",
    icon: "code-working-outline",
    title: "Creative Development",
    desc: "Engineered with maximum efficiency. Clean, robust, modular full-stack code built on Next.js, optimized for 60fps animations, web vitals, and long-term scalability.",
  },
  {
    num: "04",
    label: "Deployment",
    icon: "rocket-outline",
    title: "Production Ship",
    desc: "Continuous integration pipelines, CDN configurations, ultra-secure cloud scaling, and micro-interaction checks for a flawless zero-downtime launch.",
  },
];

export default function ProcessDashboard() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [hintDismissed, setHintDismissed] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      setIsDesktop(w >= 1024);
      setIsMobile(w < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Robust fix for "stationary mouse scroll" hover bug — desktop only
  useEffect(() => {
    if (isMobile) return;
    let lastX = 0;
    let lastY = 0;

    function handleMouseMove(e: MouseEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
    }

    function handleScroll() {
      if (lastX === 0 && lastY === 0) return;
      const el = document.elementFromPoint(lastX, lastY);
      if (el) {
        const trigger = el.closest('[data-process-index]');
        if (trigger) {
          const idx = parseInt(trigger.getAttribute('data-process-index') || '0', 10);
          setActiveIndex(idx);
          setHintDismissed(true);
        } else if (!el.closest('.process-list-wrapper')) {
          setActiveIndex(null);
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  const handleItemClick = (idx: number) => {
    // On mobile: toggle — clicking same item deactivates it
    setActiveIndex(prev => prev === idx ? null : idx);
    if (!hintDismissed) setHintDismissed(true);
  };

  const activeStep = activeIndex !== null ? STEPS[activeIndex] : null;

  return (
    <section
      ref={containerRef}
      className={`section process-section-container${hintDismissed ? " hint-dismissed" : ""}`}
      id="workflow"
      aria-label="Workflow Section"
    >
      <div className="parallax-text" style={{ top: "8%", left: "8%" }} data-speed="0.08">
        PROCESS
      </div>

      <div className="container">
        <h2 className="section-title" data-scroll>How I Work</h2>

        {/* Desktop hint */}
        <p className="process-hover-hint process-hint-desktop" aria-hidden="true">
          <span className="hint-cursor" />
          hover each phase to reveal
        </p>

        {/* Mobile hint */}
        <p className="process-hover-hint process-hint-mobile" aria-hidden="true">
          <span className="hint-tap-icon">
            <ion-icon suppressHydrationWarning name="finger-print-outline"></ion-icon>
          </span>
          tap a phase — unlock the sequence
        </p>

        <div className="process-grid">
          {isDesktop && activeIndex !== null && <DynamicConduit activeIndex={activeIndex} />}

          <ol
            className="process-list-wrapper"
            aria-label="Workflow steps"
            onMouseLeave={() => !isMobile && setActiveIndex(null)}
          >
            {STEPS.map((step, idx) => (
              <InteractiveProcessItem
                key={step.num}
                step={step}
                index={idx}
                isActive={activeIndex === idx}
                isMobile={isMobile}
                onHoverStart={() => {
                  if (!isMobile) {
                    setActiveIndex(idx);
                    if (!hintDismissed) setHintDismissed(true);
                  }
                }}
                onHoverEnd={() => {}}
                onClickItem={() => handleItemClick(idx)}
              />
            ))}
          </ol>

          <HolographicCard
            activeStep={activeStep}
            activeIndex={activeIndex}
          />
        </div>
      </div>
    </section>
  );
}

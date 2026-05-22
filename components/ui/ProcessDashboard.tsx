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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [interactionDisabled, setInteractionDisabled] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check viewport width for responsive rendering (client-side only)
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Performance-optimized Scroll-Based Debouncing to prevent chaotic ghost hovers
  useEffect(() => {
    let lastScrollTop = window.scrollY;
    let lastScrollTime = Date.now();
    let debounceTimer: NodeJS.Timeout;

    function handleScroll() {
      const now = Date.now();
      const currentScrollTop = window.scrollY;
      
      const deltaY = Math.abs(currentScrollTop - lastScrollTop);
      const deltaTime = now - lastScrollTime;
      const speed = deltaTime > 0 ? deltaY / deltaTime : 0;

      lastScrollTop = currentScrollTop;
      lastScrollTime = now;

      // If scrolling velocity is high, temporarily suspend all hover interactions
      if (speed > 0.4) {
        setInteractionDisabled(true);
      }

      // Re-enable interactions after scrolling comes to a complete halt for 150ms
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setInteractionDisabled(false);
      }, 150);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(debounceTimer);
    };
  }, []);

  const activeStep = STEPS[activeIndex] || STEPS[0];

  return (
    <section 
      ref={containerRef}
      className="section process-section-container" 
      id="workflow" 
      aria-label="Workflow Section"
    >
      <div className="parallax-text" style={{ top: "8%", left: "8%" }} data-speed="0.08">
        PROCESS
      </div>

      <div className="container">
        <h2 className="section-title" data-scroll>How I Work</h2>

        <div className="process-grid">
          {/* Dynamic Conduit overlay for desktop rendering */}
          {isDesktop && <DynamicConduit activeIndex={activeIndex} />}

          {/* Process steps left column */}
          <ol 
            className={`process-list-wrapper ${interactionDisabled ? "scroll-disabled-interactions" : ""}`}
            aria-label="Workflow steps"
          >
            {STEPS.map((step, idx) => (
              <InteractiveProcessItem
                key={step.num}
                step={step}
                index={idx}
                isActive={activeIndex === idx}
                onHoverStart={() => {
                  if (!interactionDisabled) {
                    setActiveIndex(idx);
                  }
                }}
                onHoverEnd={() => {
                  // Keep active step pinned to prevent visual jitter
                }}
              />
            ))}
          </ol>

          {/* Informational holographic card right column */}
          <HolographicCard 
            activeStep={activeStep} 
            activeIndex={activeIndex} 
          />
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import InfinityNodeDiagram from "./InfinityNodeDiagram";

interface Step {
  num: string;
  label: string;
  icon: string;
  title: string;
  desc: string;
}

interface HolographicCardProps {
  activeStep: Step;
  activeIndex: number;
}

export default function HolographicCard({ activeStep, activeIndex }: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Curated theme styles for each of the 4 steps (high-end architectural colors)
  const themes = [
    { rgb: "0, 243, 255", hex: "#00f3ff", eyebrow: "PHASE 01 // DISCOVERY & STRATEGY" }, // Discovery (Cyan)
    { rgb: "255, 215, 0", hex: "#ffd700", eyebrow: "PHASE 02 // INTERACTION & DESIGN" }, // Design (Gold)
    { rgb: "188, 19, 254", hex: "#bc13fe", eyebrow: "PHASE 03 // ARCHITECTURE & CODE" }, // Development (Purple)
    { rgb: "255, 80, 0", hex: "#ff5000", eyebrow: "PHASE 04 // LAUNCH & MONITOR" },    // Deployment (Orange)
  ];

  const currentTheme = themes[activeIndex] || themes[0];

  // GSAP Spring entrance timelines for card content
  useEffect(() => {
    const tl = gsap.timeline();
    
    // Card slide-up & elastic bounce
    tl.fromTo(
      cardRef.current,
      { y: 15, scale: 0.98, opacity: 0.9 },
      { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
    );

    // Staggered text reveal
    tl.fromTo(
      [iconRef.current, titleRef.current, descRef.current],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" },
      "-=0.35"
    );
  }, [activeIndex]);

  return (
    <div 
      ref={cardRef}
      className={`interactive-info-card accent-${activeIndex}`}
      id="interactive-info-card"
      style={{
        ["--card-theme-color" as any]: currentTheme.hex,
        ["--glow-color-rgb" as any]: currentTheme.rgb
      }}
    >
      {/* Ambient background light glow - extremely subtle */}
      <div className="card-ambient-glow" />

      {/* Relative container ensuring text sits beautifully */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Card Header */}
        <div className="card-header-area">
          <span className="card-eyebrow-tech">{currentTheme.eyebrow}</span>
          <div ref={iconRef} className="card-icon-container">
            {/* @ts-ignore */}
            <ion-icon suppressHydrationWarning name={activeStep.icon}></ion-icon>
          </div>
        </div>

        {/* Card Typography */}
        <h2 ref={titleRef} className="card-main-title">{activeStep.title}</h2>
        <p ref={descRef} className="card-description-text">{activeStep.desc}</p>

        {/* The Live Interactive Workflow Laboratory Visuals */}
        <InfinityNodeDiagram 
          activeIndex={activeIndex} 
          hexColor={currentTheme.hex} 
        />
      </div>
    </div>
  );
}

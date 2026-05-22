"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface Step {
  num: string;
  label: string;
  icon: string;
  title: string;
  desc: string;
}

interface InteractiveProcessItemProps {
  step: Step;
  index: number;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

// Recreate the exact, distinct kinetic animations per phase from the original implementation
const ANIMATIONS = [
  {
    color: "#00f3ff", // Discovery (Cyan)
    enter: (chars: HTMLElement[]) =>
      gsap.timeline({ overwrite: "auto" as const })
        .to(chars, { backgroundSize: "100% 110%", y: -7, duration: 0.5, stagger: { each: 0.042, from: "start" as const, ease: "power1.inOut" }, ease: "power2.out" })
        .to(chars, { y: 0, duration: 0.35, stagger: { each: 0.025, from: "start" as const }, ease: "power2.inOut" }, "-=0.28"),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", y: 0, duration: 0.28, stagger: { each: 0.022, from: "end" as const }, overwrite: "auto" as const }),
  },
  {
    color: "#ffd700", // Design (Gold)
    enter: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 110%", duration: 0.48, stagger: { each: 0.05, from: "center" as const }, ease: "power2.out", overwrite: "auto" as const }),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", duration: 0.32, stagger: { each: 0.04, from: "center" as const }, overwrite: "auto" as const }),
  },
  {
    color: "#bc13fe", // Development (Purple)
    enter: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 110%", scaleY: 1.06, duration: 0.32, stagger: { each: 0.028, from: "random" as const }, ease: "power1.out", overwrite: "auto" as const, onComplete: () => gsap.to(chars, { scaleY: 1, duration: 0.2 }) }),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", scaleY: 1, duration: 0.22, stagger: { each: 0.02, from: "random" as const }, overwrite: "auto" as const }),
  },
  {
    color: "#ff5000", // Deployment (Orange)
    enter: (chars: HTMLElement[]) =>
      gsap.timeline({ overwrite: "auto" as const })
        .to(chars, { y: -14, duration: 0.18, stagger: { each: 0.007, from: "start" as const }, ease: "power3.in" })
        .to(chars, { backgroundSize: "100% 110%", y: 0, duration: 0.28, stagger: { each: 0.007, from: "start" as const }, ease: "power3.out" }, "-=0.06"),
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { backgroundSize: "100% 0%", y: 0, duration: 0.2, stagger: { each: 0.009, from: "end" as const }, ease: "power2.in", overwrite: "auto" as const }),
  },
];

export default function InteractiveProcessItem({
  step,
  index,
  isActive,
  onHoverStart,
  onHoverEnd
}: InteractiveProcessItemProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const currentTheme = ANIMATIONS[index] || ANIMATIONS[0];
  const activeAnimRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  // Dynamically trigger entry or exit GSAP timeline based on active state changes
  useEffect(() => {
    if (!textRef.current) return;
    const chars = Array.from(textRef.current.querySelectorAll(".char")) as HTMLElement[];
    if (chars.length === 0) return;

    if (activeAnimRef.current) {
      activeAnimRef.current.kill();
      activeAnimRef.current = null;
    }
    gsap.killTweensOf(chars);

    if (isActive) {
      activeAnimRef.current = currentTheme.enter(chars);
    } else {
      activeAnimRef.current = currentTheme.leave(chars);
    }

    return () => {
      if (activeAnimRef.current) {
        activeAnimRef.current.kill();
        activeAnimRef.current = null;
      }
      gsap.killTweensOf(chars);
    };
  }, [isActive, currentTheme]);

  return (
    <li 
      className={`process-item-container ${isActive ? "active-row" : ""}`}
      style={{
        ["--theme-color" as any]: currentTheme.color
      }}
    >
      {/* 
        Strict Bounding Box Hover Trigger Area:
        The triggers and bounding box are bound strictly to this inline-flex wrapper, 
        ensuring 100% immunity to adjacent padding or full-row ghost hovers.
      */}
      <span 
        className="process-item-trigger-wrapper"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          position: "relative",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: "6px",
          userSelect: "none",
          whiteSpace: "nowrap"
        }}
      >
        <span 
          className="process-item-num"
          style={{
            fontFamily: "var(--font-code)",
            fontSize: "1rem",
            color: isActive ? currentTheme.color : "rgba(255, 255, 255, 0.3)",
            marginRight: "16px",
            transition: "color 0.3s ease",
            whiteSpace: "nowrap"
          }}
        >
          {step.num} —
        </span>
        
        {/* Text node split into separate char elements for kinetic stagger animation */}
        <span 
          ref={textRef}
          id={`process-item-text-${index}`} 
          className="process-item-text"
        >
          {step.label.split("").map((ch, idx) => {
            if (ch === " ") {
              return <React.Fragment key={idx}> </React.Fragment>;
            }
            return (
              <span key={idx} className="char">
                {ch}
              </span>
            );
          })}
        </span>
      </span>
    </li>
  );
}

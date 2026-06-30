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
    color: "#00f3ff", // Discovery (Cyan): Sonar Scan & Wave Wavefront
    enter: (chars: HTMLElement[]) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      gsap.set(chars, { transformPerspective: 500 });
      return tl.to(chars, { 
        backgroundSize: "100% 100%", 
        backgroundPosition: "0% 50%", 
        y: -11, 
        rotationX: 20,
        scale: 1.12,
        textShadow: "0 0 14px rgba(0, 243, 255, 0.95)",
        duration: 0.38, 
        stagger: { each: 0.04, from: "start" as const, ease: "power1.inOut" }, 
        ease: "power2.out" 
      })
      .to(chars, { 
        y: 0, 
        rotationX: 0,
        scale: 1.0,
        textShadow: "0 0 2px rgba(0, 243, 255, 0.25)",
        duration: 0.28, 
        stagger: { each: 0.03, from: "start" as const }, 
        ease: "power2.inOut" 
      }, "-=0.22");
    },
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { 
        backgroundSize: "0% 100%", 
        backgroundPosition: "100% 50%", 
        y: 0, 
        rotationX: 0,
        scale: 1,
        textShadow: "none",
        duration: 0.3, 
        stagger: { each: 0.02, from: "end" as const }, 
        ease: "power2.in", 
        overwrite: "auto" as const 
      }),
  },
  {
    color: "#ffd700", // Design (Gold): Liquid Elastic Drop & Skew Morphing
    enter: (chars: HTMLElement[]) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      return tl.to(chars, { 
        backgroundSize: "100% 100%", 
        backgroundPosition: "50% 0%", 
        y: 14, 
        scaleY: 0.65,
        scaleX: 1.3,
        skewX: -18,
        textShadow: "0 0 16px rgba(255, 215, 0, 0.85)",
        duration: 0.18, 
        stagger: { each: 0.045, from: "center" as const }, 
        ease: "power1.in" 
      })
      .to(chars, { 
        y: 0, 
        scaleY: 1,
        scaleX: 1,
        skewX: 0,
        textShadow: "0 0 3px rgba(255, 215, 0, 0.3)",
        duration: 0.65, 
        stagger: { each: 0.038, from: "center" as const }, 
        ease: "elastic.out(1.2, 0.38)" 
      }, "-=0.08");
    },
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { 
        backgroundSize: "100% 0%", 
        backgroundPosition: "50% 0%", 
        y: 0, 
        scaleY: 1,
        scaleX: 1,
        skewX: 0,
        textShadow: "none",
        duration: 0.28, 
        stagger: { each: 0.02, from: "center" as const }, 
        ease: "power2.in", 
        overwrite: "auto" as const 
      }),
  },
  {
    color: "#bc13fe", // Development (Purple): Digital Compiler Glitch & Chrome Slide
    enter: (chars: HTMLElement[]) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      // Fast jittery code glitch assembly
      chars.forEach((char) => {
        tl.to(char, {
          x: () => (Math.random() - 0.5) * 7,
          y: () => (Math.random() - 0.5) * 5,
          scaleY: () => 0.85 + Math.random() * 0.3,
          duration: 0.07,
          ease: "none"
        }, Math.random() * 0.12);
      });
      // Chrome sweep stabilizer
      tl.to(chars, { 
        backgroundSize: "250% 100%", 
        backgroundPosition: "0% 50%", 
        x: 0,
        y: 0,
        scaleY: 1.06,
        scaleX: 1.06,
        skewY: 6,
        textShadow: "0 0 12px rgba(188, 19, 254, 0.85)",
        duration: 0.42, 
        stagger: { each: 0.032, from: "random" as const }, 
        ease: "back.out(2.5)" 
      }, "+=0.04")
      .to(chars, { 
        scaleY: 1,
        scaleX: 1,
        skewY: 0,
        duration: 0.22, 
        stagger: { each: 0.018, from: "random" as const }, 
        ease: "power2.out" 
      }, "-=0.16");
      return tl;
    },
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { 
        backgroundSize: "250% 0%", 
        backgroundPosition: "100% 50%", 
        x: 0,
        y: 0,
        scaleY: 1,
        scaleX: 1,
        skewY: 0,
        textShadow: "none",
        duration: 0.28, 
        stagger: { each: 0.02, from: "random" as const }, 
        ease: "power2.in", 
        overwrite: "auto" as const 
      }),
  },
  {
    color: "#ff5000", // Deployment (Orange): Rocket Launch ignition & Kinetic Impact Bounce
    enter: (chars: HTMLElement[]) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      return tl.to(chars, { 
        y: -24, 
        scaleY: 1.45,
        scaleX: 0.78,
        backgroundSize: "180% 180%", 
        textShadow: "0 0 22px rgba(255, 80, 0, 0.98)",
        duration: 0.22, 
        stagger: { each: 0.022, from: "end" as const }, 
        ease: "power3.out" 
      })
      .to(chars, { 
        y: 0, 
        scaleY: 1,
        scaleX: 1,
        duration: 0.48, 
        stagger: { each: 0.018, from: "end" as const }, 
        ease: "bounce.out" 
      }, "-=0.12");
    },
    leave: (chars: HTMLElement[]) =>
      gsap.to(chars, { 
        backgroundSize: "0% 0%", 
        y: 0, 
        scaleY: 1,
        scaleX: 1,
        textShadow: "none",
        duration: 0.25, 
        stagger: { each: 0.012, from: "start" as const }, 
        ease: "power2.in", 
        overwrite: "auto" as const 
      }),
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
            color: isActive ? currentTheme.color : "var(--process-item-num-idle)",
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

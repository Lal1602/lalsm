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

// ─────────────────────────────────────────────────────────────────────────────
// CARTOONISH CHARACTER ANIMATIONS — Awwwards-quality, personality-driven
// Each phase has a distinct "character" with anticipation → action → settle
// ─────────────────────────────────────────────────────────────────────────────
const ANIMATIONS = [
  {
    // ── 01 DISCOVERY ─ "Wide-Eyed Surprise" ─────────────────────────────────
    // Character: Letters widen eyes (scaleY), gasp upward with overshoot,
    // then wobble side-to-side in excitement before settling
    color: "#00f3ff",
    enter: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      // Anticipation: slight squash down first
      tl.to(chars, {
        scaleY: 0.7,
        scaleX: 1.15,
        y: 4,
        duration: 0.1,
        stagger: { each: 0.025, from: "start" as const },
        ease: "power1.in",
      })
        // Launch up with stretch (cartoon squash & stretch)
        .to(
          chars,
          {
            scaleY: 1.5,
            scaleX: 0.8,
            y: -18,
            textShadow: "0 0 20px rgba(0, 243, 255, 0.9), 0 6px 0 rgba(0, 243, 255, 0.3)",
            backgroundSize: "100% 100%",
            backgroundPosition: "0% 50%",
            duration: 0.25,
            stagger: { each: 0.03, from: "start" as const },
            ease: "power3.out",
          },
          "-=0.05"
        )
        // Elastic settle — wide-eyed landed position
        .to(
          chars,
          {
            scaleY: 1,
            scaleX: 1,
            y: 0,
            duration: 0.6,
            stagger: { each: 0.022, from: "start" as const },
            ease: "elastic.out(1.4, 0.45)",
          },
          "-=0.1"
        )
        // Side-to-side excited wobble on the whole group
        .to(
          chars,
          {
            rotation: 3,
            duration: 0.08,
            stagger: { each: 0.01, from: "center" as const, yoyo: true, repeat: 3 },
            ease: "none",
          },
          "-=0.3"
        )
        .to(
          chars,
          { rotation: 0, duration: 0.1, ease: "power1.out" },
          "+=0"
        );

      // Number element: color flash
      if (numEl) {
        tl.to(numEl, { scale: 1.15, duration: 0.2, ease: "back.out(3)" }, 0);
      }
      return tl;
    },
    leave: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      tl.to(chars, {
        scaleY: 1,
        scaleX: 1,
        y: 0,
        rotation: 0,
        textShadow: "none",
        backgroundSize: "0% 100%",
        backgroundPosition: "100% 50%",
        duration: 0.3,
        stagger: { each: 0.02, from: "end" as const },
        ease: "power2.in",
      });
      if (numEl) tl.to(numEl, { scale: 1, duration: 0.2, ease: "power2.out" }, 0);
      return tl;
    },
  },
  {
    // ── 02 DESIGN ─ "Paint Splash Wave" ─────────────────────────────────────
    // Character: Letters wave like a flag in the wind, undulating Y sine,
    // each char slightly offset in phase — like paint being splashed across
    color: "#ffd700",
    enter: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });

      // Set initial gradient state
      gsap.set(chars, { backgroundSize: "100% 0%", backgroundPosition: "50% 0%" });

      // Wave sweep: each char floats up in a sine-wave stagger pattern
      chars.forEach((char, i) => {
        const waveY = Math.sin((i / chars.length) * Math.PI) * -14;
        tl.to(
          char,
          {
            y: waveY - 4,
            scaleX: 1.08,
            scaleY: 1.12,
            rotation: Math.sin((i / chars.length) * Math.PI * 2) * 4,
            backgroundSize: "100% 100%",
            backgroundPosition: "50% 50%",
            textShadow: `0 0 16px rgba(255, 215, 0, 0.85), 0 ${Math.abs(waveY) * 0.5}px 0 rgba(255, 215, 0, 0.2)`,
            duration: 0.35,
            ease: "power2.out",
          },
          i * 0.038
        );
      });

      // Ripple settle: gentle float back down with a secondary wave
      tl.to(
        chars,
        {
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          textShadow: "0 0 8px rgba(255, 215, 0, 0.4)",
          duration: 0.5,
          stagger: { each: 0.03, from: "center" as const },
          ease: "elastic.out(1.1, 0.5)",
        },
        `+=${chars.length * 0.038 - 0.1}`
      );

      if (numEl) tl.to(numEl, { rotation: 15, scale: 1.1, duration: 0.2, ease: "back.out(3)" }, 0.1)
        .to(numEl, { rotation: 0, scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
      return tl;
    },
    leave: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      tl.to(chars, {
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        textShadow: "none",
        backgroundSize: "100% 0%",
        backgroundPosition: "50% 0%",
        duration: 0.32,
        stagger: { each: 0.018, from: "center" as const },
        ease: "power2.in",
      });
      if (numEl) tl.to(numEl, { rotation: 0, scale: 1, duration: 0.2 }, 0);
      return tl;
    },
  },
  {
    // ── 03 DEVELOPMENT ─ "Split-Flap Board" ─────────────────────────────────
    // Character: Like an airport departures board — each letter flips on its own
    // Y/X axis to reveal itself, alternating direction (odd flips down, even flips up).
    // Purple neon glow builds char by char, then all pulse together once complete.
    // Fully deterministic (index-based), no Math.random() anywhere.
    color: "#bc13fe",
    enter: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });

      // Set starting state: each char is a "blank tile" — flipped away (rotationX 90 or -90)
      chars.forEach((char, i) => {
        const dir = i % 2 === 0 ? -90 : 90; // alternating flip direction
        gsap.set(char, {
          rotationX: dir,
          scaleX: 0.7,
          opacity: 0,
          transformPerspective: 400,
          transformOrigin: "50% 50%",
          backgroundSize: "250% 100%",
          backgroundPosition: "0% 50%",
          textShadow: "none",
        });
      });

      // Phase 1: Reveal — each char flips into view, staggered left-to-right
      tl.to(chars, {
        rotationX: 0,
        scaleX: 1,
        opacity: 1,
        textShadow: "0 0 18px rgba(188, 19, 254, 0.9), 0 0 4px rgba(188,19,254,0.5)",
        duration: 0.28,
        stagger: {
          each: 0.055,
          from: "start" as const,
          ease: "power1.in",
        },
        ease: "back.out(1.8)",
      });

      // Phase 2: Overshoot bounce — chars pop slightly forward then settle
      tl.to(
        chars,
        {
          scaleX: 1.08,
          scaleY: 1.1,
          duration: 0.1,
          stagger: { each: 0.04, from: "start" as const },
          ease: "power2.out",
        },
        // Start as soon as first chars finish flipping
        `+=${chars.length * 0.055 * 0.3}`
      ).to(
        chars,
        {
          scaleX: 1,
          scaleY: 1,
          duration: 0.22,
          stagger: { each: 0.025, from: "start" as const },
          ease: "elastic.out(1.4, 0.5)",
        },
        "-=0.06"
      );

      // Phase 3: Collective pulse — all chars breathe together once
      tl.to(
        chars,
        {
          textShadow:
            "0 0 28px rgba(188, 19, 254, 1), 0 0 8px rgba(255,255,255,0.3), 0 0 50px rgba(188,19,254,0.35)",
          duration: 0.18,
          ease: "power2.in",
        },
        "-=0.05"
      ).to(chars, {
        textShadow: "0 0 8px rgba(188, 19, 254, 0.45)",
        duration: 0.35,
        ease: "power2.out",
      });

      // Number element: quick skewX snap + scale like a mechanical click
      if (numEl) {
        gsap.set(numEl, { skewX: -15, scale: 0.85, opacity: 0.5 });
        tl.to(
          numEl,
          {
            skewX: 0,
            scale: 1.1,
            opacity: 1,
            duration: 0.2,
            ease: "back.out(3)",
          },
          0
        ).to(numEl, { scale: 1, duration: 0.3, ease: "elastic.out(1.2, 0.45)" });
      }
      return tl;
    },
    leave: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });

      // Flip back out — reverse direction from how they came in
      chars.forEach((char, i) => {
        const dir = i % 2 === 0 ? 90 : -90; // mirror of enter
        tl.to(
          char,
          {
            rotationX: dir,
            scaleX: 0.7,
            opacity: 0,
            textShadow: "none",
            backgroundSize: "250% 0%",
            backgroundPosition: "100% 50%",
            duration: 0.18,
            ease: "power2.in",
          },
          // Stagger from the end — like the board clearing from right to left
          (chars.length - 1 - i) * 0.025
        );
      });

      if (numEl) {
        tl.to(
          numEl,
          { skewX: -8, scale: 0.9, opacity: 0.5, duration: 0.15, ease: "power2.in" },
          0
        );
      }

      // After all chars are flipped out, instantly reset to clean neutral state
      // so the next enter() starts from the correct gsap.set() position
      tl.set(chars, {
        rotationX: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        textShadow: "none",
        backgroundSize: "250% 0%",
        backgroundPosition: "100% 50%",
      });
      if (numEl) {
        tl.set(numEl, { skewX: 0, scale: 1, opacity: 1 });
      }

      return tl;
    },
  },


  {
    // ── 04 DEPLOYMENT ─ "Rocket Launch" ─────────────────────────────────────
    // Character: Anticipation squash (crouch), rocket launch up with trail,
    // then slam back down with cartoon impact bounce
    color: "#ff5000",
    enter: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });

      // Anticipation: squash down (crouch before launch)
      tl.to(chars, {
        scaleY: 0.55,
        scaleX: 1.25,
        y: 6,
        duration: 0.14,
        stagger: { each: 0.018, from: "end" as const },
        ease: "power2.in",
      })
        // LAUNCH: stretch tall, shoot up
        .to(
          chars,
          {
            scaleY: 1.8,
            scaleX: 0.7,
            y: -30,
            backgroundSize: "180% 180%",
            textShadow: "0 0 24px rgba(255, 80, 0, 1), 0 8px 0 rgba(255, 180, 0, 0.4)",
            duration: 0.22,
            stagger: { each: 0.02, from: "end" as const },
            ease: "power4.out",
          },
          "-=0.05"
        )
        // SLAM landing: bounce.out with squash impact
        .to(
          chars,
          {
            scaleY: 1,
            scaleX: 1,
            y: 0,
            duration: 0.55,
            stagger: { each: 0.025, from: "end" as const },
            ease: "bounce.out",
          },
          "-=0.05"
        )
        // Impact ripple: brief squash on land, then snap to normal
        .to(
          chars,
          {
            scaleY: 0.85,
            scaleX: 1.12,
            duration: 0.06,
            stagger: { each: 0.01, from: "center" as const },
            ease: "power1.in",
          },
          "-=0.12"
        )
        .to(
          chars,
          {
            scaleY: 1,
            scaleX: 1,
            textShadow: "0 0 8px rgba(255, 80, 0, 0.5)",
            duration: 0.18,
            stagger: { each: 0.01, from: "center" as const },
            ease: "power2.out",
          },
          "-=0.02"
        );

      if (numEl) tl.to(numEl, { y: -8, scale: 1.2, duration: 0.2, ease: "power3.out" }, 0.1)
        .to(numEl, { y: 0, scale: 1, duration: 0.4, ease: "bounce.out" }, "-=0.05");
      return tl;
    },
    leave: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });
      tl.to(chars, {
        scaleY: 1,
        scaleX: 1,
        y: 0,
        textShadow: "none",
        backgroundSize: "0% 0%",
        duration: 0.28,
        stagger: { each: 0.015, from: "start" as const },
        ease: "power2.in",
      });
      if (numEl) tl.to(numEl, { y: 0, scale: 1, duration: 0.2 }, 0);
      return tl;
    },
  },
];

export default function InteractiveProcessItem({
  step,
  index,
  isActive,
  onHoverStart,
  onHoverEnd,
}: InteractiveProcessItemProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);
  const currentTheme = ANIMATIONS[index] || ANIMATIONS[0]!;
  const activeAnimRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  // Transform perspective setup once on mount
  useEffect(() => {
    const chars = textRef.current
      ? (Array.from(textRef.current.querySelectorAll(".char")) as HTMLElement[])
      : [];
    gsap.set(chars, { transformPerspective: 600, transformOrigin: "center bottom" });
  }, []);

  // Trigger entry / exit animation on isActive change
  useEffect(() => {
    if (!textRef.current) return;
    const chars = Array.from(textRef.current.querySelectorAll(".char")) as HTMLElement[];
    if (chars.length === 0) return;
    const numEl = numRef.current;

    if (activeAnimRef.current) {
      activeAnimRef.current.kill();
      activeAnimRef.current = null;
    }
    gsap.killTweensOf(chars);
    if (numEl) gsap.killTweensOf(numEl);

    if (isActive) {
      activeAnimRef.current = currentTheme.enter(chars, numEl);
    } else {
      activeAnimRef.current = currentTheme.leave(chars, numEl);
    }

    return () => {
      if (activeAnimRef.current) {
        activeAnimRef.current.kill();
        activeAnimRef.current = null;
      }
      gsap.killTweensOf(chars);
      if (numEl) gsap.killTweensOf(numEl);
    };
  }, [isActive, currentTheme]);

  return (
    <li
      ref={itemRef}
      className={`process-item-container ${isActive ? "active-row" : ""}`}
      style={{ ["--theme-color" as string]: currentTheme.color }}
    >
      {/*
        Strict bounding-box hover trigger — only the label text fires the hover,
        NOT the full list item row.
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
          whiteSpace: "nowrap",
        }}
      >
        <span
          ref={numRef}
          className="process-item-num"
          style={{
            fontFamily: "var(--font-code)",
            fontSize: "1rem",
            color: isActive ? currentTheme.color : "var(--process-item-num-idle, rgba(255,255,255,0.3))",
            marginRight: "16px",
            transition: "color 0.3s ease",
            whiteSpace: "nowrap",
            display: "inline-block", // needed for GSAP scale/rotation
          }}
        >
          {step.num} —
        </span>

        {/* Text node split into char spans for kinetic stagger */}
        <span
          ref={textRef}
          id={`process-item-text-${index}`}
          className="process-item-text"
        >
          {step.label.split("").map((ch, i) => {
            if (ch === " ") return <React.Fragment key={i}>&nbsp;</React.Fragment>;
            return (
              <span key={i} className="char">
                {ch}
              </span>
            );
          })}
        </span>

        {/* Cartoon "!" pop indicator — visible only on active, purely CSS */}
        <span
          className="process-item-pop-badge"
          aria-hidden="true"
          style={{ color: currentTheme.color }}
        >
          !
        </span>
      </span>
    </li>
  );
}

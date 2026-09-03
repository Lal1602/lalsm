"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useThemeStore } from "@/stores";

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
  isMobile?: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClickItem?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARTOONISH CHARACTER ANIMATIONS — Awwwards-quality, personality-driven
// Each phase has a distinct "character" with anticipation → action → settle
// ─────────────────────────────────────────────────────────────────────────────
const getAnimations = (themeType: "light" | "dark") => [
  {
    // ── 01 DISCOVERY ─ "Wide-Eyed Surprise" ─────────────────────────────────
    // Character: Letters widen eyes (scaleY), gasp upward with overshoot,
    // then wobble side-to-side in excitement before settling
    color: themeType === "light" ? "#007acc" : "#00f3ff",
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
            textShadow: themeType === "light" 
              ? "0 0 20px rgba(0, 122, 204, 0.9), 0 6px 0 rgba(0, 122, 204, 0.3)" 
              : "0 0 20px rgba(0, 243, 255, 0.9), 0 6px 0 rgba(0, 243, 255, 0.3)",
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
    color: themeType === "light" ? "#d97706" : "#ffd700",
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
            textShadow: themeType === "light"
              ? `0 0 16px rgba(217, 119, 6, 0.85), 0 ${Math.abs(waveY) * 0.5}px 0 rgba(217, 119, 6, 0.2)`
              : `0 0 16px rgba(255, 215, 0, 0.85), 0 ${Math.abs(waveY) * 0.5}px 0 rgba(255, 215, 0, 0.2)`,
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
          textShadow: themeType === "light" ? "0 0 8px rgba(217, 119, 6, 0.4)" : "0 0 8px rgba(255, 215, 0, 0.4)",
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
    // ── 03 DEVELOPMENT ─ "Circuit Board Compile" ─────────────────────────────
    // Character: Like code being typed/compiled char-by-char with a glitch flicker.
    // Fast enter: chars materialize from a digital scan line (Y-scale expand from 0),
    // Then wobble/vibrate like electricity running through circuits.
    // Leave: Calm — only color/glow fades away. Text stays visible. Clean.
    color: themeType === "light" ? "#b58900" : "#bc13fe",
    enter: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      const tl = gsap.timeline({ overwrite: "auto" as const });

      // Set initial state: squashed flat (scaleY 0), translucent, slightly offset
      gsap.set(chars, {
        scaleY: 0,
        scaleX: 0.8,
        y: 6,
        opacity: 0.3,
        transformPerspective: 500,
        transformOrigin: "50% 100%",
        textShadow: "none",
        backgroundSize: "100% 0%",
        backgroundPosition: "50% 100%",
      });

      // 1. Fast compile-in: chars "scan" into existence from bottom, left-to-right
      tl.to(chars, {
        scaleY: 1.25, // overshoot tall first (like a typewriter key spring)
        scaleX: 0.9,
        y: -4,
        opacity: 1,
        duration: 0.14,
        stagger: { each: 0.03, from: "start" as const },
        ease: "power3.out",
      })
      // 2. Impact spark: neon flash as each char fully materializes
      .to(chars, {
        textShadow: themeType === "light"
          ? "0 0 30px rgba(181, 137, 0, 1), 0 0 8px rgba(0, 0, 0, 0.7)"
          : "0 0 30px rgba(188, 19, 254, 1), 0 0 8px rgba(255, 255, 255, 0.7)",
        backgroundSize: "100% 100%",
        backgroundPosition: "50% 50%",
        duration: 0.08,
        stagger: { each: 0.03, from: "start" as const },
      }, "<")
      // 3. Elastic settle back to normal height
      .to(chars, {
        scaleY: 1,
        scaleX: 1,
        y: 0,
        duration: 0.45,
        stagger: { each: 0.03, from: "start" as const },
        ease: "elastic.out(1.3, 0.4)",
      }, "<0.08")
      // 4. Electric vibration: rapid horizontal micro-shudder (like voltage through a wire)
      .to(chars, {
        x: 2,
        duration: 0.05,
        stagger: { each: 0.01, from: "center" as const, yoyo: true, repeat: 5 },
        ease: "none",
      }, "-=0.3")
      .to(chars, { x: 0, duration: 0.06, ease: "power2.out" })
      // 5. Steady glow at rest
      .to(chars, {
        textShadow: themeType === "light" ? "0 0 10px rgba(181, 137, 0, 0.55)" : "0 0 10px rgba(188, 19, 254, 0.55)",
        duration: 0.25,
        ease: "power1.out",
      }, "<");

      if (numEl) {
        gsap.set(numEl, { skewX: -20, scale: 0.8, opacity: 0 });
        tl.to(numEl, {
          skewX: 0, scale: 1.1, opacity: 1,
          duration: 0.18, ease: "back.out(2.5)",
        }, 0.05)
        .to(numEl, { scale: 1, duration: 0.3, ease: "elastic.out(1.2, 0.45)" });
      }
      return tl;
    },
    leave: (chars: HTMLElement[], numEl: HTMLElement | null) => {
      // Exactly like Discovery/Design: only fade glow/color. Text stays visible.
      const tl = gsap.timeline({ overwrite: "auto" as const });
      tl.to(chars, {
        scaleY: 1,
        scaleX: 1,
        y: 0,
        x: 0,
        opacity: 1,
        textShadow: "none",
        backgroundSize: "100% 0%",
        backgroundPosition: "50% 100%",
        duration: 0.3,
        stagger: { each: 0.02, from: "end" as const },
        ease: "power2.in",
      });
      if (numEl) tl.to(numEl, { scale: 1, skewX: 0, opacity: 1, duration: 0.2, ease: "power2.out" }, 0);
      return tl;
    },
  },


  {
    // ── 04 DEPLOYMENT ─ "Rocket Launch" ─────────────────────────────────────
    // Character: Anticipation squash (crouch), rocket launch up with trail,
    // then slam back down with cartoon impact bounce
    color: themeType === "light" ? "#c2410c" : "#ff5000",
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
            textShadow: themeType === "light"
              ? "0 0 24px rgba(194, 65, 12, 1), 0 8px 0 rgba(194, 65, 12, 0.4)"
              : "0 0 24px rgba(255, 80, 0, 1), 0 8px 0 rgba(255, 180, 0, 0.4)",
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
            textShadow: themeType === "light" ? "0 0 8px rgba(194, 65, 12, 0.5)" : "0 0 8px rgba(255, 80, 0, 0.5)",
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
  isMobile = false,
  onHoverStart,
  onHoverEnd,
  onClickItem,
}: InteractiveProcessItemProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);
  const themeType = useThemeStore((state) => state.theme.type);
  const currentTheme = React.useMemo(() => getAnimations(themeType)[index] || getAnimations(themeType)[0]!, [themeType, index]);
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
        data-process-index={index}
        onMouseEnter={!isMobile ? onHoverStart : undefined}
        onMouseLeave={!isMobile ? onHoverEnd : undefined}
        onPointerEnter={!isMobile ? onHoverStart : undefined}
        onClick={isMobile ? onClickItem : undefined}
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          position: "relative",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: "6px",
          userSelect: "none",
          whiteSpace: "nowrap",
          WebkitTapHighlightColor: "transparent",
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

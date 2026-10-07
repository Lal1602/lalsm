"use client";
import * as m from "motion/react-m";
import { useMotionValue, useSpring } from "motion/react";
import type { ReactNode } from "react";
import { useCalm, useHydrated } from "@/components/ui/hiw/hooks";
import CvDownload from "@/components/ui/CvDownload";

/** The glyph shared by both buttons: an arrow that leans into the click. */
function Arrow() {
  return (
    <svg className="hx-btn-arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

/**
 * The label is written twice, one above the other, inside a window one line tall: on hover the
 * pair slides up so a fresh copy takes the old one's place. The copy is hidden from assistive
 * tech, so the link is still read once.
 */
function Label({ children }: { children: string }) {
  return (
    <span className="hx-btn-window">
      <span className="hx-btn-roll">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

const PULL = 0.22;
const MAX = 8;
const clamp = (n: number) => Math.max(-MAX, Math.min(MAX, n));
const FOLLOW = { stiffness: 220, damping: 18, mass: 0.6 };
const PRESS = { type: "spring", stiffness: 420, damping: 26 } as const;

/**
 * A button that leans toward the pointer (up to 8px, sprung) and gives a little under a press. The
 * label roll and the arrow are CSS and work everywhere; the lean needs a mouse and a device that has
 * the headroom for it, and writes its offset only after hydration so the server's markup is plain.
 */
function Button({
  href,
  tone,
  cursorText,
  children,
}: {
  href: string;
  tone: "primary" | "ghost";
  cursorText?: string;
  children: ReactNode;
}) {
  const { rich } = useCalm();
  const hydrated = useHydrated();
  const live = rich && hydrated;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, FOLLOW);
  const sy = useSpring(y, FOLLOW);

  return (
    <m.a
      className={`hx-btn hx-btn-${tone}`}
      href={href}
      data-cursor-text={cursorText}
      inherit={false}
      style={live ? { x: sx, y: sy } : undefined}
      whileTap={live ? { scale: 0.97 } : undefined}
      transition={PRESS}
      onPointerMove={(e) => {
        if (!live || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(clamp((e.clientX - (r.left + r.width / 2)) * PULL));
        y.set(clamp((e.clientY - (r.top + r.height / 2)) * PULL));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </m.a>
  );
}

export default function Actions() {
  return (
    <div className="hx-actions">
      <Button href="#projects" tone="primary" cursorText="OPEN">
        <Label>See my works</Label>
        <Arrow />
      </Button>
      <CvDownload variant="hero" source="hero" label="Download CV" />
      <Button href="#contact" tone="ghost">
        <Label>Contact me</Label>
        <Arrow />
      </Button>
    </div>
  );
}

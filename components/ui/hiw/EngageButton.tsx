"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import * as m from "motion/react-m";
import { animate, useMotionValue, type AnimationPlaybackControls } from "motion/react";
import { mulberry32 } from "@/lib/seededRandom";

const HOLD_SECONDS = 0.8;

/**
 * Hold to engage a stage. A ring fills while the button is held and rewinds if it
 * is let go early; completing it commits the stage and throws a burst of sparks
 * from the button. It works with a mouse, a finger, and the keyboard (hold Space or
 * Enter), and a screen reader's plain "activate" commits at once.
 *
 * With reduced motion (or Lite) there is no hold: one press commits, nothing flies.
 */
export default function EngageButton({
  engaged,
  calm,
  particles,
  label,
  onEngage,
}: {
  engaged: boolean;
  calm: boolean;
  /** 0..1 scales the number of sparks (the quality governor's particle budget). */
  particles: number;
  /** For assistive technology, e.g. "Build". */
  label: string;
  onEngage: () => void;
}) {
  const progress = useMotionValue(engaged ? 1 : 0);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const holding = useRef(false);
  const [burst, setBurst] = useState(0);

  // A new visit starts with every stage disengaged: put the ring back.
  useEffect(() => {
    if (!engaged) {
      controls.current?.stop();
      progress.set(0);
    }
  }, [engaged, progress]);

  useEffect(() => () => controls.current?.stop(), []);

  const commit = () => {
    holding.current = false;
    progress.set(1);
    setBurst((n) => n + 1);
    onEngage();
  };

  const start = () => {
    if (engaged || holding.current) return;
    if (calm) {
      commit();
      return;
    }
    holding.current = true;
    controls.current?.stop();
    controls.current = animate(progress, 1, { duration: HOLD_SECONDS * (1 - progress.get()), ease: "linear", onComplete: commit });
  };

  const cancel = () => {
    if (!holding.current) return;
    holding.current = false;
    controls.current?.stop();
    controls.current = animate(progress, 0, { duration: 0.28, ease: "easeOut" });
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault(); // no synthesised click: the hold decides
    if (!e.repeat) start();
  };

  const onKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    // A button turns the release of Space into a click. That click is not "activate", it is
    // the end of a hold, so it is swallowed here as well as on keydown.
    e.preventDefault();
    cancel();
  };

  // A click that no pointer or key produced is assistive technology saying "activate".
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0 && !engaged) commit();
  };

  const sparks = useMemo(() => {
    const rand = mulberry32(burst * 7919 + 13);
    const n = Math.max(5, Math.round(16 * particles));
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rand() * 0.5;
      const d = 34 + rand() * 54;
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.8, size: 2 + rand() * 2.4, dur: 0.55 + rand() * 0.5, warm: rand() > 0.6 };
    });
  }, [burst, particles]);

  return (
    <button
      type="button"
      className="fd-engage"
      data-engaged={engaged || undefined}
      aria-pressed={engaged}
      aria-label={engaged ? `${label} engaged` : `Engage ${label}. Hold to confirm.`}
      onPointerDown={onPointerDown}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onClick={onClick}
    >
      <svg className="fd-engage-ring" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle className="fd-engage-track" cx="16" cy="16" r="12.5" />
        <m.circle className="fd-engage-fill" cx="16" cy="16" r="12.5" style={{ pathLength: progress }} />
        <path className="fd-engage-tick" d="M10.5 16.4 14.2 20 21.5 12" />
      </svg>
      <span className="fd-engage-text">
        <b>{engaged ? "Engaged" : calm ? "Engage" : "Hold to engage"}</b>
        <i>{engaged ? "stage locked in" : calm ? "press to confirm" : "press and hold"}</i>
      </span>

      {burst > 0 && !calm && (
        <span className="fd-burst" key={burst} aria-hidden="true">
          <m.i
            className="fd-burst-ring"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          />
          {sparks.map((s, i) => (
            <m.i
              key={i}
              className={s.warm ? "fd-spark is-warm" : "fd-spark"}
              style={{ width: s.size, height: s.size }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: s.dx, y: s.dy, opacity: 0, scale: 0.25 }}
              transition={{ duration: s.dur, ease: [0.15, 0.85, 0.25, 1] }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

"use client";
import * as m from "motion/react-m";
import { useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import { MAP_W, pointAt } from "@/lib/flight/path";

/**
 * The craft that flies the trajectory. Its position is computed from one motion
 * value (the progress along the route) and the map's width, and written as a
 * transform, so a frame of flight is one style write and no React render.
 *
 * The engine flare is the ship's own speed: the faster the progress is changing,
 * the longer and hotter it burns, so it flares when you throw the ship at a station
 * and dims to a pilot light when it is parked.
 */
export default function Ship({
  progress,
  mapWidth,
  calm,
  dragging,
}: {
  progress: MotionValue<number>;
  mapWidth: MotionValue<number>;
  calm: boolean;
  dragging: boolean;
}) {
  // pointAt is a binary search over a table: cheap enough to call per property per frame.
  const x = useTransform([progress, mapWidth], ([u, w]: number[]) => (pointAt(u!).x / MAP_W) * w!);
  // The map is a fixed 5:1 box, so its height is a fifth of its width.
  const y = useTransform([progress, mapWidth], ([u, w]: number[]) => (pointAt(u!).y / MAP_W) * w!);
  // Rounded: the server writes this transform with a trimmed number and the client with the full
  // float, which React reports as a hydration mismatch.
  const rotate = useTransform(progress, (u) => Math.round(((pointAt(u).angle * 180) / Math.PI) * 100) / 100);

  const speed = useVelocity(progress);
  const burn = useSpring(useTransform(speed, (v) => Math.min(1, Math.abs(v) * 2.4)), { stiffness: 140, damping: 22 });
  const flareX = useTransform(burn, (b) => 0.3 + b * 1.1);
  const flareO = useTransform(burn, (b) => 0.35 + b * 0.65);

  return (
    <m.i className="fd-ship" inherit={false} style={{ x, y, rotate }} data-dragging={dragging || undefined} aria-hidden="true">
      <m.i className="fd-flare" inherit={false} style={calm ? undefined : { scaleX: flareX, opacity: flareO }} />
      <svg className="fd-craft" viewBox="0 0 30 18" fill="none" focusable="false">
        {/* A narrow delta: nose, two swept wings, a notch at the tail. */}
        <path d="M29 9 L7 1.2 L11.5 9 L7 16.8 Z" className="fd-craft-body" />
        <path d="M29 9 L11.5 9" className="fd-craft-spine" />
        <circle cx="14.5" cy="9" r="1.15" className="fd-craft-lamp" />
      </svg>
    </m.i>
  );
}

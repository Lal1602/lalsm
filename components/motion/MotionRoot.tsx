"use client";

import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Loads Framer Motion's feature bundle (drag, layout, gestures) on demand, so the
 * rest of the site never pays for it. Anything animated with the `m` components
 * from "motion/react-m" must sit inside this provider; `strict` makes a stray
 * full `motion.*` component an error instead of silently bundling everything.
 */
const loadFeatures = () => import("./features").then((mod) => mod.default);

export default function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}

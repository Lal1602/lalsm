"use client";
import SeamCanvas from "./SeamCanvas";

interface AccretionHorizonSeamProps {
  /**
   * "upper": renders inside HorizonShowcase (Creative Playground), anchored at its bottom edge.
   * "lower": renders inside ProjectsSection, anchored at its top edge.
   * The amber-to-cyan accretion flow is one shared, animated field seen through
   * both halves.
   */
  part?: "upper" | "lower";
  className?: string;
}

// Matches .accretion-horizon-seam-upper (320px, ending exactly on the boundary) and -lower (320px; a multiple of the seam grid, lib/seamGrid, so the canvas is a whole number of device pixels tall at every scale factor).
const HEIGHT = { upper: 320, lower: 320 } as const;

export default function AccretionHorizonSeam({ part = "upper", className = "" }: AccretionHorizonSeamProps) {
  return (
    <SeamCanvas
      kind="accretion"
      part={part}
      height={HEIGHT[part]}
      containerClass={`accretion-horizon-seam-container accretion-horizon-seam-${part} ${className}`}
      canvasClass="accretion-horizon-seam-canvas"
    />
  );
}

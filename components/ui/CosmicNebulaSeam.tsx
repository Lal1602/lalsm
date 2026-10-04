"use client";
import SeamCanvas from "./SeamCanvas";

interface CosmicNebulaSeamProps {
  /**
   * "upper": renders inside ProcessSteps (How I Work), anchored at its bottom edge.
   * "lower": renders inside HorizonShowcase (Creative Playground), anchored at its top edge.
   * Both halves sample one shared, animated world-space nebula, so they meet at
   * the section boundary by construction.
   */
  part?: "upper" | "lower";
  className?: string;
}

// Matches .cosmic-nebula-seam-upper (320px, ending exactly on the boundary) and -lower (320px).
const HEIGHT = { upper: 320, lower: 320 } as const;

export default function CosmicNebulaSeam({ part = "upper", className = "" }: CosmicNebulaSeamProps) {
  return (
    <SeamCanvas
      kind="nebula"
      part={part}
      height={HEIGHT[part]}
      containerClass={`cosmic-nebula-seam-container cosmic-nebula-seam-${part} ${className}`}
      canvasClass="cosmic-nebula-seam-canvas"
    />
  );
}

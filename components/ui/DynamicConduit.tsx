"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useThemeStore } from "@/stores";

interface DynamicConduitProps {
  activeIndex: number;
}

export default function DynamicConduit({ activeIndex }: DynamicConduitProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Coordinates mapped relative to the overlay conduit viewport
  const [coords, setCoords] = useState<{ 
    x1: number; 
    y1: number; 
    x1_left: number; 
    x2: number; 
    y2: number; 
    midX: number; 
    midY: number; 
  } | null>(null);

  // Curated theme colors for each step (architectural accent tones)
  const themeType = useThemeStore((state) => state.theme.type);
  const themeColors = themeType === "light" 
    ? ["#007acc", "#d97706", "#b58900", "#c2410c"]
    : ["#00f3ff", "#ffd700", "#bc13fe", "#ff5000"];

  const activeColor = themeColors[activeIndex] || themeColors[0];

  useEffect(() => {
    function updateCoordinates() {
      const svg = svgRef.current;
      const textEl = document.getElementById(`process-item-text-${activeIndex}`);
      const cardEl = document.getElementById("interactive-info-card");

      if (!svg || !textEl || !cardEl) {
        setCoords(null);
        return;
      }

      const rectSvg = svg.getBoundingClientRect();
      const rectText = textEl.getBoundingClientRect();
      const rectCard = cardEl.getBoundingClientRect();

      // Math coordinates relative to the expanded overlay SVG viewport canvas
      const x1 = rectText.right - rectSvg.left;
      const y1 = rectText.top + rectText.height / 2 - rectSvg.top;

      const x2 = rectCard.left - rectSvg.left;
      
      // Dynamic vertical docking point: aligns with y1 but clamped within the card's vertical boundaries
      const cardTopSvg = rectCard.top - rectSvg.top;
      const cardHeight = rectCard.height;
      const y2 = Math.max(cardTopSvg + 40, Math.min(cardTopSvg + cardHeight - 40, y1));

      // Midpoints for s-curve coordinate calculation
      const midX = x1 + (x2 - x1) * 0.45;
      const midY = y1 + (y2 - y1) * 0.5;

      // The exact horizontal coordinate representing the left side of the process item text
      const x1_left = rectText.left - rectSvg.left;

      setCoords({ x1, y1, x1_left, x2, y2, midX, midY });
    }

    updateCoordinates();
    
    // Safety delay to ensure layout rendering has settled
    const timeoutId = setTimeout(updateCoordinates, 150);

    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates);
    };
  }, [activeIndex]);

  // GSAP path drawing animation on coordinates change
  useEffect(() => {
    if (!coords) return;

    const svg = svgRef.current;
    if (svg) {
      const paths = svg.querySelectorAll(".pipeline-path");
      paths.forEach((p, idx) => {
        const path = p as SVGPathElement;
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          { 
            strokeDashoffset: 0, 
            duration: 0.6 + idx * 0.1, 
            ease: "power2.out" 
          }
        );
      });
    }
  }, [coords, activeIndex]);

  if (!coords) return (
    <div style={{ position: "absolute", top: -300, left: -300, right: -300, bottom: -300, pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
      <svg ref={svgRef} className="svg-connector-canvas" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }} />
    </div>
  );

  // Generate a clean, elegant, high-precision bezier path
  const pathD = `M ${coords.x1} ${coords.y1} C ${coords.midX} ${coords.y1}, ${coords.midX} ${coords.y2}, ${coords.x2} ${coords.y2}`;

  // Two architectural helper offset lines (faint lines mimicking precision layout grids)
  const offsetPath1 = `M ${coords.x1} ${coords.y1 - 3} C ${coords.midX} ${coords.y1 - 3}, ${coords.midX} ${coords.y2 - 3}, ${coords.x2} ${coords.y2 - 3}`;
  const offsetPath2 = `M ${coords.x1} ${coords.y1 + 3} C ${coords.midX} ${coords.y1 + 3}, ${coords.midX} ${coords.y2 + 3}, ${coords.x2} ${coords.y2 + 3}`;

  return (
    <div style={{ position: "absolute", top: -300, left: -300, right: -300, bottom: -300, pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
      {/* High-precision clean SVG vector pathways */}
      <svg ref={svgRef} className="svg-connector-canvas" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
        <defs>
          <filter id="svgPipelineGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint grid helper line 1 */}
        <path
          d={offsetPath1}
          fill="none"
          stroke={themeType === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.04)"}
          strokeWidth="0.8"
        />

        {/* Faint grid helper line 2 */}
        <path
          d={offsetPath2}
          fill="none"
          stroke={themeType === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.04)"}
          strokeWidth="0.8"
        />

        {/* Main sharp technical connection path */}
        <path
          className="pipeline-path"
          d={pathD}
          fill="none"
          stroke={activeColor}
          strokeWidth="1.2"
          filter="url(#svgPipelineGlow)"
          style={{
            "--line-color": activeColor,
            transition: "stroke 0.4s ease"
          } as React.CSSProperties}
        />

        {/* Single high-precision technical signal pulse traveling along the pathway */}
        <circle r="2.2" fill={themeType === "light" ? "#1a1a2e" : "#ffffff"} filter="url(#svgPipelineGlow)">
          <animateMotion path={pathD} dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

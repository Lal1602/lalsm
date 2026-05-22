"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface DynamicConduitProps {
  activeIndex: number;
}

export default function DynamicConduit({ activeIndex }: DynamicConduitProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const branchRef = useRef<SVGPathElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Coordinates mapped relative to the overlay conduit viewport
  const [coords, setCoords] = useState<{ 
    x1: number; 
    y1: number; 
    x1_left: number; 
    x2: number; 
    y2: number; 
    midX: number; 
    midY: number; 
    globeX: number; 
    globeY: number; 
  } | null>(null);

  const coordsRef = useRef<any>(null);

  // Curated theme colors for each step
  const themeColors = [
    "#00f3ff", // Discovery (Cyan)
    "#ffd700", // Design (Gold)
    "#bc13fe", // Development (Purple)
    "#ff5000", // Deployment (Orange)
  ];

  const activeColor = themeColors[activeIndex] || themeColors[0];

  useEffect(() => {
    function updateCoordinates() {
      const svg = svgRef.current;
      const textEl = document.getElementById(`process-item-text-${activeIndex}`);
      const cardEl = document.getElementById("interactive-info-card");

      if (!svg || !textEl || !cardEl) {
        setCoords(null);
        coordsRef.current = null;
        return;
      }

      const rectSvg = svg.getBoundingClientRect();
      const rectText = textEl.getBoundingClientRect();
      const rectCard = cardEl.getBoundingClientRect();

      // Math coordinates relative to the full overlay SVG viewport canvas
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

      // Approximate bottom center of viewport where Three globe floats
      const globeX = rectSvg.width * 0.55;
      const globeY = rectSvg.height - 30;

      // The exact horizontal coordinate representing the left side of the process item text
      const x1_left = rectText.left - rectSvg.left;

      const newCoords = { x1, y1, x1_left, x2, y2, midX, midY, globeX, globeY };
      setCoords(newCoords);
      coordsRef.current = newCoords;
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
      const fibers = svg.querySelectorAll(".bundle-fiber");
      fibers.forEach((fiber, idx) => {
        const path = fiber as SVGPathElement;
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          { 
            strokeDashoffset: 0, 
            duration: 0.75 + idx * 0.08, 
            delay: idx * 0.04, 
            ease: "power2.out" 
          }
        );
      });

      const branch = branchRef.current;
      if (branch) {
        const branchLength = branch.getTotalLength();
        gsap.fromTo(
          branch,
          { strokeDasharray: branchLength, strokeDashoffset: branchLength },
          { strokeDashoffset: 0, duration: 0.85, delay: 0.15, ease: "power2.out" }
        );
      }
    }
  }, [coords, activeIndex]);

  // High-performance canvas animation loop for flowing organic ribbon-waves and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Create a pool of particles to flow elegantly from the active row through the network bundle
    const particleCount = 100;
    const particles: Array<{
      t: number;
      speed: number;
      size: number;
      yOffset: number;
      waveFreq: number;
      waveAmp: number;
      opacity: number;
      colorType: "primary" | "secondary";
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        t: Math.random(), // Randomize starting progress
        speed: 0.0025 + Math.random() * 0.005,
        size: 0.6 + Math.random() * 2.2,
        yOffset: (Math.random() - 0.5) * 15,
        waveFreq: 2.0 + Math.random() * 3.5,
        waveAmp: 6 + Math.random() * 12,
        opacity: 0.35 + Math.random() * 0.65,
        colorType: Math.random() > 0.35 ? "primary" : "secondary",
      });
    }

    // Create ambient dust particles drifting horizontally around active text
    const dustCount = 70;
    const dust: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      colorType: "primary" | "secondary";
    }> = [];

    for (let i = 0; i < dustCount; i++) {
      dust.push({
        x: Math.random() * 500 - 150, // relative to x1_left
        y: (Math.random() - 0.5) * 75, // relative to y1
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 0.4 + Math.random() * 2.0,
        opacity: 0.15 + Math.random() * 0.8,
        colorType: Math.random() > 0.4 ? "primary" : "secondary",
      });
    }

    const secondaryColors = [
      "#bc13fe", // Discovery secondary (Purple)
      "#ff5000", // Design secondary (Orange)
      "#00f3ff", // Development secondary (Cyan)
      "#ffd700", // Deployment secondary (Gold)
    ];

    const secColor = secondaryColors[activeIndex] || secondaryColors[0];

    const themeRgb = [
      "0, 243, 255",  // Discovery (Cyan)
      "255, 215, 0",  // Design (Gold)
      "188, 19, 254", // Development (Purple)
      "255, 80, 0",   // Deployment (Orange)
    ];

    const activeRgb = themeRgb[activeIndex] || themeRgb[0];

    const handleCanvasResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleCanvasResize();
    window.addEventListener("resize", handleCanvasResize);

    const animate = () => {
      time += 0.024;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const c = coordsRef.current;
      if (!c) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // 1. Draw a massive glowing volumetric aura behind the active text row to match mockup
      const auraGrad = ctx.createRadialGradient(
        c.x1_left + 150, c.y1,
        10,
        c.x1_left + 150, c.y1,
        280
      );
      auraGrad.addColorStop(0, `rgba(${activeRgb}, 0.28)`);
      auraGrad.addColorStop(0.5, `rgba(${activeRgb}, 0.08)`);
      auraGrad.addColorStop(1, "rgba(0,0,0,0)");
      
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(c.x1_left + 150, c.y1, 280, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw organic glowing background plasma ribbons (with white core filaments)
      const ribbons = [
        { yOffset: -2, thickness: 2.2, amp: 8, freq: 3.8, speed: 0.7, op: 0.35 },
        { yOffset: 0, thickness: 3.2, amp: 14, freq: 2.4, speed: 0.5, op: 0.45 },
        { yOffset: 2, thickness: 1.8, amp: 10, freq: 4.6, speed: 1.0, op: 0.3 },
        { yOffset: -5, thickness: 2.0, amp: 18, freq: 1.9, speed: 0.3, op: 0.25 },
        { yOffset: 5, thickness: 2.5, amp: 12, freq: 3.1, speed: 0.6, op: 0.4 },
      ];

      ribbons.forEach((rib, idx) => {
        ctx.beginPath();
        const segments = 100;
        const points: Array<{x: number, y: number}> = [];
        
        // Draw bezier path starting before active text, flowing through it, and ending at the card
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          
          const midX = c.x1_left + (c.x2 - c.x1_left) * 0.45;
          const cx1 = midX;
          const cy1 = c.y1;
          const cx2 = midX;
          const cy2 = c.y2;
          
          const mt = 1 - t;
          const x = mt*mt*mt*(c.x1_left - 80) + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*c.x2;
          const y = mt*mt*mt*c.y1 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*c.y2;
          
          // Fluid organic double-sine wave undulation for fire filament look
          const sine1 = Math.sin(t * rib.freq + time * rib.speed + idx);
          const sine2 = Math.sin(t * rib.freq * 2.6 - time * rib.speed * 1.6) * 0.35;
          const undulation = (sine1 + sine2) * rib.amp * Math.sin(t * Math.PI);
          const finalY = y + undulation + rib.yOffset;
          
          points.push({ x, y: finalY });
          
          if (i === 0) {
            ctx.moveTo(x, finalY);
          } else {
            ctx.lineTo(x, finalY);
          }
        }

        // Colored glowing envelope
        const grad = ctx.createLinearGradient(c.x1_left - 80, c.y1, c.x2, c.y2);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(0.12, `rgba(${activeRgb}, ${rib.op})`);
        grad.addColorStop(0.5, `rgba(${activeRgb}, ${rib.op * 1.4})`);
        grad.addColorStop(0.88, `rgba(${activeRgb}, ${rib.op})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = rib.thickness;
        ctx.shadowColor = `rgb(${activeRgb})`;
        ctx.shadowBlur = 18;
        ctx.stroke();

        // White core laser line
        ctx.shadowBlur = 0;
        ctx.beginPath();
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = `rgba(255, 255, 255, ${rib.op * 1.6})`;
        ctx.lineWidth = Math.max(0.6, rib.thickness * 0.32);
        ctx.stroke();
      });

      // 3. Draw volumetric drifting ambient dust particles around active text row
      dust.forEach((d) => {
        // Drift organically
        d.x += d.vx;
        d.y += d.vy;

        d.vx += (Math.random() - 0.5) * 0.04;
        d.vy += (Math.random() - 0.5) * 0.04;
        
        d.vx = Math.max(-0.5, Math.min(0.5, d.vx));
        d.vy = Math.max(-0.5, Math.min(0.5, d.vy));

        // Reset when exiting boundaries
        if (Math.abs(d.x - 150) > 300 || Math.abs(d.y) > 55) {
          d.x = Math.random() * 450 - 150;
          d.y = (Math.random() - 0.5) * 75;
          d.vx = (Math.random() - 0.5) * 0.3;
          d.vy = (Math.random() - 0.5) * 0.3;
        }

        const absX = c.x1_left + d.x;
        const absY = c.y1 + d.y;

        ctx.beginPath();
        ctx.arc(absX, absY, d.size, 0, Math.PI * 2);
        ctx.fillStyle = d.colorType === "primary" ? activeColor : secColor;
        ctx.globalAlpha = d.opacity * (1 - Math.abs(d.x - 150) / 300); // fade out at bounds
        ctx.fill();
      });

      // 4. Draw flowing sparks/particles along the network paths
      particles.forEach((p) => {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.speed = 0.0025 + Math.random() * 0.005;
          p.yOffset = (Math.random() - 0.5) * 15;
        }

        const midX = c.x1_left + (c.x2 - c.x1_left) * 0.45;
        const cx1 = midX;
        const cy1 = c.y1;
        const cx2 = midX;
        const cy2 = c.y2;
        
        const t = p.t;
        const mt = 1 - t;
        const x = mt*mt*mt*(c.x1_left - 80) + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*c.x2;
        const y = mt*mt*mt*c.y1 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*c.y2;
        
        const undulation = Math.sin(t * p.waveFreq + time) * p.waveAmp * Math.sin(t * Math.PI);
        const finalY = y + undulation + p.yOffset;

        ctx.beginPath();
        ctx.arc(x, finalY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.colorType === "primary" ? activeColor : secColor;
        ctx.globalAlpha = p.opacity * Math.sin(t * Math.PI);
        ctx.fill();

        // High intensity micro-glow on larger particles
        if (p.size > 1.6) {
          ctx.beginPath();
          ctx.arc(x, finalY, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = p.colorType === "primary" ? activeColor : secColor;
          ctx.globalAlpha = p.opacity * 0.18 * Math.sin(t * Math.PI);
          ctx.fill();
        }
      });

      ctx.restore();
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleCanvasResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [coords, activeIndex, activeColor]);

  if (!coords) return (
    <div style={{ position: "absolute", top: -300, left: -300, right: -300, bottom: -300, pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
      <svg ref={svgRef} className="svg-connector-canvas" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }} />
    </div>
  );

  // Generate a multi-strand bundle of 4 optical fibers (bezier curves with slight spacing/crossover offsets)
  const fiberStrands = Array.from({ length: 4 }).map((_, i) => {
    const offsetY1 = (i - 1.5) * 5;
    const offsetY2 = (i - 1.5) * 4;
    const midXOffset = (i - 1.5) * 10;
    const midYOffset = (i - 1.5) * 6;

    const pathD = `M ${coords.x1} ${coords.y1 + offsetY1} 
                   C ${coords.midX + midXOffset} ${coords.y1 + offsetY1 + midYOffset}, 
                     ${coords.midX - midXOffset} ${coords.y2 + offsetY2 - midYOffset}, 
                     ${coords.x2} ${coords.y2 + offsetY2}`;
    return { pathD, id: i };
  });

  // Wavy branch connecting downward to globe
  const branchPathD = `M ${coords.midX} ${coords.midY} C ${coords.midX} ${coords.midY + 110}, ${coords.midX - 120} ${coords.globeY - 110}, ${coords.globeX} ${coords.globeY}`;

  return (
    <div style={{ position: "absolute", top: -300, left: -300, right: -300, bottom: -300, pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
      {/* 60fps flowing wave-ribbon and volumetric particle canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
      
      {/* Vector connections and glowing sparks */}
      <svg ref={svgRef} className="svg-connector-canvas" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
        <defs>
          {/* Extreme glowing drop shadow styling filters */}
          <filter id="svgConnectorGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Fading branch line gradient */}
          <linearGradient id="branchGrad" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={activeColor} stopOpacity="0.8" />
            <stop offset="55%" stopColor={activeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Broad background duplicate aura */}
        {fiberStrands.map((strand) => (
          <path
            key={`aura-${strand.id}`}
            d={strand.pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth="6"
            opacity="0.1"
            style={{ filter: "blur(5px)" }}
          />
        ))}

        {/* Downward Globe Branch Path */}
        <path
          ref={branchRef}
          className="connector-line-glowing"
          d={branchPathD}
          fill="none"
          stroke="url(#branchGrad)"
          strokeWidth="1.5"
          style={{
            ["--line-color" as any]: activeColor
          }}
        />

        {/* Wavy bundle of glowing optical fibers */}
        {fiberStrands.map((strand) => (
          <path
            key={`fiber-${strand.id}`}
            className="connector-line-glowing bundle-fiber"
            d={strand.pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth="1.8"
            filter="url(#svgConnectorGlow)"
            style={{
              ["--line-color" as any]: activeColor
            }}
          />
        ))}

        {/* Double glowing energy sparks traveling along strands */}
        <circle r="3.5" fill="#ffffff" filter="url(#svgConnectorGlow)">
          <animateMotion path={fiberStrands[1].pathD} dur="1.7s" repeatCount="indefinite" />
        </circle>
        <circle r="3.5" fill="#ffffff" filter="url(#svgConnectorGlow)">
          <animateMotion path={fiberStrands[2].pathD} dur="2.1s" begin="0.4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

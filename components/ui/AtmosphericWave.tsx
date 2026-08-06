"use client";
import React, { useEffect, useRef } from "react";

export default function AtmosphericWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Clean Viewport Isolation: completely bypass canvas calculations on mobile
    if (window.innerWidth < 1024) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse coordinates tracking relative to card center
    let mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
    };
    
    const card = canvas.closest(".about-spatial-card");
    if (card) {
      card.addEventListener("mousemove", handleMouseMove as EventListener);
    }

    // Grid mesh coordinates
    const particles: Array<{ x: number; y: number; bx: number; by: number; size: number }> = [];
    const cols = 22;
    const rows = 14;
    const gapX = width / cols;
    const gapY = height / rows;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        particles.push({
          x: c * gapX + gapX / 2,
          y: r * gapY + gapY / 2,
          bx: c * gapX + gapX / 2,
          by: r * gapY + gapY / 2,
          size: Math.random() * 1.0 + 0.4,
        });
      }
    }

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking spring
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // Draw volumetric rippling mesh grid
      particles.forEach((p) => {
        const dx = p.bx - mouse.x;
        const dy = p.by - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Ripple force falls off based on cursor distance
        const force = Math.max(0, (240 - dist) / 240);
        const angle = Math.atan2(dy, dx);
        const ripple = Math.sin(dist * 0.04 - time * 2.5) * 12 * force;

        const x = p.bx + Math.cos(angle) * ripple;
        const y = p.by + Math.sin(angle) * ripple;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${0.08 + force * 0.42})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (card) {
        card.removeEventListener("mousemove", handleMouseMove as EventListener);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.75,
      }}
    />
  );
}

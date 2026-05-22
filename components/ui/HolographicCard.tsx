"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import InfinityNodeDiagram from "./InfinityNodeDiagram";

interface Step {
  num: string;
  label: string;
  icon: string;
  title: string;
  desc: string;
}

interface HolographicCardProps {
  activeStep: Step;
  activeIndex: number;
}

export default function HolographicCard({ activeStep, activeIndex }: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Curated theme styles for each of the 4 steps
  const themes = [
    { rgb: "0, 243, 255", hex: "#00f3ff", eyebrow: "PHASE 01 // DISCOVERY & STRATEGY" }, // Discovery
    { rgb: "255, 215, 0", hex: "#ffd700", eyebrow: "PHASE 02 // INTERACTION & DESIGN" }, // Design
    { rgb: "188, 19, 254", hex: "#bc13fe", eyebrow: "PHASE 03 // ARCHITECTURE & CODE" }, // Development
    { rgb: "255, 80, 0", hex: "#ff5000", eyebrow: "PHASE 04 // LAUNCH & MONITOR" },    // Deployment
  ];

  const currentTheme = themes[activeIndex] || themes[0];

  // GSAP Spring entrance timelines for card content
  useEffect(() => {
    const tl = gsap.timeline();
    
    // Card slide-up & elastic bounce
    tl.fromTo(
      cardRef.current,
      { y: 15, scale: 0.98, opacity: 0.9 },
      { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.25)" }
    );

    // Staggered text reveal
    tl.fromTo(
      [iconRef.current, titleRef.current, descRef.current],
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" },
      "-=0.3"
    );
  }, [activeIndex]);

  // Holographic Floating Particle Effect (Slow-moving volumetric orange & cyan dots)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      color: string;
      alpha: number;
      fadeSpeed: number;
      angle: number;
      swingSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = -(Math.random() * 0.45 + 0.15);
        // Soft glowing volumetric cyan (#00f3ff) & deep orange (#ff5000)
        this.color = Math.random() > 0.52 ? "#00f3ff" : "#ff5000";
        this.alpha = Math.random() * 0.4 + 0.08;
        this.fadeSpeed = Math.random() * 0.0035 + 0.0008;
        this.angle = Math.random() * Math.PI * 2;
        this.swingSpeed = Math.random() * 0.015 - 0.0075;
      }

      update() {
        this.y += this.speedY;
        this.angle += this.swingSpeed;
        this.x += Math.sin(this.angle) * 0.18;
        this.alpha += this.fadeSpeed;
        
        if (this.alpha > 0.65) {
          this.fadeSpeed = -Math.abs(this.fadeSpeed);
        }
        
        if (this.y < 0 || this.alpha <= 0) {
          this.x = Math.random() * width;
          this.y = height + 10;
          this.alpha = 0.05;
          this.fadeSpeed = Math.abs(this.fadeSpeed);
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.shadowBlur = 6;
        c.shadowColor = this.color;
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 28; i++) {
      particles.push(new Particle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeIndex]);

  return (
    <div 
      ref={cardRef}
      className={`interactive-info-card accent-${activeIndex}`}
      id="interactive-info-card"
      style={{
        ["--card-theme-color" as any]: currentTheme.hex,
        ["--glow-color-rgb" as any]: currentTheme.rgb
      }}
    >
      {/* Volumetric Holographic Canvas */}
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
          borderRadius: "inherit",
          opacity: 0.55
        }} 
      />

      {/* Ambient background light glow */}
      <div className="card-ambient-glow" />

      {/* Relative container ensuring text sits above background particle canvas */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Card Header */}
        <div className="card-header-area">
          <span className="card-eyebrow-tech">{currentTheme.eyebrow}</span>
          <div ref={iconRef} className="card-icon-container">
            {/* @ts-ignore */}
            <ion-icon name={activeStep.icon}></ion-icon>
          </div>
        </div>

        {/* Card Typography */}
        <h2 ref={titleRef} className="card-main-title">{activeStep.title}</h2>
        <p ref={descRef} className="card-description-text">{activeStep.desc}</p>

        {/* The Infinity-Loop Node Diagram */}
        <InfinityNodeDiagram 
          activeIndex={activeIndex} 
          hexColor={currentTheme.hex} 
        />
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Creative3DScene from "./CreativeBlob";

// Ensure ScrollTrigger is registered safely on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function HorizonShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Playground state for Slide 2 Interactive Lab
  const [gravityActive, setGravityActive] = useState(true);
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [nodeCount, setNodeCount] = useState(80);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [currentFps, setCurrentFps] = useState(60);

  // Client WebGL mounting states to prevent SSR mismatches
  const [mounted, setMounted] = useState(false);
  const [showWebGL, setShowWebGL] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setShowWebGL(window.innerWidth >= 968);
    }

    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    // Detect if viewport is desktop to activate GSAP Horizontal Pinning
    const isDesktop = window.innerWidth >= 968;
    let ctx = gsap.context(() => {
      if (isDesktop) {
        // Pin container and slide wrapper horizontally
        gsap.to(wrapper, {
          x: () => -(wrapper.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: container,
            pin: true,
            scrub: 0.8,
            start: "top top",
            end: () => `+=${wrapper.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // 3D tilt camera effect based on scroll velocity
              const velocity = self.getVelocity();
              const tilt = gsap.utils.clamp(-4, 4, velocity / 300);
              gsap.to(wrapper, {
                rotationY: tilt,
                rotationZ: tilt * 0.2,
                transformPerspective: 1200,
                duration: 0.5,
                ease: "power2.out",
                overwrite: "auto",
              });
            },
            onLeave: () => {
              gsap.to(wrapper, { rotationY: 0, rotationZ: 0, duration: 0.5 });
            },
            onEnterBack: () => {
              gsap.to(wrapper, { rotationY: 0, rotationZ: 0, duration: 0.5 });
            }
          },
        });

        // Parallax depth shifts on individual slides
        gsap.utils.toArray<HTMLElement>(".parallax-slide-layer").forEach((layer) => {
          const depth = parseFloat(layer.getAttribute("data-depth") || "0.2");
          gsap.fromTo(layer, 
            { x: 100 * depth },
            {
              x: -100 * depth,
              ease: "none",
              scrollTrigger: {
                trigger: container,
                scrub: true,
                start: "top top",
                end: () => `+=${wrapper.scrollWidth - window.innerWidth}`,
              }
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generative Particle Physics Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < nodeCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5 * particleSpeed,
          vy: (Math.random() - 0.5) * 1.5 * particleSpeed,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? "#00f3ff" : "#bc13fe",
        });
      }
    };

    initParticles();

    // Handle canvas resize
    const resizeObserver = new ResizeObserver(() => {
      if (canvas.offsetWidth && canvas.offsetHeight) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        initParticles();
      }
    });
    resizeObserver.observe(canvas);

    // Track FPS
    let lastTime = performance.now();
    let frameCount = 0;

    const drawLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw grid backdrop
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Physics loop
      particles.forEach((p, idx) => {
        // Gravity attraction to mouse
        if (gravityActive && mousePos.x >= 0 && mousePos.y >= 0) {
          const dx = mousePos.x - p.x;
          const dy = mousePos.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const force = (220 - dist) / 220 * 0.08 * particleSpeed;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Apply velocities & friction
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Add standard idle drifting speed
        const drift = 0.1 * particleSpeed;
        p.vx += (Math.random() - 0.5) * drift;
        p.vy += (Math.random() - 0.5) * drift;

        // Screen boundary bounds
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Connect lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (90 - dist) / 90 * 0.18;
            ctx.strokeStyle = p.color === "#00f3ff" 
              ? `rgba(0, 243, 255, ${alpha})`
              : `rgba(188, 19, 254, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      // Calculate FPS
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setCurrentFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      animationFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [nodeCount, particleSpeed, gravityActive, mousePos]);

  // Track relative mouse position inside canvas lab
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCanvasMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <section 
      className="horizon-container" 
      ref={containerRef} 
      id="playground" 
      aria-label="Horizon Playground Section"
    >
      <div className="horizon-wrapper" ref={wrapperRef}>
        
        {/* SLIDE 1: KINETIC TYPOGRAPHY */}
        <div className="horizon-slide slide--kinetic">
          <div className="slide-background-glow glow--violet"></div>
          {mounted && showWebGL && <Creative3DScene />}
          <div className="horizon-slide-content">
            <p className="slide-badge">// PLAYGROUND.01</p>
            <h2 className="kinetic-hero-title parallax-slide-layer" data-depth="0.3">
              CREATIVE<br />
              <span className="text-hollow">PLAYGROUND</span>
            </h2>
            <p className="slide-description parallax-slide-layer" data-depth="0.1">
              Scroll horizontally to morph the space, distortion perspectives, and trigger interactive experimental physics.
            </p>
          </div>
        </div>

        {/* SLIDE 2: THE INTERACTIVE PHYSICS LAB */}
        <div 
          className="horizon-slide slide--physics-lab"
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          data-cursor-text="INTERACT"
        >
          <div className="slide-background-glow glow--cyan"></div>
          <canvas className="physics-canvas" ref={canvasRef} />
          
          <div className="horizon-slide-content full-width">
            <div className="lab-grid-layout">
              <div className="lab-info">
                <p className="slide-badge">// PLAYGROUND.02</p>
                <h3 className="slide-title">GRAVITY NODE LAB</h3>
                <p className="slide-description">
                  Move your cursor to dynamically pull particles, construct holographic cybernetic lines, and morph gravity fields in real-time.
                </p>
              </div>

              {/* Holographic Terminal Controllers */}
              <div className="lab-terminal glass-card">
                <div className="terminal-header">
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                  <span className="terminal-title">// CYBERNETIC.CONTROL</span>
                </div>
                
                <div className="terminal-readouts">
                  <div className="readout-row">
                    <span className="readout-label">SYSTEM STATE:</span>
                    <span className="readout-value active">ONLINE</span>
                  </div>
                  <div className="readout-row">
                    <span className="readout-label">FPS ENGINE:</span>
                    <span className="readout-value">{currentFps} FPS</span>
                  </div>
                  <div className="readout-row">
                    <span className="readout-label">ACTIVE NODES:</span>
                    <span className="readout-value">{nodeCount}</span>
                  </div>
                </div>

                <div className="terminal-controls">
                  <button 
                    className={`btn-terminal ${gravityActive ? "active" : ""}`}
                    onClick={() => setGravityActive(!gravityActive)}
                  >
                    GRAVITY: {gravityActive ? "ON" : "OFF"}
                  </button>
                  
                  <button 
                    className="btn-terminal"
                    onClick={() => setParticleSpeed(prev => prev === 2 ? 0.5 : prev + 0.5)}
                  >
                    SPEED: {particleSpeed === 0.5 ? "0.5x" : particleSpeed === 1 ? "1.0x" : "2.0x"}
                  </button>

                  <button 
                    className="btn-terminal"
                    onClick={() => setNodeCount(prev => prev === 120 ? 40 : prev + 40)}
                  >
                    NODES: {nodeCount}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: CONCEPTUAL GLITCH CARDS */}
        <div className="horizon-slide slide--glitch-cards">
          <div className="slide-background-glow glow--violet"></div>
          <div className="horizon-slide-content">
            <p className="slide-badge">// PLAYGROUND.03</p>
            <h3 className="slide-title">EXPERIMENTAL CONCEPTS</h3>
            
            <div className="glitch-cards-wrapper parallax-slide-layer" data-depth="0.2">
              {/* Card 1 */}
              <article 
                className="glitch-card tilt-card glass-card"
                data-cursor-text="MORPH"
              >
                <div className="glitch-card-ambient"></div>
                <div className="glitch-card-image-wrap">
                  <div className="glitch-overlay-noise"></div>
                  <img src="/images/project-img/experimental.jpg" alt="Neural Shader Artwork" />
                </div>
                <div className="glitch-card-info">
                  <span className="card-num">01 //</span>
                  <h4 className="card-heading">NEURAL SHADER</h4>
                  <p className="card-text">GPU-accelerated vector fields that dynamically generate real-time feedback loops based on sound inputs.</p>
                </div>
              </article>

              {/* Card 2 */}
              <article 
                className="glitch-card tilt-card glass-card"
                data-cursor-text="DISCOVER"
              >
                <div className="glitch-card-ambient"></div>
                <div className="glitch-card-image-wrap">
                  <div className="glitch-overlay-noise"></div>
                  <img src="/images/project-img/infini-loop.jpg" alt="Synapse Engine Artwork" />
                </div>
                <div className="glitch-card-info">
                  <span className="card-num">02 //</span>
                  <h4 className="card-heading">SYNAPSE ENGINE</h4>
                  <p className="card-text">Monolithic data structures rendering physics-backed canvases that coordinate smooth horizontal scrolling triggers.</p>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* SLIDE 4: OUTRO MATRIX REVEAL */}
        <div className="horizon-slide slide--matrix-outro">
          <div className="slide-background-glow glow--cyan"></div>
          <div className="horizon-slide-content">
            <p className="slide-badge">// PLAYGROUND.04</p>
            <h2 className="outro-title parallax-slide-layer" data-depth="0.4">
              ENTER THE<br />
              <span className="text-gradient">SYSTEM</span>
            </h2>
            <p className="slide-description">
              You are prepared. Explore complete finished project systems and creative deployments in the dynamic stack below.
            </p>
            <div className="outro-arrow-wrap parallax-slide-layer" data-depth="0.1">
              <span className="outro-arrow">↓</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

"use client";
import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import FilmScene from "./FilmScene";

interface Project {
  title: string;
  desc: string;
  fullDesc: string;
  tech: string;
  image: string;
  link: string;
}

const projects: Project[] = [
  { title: "Herbal Mart", desc: "A scalable e-commerce platform featuring dynamic cart management and real-time product filtering, built to optimize user engagement.", fullDesc: "An interactive online store for herbal health products. Features a dynamic shopping cart, product filtering, and a responsive design.", tech: "HTML5, CSS3, JavaScript, Netlify", image: "/images/project-img/herbal-mart.jpg", link: "/images/project-img/herbal-mart.jpg" },
  { title: "Bunny Jump Lite", desc: "A fun interactive game where a bunny is controlled via keyboard inputs.", fullDesc: "A lightweight browser game where you control a bunny to jump over obstacles. Features score tracking and progressive difficulty.", tech: "JavaScript, HTML5 Canvas, CSS3", image: "/images/project-img/bunny-jump.jpg", link: "https://bunny-jump-lite.netlify.app/" },
  { title: "Hunting Alien", desc: "Action-packed shooter game developed using the Phaser JavaScript framework.", fullDesc: "A fast-paced space shooter game. Protect your ship from incoming waves of aliens using different power-ups.", tech: "Phaser.js, JavaScript, Game Design", image: "/images/project-img/hunt-alien.jpg", link: "https://hunting-alien-io.netlify.app/" },
  { title: "Math Fighter", desc: "Educational web game solving math operations with touch controls.", fullDesc: "An educational game that combines RPG elements with math problems. Solve equations quickly to defeat monsters.", tech: "HTML5, CSS3, JavaScript", image: "/images/project-img/Math-fighter.jpg", link: "https://encerkan-otakmu-bersama-bilal.netlify.app/" },
  { title: "Snake Game", desc: "Classic Snake arcade game implementation. Eat food, grow, and avoid walls.", fullDesc: "A modern recreation of the classic Snake arcade game. Features smooth controls and high-score saving.", tech: "JavaScript, DOM Manipulation, CSS Grid", image: "/images/project-img/snake-game.jpg", link: "https://snake-game-lalsm.netlify.app/" },
  { title: "Mini Portfolio", desc: "A concise showcase of personal skills and early projects.", fullDesc: "My first portfolio project showcasing early works and basic web development skills.", tech: "HTML, CSS, Simple JS", image: "/images/project-img/mini-porto.jpg", link: "https://portofolio-bilal.netlify.app/" },
  { title: "Memory Game", desc: "Navigate characters, match memories, select using spacebar.", fullDesc: "An interactive Puzzle Memory Game website built with Phaser.js, where players navigate character using arrow keys and select them with the spacebar.", tech: "Typescript, CSS, Phaser JS, HTML, Javascript, Game Design", image: "/images/project-img/memory-game.jpg", link: "https://memory-game-by-bilal.netlify.app/" },
  { title: "Ghost Buster", desc: "Avoid ghost attacks using arrows and survive longer.", fullDesc: "Ghost Buster is a web game using JavaScript where players use arrow keys to avoid ghost attacks and survive.", tech: "Typescript, CSS, Phaser JS, Game Design", image: "/images/project-img/ghost-buster.jpg", link: "https://ghostbuster-by-bilal.netlify.app/" },
  { title: "MindPoint", desc: "Mindpoint: rotate and drag the perspective to align fragments and solve puzzles.", fullDesc: "Mindpoint is a perspective puzzle game where players drag and rotate views to align fragments into complete symbols perfectly.", tech: "Typescript, CSS, Game Design, HTML, Javascript, Puzzle Illusion", image: "/images/project-img/mindpoint.jpg", link: "https://mindpoint-by-bilal.netlify.app/" },
  { title: "Guru Bahasa", desc: "A responsive educational platform designed to streamline student consultation via WhatsApp integration and interactive gallery modules.", fullDesc: "Professional language tutor website offering English and Indonesian lessons, featuring services, testimonials, gallery slider, and WhatsApp consultation form.", tech: "CSS, HTML5, Javascript, Responsive Design", image: "/images/project-img/guru-bahasa.jpg", link: "https://pak-guru-bahasa.netlify.app/" },
  { title: "Aether Dreamscape", desc: "Rotate the world, align platforms, and guide the orb to light.", fullDesc: "Aether Dreamscape is a 3D perspective puzzle where players rotate the world, align platforms, and guide a glowing orb to goals.", tech: "CSS, HTML5, Javascript, Game Design, Experimental, 3D", image: "/images/project-img/aether-dreamscape.jpg", link: "https://aether-dreamscape.netlify.app/" },
  { title: "Infinite Loop", desc: "A canvas-based interactive visual narrative with physics-driven particles.", fullDesc: "An interactive visual narrative exploring control and chaos through canvas-based particle physics, infinite scroll mechanics, and dynamic typography.", tech: "JavaScript, HTML5 Canvas, CSS Variables", image: "/images/project-img/infini-loop.jpg", link: "https://infinite-loop-scroll.netlify.app" },
  { title: "Lorem V. Portfolio", desc: "A creative developer portfolio with custom cursor and smooth scroll animations.", fullDesc: "A creative developer portfolio featuring custom cursors, noise overlays, smooth scrolling, and scroll-triggered intersection observer animations.", tech: "HTML, CSS, JavaScript, IntersectionObserver", image: "/images/project-img/lorem-v.jpg", link: "https://lorem-v-portfolio.netlify.app" },
  { title: "NOIR Photography", desc: "High-end photography portfolio featuring horizontal scrolling and GSAP.", fullDesc: "A high-end, monolithic photography portfolio featuring horizontal scrolling, GSAP animations, Lenis smooth scroll, and cinematic typography.", tech: "Tailwind CSS, GSAP, ScrollTrigger, Lenis", image: "/images/project-img/noir.jpg", link: "https://noir-photography.netlify.app" },
  { title: "Creative Programmer", desc: "Cinematic portfolio with Three.js WebGL background and custom interactions.", fullDesc: "A cinematic web experience merging performance and motion, featuring a Three.js WebGL particle background, GSAP animations, and an interactive code playground.", tech: "Three.js, GSAP, Lenis, WebGL", image: "/images/project-img/creative-progs.jpg", link: "https://creative-progs-lal.netlify.app" },
  { title: "Digital Craftsman", desc: "Immersive creative portfolio with WebGL particles and cinematic reveals.", fullDesc: "An award-winning creative development portfolio featuring a WebGL starfield, cinematic typography, modal flip animations, and a performance toggle mode.", tech: "Three.js, GSAP, HTML5, CSS3", image: "/images/project-img/digital-craftsman.jpg", link: "https://digital-craftsman-lal.netlify.app" },
  { title: "Experimental Directory", desc: "Physics-based Canvas particle text system with CRT glitch effects.", fullDesc: "A digital chaos experiment featuring a vanilla JavaScript particle system that forms readable text, CRT scanlines, and physics-based mouse repelling interactions.", tech: "Canvas API, Vanilla JS, CSS Glitch Effects", image: "/images/project-img/experimental.jpg", link: "https://experimental-directory.netlify.app" },
  { title: "LUMIERA Visual Poetry", desc: "Ultra-cinematic photography portfolio with multi-layered SVG parallax.", fullDesc: "An ultra-cinematic photography portfolio. Features a multi-layered SVG parallax landscape, horizontal scroll sections, and SplitType text reveals.", tech: "Tailwind CSS, GSAP, Lenis, SVG Parallax", image: "/images/project-img/lumiera.jpg", link: "https://lumiera.netlify.app" },
];

export default function ProjectsSection() {
  const [mounted, setMounted] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // References to share dynamic, high-performance scroll values across R3F and DOM
  const scrollRef = useRef({
    current: 0,
    target: 0,
    isDragging: false,
    lastX: 0,
    velocity: 0,
    dragDistance: 0,
  });

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pointer drag event handlers to rotate the 3D film strip cylinder
  const handlePointerDown = (e: React.PointerEvent) => {
    scrollRef.current.isDragging = true;
    scrollRef.current.lastX = e.clientX;
    scrollRef.current.dragDistance = 0;
    scrollRef.current.velocity = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!scrollRef.current.isDragging) return;
    const deltaX = e.clientX - scrollRef.current.lastX;
    scrollRef.current.lastX = e.clientX;
    
    // Accumulate total drag distance
    scrollRef.current.dragDistance += Math.abs(deltaX);
    
    // Smooth dragging sensitivity scale
    const sensitivity = 0.003; 
    scrollRef.current.target -= deltaX * sensitivity;
    scrollRef.current.velocity = -deltaX * sensitivity;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (scrollRef.current.isDragging) {
      scrollRef.current.isDragging = false;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Wheel zoom/scroll rotation support
    const sensitivity = 0.001;
    scrollRef.current.target += e.deltaY * sensitivity;
  };

  return (
    <section className="section" id="projects" aria-label="Projects Section" style={{ overflow: "visible", position: "relative" }}>
      <div className="parallax-text" style={{ top: "-20px", right: "0" }} data-speed="0.15">WORK</div>
      
      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <h2 className="section-title" data-scroll>Projects</h2>
        
        {/* Helper HUD instruction bar */}
        <div className="project-hud-instruction" data-scroll>
          <span className="hud-pulse-dot"></span>
          <p className="hud-text">// GRAB & DRAG OR SCROLL TO SPIN VINTAGE FILM STRIP</p>
        </div>

        {/* 3D WebGL Canvas Container with pointer-event hooks */}
        <div 
          className="project-3d-canvas-wrap"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          style={{ touchAction: "none" }}
        >
          {mounted && (
            <Canvas
              camera={{ position: [0, 0, 4.0], fov: 50 }}
              dpr={[1, 1.5]}
              gl={{ alpha: true, antialias: true, stencil: false }}
              style={{ background: "transparent" }}
            >
              <FilmScene 
                projects={projects} 
                onSelectProject={(proj) => setActiveProject(proj)} 
                scrollRef={scrollRef}
                progressRef={progressRef}
              />
            </Canvas>
          )}
        </div>

        {/* Sleek Cinematic Looping Animation Bar */}
        <div className="project-loop-bar-container" data-scroll>
          <div className="project-loop-bar-track">
            <div ref={progressRef} className="project-loop-bar-fill"></div>
          </div>
          <div className="project-loop-bar-hud">
            <span className="hud-code">// SYS.LOOP_ACTIVE</span>
            <span className="hud-code">REEL SPEED: 2.4 RPM</span>
          </div>
        </div>
      </div>

      {/* Cyberpunk details overlay modal */}
      {activeProject && (
        <div className="project-detail-modal" onClick={() => setActiveProject(null)}>
          <div className="modal-backdrop"></div>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveProject(null)}>
              {/* @ts-ignore */}
              <ion-icon name="close-outline"></ion-icon>
            </button>
            <div className="modal-body">
              <div className="modal-image-wrap">
                <img src={activeProject.image} alt={activeProject.title} />
                <div className="modal-img-gradient"></div>
              </div>
              <div className="modal-info">
                <p className="modal-eyebrow">// PROJECT DATAFRAME</p>
                <h3 className="modal-title">{activeProject.title}</h3>
                
                <div className="modal-tech-tags">
                  {activeProject.tech.split(",").map((tech, idx) => (
                    <span className="tech-badge" key={idx}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>
                
                <p className="modal-desc">{activeProject.fullDesc}</p>
                
                <div className="modal-actions">
                  <a 
                    href={activeProject.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-launch-live"
                  >
                    <span>LAUNCH ACTIVE INTERFACE</span>
                    {/* @ts-ignore */}
                    <ion-icon name="rocket-outline" style={{ marginLeft: "8px", fontSize: "1.1rem" }}></ion-icon>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

# ULTRASUPERPROMPT: "Awwwards-Level Fluid Interactive About Me Card"

**SYSTEM DIRECTIVE:**
Act as a world-class Creative Frontend Engineer and Creative Director specializing in hyper-interactive, immersive portfolio experiences (Awwwards-winning standard). Your objective is to rewrite/generate an advanced React (Next.js) component with production-ready, mathematical, and fluid animations. The output must perform at a locked 60fps with zero layout shifting and flawless state management.

**TECH STACK Context:**
* **Framework:** Next.js (App Router, Tailwind CSS for layout)
* **Animation Core:** GSAP (GreenSock) for precise interactive sequencing
* **Graphics/FX:** SVG Path manipulation, HTML5 Canvas for organic particle flow fields

---

## 1. COMPONENT ARCHITECTURE & MOBILE UX SPECIFICATIONS (CRITICAL REVISION)
1. **Responsive Viewport Isolation (No Mobile Panning Bug):** * On desktop viewports (`min-width: 1024px`), enable full interactive panning, floating node structures, and rich mouse-tracking effects.
   * **CRITICAL MOBILE RULE:** On mobile viewports (`max-width: 1023px`), completely strip out the complex panning system, heavy mouse-tracking canvas physics, and deep multi-nested hover interactions. Ensure touch interactions allow standard, uninhibited vertical scrolling so the visitor's comfort is completely uninterrupted when exploring the site via a mobile device.

---

## 2. STEP-BY-STEP INTERACTION WORKFLOW (THE FLUID MIND-MAP REVAMP)

Transform a static bento-style "About Me" card into an interactive, interconnected multi-layered ecosystem based on the following precise specs:

### A. The Structural Layout & Node System
* **Left Section:** Houses the core branding: `// DISCIPLINE_01`, an extended bold header reading `FRONTEND ENGINEERING`, and the description block: *"Architecting pixel-perfect, immersive web experiences with modern frameworks and WebGL interactions."*
* **Right Section:** Replaces the static pill container with a **Dynamic Tech Constellation/Node Network (`[ SYS.STACK ]`)**.
  * The tech tags (`JavaScript`, `React.js`, `Next.js 14`, `TypeScript`, `Tailwind CSS`, `GSAP`, `Three.js`, `WebGL`) must float independently using a subtle, randomized floating path animation managed by GSAP (floating floating physics).

### B. The Hover & Connection Engine (Awwwards-Standard)
When the user hovers over a specific technology node—specifically **`Three.js`** as the prime anchor state:
1. **The Core Central Portal Activation:**
   * Reveal a floating glassmorphic 3D interactive icon window directly below the node layer. 
   * Inside this window, render a minimalist rotating 3D geometric wireframe polyhedron (icosahedron/dodecahedron) using animated SVG or a canvas loop, glowing with an intense cyan/teal gradient border.
2. **Dynamic SVG Neural Constellation Lines:**
   * Instantly calculate coordinates using `getBoundingClientRect()` and dynamically draw crisp, glowing teal SVG connection lines branching out from the hovered `Three.js` node, interlocking with neighboring nodes (`TypeScript`, `WebGL`, `GSAP`), and anchoring directly into the central wireframe portal window. Use GSAP's `stroke-dashoffset` to draw the neural connections seamlessly.
3. **Advanced Sci-Fi Glassmorphic Tooltip:**
   * Directly above the active node, reveal a precise micro-interaction card reading: `// TYPE.SCRIPT` or `// THREE.JS CONTEXT` with an inner description tag: `CREATING ADVANCED WEBGL-BASED 3D GRAPHICS IN THE BROWSER`. The tooltip must feature a sharp tech outline with a blur-filtered background.
4. **Ambient Background Particle Wave:**
   * Across the background layer of the entire card container, animate an organic fluid wave. Replace the static background with a flowing `Perlin Noise Flow Field` or a dynamic sine-wave mesh of fine cyan dust particles that morph and ripple outward from the cursor’s focal point, giving the card unmatched visual depth.

---

## 3. CLEAN PRODUCTION-CODE EXPECTATIONS
* **Modularization:** Break down the layout cleanly into components: `AboutSection.tsx`, `TechConstellation.tsx`, `NeuralLines.tsx`, `WireframePortal.tsx`, and `AtmosphericWave.tsx`.
* **Hardware Acceleration:** Force hardware acceleration on all micro-interactions by strictly animating `transform`, `opacity`, and native SVG parameters. Absolutely do not trigger browser repaints by altering structural properties (`width`, `height`, `top`, `left`) inside active animation hooks.
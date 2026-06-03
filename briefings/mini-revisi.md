# ULTRASUPERPROMPT: "Awwwards-Level Precision Interactive Hover - Deployment Phase (Final Verified Layout)"

**SYSTEM DIRECTIVE:**
Act as an elite Creative Frontend Developer and WebGL/GSAP Animation Master. Your objective is to build a pixel-perfect, hyper-interactive, and performance-optimized React component replicating a complex UI interaction. The output must operate flawlessly at 60fps with zero layout shifts, zero logical flaws, and complete immunity to fast-scrolling bugs.

**TECH STACK REQUIREMENTS:**
* **Framework:** React (Vite architecture)
* **Styling:** Tailwind CSS (utility-first layout)
* **Animation Core:** GSAP (GreenSock Animation Platform) for timeline orchestration
* **Graphics/FX:** Dynamic SVG Paths and HTML5 Canvas or CSS Masking for high-fidelity particle/fluid systems

---

## 1. UX LOGIC & PERFORMANCE INFRASTRUCTURE (THE SCROLL-BUG FIX)
The component must elegantly handle high-velocity user scrolling without accidental hover triggers:
1.  **Strict Typographic Bounding Box:** The `onMouseEnter` and `onMouseLeave` event listeners must be bound *exclusively* to the inline text node element (`<span>` or `<h1>` of "04 - DEPLOYMENT"). Do not bind to the wrapper flex-row or block container. The active hitbox must precisely match the dimensions of the text string.
2.  **Scroll Velocity Pointer Lock:** Implement an active scroll event listener on the parent container. When scrolling is active or exceeds a specific velocity threshold, dynamically inject `pointer-events: none` into the entire interaction list. Use a 150ms debounce function to smoothly restore `pointer-events: auto` only after scrolling has completely ceased.

---

## 2. STEP-BY-STEP INTERACTION WORKFLOW (PIXEL-PERFECT REPLICATION)

Upon triggering a valid `onMouseEnter` event on "04 - DEPLOYMENT", execute the following synchronized GSAP timelines:

### A. The Hovered Menu Item ("04 - DEPLOYMENT")
* **Sci-Fi Neon Framing:** Instantly reveal a crisp, 1px neon cyan (`#00FFFF`) bounding box perfectly hugging the active text. The box must feature sharp tech-style corner brackets. Animate this border using an SVG line-drawing stroke effect.
* **Molten Internal Energy Flow:** The text shifts from a muted gray wireframe outline to a vibrant, luminous orange-yellow state. Inside the letters, animate a fluid, shifting molten energy waveform. Achieve this via CSS `background-clip: text` combined with an animated linear-gradient map or a canvas-driven noise texture mask moving horizontally.

### B. The Organic Connecting Conduit (SVG Cable Bundle)
* From the rightmost edge of the active cyan text bounding box, dynamically generate and draw a multi-stranded bundle of glowing neon-orange SVG bezier curves.
* These lines must curve organically downward and outward across the screen space, mimicking a high-energy fiber-optic cable conduit, directly docking into the left-central boundary of the informational card on the right. Animate the path reveal using GSAP's `stroke-dashoffset`.

### C. The Holographic Information Card (EXACT STRUCTURAL REPLICATION)
The right-side card must render as a highly polished glassmorphic panel with the following rigid specifications:
1.  **Container Properties:** Dark, highly translucent background with strong `backdrop-blur`. It must feature a thick, beautifully blended, intense neon orange glowing outer border with smooth rounded corners.
2.  **Header Metrics:** * *Left:* Small, uppercase monospace typography in bright orange reading: `PHASE 04 // LAUNCH & MONITOR`.
    * *Right:* A small square accent block with an orange outline housing a minimal glowing orange Rocket icon.
3.  **Core Typography:**
    * *Title (`<h2>`):* `PRODUCTION SHIP` rendered in an ultra-bold, extended tech/sci-fi white typeface.
    * *Description (`<p>`):* *"Continuous integration pipelines, CDN configurations, ultra-secure cloud scaling, and micro-interaction checks for a flawless zero-downtime launch."* rendered in a clean, legible muted gray sans-serif font.
4.  **Atmospheric Particle Field:** Behind the text layers within the card container, execute a lightweight canvas particle field. Render fine, glowing dots (alternating between soft orange and sharp cyan) that float gently upwards, varying in scale and opacity to simulate volumetric 3D depth.
5.  **The Infinity-Loop Node Diagram (Bottom Section):**
    * Render a horizontal network topology layout consisting of glowing circular junction nodes.
    * **The Path Architecture:** The connections between nodes must follow a highly complex, braided multi-strand fiber path forming an elegant infinity-loop / figure-8 wave pattern.
    * **The Node Flow (Left to Right):**
        * `Core` (Far Left Node)
        * Splits symmetrically into upper node `Strategy` and lower node `UI/UX`.
        * Converges perfectly into the center node `Architecture`.
        * Splits symmetrically again into upper node `Codebase` and lower node `Testing`.
        * Converges finally into the target node `Cloud` (Far Right Node).
    * **Animation:** Animate bright pulses of light traveling continuously along these interwoven curved sine-wave tracks from `Core` through the entire system to `Cloud`.

---

## 3. TECHNICAL SPECIFICATIONS FOR OUTPUT PRODUCTION
* **Modular Breakdown:** Structure the codebase cleanly into reusable components: `ProcessDashboard.jsx`, `InteractiveProcessItem.jsx`, `DynamicConduit.jsx`, `HolographicCard.jsx`, and `InfinityNodeDiagram.jsx`.
* **Dynamic Coordinate Mapping:** Do not hardcode layout positions. Use React `useRef` hooks and live `getBoundingClientRect()` calculations to compute the exact start and end coordinates of the SVG connection strands dynamically, ensuring total responsiveness across all desktop viewports.
* **Hardware Acceleration:** Ensure all animations leverage hardware-accelerated CSS properties (`transform`, `opacity`, and native SVG path parameters). Avoid manipulating layout triggers (`width`, `height`, `top`, `left`) inside the animation loop to guarantee a locked 60fps performance profile.

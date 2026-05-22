# Ultrasuperprompt V2: 3D Immersive Film Roll Carousel (Awwwards Standard)

**Role & Objective:**
Act as a Senior Creative Developer, WebGL Expert, and Three.js Master who specializes in building Awwwards-winning, high-end interactive websites. Your task is to build a highly immersive, seamless 3D interactive portfolio section for my Next.js project.

---

### CRITICAL WARNING: WHAT NOT TO DO (DO NOT REPEAT THESE MISTAKES)
* **DO NOT** create individual flat planes (`PlaneGeometry`) and just align them side-by-side with minor rotation. This creates a jagged, disjointed "billboard" look which looks cheap and amateur.
* **DO NOT** use solid grey/blue meshes with drawn-on crosses for the film border.
* **DO NOT** make the Depth of Field (DoF) blur so aggressive that adjacent frames are completely unreadable.

---

### THE REQUIRED ARCHITECTURE & VISUALS (Based on High-End References)
1. **The Geometry (Seamless Cylinder/Curve):** * You must create a **unified, continuous curved track** or use a large `CylinderGeometry` (open-ended) where the projects wrap around smoothly like a real, single physical film strip.
   * The entire film strip carousel should have a subtle **tilt (skew) on the X and Z axes** (or angle the camera slightly from above/below). It should NOT face the user completely flat at a dead-center 90-degree angle. This angle variation is crucial for the 3D depth effect.

2. **The Film Strip & Perforations (Alpha Mapping):**
   * The film strip must look like a professional cinematic roll (dark translucent or solid black/white styling depending on theme, following a sleek aesthetic).
   * Implement the perforated holes at the top and bottom edges using a **repeating texture with an Alpha Map (`alphaMap`)**. The background scene must be visible *through* the holes. Do not generate holes using complex 3D geometry or separate meshes.

3. **Post-Processing & Focus:**
   * Implement `DepthOfField` from `@react-three/postprocessing`.
   * **Crucial Tuning:** The focus envelope must be wide. The 2 to 3 project frames closest to the center must remain perfectly sharp and readable. The blur should only smoothly accumulate as the strip curves deeply into the background on the far left and far right.

---

### TECH STACK
* Next.js (App Router, Client Component)
* React Three Fiber (R3F)
* @react-three/drei
* @react-three/postprocessing
* Three.js

---

### INTERACTION & UX SPECIFICATIONS
1. **Scroll & Drag Mechanics:** Use `ScrollControls` or a custom global pointer event listener to rotate/pan the film roll horizontally. It must capture both trackpad/mouse-wheel scrolling AND click-and-drag (grab to swipe) interactions seamlessly.
2. **Inertia & Damping (Buttery Smooth):** Movement must feel organic. Use linear interpolation (`MathUtils.lerp`) inside the `useFrame` loop so that when a user releases the drag or stops scrolling, the film roll glides smoothly to a halt with realistic friction.
3. **Parallax/Mouse Reactivity:** The camera should subtly react to the active cursor position (X/Y movement), creating a slight floating/VR perspective.
4. **Hover Interaction:** When hovering over a specific project frame, it should subtly scale up or illuminate, signaling interactivity without breaking the cylinder's structural continuity.

---

### DELIVERABLES REQUIRED FROM YOU (AI):
1. **Production-Ready Code:** Provide clean, production-ready, modular code for the Next.js component. Ensure all imports from `three`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing` are correct.
2. **Shader/Texture Implementation Guide:** Clearly explain how to map the textures (the project screenshots) onto the continuous geometry seamlessly without stretching.
3. **Performance Optimization:** Ensure proper texture filtering, cleanup on unmount, and performance optimization suitable for high-refresh-rate displays.
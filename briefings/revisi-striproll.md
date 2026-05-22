# ULTRASUPERPROMPT V4: MASTER ARCHITECTURE FOR 3D CINEMATIC FILM ROLL

**Role & Objective:**
Act as a Principal Creative Developer and Three.js/WebGL Master who builds Awwwards-winning immersive websites. Your task is to write a production-ready Next.js (App Router) client component using React Three Fiber (R3F) and `@react-three/drei` to build an interactive, high-end 3D Cinematic Film Roll Carousel for a portfolio section.

---

### VISUAL TARGET & AESTHETICS (GOLD STANDARD)
* **The Film Roll:** A singular, continuous, perfectly curved cinematic ribbon that loops horizontally across the screen. It must look like a physical film strip tilted dynamically in a 3D environment.
* **The Perforations:** Realistic rectangular cinematic sprocket holes on the top and bottom borders of the ribbon. The background (e.g., a dark canvas with subtle particles/stars) MUST be visible *through* these holes.
* **Typography & UI Overlay:** An elegant, high-contrast serif font header "PROJECTS" centered at the top, with a dynamic subtitle showing the active project name and category (e.g., "Math Fighter • Educational web game"). At the bottom, a row of clean pagination dots and minimalist navigation arrows on the corners.
* **Atmosphere & Focus (Depth of Field):** The active project frame at the center must be 100% crisp, sharp, and vivid. The frames to the immediate left and right curve beautifully backward into the Z-axis and gradually blur out using a high-end photographic bokeh lens effect.

---

### REQUIRED TECHNICAL ARCHITECTURE (STRICT IMPLEMENTATION)

#### 1. Geometry & Mesh Deformation
* **DO NOT** use individual flat `PlaneGeometry` meshes positioned side-by-side. That creates a broken, jagged "billboard" effect.
* **YOU MUST** use an open-ended `CylinderGeometry` segment (using `radialSegments`, `heightSegments`, and open-ended parameters) with a large radius to create a **TRUE, SMOOTH, CONTINUOUS SEAMLESS CURVE**.
* **Project Texture Mapping:** Project screenshots (e.g., "Hunting Alien", "Math Fighter", "Snake Game") must contour perfectly along the exact same radius. Map them as textures onto adjacent segments of the cylinder geometry, offset by a microscopic fraction (`z += 0.01`) to prevent z-fighting against the black film strip background.

#### 2. Alpha-Mapped Perforations
* Rather than rendering complex 3D geometry for thousands of holes, use a highly optimized repeating black texture on the cylinder mesh that utilizes an `alphaMap`.
* The alpha map must dictate the transparency of the sprocket holes, ensuring the global canvas background shows through them natively without overhead.

#### 3. Photographic Post-Processing
* Integrate `@react-three/postprocessing` enclosing an ultra-tuned `DepthOfField` component.
* **Strict Tuning Parameters:** Set a wide, forgiving focal envelope so the active center frame is perfectly readable. The blur must smoothly and progressively blend only on the far peripheral edges as the cylinder recedes into the background.
* *Recommended initial baseline:* `focusDistance={0.0}`, `focalLength={0.02}`, `bokehScale={1.5}`.

#### 4. Camera, Tilt & Parallax Physics
* **Dynamic Perspective:** Do not position the camera or cylinder flat at a dead-center 90-degree angle. Apply a precise structural tilt/skew to the carousel on the X and Z axes (e.g., `rotation={[0.08, 0, -0.04]}`) to accentuate the spatial 3D depth.
* **Cursor Parallax:** Hook into the global pointer/mouse movement inside the `useFrame` loop. The camera or the main group must subtly drift on the X/Y axes matching the cursor position, faking a floating VR head-tracking feel.

#### 5. Scroll, Click-Drag, & Inertial Damping
* Implement horizontal navigation utilizing `ScrollControls` from `@react-three/drei`.
* It must natively support trackpad swiping, mouse-wheel scrolling, AND manual click-and-drag (grab-to-swipe) functionality.
* **Buttery Smooth Physics:** Use linear interpolation (`THREE.MathUtils.lerp`) inside `useFrame` to interpolate the current scroll position to the target scroll position. When the user flings or stops dragging, the film strip must smoothly glide to a halt with premium organic inertia.

#### 6. UI Synchronization & State Management
* The HTML overlay (Active Project Title, Category, Bottom Dots) must be fully reactive.
* Calculate the active item index in real-time inside the R3F loop based on the scroll offset: `const activeIndex = Math.round(scroll.offset * (totalItems - 1))`.
* Safely lift or sync this state to update the text typography seamlessly without breaking the R3F render cycle performance.

---

### DELIVERABLES:
1. **Clean, Modular Code Architecture:** Provide the complete Next.js client component code setup. Ensure all imports are accurate and optimized.
2. **Implementation Details:** Briefly explain the structural math behind the `CylinderGeometry` UV coordinates and how state synchronization between the R3F scroll offset and the HTML UI text layer is safely handled.
3. **Performance Optimization:** Ensure textures are properly filtered, and all event listeners or post-processing passes are safely disposed of upon unmounting to avoid any memory leaks on high-end GPUs.
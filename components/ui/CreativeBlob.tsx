"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

// Glowing Cybernetic Core Sphere built with Points (highly stable, 100% bug-free)
// Parent-Child Hoberman Sphere with Momentum Throw Mechanics
function CyberSphere({
  isIdle,
  isCollapsed,
  mouse,
}: {
  isIdle: boolean;
  isCollapsed: boolean;
  mouse: { x: number; y: number };
}) {
  const containerRef = useRef<THREE.Group>(null);

  // Sync isCollapsed to a ref to avoid recreating frame loops or using stale values
  const isCollapsedRef = useRef(isCollapsed);
  useEffect(() => {
    isCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);

  // Physics state Refs
  const sphereScaleRef = useRef(1.0);
  const sphereRotationRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef(0.25);
  const tiltRef = useRef({ x: 0, y: 0 });

  // Mouse velocity and fling momentum tracking
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const mouseVelocityRef = useRef({ x: 0, y: 0 });
  const momentumRef = useRef({ x: 0, y: 0 });
  const wasCollapsedRef = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Calculate real-time mouse movement speed (velocity) in WebGL coordinate space
    const dx = mouse.x - prevMouseRef.current.x;
    const dy = mouse.y - prevMouseRef.current.y;

    prevMouseRef.current.x = mouse.x;
    prevMouseRef.current.y = mouse.y;

    // Smoothly accumulate mouse velocity
    mouseVelocityRef.current.x += (dx - mouseVelocityRef.current.x) * 0.25;
    mouseVelocityRef.current.y += (dy - mouseVelocityRef.current.y) * 0.25;

    // Rapidly decay velocity if the mouse is stationary
    if (dx === 0 && dy === 0) {
      mouseVelocityRef.current.x *= 0.85;
      mouseVelocityRef.current.y *= 0.85;
    }

    // 2. Detect the exact moment the user releases click (MOUSEDOWN -> MOUSEUP)
    const justReleased = wasCollapsedRef.current && !isCollapsedRef.current;
    wasCollapsedRef.current = isCollapsedRef.current;

    if (isCollapsedRef.current) {
      // While pressed, clear any previous fling momentum
      momentumRef.current.x = 0;
      momentumRef.current.y = 0;
    } else if (justReleased) {
      // On release, capture the final swipe speed and inject as momentum
      // Sensitivity factor scales the WebGL coordinate shift into rad/s
      const sensitivity = 70.0;
      momentumRef.current.y = mouseVelocityRef.current.x * sensitivity;
      momentumRef.current.x = -mouseVelocityRef.current.y * sensitivity;
    } else {
      // Natural air friction: slow down momentum over time (96.5% velocity retained per frame)
      momentumRef.current.x *= 0.965;
      momentumRef.current.y *= 0.965;
    }

    // 3. Determine target scale and base rotation speed
    // Pressed scale: 0.55 (not too small, looks very clear)
    // Expanded scale: 1.30 + breathing sine pulse (larger, extremely volumetric!)
    const targetScale = isCollapsedRef.current
      ? 0.55
      : 1.30 + Math.sin(time * 1.2) * 0.08;

    const targetSpeed = isCollapsedRef.current
      ? 4.5  // Vortex rotation when compressed
      : 0.25; // Calm idle speed when expanded

    // 4. Smoothly lerp physical properties
    sphereScaleRef.current += (targetScale - sphereScaleRef.current) * 0.08;
    speedRef.current += (targetSpeed - speedRef.current) * 0.06;

    // 5. Integrate rotation over time
    // Y-axis: base rotation speed + Y-momentum
    const speedY = isCollapsedRef.current ? speedRef.current : (speedRef.current + momentumRef.current.y);
    // X-axis: X-momentum (rolling rotation)
    const speedX = isCollapsedRef.current ? 0 : momentumRef.current.x;

    sphereRotationRef.current.y += delta * speedY;
    sphereRotationRef.current.x += delta * speedX;

    // 6. Smoothly lerp mouse coordinate tilt (disabled when pressed for uniform vortex axis)
    const targetTiltX = isCollapsedRef.current ? 0 : -mouse.y * 0.35;
    const targetTiltY = isCollapsedRef.current ? 0 : mouse.x * 0.35;

    tiltRef.current.x += (targetTiltX - tiltRef.current.x) * 0.1;
    tiltRef.current.y += (targetTiltY - tiltRef.current.y) * 0.1;

    // 7. Apply transformations to parent container
    if (containerRef.current) {
      containerRef.current.scale.set(
        sphereScaleRef.current,
        sphereScaleRef.current,
        sphereScaleRef.current
      );
      containerRef.current.rotation.y = sphereRotationRef.current.y + tiltRef.current.y;
      containerRef.current.rotation.x = sphereRotationRef.current.x + tiltRef.current.x + Math.PI * 0.1; // static forward angle
    }
  });

  // Mathematically generate particles for the 3D Sphere Core (Solid Sphere Volume)
  const { positions, colors } = useMemo(() => {
    const particleCount = 750;
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color("#00f3ff");
    const colorPurple = new THREE.Color("#bc13fe");

    for (let i = 0; i < particleCount; i++) {
      // Volumetric distribution inside the sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      // Max radius 1.35 is securely inside the 1.55 wireframe shell
      const r = Math.pow(Math.random(), 0.8) * 1.35;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color gradient interpolation based on height (Y-coordinate)
      const mixedColor = colorCyan.clone().lerp(colorPurple, (y + 1.5) / 3);
      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }

    return { positions: pos, colors: cols };
  }, []);

  return (
    <group ref={containerRef}>
      {/* Dynamic Cyber Points Mesh */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Cyber-Grid Wireframe Geometry (looks incredibly premium, futuristic) */}
      <mesh>
        <icosahedronGeometry args={[1.55, 2]} />
        <meshBasicMaterial
          color="#00f3ff"
          wireframe
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Glowing rings orbiting the sphere core
function OrbitingRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.05;
      groupRef.current.rotation.x = time * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Cyan Ring */}
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[2.0, 0.015, 12, 80]} />
        <meshBasicMaterial
          color="#00f3ff"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Outer Purple Ring */}
      <mesh rotation={[-Math.PI / 2.4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.2, 0.01, 12, 80]} />
        <meshBasicMaterial
          color="#bc13fe"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function Creative3DScene() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isIdle, setIsIdle] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastMoveTime = useRef(Date.now());

  // Track mouse coordinates, handle clicks, and reset idle timer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
      lastMoveTime.current = Date.now();
      setIsIdle(false);
    };

    const handleDown = () => {
      setIsCollapsed(true);
    };
    const handleUp = () => {
      setIsCollapsed(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchstart", handleDown);
    window.addEventListener("touchend", handleUp);

    // Watcher interval to toggle idle status after 2.5 seconds
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTime.current > 2500) {
        setIsIdle(true);
      }
    }, 300);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchstart", handleDown);
      window.removeEventListener("touchend", handleUp);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="three-webgl-canvas-wrap" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />

        {/* Immersive core Hoberman particle sphere with collapse states */}
        <CyberSphere isIdle={isIdle} isCollapsed={isCollapsed} mouse={mouse} />

        {/* Floating cyber orbit rings */}
        <OrbitingRings />

        {/* Interactive orbital drag controls */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>

      {/* Cybernetic HUD Status Overlay (Awwwards Polish) */}
      <div className="hud-interactive-status">
        <span className={`hud-pulse-dot ${isCollapsed ? "active" : isIdle ? "idle" : "active"}`}></span>
        <span className="hud-status-text">
          {isCollapsed
            ? "STATUS: COMPRESSION_CORE - HYPER_VORTEX_SPIN ENGAGED"
            : isIdle
              ? "STATUS: COLD_BREATH - MATHEMATICAL SWIRL RUNNING..."
              : "STATUS: INTERACTIVE - CONNECTED_TILT_ENGAGED"}
        </span>
      </div>
    </div>
  );
}

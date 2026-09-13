"use client";
import { Suspense, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import FilmStripCard from "./FilmStripCard";

interface Project {
  title: string;
  desc: string;
  fullDesc: string;
  tech: string;
  image: string;
  link: string;
}

interface FilmSceneProps {
  projects: Project[];
  onSelectProject: (proj: Project) => void;
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    isDragging: boolean;
    lastX: number;
    velocity: number;
    dragDistance: number;
  }>;
  progressRef: React.RefObject<HTMLDivElement | null>;
}

// Concentric 3D Tilted Ecliptic Orbital Rings cutting across space
function CelestialOrbits3D() {
  const orbits = useMemo(() => {
    const createEllipsePoints = (rx: number, ry: number, count: number) => {
      const pts = [];
      for (let i = 0; i <= count; i++) {
        const theta = (i / count) * Math.PI * 2;
        pts.push(new THREE.Vector3(rx * Math.cos(theta), 0, ry * Math.sin(theta)));
      }
      return new THREE.BufferGeometry().setFromPoints(pts);
    };

    return [
      { geom: createEllipsePoints(8.8, 3.9, 160), color: "#e6f0ff", opacity: 0.65 },
      { geom: createEllipsePoints(10.8, 4.8, 160), color: "#9dbef0", opacity: 0.38 },
      { geom: createEllipsePoints(6.6, 2.9, 120), color: "#ffd8a8", opacity: 0.5 },
    ];
  }, []);

  // Graduation tick marks along the primary orbit
  const ticksGeometry = useMemo(() => {
    const pts = [];
    const rx = 8.8;
    const ry = 3.9;
    for (let i = 0; i < 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      pts.push(rx * Math.cos(theta), 0, ry * Math.sin(theta));
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geom;
  }, []);

  return (
    <group position={[0, -0.35, -0.6]} rotation={[0.26, 0, -0.06]}>
      {orbits.map((orb, i) => (
        <lineLoop key={i} geometry={orb.geom}>
          <lineBasicMaterial color={orb.color} transparent opacity={orb.opacity} />
        </lineLoop>
      ))}
      <points geometry={ticksGeometry}>
        <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.8} />
      </points>
    </group>
  );
}

// Relativistic shooting cosmic dust particle streaks with velocity trails
function RelativisticStreaks3D({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    isDragging: boolean;
    lastX: number;
    velocity: number;
    dragDistance: number;
  }>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 130;

  const [positions, colors, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8 - 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1.2;

      // Warm amber stars near bottom & mid-left, cyan-white elsewhere
      const isWarm = pos[i * 3 + 1] < 0 && Math.random() > 0.45;
      if (isWarm) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.78 + Math.random() * 0.18;
        col[i * 3 + 2] = 0.48;
      } else {
        col[i * 3] = 0.52 + Math.random() * 0.4;
        col[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        col[i * 3 + 2] = 1.0;
      }

      vel[i] = 0.06 + Math.random() * 0.14;
    }

    return [pos, col, vel];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    const dragInfluence = scrollRef.current.isDragging
      ? scrollRef.current.velocity * 10
      : 0;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += (velocities[i] + dragInfluence) * 45 * delta;
      if (arr[i * 3] > 14) {
        arr[i * 3] = -14;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 8 - 0.4;
      } else if (arr[i * 3] < -14) {
        arr[i * 3] = 14;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Inner component to access R3F's useFrame loop for camera parallax
function CameraParallax() {
  useFrame((state) => {
    // Disable camera parallax on mobile / touch viewports
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.08);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, 0.08);
      state.camera.lookAt(0, 0, -3.2);
      return;
    }

    // Elegant mouse cursor parallax shifting the camera view
    const targetX = state.pointer.x * 1.3;
    const targetY = state.pointer.y * 0.8;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.08);

    state.camera.lookAt(0, 0, -3.2);
  });

  return null;
}

export default function FilmScene({ projects, onSelectProject, scrollRef, progressRef }: FilmSceneProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useFrame((_, delta) => {
    // 1. Auto-spin and drag velocity damping inside the frame loop
    if (!scrollRef.current.isDragging) {
      scrollRef.current.target += delta * 0.035;

      if (Math.abs(scrollRef.current.velocity) > 0.0001) {
        scrollRef.current.target += scrollRef.current.velocity;
        scrollRef.current.velocity *= 0.95; // apply friction
      }
    }

    // 2. Smoothly interpolate current to target
    scrollRef.current.current = THREE.MathUtils.lerp(
      scrollRef.current.current,
      scrollRef.current.target,
      0.1
    );

    // 3. Directly update loop progress bar width without React re-renders
    if (progressRef.current) {
      const MathPI2 = Math.PI * 2;
      const rawOffset = scrollRef.current.current;
      const progress = (((rawOffset % MathPI2) + MathPI2) % MathPI2) / MathPI2;
      progressRef.current.style.width = `${progress * 100}%`;
    }
  });

  return (
    <>
      {/* 1. Deep Space Cosmic Lighting matching Image 2 */}
      <ambientLight intensity={0.4} color="#0c1220" />
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#dbeafe" />

      {/* Warm golden/amber nebula light on top-left */}
      <pointLight position={[-7, 5, 2]} intensity={2.8} color="#f0a868" distance={20} />

      {/* Cool celestial cyan/blue light on top-right */}
      <pointLight position={[7, 4, 1]} intensity={2.5} color="#4fb8e0" distance={20} />

      {/* 2. Concentric 3D Tilted Ecliptic Orbital Rings */}
      <CelestialOrbits3D />

      {/* 3. Relativistic Cosmic Particle Streaks */}
      <RelativisticStreaks3D scrollRef={scrollRef} />

      {/* 4. Cyber-Glass Obsidian Tablet Group */}
      <Suspense fallback={null}>
        <group position={[0, 0.08, 0]}>
          {projects.map((proj, idx) => (
            <FilmStripCard
              key={idx}
              {...proj}
              index={idx}
              totalItems={projects.length}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              onSelect={() => onSelectProject(proj)}
              scrollRef={scrollRef}
            />
          ))}
        </group>
      </Suspense>

      {/* 5. Mouse Parallax Controller */}
      <CameraParallax />
    </>
  );
}

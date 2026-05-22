"use client";
import { Suspense, useState } from "react";
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

// Inner component to access R3F's useFrame loop for camera parallax
function CameraParallax() {
  useFrame((state) => {
    // Elegant mouse cursor parallax shifting the camera view
    const targetX = state.pointer.x * 1.5;
    const targetY = state.pointer.y * 1.0;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.08);
    
    // Look slightly deeper into the curved center of the film roll
    state.camera.lookAt(0, 0, -3.2);
  });

  return null;
}

export default function FilmScene({ projects, onSelectProject, scrollRef, progressRef }: FilmSceneProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useFrame((state, delta) => {
    // 1. Auto-spin and drag velocity damping inside the frame loop
    if (!scrollRef.current.isDragging) {
      // Gentle auto-spin speed
      scrollRef.current.target += delta * 0.04;
      
      // Decay velocity/inertia from drag
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
      {/* 1. Cinematic Stage Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 10, 5]} intensity={0.4} />
      
      {/* Ambient glowing accent light spheres in 3D space */}
      <pointLight position={[-6, 4, -4]} intensity={2} color="#bc13fe" distance={15} />
      <pointLight position={[6, -4, -4]} intensity={2} color="#00f3ff" distance={15} />

      {/* 2. Film Strip Group */}
      <Suspense fallback={null}>
        <group position={[0, 0.15, 0]}>
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

      {/* 3. Mouse Parallax Controller */}
      <CameraParallax />
    </>
  );
}

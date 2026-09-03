"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface FilmStripCardProps {
  title: string;
  desc: string;
  image: string;
  link: string;
  tech: string;
  index: number;
  totalItems: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  onSelect: () => void;
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    isDragging: boolean;
    lastX: number;
    velocity: number;
    dragDistance: number;
  }>;
}

export default function FilmStripCard({
  image,
  index,
  totalItems,
  hoveredIndex,
  setHoveredIndex,
  onSelect,
  scrollRef,
}: FilmStripCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const backingMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const imageMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const [localHovered, setLocalHovered] = useState(false);

  // Load project texture using Drei's useTexture utility
  const texture = useTexture(image);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;

  // Cylindrical curve parameters
  const R = 7.5; // Radius of the curved film strip
  const spacing = (2 * Math.PI) / totalItems; // Angle spacing (in radians) between cards (fully looping circle)
  
  // Procedural fragment shader for a holographic HUD panel backing — a
  // "satellite array" frame instead of a 35mm film strip, echoing the same
  // targeting-reticle corner brackets used on the About cards so the two
  // sections read as one consistent sci-fi system rather than two styles.
  const filmBackingShader = {
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      uniform float uHover;

      void main() {
        // Deep-space panel base, lifts slightly brighter on hover
        vec3 baseColor = mix(vec3(0.043, 0.043, 0.07), vec3(0.075, 0.075, 0.12), uHover);
        vec3 accent = vec3(0.0, 0.953, 1.0); // cyan — matches --accent-cyan

        // Thin outer frame line
        float edge = 0.014;
        bool onEdge = vUv.x < edge || vUv.x > 1.0 - edge || vUv.y < edge || vUv.y > 1.0 - edge;

        // HUD corner brackets — L-shaped marks at each corner, same motif
        // as the About section's .about-spatial-card::after brackets
        float cSize = 0.14;
        float cThick = 0.016;
        bool nearLeft   = vUv.x < cSize;
        bool nearRight  = vUv.x > 1.0 - cSize;
        bool nearBottom = vUv.y < cSize;
        bool nearTop    = vUv.y > 1.0 - cSize;
        bool onCornerH = (vUv.y < cThick || vUv.y > 1.0 - cThick) && (nearLeft || nearRight);
        bool onCornerV = (vUv.x < cThick || vUv.x > 1.0 - cThick) && (nearBottom || nearTop);
        bool onCorner = onCornerH || onCornerV;

        vec3 finalColor = baseColor;
        if (onCorner) {
          finalColor = mix(accent * 0.55, accent, uHover);
        } else if (onEdge) {
          finalColor = mix(vec3(0.18, 0.18, 0.24), accent * 0.7, uHover * 0.5);
        }

        gl_FragColor = vec4(finalColor, uOpacity);
      }
    `
  };

  useFrame(() => {
    if (!meshRef.current) return;

    // 1. Calculate cylindrical coordinate based on scrolling (infinite loop)
    const scrollOffset = scrollRef.current.current; 
    
    const baseAngle = index * spacing;
    const rawAngle = baseAngle - scrollOffset;

    // Seamless wrapping math to keep theta in [-PI, PI] range
    const totalRange = Math.PI * 2;
    const halfRange = Math.PI;
    
    let theta = ((rawAngle + halfRange) % totalRange);
    if (theta < 0) theta += totalRange;
    theta -= halfRange;

    // Apply cylindrical math receding into depth (Z)
    const x = R * Math.sin(theta);
    const z = R * (Math.cos(theta) - 1.0);
    
    // Smoothly lerp towards curved coordinate
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, x, 0.15);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, z, 0.15);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, -theta, 0.15);

    // 2. Smoothly animate scales on Hover
    const targetScale = localHovered ? 1.14 : 1.0;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15);
    meshRef.current.scale.set(newScale, newScale, newScale);

    // 3. Smoothly animate opacity/brightness dimming when other cards are hovered
    const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
    const targetOpacity = isOtherHovered ? 0.35 : 1.0;
    
    if (backingMaterialRef.current) {
      backingMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        backingMaterialRef.current.uniforms.uOpacity.value,
        targetOpacity,
        0.1
      );
      backingMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        backingMaterialRef.current.uniforms.uHover.value,
        localHovered ? 1.0 : 0.0,
        0.1
      );
    }
    if (imageMaterialRef.current) {
      imageMaterialRef.current.opacity = THREE.MathUtils.lerp(
        imageMaterialRef.current.opacity,
        targetOpacity,
        0.1
      );
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setLocalHovered(true);
        setHoveredIndex(index);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setLocalHovered(false);
        setHoveredIndex(null);
        document.body.style.cursor = "none";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (scrollRef.current.dragDistance < 8) {
          onSelect();
        }
      }}
    >
      {/* 1. Procedural HUD panel backing (holographic frame with corner brackets) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.5, 1.5]} />
        <shaderMaterial
          ref={backingMaterialRef}
          transparent
          depthWrite={false}
          vertexShader={filmBackingShader.vertexShader}
          fragmentShader={filmBackingShader.fragmentShader}
          uniforms={{
            uOpacity: { value: 1.0 },
            uHover: { value: 0.0 }
          }}
        />
      </mesh>

      {/* 2. Project Screenshot Image Plane (Centered inside the inner lines) */}
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[2.14, 1.02]} />
        <meshBasicMaterial
          ref={imageMaterialRef}
          map={texture}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

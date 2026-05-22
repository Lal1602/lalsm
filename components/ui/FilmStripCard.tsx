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
  title,
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
  
  // Custom procedural fragment shader for vector-quality perforated film holes
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
        // Base color: sleek cinematic charcoal grey, shifts slightly to lighter grey on hover
        vec3 baseColor = mix(vec3(0.15, 0.15, 0.16), vec3(0.22, 0.22, 0.24), uHover);
        
        // Procedural film perforated holes logic
        // Top zones: y in [0.89, 0.95], Bottom zones: y in [0.05, 0.11]
        // Hole width: 0.024, spacing: 0.065
        float repeatX = mod(vUv.x, 0.065);
        bool inHoleX = (repeatX > 0.02) && (repeatX < 0.045);
        bool inHoleY = (vUv.y > 0.05 && vUv.y < 0.11) || (vUv.y > 0.89 && vUv.y < 0.95);
        
        // If inside a perforation hole, discard the fragment (creates transparent punch-throughs)
        if (inHoleX && inHoleY) {
          discard;
        }

        // Inner film track lines (cinematic borders)
        bool innerLine = (vUv.y > 0.148 && vUv.y < 0.153) || (vUv.y > 0.847 && vUv.y < 0.852) ||
                         (vUv.x > 0.058 && vUv.x < 0.063) || (vUv.x > 0.937 && vUv.x < 0.942);
        
        vec3 finalColor = innerLine ? mix(vec3(0.25, 0.25, 0.28), vec3(0.95, 0.95, 0.95), uHover) : baseColor;

        gl_FragColor = vec4(finalColor, uOpacity);
      }
    `
  };

  useFrame((state, delta) => {
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
      {/* 1. Procedural Film Backing Sheet (White clip frame with perforated holes) */}
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

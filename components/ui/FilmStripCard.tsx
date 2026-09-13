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
  const glareMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const [localHovered, setLocalHovered] = useState(false);

  // Load project texture using Drei's useTexture utility
  const texture = useTexture(`/_next/image?url=${encodeURIComponent(image)}&w=640&q=75`);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;

  // Cylindrical curve parameters matching the cosmic orbit
  const R = 7.5; // Radius of the curved cosmic carousel
  const spacing = (2 * Math.PI) / totalItems; // Angle spacing between cards

  // Procedural shader for Cyber-Glass Obsidian Tablet with specular sheen and corner brackets
  const cyberTabletShader = {
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
        // Rounded rectangle SDF (Signed Distance Function)
        vec2 halfSize = vec2(0.485, 0.475);
        float radius = 0.032;
        vec2 d = abs(vUv - 0.5) - halfSize + radius;
        float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;

        if (dist > 0.0) {
          discard;
        }

        // Base obsidian glass color with soft cyan undertone
        vec3 baseColor = mix(vec3(0.045, 0.055, 0.075), vec3(0.08, 0.11, 0.15), uHover);

        // Chamfered / beveled perimeter glow
        float rim = smoothstep(0.0, -0.012, dist) - smoothstep(-0.012, -0.025, dist);
        vec3 rimColor = mix(vec3(0.35, 0.45, 0.55), vec3(0.0, 0.95, 1.0), uHover);

        // High-end diagonal specular glass reflection streak
        float diag = vUv.x * 0.72 + vUv.y * 0.68;
        float sheen1 = smoothstep(0.66, 0.70, diag) * (1.0 - smoothstep(0.70, 0.75, diag)) * 0.45;
        float sheen2 = smoothstep(0.78, 0.80, diag) * (1.0 - smoothstep(0.80, 0.83, diag)) * 0.25;
        float totalSheen = (sheen1 + sheen2) * (0.65 + 0.45 * uHover);

        // Micro-etched corner brackets: ⌜ ⌝ ⌞ ⌟
        bool isCornerTL = (vUv.x > 0.065 && vUv.x < 0.11 && abs(vUv.y - 0.915) < 0.003) ||
                          (vUv.y > 0.87 && vUv.y < 0.915 && abs(vUv.x - 0.065) < 0.003);
        bool isCornerTR = (vUv.x > 0.89 && vUv.x < 0.935 && abs(vUv.y - 0.915) < 0.003) ||
                          (vUv.y > 0.87 && vUv.y < 0.915 && abs(vUv.x - 0.935) < 0.003);
        bool isCornerBL = (vUv.x > 0.065 && vUv.x < 0.11 && abs(vUv.y - 0.085) < 0.003) ||
                          (vUv.y > 0.085 && vUv.y < 0.13 && abs(vUv.x - 0.065) < 0.003);
        bool isCornerBR = (vUv.x > 0.89 && vUv.x < 0.935 && abs(vUv.y - 0.085) < 0.003) ||
                          (vUv.y > 0.085 && vUv.y < 0.13 && abs(vUv.x - 0.935) < 0.003);
        bool isCorner = isCornerTL || isCornerTR || isCornerBL || isCornerBR;

        // Micro telemetry marks (bezel ticks & status line)
        bool tickTop = (abs(vUv.y - 0.955) < 0.003) && ((abs(vUv.x - 0.08) < 0.003) || (abs(vUv.x - 0.10) < 0.003));
        bool tickBottom = (abs(vUv.y - 0.045) < 0.002) && (vUv.x > 0.72 && vUv.x < 0.92);

        vec3 finalColor = baseColor;
        finalColor += rimColor * rim * 1.6;
        if (isCorner) {
          finalColor = mix(finalColor, vec3(0.3, 0.95, 1.0), 0.92);
        }
        if (tickTop || tickBottom) {
          finalColor = mix(finalColor, vec3(0.5, 0.85, 1.0), 0.75);
        }
        finalColor += vec3(0.85, 0.92, 1.0) * totalSheen;

        gl_FragColor = vec4(finalColor, uOpacity * 0.96);
      }
    `
  };

  // Glare overlay shader on top of the image plane
  const screenGlareShader = {
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uHover;
      uniform float uOpacity;

      void main() {
        float diag = vUv.x * 0.72 + vUv.y * 0.68;
        float sheen1 = smoothstep(0.66, 0.70, diag) * (1.0 - smoothstep(0.70, 0.75, diag)) * 0.28;
        float sheen2 = smoothstep(0.78, 0.80, diag) * (1.0 - smoothstep(0.80, 0.83, diag)) * 0.16;
        float total = (sheen1 + sheen2) * (0.7 + 0.35 * uHover);

        gl_FragColor = vec4(vec3(0.9, 0.96, 1.0), total * uOpacity);
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

    // Subtle celestial inclination
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.04, 0.1);

    // 2. Smoothly animate scale on Hover or when at front center
    const isFrontCenter = Math.abs(theta) < 0.18;
    const targetScale = localHovered ? 1.14 : isFrontCenter ? 1.04 : 0.98;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15);
    meshRef.current.scale.set(newScale, newScale, newScale);

    // 3. Smoothly animate opacity/brightness dimming when other cards are hovered
    const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
    const targetOpacity = isOtherHovered ? 0.32 : isFrontCenter ? 1.0 : 0.78;

    if (backingMaterialRef.current) {
      backingMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        backingMaterialRef.current.uniforms.uOpacity.value,
        targetOpacity,
        0.1
      );
      backingMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        backingMaterialRef.current.uniforms.uHover.value,
        localHovered || isFrontCenter ? 1.0 : 0.0,
        0.1
      );
    }
    if (glareMaterialRef.current) {
      glareMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        glareMaterialRef.current.uniforms.uOpacity.value,
        targetOpacity,
        0.1
      );
      glareMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        glareMaterialRef.current.uniforms.uHover.value,
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
      {/* 1. Cyber-Glass Obsidian Tablet Frame with Bevel & Sheen */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.52, 1.48]} />
        <shaderMaterial
          ref={backingMaterialRef}
          transparent
          depthWrite={false}
          vertexShader={cyberTabletShader.vertexShader}
          fragmentShader={cyberTabletShader.fragmentShader}
          uniforms={{
            uOpacity: { value: 1.0 },
            uHover: { value: 0.0 },
          }}
        />
      </mesh>

      {/* 2. Project Screenshot Image Plane (Recessed neatly inside the tablet glass) */}
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[2.18, 1.22]} />
        <meshBasicMaterial
          ref={imageMaterialRef}
          map={texture}
          transparent
          toneMapped={false}
        />
      </mesh>

      {/* 3. Specular Glass Glare Overlay on top of the screenshot for hyper-realism */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.18, 1.22]} />
        <shaderMaterial
          ref={glareMaterialRef}
          transparent
          depthWrite={false}
          vertexShader={screenGlareShader.vertexShader}
          fragmentShader={screenGlareShader.fragmentShader}
          uniforms={{
            uHover: { value: 0.0 },
            uOpacity: { value: 1.0 },
          }}
        />
      </mesh>
    </group>
  );
}

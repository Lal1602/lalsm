"use client";
import { useEffect, useRef } from "react";
import horizonScrollState from "@/lib/horizonScrollState";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let renderer: import("three").WebGLRenderer | null = null;

    async function init() {
      const THREE = await import("three");
      if (!containerRef.current) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.002);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Starfield
      const particlesCount = 6000;
      const posArray = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
      }
      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04,
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      // Floating shapes
      const geometry = new THREE.IcosahedronGeometry(0.5, 0);
      const shapeMaterial = new THREE.MeshBasicMaterial({
        color: 0xbc13fe,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
      });
      const shapesCount = 50;
      const shapesMesh = new THREE.InstancedMesh(geometry, shapeMaterial, shapesCount);
      const dummy = new THREE.Object3D();
      const shapeData: { x: number; y: number; z: number; rotSpeedX: number; rotSpeedY: number; floatSpeed: number; timeOffset: number }[] = [];

      for (let i = 0; i < shapesCount; i++) {
        dummy.position.set(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 15 - 5
        );
        dummy.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        const scale = Math.random() * 0.8 + 0.2;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        shapesMesh.setMatrixAt(i, dummy.matrix);
        shapeData.push({
          x: dummy.position.x,
          y: dummy.position.y,
          z: dummy.position.z,
          rotSpeedX: (Math.random() - 0.5) * 0.005,
          rotSpeedY: (Math.random() - 0.5) * 0.005,
          floatSpeed: Math.random() * 0.003 + 0.001,
          timeOffset: Math.random() * 100,
        });
      }
      scene.add(shapesMesh);
      camera.position.z = 4;

      let mouseX = 0, mouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
      };
      document.addEventListener("mousemove", onMouseMove);

      const clock = new THREE.Clock();

      let currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      function updateThemeVisuals(themeStr: string) {
        if (themeStr === "light") {
          particlesMaterial.color.setHex(0x8a6ab0);
          particlesMaterial.opacity = 0.25;
          particlesMaterial.blending = THREE.NormalBlending;

          shapeMaterial.color.setHex(0x8a6ab0);
          shapeMaterial.opacity = 0.03;
          shapeMaterial.blending = THREE.NormalBlending;

          if (scene.fog) {
            (scene.fog as import("three").FogExp2).color.setHex(0xe8e8ec);
          }
        } else {
          particlesMaterial.color.setHex(0x00f3ff);
          particlesMaterial.opacity = 0.5;
          particlesMaterial.blending = THREE.AdditiveBlending;

          shapeMaterial.color.setHex(0xbc13fe);
          shapeMaterial.opacity = 0.06;
          shapeMaterial.blending = THREE.AdditiveBlending;

          if (scene.fog) {
            (scene.fog as import("three").FogExp2).color.setHex(0x050505);
          }
        }
        particlesMaterial.needsUpdate = true;
        shapeMaterial.needsUpdate = true;
      }
      updateThemeVisuals(currentTheme);

      function animate() {
        animId = requestAnimationFrame(animate);
        
        const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
        if (activeTheme !== currentTheme) {
          currentTheme = activeTheme;
          updateThemeVisuals(activeTheme);
        }

        const elapsedTime = clock.getElapsedTime();
        // Calculate the effective scroll Y position for Three.js camera/particles mathematically.
        // This is stateless and perfectly handles scrolling down, scrolling up, and resizing.
        let effectiveScrollY = window.scrollY;
        const start = horizonScrollState.start;
        const end = horizonScrollState.end;

        let insideHorizonPin = false;
        if (start > 0 && end > 0) {
          if (window.scrollY < start) {
            // Above the horizontal showcase: normal scroll
            effectiveScrollY = window.scrollY;
          } else if (window.scrollY >= start && window.scrollY <= end) {
            // Pinned inside the showcase: freeze exactly at the entry point.
            // The Horizon section already layers its own WebGL/canvas
            // background (TubesCursor + BackgroundPixelStars) on top of this
            // one, and the camera/particles below are frozen anyway while
            // pinned — so skip the render entirely here instead of paying
            // for a frame nobody can see. Loop keeps running so it resumes
            // instantly once the user scrolls back out.
            insideHorizonPin = true;
            effectiveScrollY = start;
          } else {
            // Below the showcase: resume scrolling but offset the virtual horizontal scroll duration
            effectiveScrollY = window.scrollY - (end - start);
          }
        }
        if (insideHorizonPin) return;
        camera.position.z = 4 - effectiveScrollY * 0.0025;
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.z = effectiveScrollY * 0.0002;

        for (let i = 0; i < shapesCount; i++) {
          const data = shapeData[i];
          dummy.position.set(
            data.x + mouseX * 1.5,
            data.y + Math.sin(elapsedTime * data.floatSpeed + data.timeOffset) + mouseY * 1.5,
            data.z
          );
          dummy.rotation.set(elapsedTime * data.rotSpeedX, elapsedTime * data.rotSpeedY, 0);
          dummy.updateMatrix();
          shapesMesh.setMatrixAt(i, dummy.matrix);
        }
        shapesMesh.instanceMatrix.needsUpdate = true;
        renderer!.render(scene, camera);
      }
      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer!.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(animId);
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        if (renderer && containerRef.current) {
          try {
            containerRef.current.removeChild(renderer.domElement);
          } catch (e) {}
          renderer.dispose();
        }
      };
    }

    const cleanup = init();
    return () => { cleanup.then((fn) => fn && fn()); };
  }, []);

  return <div id="canvas-container" ref={containerRef}></div>;
}

"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;
    const spotlight = spotlightRef.current;
    if (!dot || !outline || !spotlight) return;

    const onMouseMove = (e: MouseEvent) => {
      const posX = e.clientX;
      const posY = e.clientY;

      spotlight.style.setProperty("--x", `${posX}px`);
      spotlight.style.setProperty("--y", `${posY}px`);

      dot.style.left = `${posX}px`;
      dot.style.top = `${posY}px`;

      outline.animate(
        { left: `${posX}px`, top: `${posY}px` },
        { duration: 500, fill: "forwards" }
      );
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      <div className="spotlight" ref={spotlightRef}></div>
      <div className="cursor-dot" data-cursor-dot ref={dotRef}></div>
      <div className="cursor-outline" data-cursor-outline ref={outlineRef}></div>
    </>
  );
}

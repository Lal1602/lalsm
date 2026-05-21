"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;
    const textNode = textRef.current;
    if (!dot || !outline || !textNode) return;

    // Use GSAP quickTo for ultra lag-free 60fps performance
    const xToDot = gsap.quickTo(dot, "left", { duration: 0.1, ease: "power3" });
    const yToDot = gsap.quickTo(dot, "top", { duration: 0.1, ease: "power3" });
    const xToOutline = gsap.quickTo(outline, "left", { duration: 0.4, ease: "power3" });
    const yToOutline = gsap.quickTo(outline, "top", { duration: 0.4, ease: "power3" });

    const onMouseMove = (e: MouseEvent) => {
      xToDot(e.clientX);
      yToDot(e.clientY);
      xToOutline(e.clientX);
      yToOutline(e.clientY);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle text overlays (e.g. data-cursor-text="VIEW")
      const textTrigger = target.closest<HTMLElement>("[data-cursor-text]");
      if (textTrigger) {
        const text = textTrigger.getAttribute("data-cursor-text");
        if (text) {
          textNode.innerText = text;
          outline.classList.add("cursor-active-text");
          dot.classList.add("cursor-active-text");
          return;
        }
      } else {
        outline.classList.remove("cursor-active-text");
        dot.classList.remove("cursor-active-text");
      }

      // Handle standard hover scaling
      const isHoverable = target.closest("a, button, [role='button'], .btn, .btn-quick-view, .ai-chat-toggle-btn");
      if (isHoverable) {
        outline.classList.add("cursor-active-hover");
        dot.classList.add("cursor-active-hover");
      } else {
        outline.classList.remove("cursor-active-hover");
        dot.classList.remove("cursor-active-hover");
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" data-cursor-dot ref={dotRef}></div>
      <div className="cursor-outline" data-cursor-outline ref={outlineRef}>
        <div className="cursor-text" ref={textRef}></div>
      </div>
    </>
  );
}

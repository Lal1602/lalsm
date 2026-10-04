"use client";
import { memo, useEffect, useRef, useState } from "react";
import { getSpaceRenderer, type SeamKind } from "@/lib/space/SpaceRenderer";
import { useLite } from "@/lib/lite";

interface SeamCanvasProps {
  kind: SeamKind;
  part: "upper" | "lower";
  /** Slot height in css px; must match the container's CSS height. */
  height: number;
  containerClass: string;
  canvasClass: string;
}

/**
 * One half of a nebula seam. It owns no drawing code: it hands its canvas to the
 * shared SpaceRenderer and tells it when the slot is on screen. Until the first
 * frame lands (or if WebGL is unavailable) the container's CSS gradient shows.
 */
function SeamCanvas({ kind, part, height, containerClass, canvasClass }: SeamCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const { lite } = useLite();

  // Flow, unless the visitor asked for calm: Lite and reduced-motion show one
  // still frame of the same nebula, so the look is identical, minus the motion.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => getSpaceRenderer().setAnimated(!(lite || mq.matches));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [lite]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const renderer = getSpaceRenderer();
    if (!renderer.init()) return; // the CSS fallback stays

    const slot = renderer.addSlot({
      canvas,
      kind,
      part,
      height,
      onReady: () => setReady(true),
    });

    const io = new IntersectionObserver(([entry]) => slot.update(entry.isIntersecting), {
      // Start a little early so the first frame is already there on arrival.
      rootMargin: "240px 0px",
    });
    io.observe(container);

    const ro = new ResizeObserver(() => slot.invalidate());
    ro.observe(container);

    return () => {
      io.disconnect();
      ro.disconnect();
      slot.remove();
    };
  }, [kind, part, height]);

  return (
    <div
      ref={containerRef}
      className={containerClass}
      data-ready={ready ? "true" : "false"}
      data-kind={kind}
      data-part={part}
      aria-hidden="true"
    >
      {/* A base wash in the seam's own colours, mirrored on both sides, so the two
          sections share a tone around the line instead of meeting at it. */}
      <div className="seam-tint" />
      <canvas ref={canvasRef} className={canvasClass} />
    </div>
  );
}

export default memo(SeamCanvas);

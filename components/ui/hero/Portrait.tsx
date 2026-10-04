"use client";
import Image from "next/image";
import { CROP } from "@/lib/hero/halftone";

/**
 * The portrait: one photograph, cut to a disc and printed as a field of dots (portraitField.ts). The
 * <img> is the portrait for assistive tech and what shows until the dots are ready or if they never
 * are; the canvas is decoration over it. The lens (`hx-pl`) is a window with a copy of the photograph,
 * moved by the pointer system the way the headline's lens is. The tilt wrapper is what the pointer
 * loop leans; the figure itself only positions.
 */
export default function Portrait({ name }: { name: string }) {
  // The crop is cropped to by position and size, not by a transform, which the entrance animates.
  const crop = {
    ["--crop-size" as string]: `${100 / CROP.s}%`,
    ["--crop-left" as string]: `${-((CROP.cx - CROP.s / 2) / CROP.s) * 100}%`,
    ["--crop-top" as string]: `${-((CROP.cy - CROP.s / 2) / CROP.s) * 100}%`,
  } as React.CSSProperties;
  return (
    <figure className="hx-portrait" style={crop}>
      <div className="hx-portrait-tilt">
        <div className="hx-portrait-in">
          <Image
            className="hx-photo"
            src="/mee.jpeg"
            alt={`Portrait of ${name}`}
            fill
            sizes="(max-width: 860px) 240px, 760px"
            priority
          />
        </div>
        <canvas className="hx-dots" aria-hidden="true" />
        <div className="hx-pl" aria-hidden="true">
          <div className="hx-pl-win">
            <div className="hx-pl-copy">
              <canvas className="hx-pl-photo" />
            </div>
          </div>
          <div className="hx-pl-ring">
            <i className="hx-lens-tick hx-lens-tick-n" />
            <i className="hx-lens-tick hx-lens-tick-e" />
            <i className="hx-lens-tick hx-lens-tick-s" />
            <i className="hx-lens-tick hx-lens-tick-w" />
            <i className="hx-lens-cross hx-lens-cross-h" />
            <i className="hx-lens-cross hx-lens-cross-v" />
            <span className="hx-pl-label">LUM 000</span>
          </div>
        </div>
      </div>
    </figure>
  );
}

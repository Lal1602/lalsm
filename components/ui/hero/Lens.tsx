"use client";
import Headline from "./Headline";

/**
 * The viewfinder over the headline. Its parts are positioned by the pointer loop (pointer.ts):
 * the window holds a lit copy of the headline and shows only the part inside the ring, and the ring
 * carries the tick marks, the crosshair and a readout of where the pointer is. Rendered only when
 * the visitor's device and settings will drive it, so it is not in the server's HTML.
 */
export default function Lens() {
  return (
    <div className="hx-lens" aria-hidden="true">
      <div className="hx-lens-win">
        <div className="hx-lens-copy">
          <Headline lit />
        </div>
      </div>
      <div className="hx-lens-ring">
        <i className="hx-lens-tick hx-lens-tick-n" />
        <i className="hx-lens-tick hx-lens-tick-e" />
        <i className="hx-lens-tick hx-lens-tick-s" />
        <i className="hx-lens-tick hx-lens-tick-w" />
        <i className="hx-lens-cross hx-lens-cross-h" />
        <i className="hx-lens-cross hx-lens-cross-v" />
        <span className="hx-lens-label">X 0000 Y 0000</span>
      </div>
    </div>
  );
}

"use client";

/** The four corner ticks of the viewfinder frame. */
export function Corners() {
  return (
    <>
      <i className="hx-tick hx-tick-tl" aria-hidden="true" />
      <i className="hx-tick hx-tick-tr" aria-hidden="true" />
      <i className="hx-tick hx-tick-bl" aria-hidden="true" />
      <i className="hx-tick hx-tick-br" aria-hidden="true" />
    </>
  );
}

const TICKS = 25;

/** A vertical ruler down the left edge: a tick every step, a longer one every fifth. */
export function Ruler() {
  return (
    <div className="hx-ruler" aria-hidden="true">
      {Array.from({ length: TICKS }, (_, i) => (
        <i key={i} data-major={i % 5 === 0 || undefined} />
      ))}
      {/* Walks down the ruler as the page scrolls (scrollOut.ts). */}
      <span className="hx-ruler-mark" />
    </div>
  );
}

/** Scroll cue: a hairline with a point that travels down it. */
export function Cue() {
  return (
    <a className="hx-cue" href="#about" aria-label="Scroll to About">
      <span className="hx-cue-label" aria-hidden="true">
        Scroll
      </span>
      <span className="hx-cue-line" aria-hidden="true">
        <i />
      </span>
    </a>
  );
}

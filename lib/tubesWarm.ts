/**
 * The Horizon's tube background (a Three.js scene with a bloom pass) only renders while it is on
 * screen, so its first frame (pipeline creation, render targets, shader compile) used to land on
 * the frame the visitor scrolled into the Playground. TubesCursor draws one frame while still
 * off screen and reports it here; the warm-up pipeline holds the preloader for that, so the
 * hitch happens behind the preloader instead.
 */

let settle: () => void = () => {};
const warmed = new Promise<void>((resolve) => {
  settle = resolve;
});

/** Resolves once the tubes have drawn their first frame (or will never need to: failed, unmounted). */
export function whenTubesWarmed(): Promise<void> {
  return warmed;
}

export function markTubesWarmed(): void {
  settle();
}

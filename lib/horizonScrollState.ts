/**
 * horizonScrollState — module-level singleton
 *
 * Shared mutable state between GSAPEffects (writer) and ThreeBackground (reader).
 *
 * Rather than tracking enter/leave state history (which is buggy when scrolling
 * rapidly up and down), we store the absolute ScrollTrigger boundaries.
 * ThreeBackground then calculates the camera position mathematically based on scroll position.
 */
const horizonScrollState = {
  start: 0,
  end: 0,
};

export default horizonScrollState;

/**
 * horizonScrollState — module-level singleton
 *
 * Shared mutable state between GSAPEffects (writer) and ThreeBackground + CvTimelineSlide (readers).
 *
 * Rather than tracking enter/leave state history (which is buggy when scrolling
 * rapidly up and down), we store the absolute ScrollTrigger boundaries.
 * ThreeBackground then calculates the camera position mathematically based on scroll position.
 *
 * progress: normalized 0–1 value of the horizontal ScrollTrigger, updated every frame.
 * onProgressUpdate: optional callback registered by CvTimelineSlide to receive per-frame updates.
 */
const horizonScrollState = {
  start: 0,
  end: 0,
  progress: 0,
  onProgressUpdate: null as ((progress: number) => void) | null,
};

export default horizonScrollState;

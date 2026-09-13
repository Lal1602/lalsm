/**
 * horizonScrollState — module-level singleton
 *
 * Shared mutable state between GSAPEffects (writer) and the readers inside the
 * Horizon section (CvTimelineSlide, HorizonHud, HorizonShowcase).
 *
 * Rather than tracking enter/leave state history (which is buggy when scrolling
 * rapidly up and down), we store the absolute ScrollTrigger boundaries.
 * Readers then calculate their own state mathematically from scroll position.
 *
 * progress: normalized 0–1 value of the horizontal ScrollTrigger, updated every frame.
 * subscribe(): register a per-frame listener; returns its unsubscribe function.
 *   Multiple readers need the same signal, so this replaced the old single
 *   `onProgressUpdate` callback slot (whoever mounted last used to win).
 */

type ProgressListener = (progress: number) => void;

const listeners = new Set<ProgressListener>();

const horizonScrollState = {
  start: 0,
  end: 0,
  progress: 0,

  subscribe(fn: ProgressListener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /** Called by GSAPEffects once per ScrollTrigger update. */
  emit(progress: number) {
    this.progress = progress;
    listeners.forEach((fn) => fn(progress));
  },
};

export default horizonScrollState;

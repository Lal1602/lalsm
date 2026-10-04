/**
 * Switching theme as ink spreading across the page: the new theme is revealed through a circle that
 * grows from the toggle (the View Transitions API: the browser holds the old page as a picture while
 * the new one is made, and the circle is a clip on the new picture). Where there is no such API, or
 * the visitor asked for calm (reduced motion, Lite), the theme simply changes.
 */
interface ViewTransitionLike {
  ready: Promise<void>;
}

const DURATION_MS = 900;

export function switchTheme(change: () => void, origin?: { x: number; y: number }): void {
  const doc = document as Document & { startViewTransition?: (update: () => void) => ViewTransitionLike };
  const calm =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.getAttribute("data-lite") === "1";
  if (!doc.startViewTransition || calm) {
    change();
    return;
  }
  const x = origin?.x ?? window.innerWidth - 80;
  const y = origin?.y ?? 40;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = doc.startViewTransition(change);
  void transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: DURATION_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => undefined);
}

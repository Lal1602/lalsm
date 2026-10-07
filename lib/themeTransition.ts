/**
 * Switching theme as ink spreading across the page: the new theme is revealed through a circle that
 * grows from the toggle (the View Transitions API: the browser holds the old page as a picture while
 * the new one is made, and the circle is a clip on the new picture). Where there is no such API, or
 * the visitor asked for calm (reduced motion, Lite), the theme simply changes.
 */
interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

const DURATION_MS = 900;

/**
 * While the theme is changing, `data-theme-switching` is on <html> and the stylesheet switches off every CSS
 * transition (C0-nav-and-theme.css). The page has a 0.4s colour transition on nearly every element, which is right
 * for a hover and wrong here: the new theme is captured the moment it is applied, and every element underneath
 * would otherwise spend the next 0.4s re-styling and re-painting itself on the way to a colour the picture already
 * shows. That, on thousands of elements at once, is what made the switch a slideshow.
 */
const SWITCHING = "data-theme-switching";

export function switchTheme(change: () => void, origin?: { x: number; y: number }): void {
  const doc = document as Document & { startViewTransition?: (update: () => void) => ViewTransitionLike };
  const root = document.documentElement;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-lite") === "1";

  root.setAttribute(SWITCHING, "");
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    root.removeAttribute(SWITCHING);
  };
  // Whatever happens, the switch is over after this.
  window.setTimeout(release, DURATION_MS + 1200);

  if (!doc.startViewTransition || calm) {
    change();
    // The change is applied in this frame; the transitions come back once it has been painted.
    requestAnimationFrame(() => requestAnimationFrame(release));
    return;
  }
  const x = origin?.x ?? window.innerWidth - 80;
  const y = origin?.y ?? 40;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = doc.startViewTransition(change);
  void transition.finished.then(release, release);
  void transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: DURATION_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => undefined);
}

/**
 * The hero leaving. No pinning and no scroll-jacking: as the page scrolls the hero up, its parts
 * leave at different speeds, so the section comes apart instead of simply sliding off.
 *
 *   the two headline lines drift apart (line 1 to the left, line 2 to the right)
 *   each letter lifts out and fades, a little later than the one before it
 *   the lede, the buttons and the kicker thin out first; the portrait lags behind the page
 *   the ruler fades and its marker walks down it with the scroll
 *
 * It writes the individual `translate` property and `opacity`, never `transform`: the pointer
 * system owns `transform` on the same letters, and the two compose instead of fighting.
 */

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

export function createScrollOut(root: HTMLElement): () => void {
  const q = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
  const letters = q("h1.hx-title .hx-ch, h1.hx-title .hx-stop");
  const lines = q("h1.hx-title .hx-line-in");
  const lede = q(".hx-lede");
  const actions = q(".hx-actions");
  const kicker = q(".hx-kicker");
  const portrait = q(".hx-portrait");
  const ruler = q(".hx-ruler");
  const mark = q(".hx-ruler-mark");
  const cue = q(".hx-cue");
  const orbit = q(".hx-orbit");
  const spec = q(".hx-spec");

  let raf = 0;
  let lastP = -1;
  let dirty = false;
  let disposed = false;

  const clear = () => {
    for (const el of [...letters, ...lines, ...lede, ...actions, ...kicker, ...portrait, ...ruler, ...mark, ...cue, ...orbit, ...spec]) {
      el.style.removeProperty("translate");
      el.style.removeProperty("opacity");
    }
    dirty = false;
  };

  const apply = () => {
    raf = 0;
    if (disposed) return;
    const rect = root.getBoundingClientRect();
    const height = rect.height || window.innerHeight;
    const p = clamp(-rect.top / height);
    if (p === lastP) return;
    lastP = p;

    // At the top, or back at the top: leave nothing behind.
    if (p <= 0) {
      if (dirty) clear();
      return;
    }
    dirty = true;

    const drift = p * window.innerWidth * 0.07;
    lines.forEach((el, i) => {
      el.style.translate = `${round(i === 0 ? -drift : drift)}px 0`;
    });

    letters.forEach((el, i) => {
      const u = clamp((p - i * 0.01) / 0.62);
      const e = u ** 1.7;
      el.style.translate = `0 ${round(-e * 110)}px`;
      el.style.opacity = String(round(1 - e, 3));
    });

    const thin = (el: HTMLElement[], by: number, rise: number) =>
      el.forEach((n) => {
        n.style.opacity = String(round(1 - clamp(p / by), 3));
        n.style.translate = `0 ${round(-p * rise)}px`;
      });
    thin(kicker, 0.25, 30);
    thin(lede, 0.35, 50);
    thin(actions, 0.3, 40);

    portrait.forEach((n) => {
      n.style.translate = `0 ${round(p * 90)}px`;
      n.style.opacity = String(round(1 - clamp((p - 0.35) / 0.55) * 0.7, 3));
    });

    ruler.forEach((n) => {
      n.style.opacity = String(round(1 - clamp(p / 0.4), 3));
    });
    mark.forEach((n) => {
      const track = (n.parentElement?.offsetHeight ?? 0) - 1;
      n.style.translate = `0 ${round(p * track)}px`;
    });
    cue.forEach((n) => {
      n.style.opacity = String(round(1 - clamp(p / 0.25), 3));
    });
    // The sheet fades with the headline it measures.
    spec.forEach((n) => {
      n.style.opacity = String(round(1 - clamp(p / 0.45), 3));
    });
    // The rings thin out and drift up more slowly than the page, so they seem to stay behind.
    orbit.forEach((n) => {
      n.style.opacity = String(round(1 - clamp(p / 0.7), 3));
      n.style.translate = `0 ${round(p * 140)}px`;
    });
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  apply();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    clear();
  };
}

function round(n: number, places = 2) {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

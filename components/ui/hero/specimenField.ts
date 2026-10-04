import { buildGuides, capRatioFrom, nearestGuide, type Guide } from "@/lib/hero/specimen";

/**
 * Runtime for the specimen guides (Specimen.tsx): measure the headline, place the hairlines on its
 * real cap heights and baselines, write the figures into their labels, and let the guide nearest the
 * pointer wake. Everything is measured, nothing is typed in: change the font size and the guides and
 * their labels follow.
 */

/** The y of a line's baseline in the hero, from layout alone (a zero-size inline box sits on it). */
function baselineOf(line: HTMLElement, root: HTMLElement): number {
  const probe = document.createElement("i");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;";
  const host = line.querySelector<HTMLElement>(".hx-line-in") ?? line;
  host.appendChild(probe);
  let y = 0;
  let node: HTMLElement | null = probe;
  while (node && node !== root) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  host.removeChild(probe);
  return y;
}

function leftOf(el: HTMLElement, root: HTMLElement): number {
  let x = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    node = node.offsetParent as HTMLElement | null;
  }
  return x;
}

function capRatio(fontSize: number, family: string): number {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 0.7;
  ctx.font = `700 ${fontSize}px ${family}`;
  const ratio = capRatioFrom(ctx.measureText("H").actualBoundingBoxAscent, fontSize);
  // A font that has not loaded measures the fallback; Space Grotesk's caps are 0.70 em.
  return ratio > 0.5 && ratio < 0.9 ? ratio : 0.7;
}

export function createSpecimenField(root: HTMLElement, options: { pointer: boolean }): () => void {
  const spec = root.querySelector<HTMLElement>(".hx-spec");
  const title = root.querySelector<HTMLElement>("h1.hx-title");
  const foot = root.querySelector<HTMLElement>(".hx-foot");
  if (!spec || !title) return () => {};
  const margin = spec.querySelector<HTMLElement>(".hx-margin");
  const els = Array.from(spec.querySelectorAll<HTMLElement>(".hx-guide"));
  const lines = Array.from(title.querySelectorAll<HTMLElement>(".hx-line"));
  let guides: Guide[] = [];
  let near = -1;
  let disposed = false;

  const measure = () => {
    if (disposed) return;
    const cs = getComputedStyle(title);
    const fontSize = parseFloat(cs.fontSize);
    const ratio = capRatio(fontSize, cs.fontFamily);
    guides = buildGuides(lines.map((l) => baselineOf(l, root)), fontSize, ratio);
    // The order of buildGuides (per line: cap, then base) is the order of the elements.
    els.forEach((el, i) => {
      const g = guides[i];
      if (!g) return;
      el.style.top = `${Math.round(g.y)}px`;
      const label = el.firstElementChild as HTMLElement | null;
      if (label && label.textContent !== g.label) label.textContent = g.label;
    });
    if (margin) {
      const first = title.querySelector<HTMLElement>(".hx-ch");
      const x = Math.round(first ? leftOf(first, root) : 0);
      margin.style.left = `${x}px`;
      // The labels end just short of the margin, so they never touch the headline or the ruler.
      spec.style.setProperty("--mx", `${x}px`);
      margin.style.bottom = `${foot ? foot.offsetHeight + (parseFloat(getComputedStyle(foot).marginTop) || 0) : 0}px`;
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || guides.length === 0) return;
    const y = e.clientY - root.getBoundingClientRect().top;
    const next = nearestGuide(y, guides, 46);
    if (next === near) return;
    near = next;
    els.forEach((el, i) => (i === next ? el.setAttribute("data-near", "") : el.removeAttribute("data-near")));
  };
  const onLeave = () => {
    near = -1;
    els.forEach((el) => el.removeAttribute("data-near"));
  };

  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(root);
  ro.observe(title);
  void document.fonts?.ready.then(measure);
  if (options.pointer) {
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });
  }

  return () => {
    disposed = true;
    ro.disconnect();
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    els.forEach((el) => el.removeAttribute("data-near"));
  };
}

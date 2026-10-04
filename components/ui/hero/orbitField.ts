import { RINGS, nearestRing, ringRadii, spinFromScroll } from "@/lib/hero/orbit";
import { layoutCentre } from "./layout";

/**
 * Runtime for the rings (Orbit.tsx):
 *
 *   place    centre them on the portrait's disc and size them to it
 *   pause    stop the turning while the hero is off screen (a CSS animation keeps running otherwise)
 *   spin     scrolling adds turn on top of the slow constant one, then it settles by itself; written as the
 *            individual `rotate` property, so it composes with the CSS animation's `transform`
 *   light    the ring nearest the pointer brightens
 *
 * `spin` and `light` are given up by `calm` visitors, who keep the rings still.
 */



export function createOrbitField(root: HTMLElement, options: { motion: boolean; pointer: boolean }): () => void {
  const orbit = root.querySelector<HTMLElement>(".hx-orbit");
  // The rings go round the portrait's disc: its centre, and its size, are what they are placed from.
  const disc = root.querySelector<HTMLElement>(".hx-portrait");
  const aside = root.querySelector<HTMLElement>(".hx-aside");
  const foot = root.querySelector<HTMLElement>(".hx-foot");
  if (!orbit || !disc) return () => {};
  const rings = Array.from(orbit.querySelectorAll<SVGElement>(".hx-ring"));

  const angle = rings.map(() => 0);
  let velocity = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let raf = 0;
  let visible = true;
  let disposed = false;
  let radii: number[] = [];
  let centre = { x: 0, y: 0 };

  const place = () => {
    const hero = root.getBoundingClientRect();
    centre = layoutCentre(disc, root);
    const sized = ringRadii(disc.offsetWidth / 2);
    orbit.style.setProperty("--ox", `${Math.round(centre.x)}px`);
    orbit.style.setProperty("--oy", `${Math.round(centre.y)}px`);
    orbit.style.setProperty("--orbit-r", `${Math.round(sized.boxHalf)}px`);
    // The rings stop at the hairline above the foot (it reads as their horizon), and keep clear of the
    // lede and the buttons: a quiet ellipse round them in which the rings fade out.
    if (foot) orbit.style.setProperty("--foot-h", `${Math.round(foot.offsetHeight)}px`);
    if (aside) {
      const a = aside.getBoundingClientRect();
      orbit.style.setProperty("--qx", `${Math.round(a.left - hero.left + a.width / 2)}px`);
      orbit.style.setProperty("--qy", `${Math.round(a.top - hero.top + a.height / 2)}px`);
      orbit.style.setProperty("--qrx", `${Math.round(a.width / 2 + 120)}px`);
      orbit.style.setProperty("--qry", `${Math.round(a.height / 2 + 90)}px`);
    }
    // Radii on screen, outermost first (the same order as RINGS).
    radii = sized.radii;
  };

  const write = () => {
    rings.forEach((el, i) => {
      el.style.rotate = angle[i] === 0 ? "" : `${Math.round(angle[i] * 100) / 100}deg`;
    });
  };

  const frame = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    // The extra turn decays by itself (it has to be a spin that settles, not one that is driven).
    const step = spinFromScroll(velocity) * (dt * 60);
    RINGS.forEach((spec, i) => {
      angle[i] += step * Math.sign(spec.period) * (spec.scale === 1 ? 1 : 1.4);
    });
    velocity *= Math.pow(0.04, dt);
    write();
    if (Math.abs(velocity) > 25) raf = requestAnimationFrame(frame);
    else velocity = 0;
  };

  const onScroll = () => {
    if (!options.motion || !visible) return;
    const now = performance.now();
    const dy = window.scrollY - lastY;
    const dt = Math.max(1, now - lastT);
    lastY = window.scrollY;
    // Smooth the instantaneous speed; a single wheel tick should not read as a fling.
    velocity = velocity * 0.6 + (dy / dt) * 1000 * 0.4;
    lastT = now;
    if (!raf) raf = requestAnimationFrame(frame);
  };

  let litIndex = -1;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !visible) return;
    const hero = root.getBoundingClientRect();
    const d = Math.hypot(e.clientX - hero.left - centre.x, e.clientY - hero.top - centre.y);
    const near = nearestRing(d, radii);
    const next = near && near.gap < 90 ? near.index : -1;
    if (next === litIndex) return;
    litIndex = next;
    rings.forEach((el, i) => (i === next ? el.setAttribute("data-lit", "") : el.removeAttribute("data-lit")));
  };
  const onLeave = () => {
    litIndex = -1;
    rings.forEach((el) => el.removeAttribute("data-lit"));
  };

  place();
  const ro = new ResizeObserver(place);
  ro.observe(root);
  ro.observe(disc);
  if (aside) ro.observe(aside);
  void document.fonts?.ready.then(() => {
    if (!disposed) place();
  });

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) orbit.removeAttribute("data-paused");
    else orbit.setAttribute("data-paused", "");
  });
  io.observe(root);

  window.addEventListener("scroll", onScroll, { passive: true });
  if (options.pointer) {
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    rings.forEach((el) => {
      el.style.rotate = "";
      el.removeAttribute("data-lit");
    });
  };
}

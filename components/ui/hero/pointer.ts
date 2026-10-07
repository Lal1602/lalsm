import { animate } from "motion/react";
import { formatClock, handAngles, jakartaTime } from "@/lib/hero/clock";
import { letterOffset, rulerScale } from "@/lib/hero/proximity";
import { atRest, stepSpring, type SpringState } from "@/lib/hero/spring";
import type { PortraitDots } from "./portraitField";

/**
 * The hero's pointer system: one listener and one requestAnimationFrame loop for everything that
 * answers the pointer. It writes transforms to leaf elements directly, so nothing here costs a React
 * render, and the loop sleeps when the pointer has left and everything has settled.
 *
 *   "full"    the lens, the letters leaning toward the pointer, the portrait's tilt, the ruler
 *   "lens"    the lens only (a device that is struggling)
 *   "direct"  the lens only, following the pointer exactly with no spring (reduced motion)
 *
 * The lens is a window the size of the ring that moves with the pointer, holding a lit copy of the
 * headline that moves the opposite way by the same amount, so the copy stays exactly over the real
 * headline while only the part inside the ring is shown. Both are plain translations, and both are
 * rounded to whole pixels so the copy's edges land on the real letters' edges.
 */

export type PointerMode = "full" | "lens" | "direct";

/**
 * The last place the mouse was seen, kept for the whole page. The pointer field is rebuilt when the
 * visitor's settings or the device's tier change; a mouse that is simply resting on the hero sends
 * no event for that, so the new field would not know it was there and the lens would vanish until
 * the mouse moved again.
 */
const lastSeen = { x: -1e4, y: -1e4, known: false };
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      lastSeen.x = e.clientX;
      lastSeen.y = e.clientY;
      lastSeen.known = true;
    },
    { passive: true, capture: true },
  );
}

const LETTER_SPRING = { stiffness: 190, damping: 18, mass: 0.8 };
const LENS_SPRING = { stiffness: 120, damping: 17, mass: 1 };
const TILT_SPRING = { stiffness: 170, damping: 17, mass: 0.7 };

const REST: SpringState = { x: 0, v: 0 };
/** How far beyond the headline's own extent the lens still appears, in px. */
const LENS_MARGIN = 110;
const LABEL_EVERY_MS = 80;

interface Letter {
  el: HTMLElement;
  lit: HTMLElement | null;
  cx: number;
  cy: number;
  /** Half the letter's width: how close the lens has to be for a letter that has something to show. */
  rad: number;
  x: SpringState;
  y: SpringState;
  r: SpringState;
  /** What was last written, so an unchanged letter costs no style write. */
  wx: number;
  wy: number;
  wr: number;
}

const round = (n: number, places = 2) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

export function createPointerField(root: HTMLElement, mode: PointerMode, portrait: PortraitDots | null = null): () => void {
  const q = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
  const frame = q(".hx-frame");
  const title = q("h1.hx-title");
  if (!frame || !title) return () => {};

  const lens = q(".hx-lens");
  const lensWin = q(".hx-lens-win");
  const lensCopy = q(".hx-lens-copy");
  const lensRing = q(".hx-lens-ring");
  const lensLabel = q(".hx-lens-label");
  const dial = q(".hx-lens .hx-dial");
  const tilt = q(".hx-portrait-tilt");
  const rulerEl = q(".hx-ruler");
  const ticks = Array.from(root.querySelectorAll<HTMLElement>(".hx-ruler i"));
  const full = mode === "full";

  const baseEls = Array.from(title.querySelectorAll<HTMLElement>(".hx-ch, .hx-stop"));
  const litEls = Array.from(root.querySelectorAll<HTMLElement>(".hx-title-lit .hx-ch, .hx-title-lit .hx-stop"));
  // The letters that carry a clock: the O (there is one in the headline).
  const dialLetters: Letter[] = [];
  const letters: Letter[] = baseEls.map((el, i) => ({
    el,
    lit: litEls[i] ?? null,
    cx: 0,
    cy: 0,
    rad: 0,
    x: REST,
    y: REST,
    r: REST,
    wx: 0,
    wy: 0,
    wr: 0,
  }));

  for (const L of letters) if (dial && L.el.textContent?.trim().toLowerCase() === "o") dialLetters.push(L);

  // Where the headline sits in the frame, from its letters (the h1 box is wider than its text).
  const extent = { l: 0, t: 0, r: 0, b: 0 };
  let tiltState = { rx: REST, ry: REST, tx: REST, ty: REST };
  const tickScale = ticks.map(() => 1);
  const lensPos = { x: { ...REST }, y: { ...REST }, placed: false };

  const ptr = { x: -1e4, y: -1e4, inside: false, ui: false };
  let raf = 0;
  let last = 0;
  let lastLabel = 0;
  let hot = false;
  let lensOn = false;
  let clockOn = false;
  let clockSynced = 0;
  let sweep: { stop: () => void } | null = null;
  let disposed = false;

  const measure = () => {
    const fr = frame.getBoundingClientRect();
    let l = Infinity;
    let t = Infinity;
    let r = -Infinity;
    let b = -Infinity;
    for (const L of letters) {
      const rect = L.el.getBoundingClientRect();
      // Take back what is currently applied (translation only; the tilt is a few degrees).
      L.cx = rect.left + rect.width / 2 - fr.left - L.x.x;
      L.cy = rect.top + rect.height / 2 - fr.top - L.y.x;
      L.rad = rect.width / 2;
      l = Math.min(l, rect.left - fr.left - L.x.x);
      r = Math.max(r, rect.right - fr.left - L.x.x);
      t = Math.min(t, rect.top - fr.top - L.y.x);
      b = Math.max(b, rect.bottom - fr.top - L.y.x);
    }
    extent.l = l;
    extent.r = r;
    extent.t = t;
    extent.b = b;
  };

  const setHot = (on: boolean) => {
    if (on === hot) return;
    hot = on;
    if (on) root.setAttribute("data-hot", "");
    else root.removeAttribute("data-hot");
  };

  /** The hands are set to the real time each time the dial wakes, and again every few seconds while it is awake. */
  const syncDial = (now: number, force = false) => {
    if (!dial || (!force && now - clockSynced < 8000)) return;
    clockSynced = now;
    const t = jakartaTime(new Date());
    const a = handAngles(t);
    dial.style.setProperty("--ck-h", `${round(a.hour)}deg`);
    dial.style.setProperty("--ck-m", `${round(a.minute)}deg`);
    // Written once per waking: the second hand's own animation carries it on from there, in step with the real one.
    if (force) dial.style.setProperty("--ck-s", String(round(t.s + t.ms / 1000, 3)));
  };

  const setClock = (on: boolean, now: number) => {
    if (on === clockOn || !lens) return;
    clockOn = on;
    if (on) {
      syncDial(now, true);
      lens.setAttribute("data-clock", "");
    } else lens.removeAttribute("data-clock");
  };

  const setLens = (on: boolean) => {
    if (on === lensOn || !lens) return;
    lensOn = on;
    if (!on && clockOn) setClock(false, 0);
    if (on) lensPos.placed = false;
    if (on) lens.setAttribute("data-on", "");
    else lens.removeAttribute("data-on");
  };

  const writeLetter = (L: Letter) => {
    const x = round(L.x.x);
    const y = round(L.y.x);
    const r = round(L.r.x);
    if (x === L.wx && y === L.wy && r === L.wr) return;
    L.wx = x;
    L.wy = y;
    L.wr = r;
    const t = x === 0 && y === 0 && r === 0 ? "" : `translate3d(${x}px,${y}px,0) rotate(${r}deg)`;
    L.el.style.transform = t;
    if (L.lit) L.lit.style.transform = t;
  };

  const tick = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;

    const fr = frame.getBoundingClientRect();
    const px = ptr.x - fr.left;
    const py = ptr.y - fr.top;
    let busy = ptr.inside;

    // ── The lens ──
    if (lens && lensWin && lensCopy && lensRing) {
      const near =
        ptr.inside &&
        !ptr.ui &&
        px > extent.l - LENS_MARGIN &&
        px < extent.r + LENS_MARGIN &&
        py > extent.t - LENS_MARGIN &&
        py < extent.b + LENS_MARGIN;
      setLens(near);
      if (near || lensOn) {
        const d = lensWin.offsetWidth || 160;
        if (!lensPos.placed) {
          lensPos.x = { x: px, v: 0 };
          lensPos.y = { x: py, v: 0 };
          lensPos.placed = true;
        }
        if (near) {
          if (mode === "direct") {
            lensPos.x = { x: px, v: 0 };
            lensPos.y = { x: py, v: 0 };
          } else {
            lensPos.x = stepSpring(lensPos.x, px, dt, LENS_SPRING);
            lensPos.y = stepSpring(lensPos.y, py, dt, LENS_SPRING);
          }
        }
        const X = Math.round(lensPos.x.x - d / 2);
        const Y = Math.round(lensPos.y.x - d / 2);
        const tr = title.getBoundingClientRect();
        const tx = Math.round(tr.left - fr.left);
        const ty = Math.round(tr.top - fr.top);
        const place = `translate3d(${X}px,${Y}px,0)`;
        lensWin.style.transform = place;
        lensRing.style.transform = place;
        lensCopy.style.transform = `translate3d(${tx - X}px,${ty - Y}px,0)`;
        // Over the O the lens finds a wall clock (it wakes at 0.8 of the letter's half width, and sleeps again beyond 1.15).
        if (dialLetters.length > 0) {
          let over = false;
          for (const L of dialLetters) {
            const dx = lensPos.x.x - (L.cx + L.x.x);
            const dy = lensPos.y.x - (L.cy + L.y.x);
            const r = L.rad * (clockOn ? 1.15 : 0.8);
            if (dx * dx + dy * dy < r * r) {
              over = true;
              break;
            }
          }
          setClock(near && over, now);
          if (clockOn) syncDial(now);
        }
        if (near && lensLabel && now - lastLabel > LABEL_EVERY_MS) {
          lastLabel = now;
          if (clockOn) {
            // The readout says the time it is showing, and what zone it is in.
            lensLabel.textContent = `WIB ${formatClock(jakartaTime(new Date()))}`;
          } else {
            const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");
            lensLabel.textContent = `X ${pad(ptr.x)}  Y ${pad(ptr.y)}`;
          }
        }
        if (near && mode !== "direct" && !(atRest(lensPos.x, px, 0.2) && atRest(lensPos.y, py, 0.2))) busy = true;
      }
    }

    // ── The portrait's lens (its own canvas; drawn only when it changes) ──
    if (portrait && portrait.drive(ptr.inside ? ptr.x : null, ptr.y, dt, { spring: mode !== "direct" })) busy = true;

    if (full) {
      // ── The letters ──
      for (const L of letters) {
        const o = ptr.inside ? letterOffset(px - L.cx, py - L.cy) : { x: 0, y: 0, r: 0 };
        L.x = stepSpring(L.x, o.x, dt, LETTER_SPRING);
        L.y = stepSpring(L.y, o.y, dt, LETTER_SPRING);
        L.r = stepSpring(L.r, o.r, dt, LETTER_SPRING);
        writeLetter(L);
        if (!(atRest(L.x, o.x) && atRest(L.y, o.y) && atRest(L.r, o.r))) busy = true;
      }

      // ── The portrait leans away from the pointer ──
      if (tilt) {
        const rr = root.getBoundingClientRect();
        const nx = ptr.inside ? Math.max(-1, Math.min(1, ((ptr.x - rr.left) / rr.width) * 2 - 1)) : 0;
        const ny = ptr.inside ? Math.max(-1, Math.min(1, ((ptr.y - rr.top) / rr.height) * 2 - 1)) : 0;
        tiltState = {
          ry: stepSpring(tiltState.ry, nx * 3, dt, TILT_SPRING),
          rx: stepSpring(tiltState.rx, -ny * 2, dt, TILT_SPRING),
          tx: stepSpring(tiltState.tx, -nx * 6, dt, TILT_SPRING),
          ty: stepSpring(tiltState.ty, -ny * 4, dt, TILT_SPRING),
        };
        const still =
          atRest(tiltState.ry, nx * 3) && atRest(tiltState.rx, -ny * 2) && atRest(tiltState.tx, -nx * 6) && atRest(tiltState.ty, -ny * 4);
        tilt.style.transform = still && !ptr.inside
          ? ""
          : `translate3d(${round(tiltState.tx.x)}px,${round(tiltState.ty.x)}px,0) rotateX(${round(tiltState.rx.x)}deg) rotateY(${round(tiltState.ry.x)}deg)`;
        if (!still) busy = true;
      }

      // ── The ruler: ticks grow toward the pointer's height ──
      if (rulerEl && ticks.length > 1) {
        const rect = rulerEl.getBoundingClientRect();
        const n = ticks.length;
        ticks.forEach((tk, i) => {
          const y = rect.top + (i / (n - 1)) * rect.height;
          const near = ptr.inside && Math.abs(ptr.x - rect.left) < 420;
          const target = near ? rulerScale(Math.abs(ptr.y - y)) : 1;
          const next = tickScale[i] + (target - tickScale[i]) * Math.min(1, dt * 14);
          const v = Math.abs(next - target) < 0.004 ? target : next;
          if (Math.abs(v - tickScale[i]) > 0.002 || (v === 1 && tickScale[i] !== 1)) {
            tickScale[i] = v;
            tk.style.transform = v === 1 ? "" : `scaleX(${round(v, 3)})`;
          }
          if (v !== target) busy = true;
        });
      }
    }

    if (busy) {
      raf = requestAnimationFrame(tick);
    } else {
      // Asleep: drop the layers and leave everything at rest.
      setHot(false);
      last = 0;
      if (full) letters.forEach((L) => {
        L.wx = L.wy = L.wr = 0;
        L.el.style.transform = "";
        if (L.lit) L.lit.style.transform = "";
      });
    }
  };

  const wake = () => {
    if (disposed) return;
    setHot(true);
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const onMove = (e: PointerEvent) => {
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    // Over a button or link the lens steps aside: it belongs to the headline.
    ptr.ui = !!(e.target as Element | null)?.closest?.("a, button");
    if (e.pointerType !== "mouse") {
      sweep?.stop();
      sweep = null;
    }
    if (!ptr.inside && e.pointerType === "mouse") ptr.inside = true;
    wake();
  };
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    ptr.inside = true;
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    wake();
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    ptr.inside = false;
    wake();
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    sweep?.stop();
    sweep = null;
    ptr.inside = true;
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    wake();
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    ptr.inside = false;
    wake();
  };

  root.addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerenter", onEnter, { passive: true });
  root.addEventListener("pointerleave", onLeave, { passive: true });
  root.addEventListener("pointerdown", onDown, { passive: true });
  root.addEventListener("pointerup", onUp, { passive: true });
  root.addEventListener("pointercancel", onUp, { passive: true });

  measure();
  // Taking over from a field that was just torn down: if the mouse is resting on the hero, carry on from there.
  if (lastSeen.known && root.matches(":hover")) {
    ptr.x = lastSeen.x;
    ptr.y = lastSeen.y;
    ptr.inside = true;
    wake();
  }
  const ro = new ResizeObserver(() => measure());
  ro.observe(frame);
  ro.observe(title);
  void document.fonts?.ready.then(() => {
    if (!disposed) measure();
  });

  // A touch screen has no hover: the lens takes one slow pass over the headline, then follows a finger.
  if (mode !== "direct" && window.matchMedia("(pointer: coarse)").matches) {
    const midA = () => (extent.t + (extent.b - extent.t) * 0.27);
    const midB = () => (extent.t + (extent.b - extent.t) * 0.73);
    const controls = animate(0, 1, {
      duration: 3.8,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (u) => {
        const fr = frame.getBoundingClientRect();
        const first = u < 0.5;
        const k = first ? u * 2 : (u - 0.5) * 2;
        const x = first ? extent.l + (extent.r - extent.l) * k : extent.r - (extent.r - extent.l) * k;
        ptr.x = fr.left + x;
        ptr.y = fr.top + (first ? midA() : midB());
        ptr.inside = true;
        wake();
      },
      onComplete: () => {
        ptr.inside = false;
        sweep = null;
        wake();
      },
    });
    sweep = { stop: () => controls.stop() };
  }

  return () => {
    disposed = true;
    sweep?.stop();
    cancelAnimationFrame(raf);
    ro.disconnect();
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerenter", onEnter);
    root.removeEventListener("pointerleave", onLeave);
    root.removeEventListener("pointerdown", onDown);
    root.removeEventListener("pointerup", onUp);
    root.removeEventListener("pointercancel", onUp);
    root.removeAttribute("data-hot");
    portrait?.release();
    lens?.removeAttribute("data-on");
    lens?.removeAttribute("data-clock");
    letters.forEach((L) => {
      L.el.style.transform = "";
      if (L.lit) L.lit.style.transform = "";
    });
    if (tilt) tilt.style.transform = "";
    ticks.forEach((t) => (t.style.transform = ""));
  };
}

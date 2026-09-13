"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createMachine, ease, register, wake, type MachineDef } from "@/lib/stateMachine";
import { TechMark } from "./techMarks";

gsap.registerPlugin(ScrollTrigger);

/**
 * AboutSection — "What I Build".
 *
 * Three disciplines, three bays, one idea each. The previous version stood the
 * same three systems up as full-width rows down the page. Correct for ranking,
 * but it cost two and a half viewports of scroll to say "here are three things
 * I do", and a first-time visitor had to scroll past all of it to reach the
 * work. Side by side, the whole answer is one screen.
 *
 * Columns invite a table read, so three things break the grid on purpose: the
 * tracks are unequal, the bodies step down the row, and the instrument is 46px
 * rather than the 128px iris that came before. One big dial repeated three
 * times is texture; three small different glyphs are a legend.
 *
 * One scanner serves all three bays — it slides to the bay under the pointer
 * and brings that system's colour with it, with a hotspot riding its lit edge
 * under the cursor. That travelling element is the whole interaction; every
 * other hover state is a colour or a few pixels of transform in support of it.
 *
 * Nothing is hidden behind hover: every word is readable at rest, which is what
 * keeps the block calm and what makes a pointer-only flourish acceptable.
 *
 * Perf: this page is compositing-bound, so nothing here uses filter,
 * backdrop-filter or an animated box-shadow, and the only JS on the hot path is
 * one rAF-batched pointermove that writes a single custom property. Geometry is
 * measured on mount and on resize, never while the pointer moves.
 */

type Tone = "cyan" | "violet" | "gold";

interface Bay {
  code: string;
  callsign: string;
  tone: Tone;
  glyph: "helm" | "reactor" | "probe";
  title: [string, string];
  brief: string;
  stack: string[];
}

const BAYS: Bay[] = [
  {
    code: "SYS-01",
    callsign: "HELM",
    tone: "cyan",
    glyph: "helm",
    title: ["Frontend", "Engineering"],
    brief:
      "The part you touch. Typed components, motion that carries meaning, and a frame budget I hold to on a mid-range phone.",
    stack: ["TypeScript", "React", "Next.js", "GSAP", "Three.js", "Tailwind"],
  },
  {
    code: "SYS-02",
    callsign: "REACTOR",
    tone: "violet",
    glyph: "reactor",
    title: ["Backend &", "DevOps"],
    brief:
      "The part you do not. Schema design, APIs that stay honest under load, and the pipelines that get them shipped.",
    stack: ["Node.js", "Laravel", "PHP", "MySQL", "PostgreSQL", "Docker"],
  },
  {
    code: "SYS-03",
    callsign: "PROBE",
    tone: "gold",
    glyph: "probe",
    title: ["Mobile &", "Game Dev"],
    brief:
      "Sent out past the browser. Cross-platform builds and hand-tuned game loops, where input latency is the whole experience.",
    stack: ["React Native", "Flutter", "Phaser.js", "Canvas API", "Figma"],
  },
];

/* ── Subsystem glyphs ──────────────────────────────────────────────────────
   Drawn rather than pulled from an icon set: each says something about its own
   bay, and they share the hairline weight of the Horizon star chart. */

function HelmGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="bay-glyph" aria-hidden="true">
      {/* Viewport brackets — the frame you compose inside */}
      <path d="M6 19V6h13M45 6h13v13M58 45v13H45M19 58H6V45" className="g-bracket" pathLength={1} />
      <circle cx="32" cy="32" r="13" className="g-hair" pathLength={1} />
      <path d="M32 14v6M32 44v6M14 32h6M44 32h6" className="g-hair" pathLength={1} />
      <rect x="29.5" y="29.5" width="5" height="5" className="g-solid" />
    </svg>
  );
}

function ReactorGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="bay-glyph" aria-hidden="true">
      {/* Containment vessel and its radial spokes */}
      <path d="M52 32 42 49.3H22L12 32l10-17.3h20z" className="g-hair" pathLength={1} />
      <path d="M42 32 37 40.7H27L22 32l5-8.7h10z" className="g-hair" pathLength={1} />
      <path d="M42 32h10M27 23.3 22 14.7M37 40.7l5 8.6" className="g-hair" pathLength={1} />
      <circle cx="32" cy="32" r="3" className="g-solid" />
    </svg>
  );
}

function ProbeGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="bay-glyph" aria-hidden="true">
      <circle cx="32" cy="32" r="11" className="g-hair" pathLength={1} />
      {/* Terminator — the lit limb of the body */}
      <path d="M32 21a11 11 0 0 1 0 22" className="g-arc" pathLength={1} />
      <ellipse cx="32" cy="32" rx="25" ry="10" className="g-hair" pathLength={1} transform="rotate(-24 32 32)" />
      <rect x="51.5" y="19.5" width="5" height="5" className="g-solid" transform="rotate(-24 54 22)" />
    </svg>
  );
}

const GLYPHS = { helm: HelmGlyph, reactor: ReactorGlyph, probe: ProbeGlyph } as const;

/* An SVG overlay filling the bay, carrying the trace from a charged label up to
   the instrument. One path per bay: only one label in a bay can be lit at a
   time, so there is never a second route to draw. */
function BayTrace() {
  return (
    <svg className="bay-trace" aria-hidden="true">
      <path className="bay-trace-line" pathLength={1} d="" />
      <circle className="bay-trace-node" r="2.5" cx="-10" cy="-10" />
    </svg>
  );
}

/* ── The bay instrument ────────────────────────────────────────────────────
   A blended state machine per bay, in the Rive sense: three named states, four
   channels moving together, and transitions gated on typed inputs.

   `dwell` is the load-bearing number input rather than decoration. It gates
   idle -> hover at 0.15, so a pointer merely crossing a bay on its way
   somewhere else never fires the turret, and it is multiplied into the ring so
   the instrument keeps settling for a moment after it arrives.

   `instant` collapses every duration to zero and drops the envelopes for
   reduced motion. The marks still change — that is information, not decoration
   — but nothing eases. */

const bayMachine = (instant: boolean): MachineDef => {
  const d = (ms: number) => (instant ? 0 : ms);
  return {
    initial: "idle",
    inputs: {
      hovered: { type: "boolean", value: false },
      held: { type: "boolean", value: false },
      dwell: { type: "number", value: 0 },
      press: { type: "trigger" },
      swap: { type: "trigger" },
      boot: { type: "trigger" },
    },
    states: {
      idle: { spin: 0, scale: 1, ring: 0, lift: 0 },
      hover: { spin: 72, scale: 1.06, ring: 0.55, lift: -2 },
      pressed: { spin: 84, scale: 0.94, ring: 0.95, lift: 1 },
    },
    pulses: instant
      ? {}
      : {
          press: { duration: 320 },
          swap: { duration: 420 },
          // Long enough to read as a start-up rather than a twitch.
          boot: { duration: 900 },
        },
    transitions: [
      {
        from: "idle",
        to: "hover",
        when: [
          { input: "hovered", op: "isTrue" },
          { input: "dwell", op: "gte", value: 0.15 },
        ],
        duration: d(260),
        ease: ease.power2Out,
      },
      {
        // Touch never reports a hover, so without this edge the pressed state
        // would be unreachable on a phone — the tap would swap the mark and
        // nothing else. Ordered after idle -> hover so a pointer still takes
        // the hover route.
        from: "idle",
        to: "pressed",
        when: [{ input: "held", op: "isTrue" }],
        duration: d(140),
        ease: ease.power2Out,
      },
      {
        from: "hover",
        to: "pressed",
        when: [{ input: "held", op: "isTrue" }],
        duration: d(90),
        ease: ease.power2Out,
      },
      {
        from: "pressed",
        to: "hover",
        when: [
          { input: "held", op: "isFalse" },
          { input: "hovered", op: "isTrue" },
        ],
        duration: d(300),
        ease: ease.power2Out,
      },
      {
        from: "*",
        to: "idle",
        when: [
          { input: "hovered", op: "isFalse" },
          { input: "held", op: "isFalse" },
        ],
        duration: d(420),
        ease: ease.power2InOut,
      },
    ],
  };
};

/* ── The label charge ──────────────────────────────────────────────────────
   The same three states again, one machine per label, so a pointer dragged
   along a row of labels leaves each one blending out of wherever it had got to
   rather than snapping back.

   No dwell gate on the way in — unlike the bay instrument, this is meant to
   answer the moment the pointer arrives. dwell is still a real input: it is a
   blend weight on the rule, which keeps brightening for a beat after the wipe
   has finished, so arriving and lingering do not look identical. */

const chipMachine = (instant: boolean): MachineDef => {
  const d = (ms: number) => (instant ? 0 : ms);
  return {
    initial: "idle",
    inputs: {
      hovered: { type: "boolean", value: false },
      held: { type: "boolean", value: false },
      dwell: { type: "number", value: 0 },
      press: { type: "trigger" },
    },
    states: {
      // pull is how much of the cursor's offset the label is allowed to follow;
      // it rises with the state so a label only leans once it is engaged.
      idle: { wipe: 0, rule: 0, lift: 0, pull: 0 },
      hover: { wipe: 1, rule: 1, lift: -2, pull: 1 },
      pressed: { wipe: 1, rule: 1, lift: 0, pull: 0.5 },
    },
    pulses: instant ? {} : { press: { duration: 280 } },
    transitions: [
      {
        from: "idle",
        to: "hover",
        when: [{ input: "hovered", op: "isTrue" }],
        duration: d(340),
        ease: ease.power2Out,
      },
      {
        from: "idle",
        to: "pressed",
        when: [{ input: "held", op: "isTrue" }],
        duration: d(140),
        ease: ease.power2Out,
      },
      {
        from: "hover",
        to: "pressed",
        when: [{ input: "held", op: "isTrue" }],
        duration: d(90),
        ease: ease.power2Out,
      },
      {
        from: "pressed",
        to: "hover",
        when: [
          { input: "held", op: "isFalse" },
          { input: "hovered", op: "isTrue" },
        ],
        duration: d(260),
        ease: ease.power2Out,
      },
      {
        from: "*",
        to: "idle",
        when: [
          { input: "hovered", op: "isFalse" },
          { input: "held", op: "isFalse" },
        ],
        duration: d(420),
        ease: ease.power2InOut,
      },
    ],
  };
};

export default function AboutSection() {
  const deckRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLSpanElement>(null);
  const hotRef = useRef<HTMLElement>(null);
  const outRef = useRef<HTMLSpanElement>(null);

  /* Cross-effect handshakes. The entrance owns .bay until it finishes, the
     instruments own it afterwards, and the demo needs to drive the scanner —
     which lives in a third effect. Refs rather than state: none of this should
     ever re-render the tree. */
  const entranceDone = useRef(false);
  const bootRef = useRef<(() => void) | null>(null);
  const scannerRef = useRef<{ enter: (i: number) => void; leave: () => void } | null>(null);
  const interacted = useRef(false);

  /* Entrance. Run here rather than through the global [data-scroll] pass so the
     band assembles as one movement — rail, then hairlines, then the bays.

     The entrance transform sits on .bay (the article) while the hover lift sits
     on .bay-body, deliberately: a GSAP tween and a CSS transition writing the
     same element's transform fight each other every frame. */
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const line = deck.querySelector<HTMLElement>(".bay-rail-line");
    const dividers = gsap.utils.toArray<HTMLElement>(".bay-divider", deck);
    const bays = gsap.utils.toArray<HTMLElement>(".bay", deck);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Everything else on this page shows its content immediately on mobile;
    // matching that keeps the section off a trigger that may never fire.
    const skip = reduced || window.matchMedia("(max-width: 768px)").matches;

    if (skip) {
      gsap.set(line, { scaleX: 1 });
      gsap.set(dividers, { scaleY: 1 });
      gsap.set(bays, { y: 0, opacity: 1 });
      // No entrance to wait for, so the instruments may take .bay immediately.
      entranceDone.current = true;
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: deck, start: "top 86%", once: true },
      // Handing .bay over here is what keeps the focus falloff and the parallax
      // from fighting this timeline for the same transform.
      onComplete: () => {
        entranceDone.current = true;
        bootRef.current?.();
      },
    });

    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(
        dividers,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" },
        0.12
      )
      .fromTo(
        bays,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.09, ease: "power3.out", clearProps: "opacity" },
        0.18
      );

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && tl.progress() === 0) {
              tl.play();
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(deck);
    }

    return () => {
      observer?.disconnect();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  /* The scanner. One element for three bays, so the only per-bay work is two
     custom properties and an attribute — the tone swaps in a single repaint
     rather than interpolating a full-height gradient across the slide. */
  useEffect(() => {
    const deck = deckRef.current;
    const row = rowRef.current;
    const scan = scanRef.current;
    const out = outRef.current;
    if (!deck || !row || !scan || !out) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const bays = Array.from(row.querySelectorAll<HTMLElement>(".bay"));
    let metrics: { x: number; w: number }[] = [];

    /* .bay-row is the offsetParent, so these are already row-relative. Read on
       mount, on resize, and once per hover session — never on the move path. */
    const measure = () => {
      metrics = bays.map((b) => ({ x: b.offsetLeft, w: b.offsetWidth }));
    };
    measure();

    // Guards the writes so crossing a bay's own children costs nothing.
    let active = -1;

    const enter = (i: number) => {
      if (i === active) return;
      const m = metrics[i];
      if (!m) return;
      active = i;

      scan.style.setProperty("--x", `${m.x}px`);
      scan.style.setProperty("--w", `${m.w}px`);
      deck.dataset.tone = BAYS[i].tone;
      deck.dataset.scanning = "";

      for (let n = 0; n < bays.length; n++) {
        if (n === i) bays[n].setAttribute("data-active", "");
        else bays[n].removeAttribute("data-active");
      }

      out.textContent = `SCANNING · ${BAYS[i].callsign}`;
    };

    const leave = () => {
      if (active === -1) return;
      active = -1;
      // data-tone is left alone so the scanner keeps its colour as it fades.
      delete deck.dataset.scanning;
      bays.forEach((b) => b.removeAttribute("data-active"));
      out.textContent = "STANDBY";
    };

    const onOver = (e: PointerEvent) => {
      const bay = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay");
      if (!bay) return;
      const i = bays.indexOf(bay);
      if (i !== -1) enter(i);
    };

    // pointerout fires at every child boundary, so only act on the crossing
    // that actually leaves the row.
    const onOut = (e: PointerEvent) => {
      const to = e.relatedTarget as Node | null;
      if (to && row.contains(to)) return;
      leave();
    };

    scannerRef.current = { enter, leave };

    row.addEventListener("pointerenter", measure);
    row.addEventListener("pointerover", onOver, { passive: true });
    row.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      scannerRef.current = null;
      row.removeEventListener("pointerenter", measure);
      row.removeEventListener("pointerover", onOver);
      row.removeEventListener("pointerout", onOut);
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* The hotspot riding the scanner's lit edge. One property, batched into a
     frame so a fast mouse cannot force a style write per event. */
  useEffect(() => {
    const row = rowRef.current;
    const hot = hotRef.current;
    if (!row || !hot) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let top = 0;
    let height = 0;
    let y = 0;

    const cache = () => {
      const r = row.getBoundingClientRect();
      top = r.top;
      height = r.height;
    };

    const write = () => {
      frame = 0;
      hot.style.setProperty("--hy", `${y.toFixed(1)}px`);
    };

    const onMove = (e: PointerEvent) => {
      y = Math.max(0, Math.min(height, e.clientY - top));
      if (!frame) frame = requestAnimationFrame(write);
    };

    /* The rect is cached on entry and refreshed only while the pointer is
       inside — otherwise a wheel scroll under a parked cursor drifts the
       hotspot away from it. */
    const onEnter = () => {
      cache();
      window.addEventListener("scroll", cache, { passive: true });
    };

    const onLeave = () => {
      window.removeEventListener("scroll", cache);
    };

    row.addEventListener("pointerenter", onEnter);
    row.addEventListener("pointerleave", onLeave);
    row.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      row.removeEventListener("pointerenter", onEnter);
      row.removeEventListener("pointerleave", onLeave);
      row.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", cache);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* Drives the three instruments. One machine per bay, one shared frame for all
     of them, and nothing scheduled at all once they settle.

     Writes land on .bay-mount — four descendants — never on .bay or .bay-body.
     ContactSection measured that setting an inherited custom property on a
     container invalidates style for every descendant beneath it at about 7ms a
     frame; the same trap here is thirty nodes deep. */
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const bays = Array.from(row.querySelectorAll<HTMLElement>(".bay"));
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const parts = bays.map((b) => {
      const mount = b.querySelector<HTMLElement>(".bay-mount");
      if (!mount) return null;
      return {
        mount,
        collar: mount.querySelector<SVGElement>(".bay-collar"),
        lock: mount.querySelector<SVGElement>(".mt-lock"),
        glyph: mount.querySelector<SVGElement>(".bay-glyph:not(.tech-mark)"),
        marks: Array.from(mount.querySelectorAll<SVGElement>(".tech-mark")),
      };
    });

    const machines = bays.map(() => createMachine(bayMachine(instant)));

    /* One machine per label. Seventeen of them would be wasteful to step every
       frame when at most one is moving, so only the unsettled ones are kept in
       the live set and the tick walks only that. */
    const chips = Array.from(row.querySelectorAll<HTMLElement>(".bay-chip")).map((el) => ({
      el,
      fill: el.querySelector<HTMLElement>(".chip-fill"),
      rule: el.querySelector<HTMLElement>(".chip-rule"),
      machine: createMachine(chipMachine(instant)),
      dwell: 0,
      hovering: false,
      lean: 0,
      cx: 0,
      half: 1,
    }));
    const chipOf = new Map(chips.map((c, i) => [c.el, i]));
    const live = new Set<number>();

    /* The depth drifts the three instruments, not the three bays.

       Parallaxing .bay itself was the obvious move and it was wrong: the bays
       carry the tech-stack rules, and drifting them at different rates pulls
       those three rules off the single line they were aligned to — measured at
       3-4px of spread where it had been exactly 0. Moving the drift onto
       .bay-mount leaves the type and the rules untouched and floats the
       instruments in front of them instead, which reads as more depth, not less.

       .bay is still shared between the entrance and the focus falloff, so it
       keeps its single-writer rule. */
    /** Every scheduled callback this effect owns, so unmount can clear them. */
    const timers: number[] = [];
    /** Cursor X, for the magnetic lean. Stored only while a label is engaged. */
    let pointerX = 0;

    const parallax = [0, 0, 0];
    const recede = [0, 0, 0];
    /** The machine-derived half of the mount transform, refreshed by the tick. */
    const mountLift = [0, 0, 0];
    const mountScale = [1, 1, 1];

    /* The route from a label up to the instrument it drives. One path per bay is
       enough — only one label in a bay can be lit at a time. */
    const traces = bays.map((b) => ({
      line: b.querySelector<SVGPathElement>(".bay-trace-line"),
      node: b.querySelector<SVGCircleElement>(".bay-trace-node"),
    }));
    /** Which chip each bay's trace is currently routed to, -1 for none. */
    const routed = [-1, -1, -1];
    /** Boot draw-on progress. 1 = fully drawn, so nothing is hidden before boot. */
    const bootDraw = [1, 1, 1];

    /* Measured once per hover, never per frame.

       Rects rather than offsetLeft/offsetTop, which look like the cheaper read
       but are wrong here: the moment a bay goes active, .bay-stack li picks up
       a translateY, a transformed ancestor becomes the offsetParent, and every
       offset silently rebases from the bay to the li — 159,345 turns into 0,0.
       Rect deltas are immune to that. .bay's own transform is a translation and
       applies to the SVG too, so it cancels in the subtraction. */
    const route = (bi: number, chip: HTMLElement) => {
      const t = traces[bi];
      const mount = parts[bi]?.mount;
      if (!t?.line || !mount) return;
      const b = bays[bi].getBoundingClientRect();
      const c = chip.getBoundingClientRect();
      const m = mount.getBoundingClientRect();
      const lx = Math.round(c.left - b.left);
      const ly = Math.round(c.top - b.top + c.height / 2);
      const my = Math.round(m.top - b.top + m.height / 2);
      // Down the left gutter and back up, like a trace on a board.
      t.line.setAttribute(
        "d",
        "M" + lx + " " + ly + "H7V" + my + "H" + Math.round(m.left - b.left)
      );
      if (t.node) {
        t.node.setAttribute("cx", String(lx));
        t.node.setAttribute("cy", String(ly));
      }
    };

    const paintBays = () => {
      if (!entranceDone.current) return;
      for (let i = 0; i < bays.length; i++) {
        bays[i].style.transform = "translate3d(0, " + (recede[i] * 5).toFixed(2) + "px, 0)";
        bays[i].style.opacity = (1 - 0.5 * recede[i]).toFixed(3);
      }
    };

    /* Composed in one place because it has two callers on different clocks: the
       tick while a machine is moving, and the scroll trigger while the loop is
       asleep. */
    const paintMounts = () => {
      for (let i = 0; i < parts.length; i++) {
        const m = parts[i]?.mount;
        if (!m) continue;
        m.style.transform =
          "translate3d(0, " + (mountLift[i] + parallax[i]).toFixed(2) + "px, 0) scale(" +
          mountScale[i].toFixed(3) + ")";
      }
    };

    const chipInput = (el: HTMLElement, fn: (c: (typeof chips)[number]) => void) => {
      const i = chipOf.get(el);
      if (i === undefined) return;
      fn(chips[i]);
      live.add(i);
      wake();
    };
    const dwell = bays.map(() => 0);
    const hovering = bays.map(() => false);
    /** Chip index pressed into place; survives the pointer leaving the chip. */
    const selected = bays.map(() => -1);
    /** Where the turret is being sent, and what it currently shows. -1 = the bay glyph. */
    const wanted = bays.map(() => -1);
    const shown = bays.map(() => -1);

    const bayOf = (el: HTMLElement) => bays.indexOf(el.closest<HTMLElement>(".bay")!);

    const sendTo = (bi: number, ci: number) => {
      if (bi < 0 || wanted[bi] === ci) return;
      wanted[bi] = ci;
      machines[bi].fire("swap");
      wake();
    };

    const onOver = (e: PointerEvent) => {
      interacted.current = true;
      const chip = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay-chip");
      if (!chip) return;
      const bi = bayOf(chip);
      if (bi < 0) return;
      hovering[bi] = true;
      machines[bi].setBool("hovered", true);
      chipInput(chip, (c) => {
        c.hovering = true;
        c.machine.setBool("hovered", true);
      });
      chipInput(chip, (c) => {
        // One read per hover, not per move — and off rects for the same reason
        // as route() above.
        const cr = chip.getBoundingClientRect();
        const br = bays[bi].getBoundingClientRect();
        c.cx = cr.left - br.left + cr.width / 2;
        c.half = Math.max(1, cr.width / 2);
      });
      routed[bi] = chipOf.get(chip) ?? -1;
      route(bi, chip);
      sendTo(bi, Number(chip.dataset.chip));
      wake();
    };

    // pointerout fires at every child boundary, so only act on the crossing
    // that actually leaves this bay's stack.
    const onOut = (e: PointerEvent) => {
      const chip = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay-chip");
      if (!chip) return;
      const bi = bayOf(chip);
      if (bi < 0) return;
      const to = e.relatedTarget as HTMLElement | null;
      // The label always releases, even when the pointer is only moving to the
      // next label in the same bay — that one charges on its own pointerover.
      chipInput(chip, (c) => {
        c.hovering = false;
        c.machine.setBool("hovered", false);
        c.machine.setBool("held", false);
      });
      if (to && to.closest(".bay") === bays[bi] && to.closest(".bay-chip")) return;
      hovering[bi] = false;
      machines[bi].setBool("hovered", false);
      machines[bi].setBool("held", false);
      // Falls back to whatever was pressed, so a selection survives the pointer.
      sendTo(bi, selected[bi]);
      wake();
    };

    const onDown = (e: PointerEvent) => {
      interacted.current = true;
      const chip = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay-chip");
      if (!chip) return;
      const bi = bayOf(chip);
      if (bi < 0) return;
      machines[bi].setBool("held", true);
      chipInput(chip, (c) => c.machine.setBool("held", true));
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      // The offset is bay-relative, and so is c.cx; both come off the same
      // offsetParent, so no rect read is needed here.
      const bay = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay");
      if (!bay) return;
      pointerX = e.clientX - bay.getBoundingClientRect().left;
      for (const i of live) if (chips[i].hovering) { wake(); return; }
    };

    const onUp = () => {
      for (let i = 0; i < machines.length; i++) machines[i].setBool("held", false);
      for (let i = 0; i < chips.length; i++) {
        chips[i].machine.setBool("held", false);
        live.add(i);
      }
      wake();
    };

    /** Covers the pointer and the keyboard alike — Enter and Space both click. */
    const onClick = (e: MouseEvent) => {
      const chip = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay-chip");
      if (!chip) return;
      const bi = bayOf(chip);
      if (bi < 0) return;
      const ci = Number(chip.dataset.chip);
      selected[bi] = selected[bi] === ci ? -1 : ci;
      bays[bi].querySelectorAll<HTMLElement>(".bay-chip").forEach((c, n) => {
        c.setAttribute("aria-pressed", n === selected[bi] ? "true" : "false");
      });
      machines[bi].fire("press");
      chipInput(chip, (c) => c.machine.fire("press"));
      sendTo(bi, selected[bi] === -1 ? ci : selected[bi]);
      wake();
    };

    // Keyboard focus drives the same inputs as hover, so tabbing through the
    // chips works the instrument exactly as the pointer does.
    const onFocusIn = (e: FocusEvent) => {
      interacted.current = true;
      const chip = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay-chip");
      if (!chip) return;
      const bi = bayOf(chip);
      if (bi < 0) return;
      hovering[bi] = true;
      machines[bi].setBool("hovered", true);
      chipInput(chip, (c) => {
        c.hovering = true;
        c.machine.setBool("hovered", true);
      });
      sendTo(bi, Number(chip.dataset.chip));
      wake();
    };

    const onFocusOut = (e: FocusEvent) => {
      const chip = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bay-chip");
      if (!chip) return;
      const bi = bayOf(chip);
      if (bi < 0) return;
      chipInput(chip, (c) => {
        c.hovering = false;
        c.machine.setBool("hovered", false);
      });
      const to = e.relatedTarget as HTMLElement | null;
      if (to && to.closest(".bay") === bays[bi]) return;
      hovering[bi] = false;
      machines[bi].setBool("hovered", false);
      sendTo(bi, selected[bi]);
      wake();
    };

    const tick = (dt: number) => {
      let alive = false;

      for (let i = 0; i < machines.length; i++) {
        const p = parts[i];
        if (!p) continue;
        const m = machines[i];

        const want = hovering[i] ? 1 : 0;
        dwell[i] += (want - dwell[i]) * Math.min(1, dt / (instant ? 1 : 170));
        if (Math.abs(want - dwell[i]) < 0.002) dwell[i] = want;
        else alive = true;
        m.setNumber("dwell", dwell[i]);

        if (m.advance(dt)) alive = true;

        const swap = m.pulses.swap ?? 0;
        const press = m.pulses.press ?? 0;

        // Change the mark while the glyph is collapsed, so the swap itself is
        // never seen. swap === 0 covers reduced motion, where there is no
        // envelope to wait for, and the tail of one that has already run.
        if (wanted[i] !== shown[i] && (swap >= 0.85 || swap === 0)) {
          // Clear the outgoing mark's pose so it cannot flash a stale scale the
          // next time it comes back up.
          const leaving = shown[i] >= 0 ? p.marks[shown[i]] : p.glyph;
          if (leaving) leaving.style.transform = "";
          shown[i] = wanted[i];
          p.mount.dataset.mark = String(shown[i]);
        }

        const ch = m.channels;
        const boot = m.pulses.boot ?? 0;

        // A pulse rises and falls, which is right for the collar sweep and the
        // ring flash but wrong for a draw-on — that has to be monotonic, so it
        // gets its own ramp rather than riding the envelope.
        if (bootDraw[i] < 1) {
          bootDraw[i] = Math.min(1, bootDraw[i] + dt / 900);
          alive = true;
        }

        mountLift[i] = ch.lift;
        mountScale[i] = 1 - boot * 0.12;
        if (p.collar) {
          p.collar.style.transform =
            `rotate(${(ch.spin + press * 12 + boot * 300).toFixed(2)}deg)`;
        }
        if (p.lock) {
          // dwell fades the ring up as the pointer settles on a chip, but a
          // press has no dwell behind it on touch — so a pressed instrument
          // lights its ring outright rather than staying dark.
          const engaged = m.state === "pressed" ? 1 : dwell[i];
          p.lock.style.opacity = Math.min(
            1,
            ch.ring * engaged + press * 0.45 + boot * 0.7
          ).toFixed(3);
        }

        const t = traces[i];
        if (t?.line) {
          const rc = routed[i] >= 0 ? chips[routed[i]] : null;
          const drawn = rc ? rc.machine.channels.wipe : 0;
          t.line.style.strokeDashoffset = (1 - drawn).toFixed(4);
          if (t.node) t.node.style.opacity = drawn.toFixed(3);
          // Let the route go once it has fully retracted, so the next hover
          // re-measures instead of reusing a stale path.
          if (drawn < 0.002 && routed[i] >= 0 && !chips[routed[i]].hovering) routed[i] = -1;
          if (drawn > 0.002) alive = true;
        }

        const active = shown[i] >= 0 ? p.marks[shown[i]] : p.glyph;
        if (active) {
          active.style.transform = `scale(${(ch.scale * (1 - 0.75 * swap)).toFixed(3)})`;
          active.style.setProperty("--draw", ((1 - swap) * bootDraw[i]).toFixed(3));
        }
      }

      // The deck reads as one instrument rather than three cards: whichever bay
      // is most engaged keeps its weight and the others step back.
      let focus = 0;
      let lead = -1;
      for (let i = 0; i < dwell.length; i++) {
        if (dwell[i] > focus) { focus = dwell[i]; lead = i; }
      }
      for (let i = 0; i < recede.length; i++) {
        recede[i] = lead >= 0 && i !== lead ? focus : 0;
      }
      paintBays();
      paintMounts();

      // Only the labels that are actually moving. A settled machine drops out
      // of the set, so a still section walks nothing at all.
      for (const i of live) {
        const c = chips[i];
        const m = c.machine;

        const want = c.hovering ? 1 : 0;
        c.dwell += (want - c.dwell) * Math.min(1, dt / (instant ? 1 : 200));
        if (Math.abs(want - c.dwell) < 0.002) c.dwell = want;
        m.setNumber("dwell", c.dwell);

        const moving = m.advance(dt);
        const press = m.pulses.press ?? 0;
        const ch = m.channels;

        if (c.fill) {
          // Uncovered left to right; the inset is what is still hidden.
          c.fill.style.clipPath = "inset(0 " + (100 - ch.wipe * 100).toFixed(2) + "% 0 0)";
        }
        if (c.rule) {
          c.rule.style.transform = "scaleX(" + ch.rule.toFixed(4) + ")";
          // dwell keeps lifting the rule for a beat after the wipe lands, so
          // arriving and lingering do not look like the same thing.
          c.rule.style.opacity = Math.min(
            1,
            ch.rule * (0.5 + c.dwell * 0.5) + press * 0.4
          ).toFixed(3);
        }
        // pull rises with the state, so a label only leans once engaged and the
        // lean blends away with everything else rather than snapping back.
        const target = c.hovering
          ? Math.max(-1, Math.min(1, (pointerX - c.cx) / c.half)) * 3.5
          : 0;
        c.lean += (target - c.lean) * Math.min(1, dt / (instant ? 1 : 120));
        if (Math.abs(target - c.lean) < 0.01) c.lean = target;
        else alive = true;

        c.el.style.transform =
          "translate3d(" + (c.lean * ch.pull).toFixed(2) + "px, " +
          (ch.lift + press * 2).toFixed(2) + "px, 0)";

        if (moving || c.dwell !== want) alive = true;
        else live.delete(i);
      }

      return alive;
    };

    row.addEventListener("pointerover", onOver, { passive: true });
    row.addEventListener("pointerout", onOut, { passive: true });
    row.addEventListener("pointerdown", onDown, { passive: true });
    row.addEventListener("pointermove", onPointerMove, { passive: true });
    row.addEventListener("click", onClick);
    row.addEventListener("focusin", onFocusIn);
    row.addEventListener("focusout", onFocusOut);
    window.addEventListener("pointerup", onUp, { passive: true });
    /* The start-up. Each instrument sweeps its collar, flashes its ring and
       draws its glyph on, one after the next, when the deck first arrives.
       The entrance timeline calls this on completion. */
    bootRef.current = instant
      ? null
      : () => {
          for (let i = 0; i < machines.length; i++) {
            const at = i * 160;
            const id = window.setTimeout(() => {
              bootDraw[i] = 0;
              machines[i].fire("boot");
              wake();
            }, at);
            timers.push(id);
          }

          /* A single self-demo, and only if the deck has been ignored. It drives
             the real machines rather than a separate animation, so the tick
             renders it and then settles exactly as it would after a pointer.
             This is deliberately one-shot: a repeating attract loop would park
             the shared rAF for good, which is the one thing lib/stateMachine
             exists to avoid. */
          if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

          const step = (at: number, fn: () => void) => {
            timers.push(window.setTimeout(fn, 1800 + at));
          };
          const show = (bi: number, ci: number) => {
            if (interacted.current) return;
            scannerRef.current?.enter(bi);
            hovering[bi] = true;
            machines[bi].setBool("hovered", true);
            sendTo(bi, ci);
            wake();
          };
          const drop = (bi: number) => {
            hovering[bi] = false;
            machines[bi].setBool("hovered", false);
            sendTo(bi, -1);
            wake();
          };

          step(0, () => show(0, 1));
          step(620, () => { if (interacted.current) return; drop(0); show(1, 2); });
          step(1240, () => { if (interacted.current) return; drop(1); show(2, 0); });
          step(1860, () => {
            if (interacted.current) return;
            drop(2);
            scannerRef.current?.leave();
          });
        };

    /* Depth. The three bays drift at different rates as the section crosses the
       viewport, so the deck reads as a diorama rather than a flat row. Costs one
       per-scroll-tick callback — the first over this region, since the hero
       parallax triggers are all at progress 1 by the time About is on screen. */
    const SPEED = [-1, 0.35, 1];
    const depth =
      instant || window.matchMedia("(max-width: 768px)").matches
        ? null
        : ScrollTrigger.create({
            trigger: row,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const p = (self.progress - 0.5) * 2;
              for (let i = 0; i < parallax.length; i++) parallax[i] = p * SPEED[i] * 14;
              paintMounts();
            },
          });

    const unregister = register(tick);

    return () => {
      row.removeEventListener("pointerover", onOver);
      row.removeEventListener("pointerout", onOut);
      row.removeEventListener("pointerdown", onDown);
      row.removeEventListener("pointermove", onPointerMove);
      row.removeEventListener("click", onClick);
      row.removeEventListener("focusin", onFocusIn);
      row.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("pointerup", onUp);
      for (const id of timers) window.clearTimeout(id);
      depth?.kill();
      unregister();
    };
  }, []);

  return (
    <section className="section bays-section" id="about" aria-label="About — what I build">
      <div className="parallax-text" style={{ top: "40px", left: "-50px" }} data-speed="-0.1">
        ABOUT
      </div>

      <div className="container">
        <header className="bays-head">
          <div>
            <h2 className="section-title bays-title" data-scroll>
              What I Build
            </h2>
          </div>

          <p className="bays-lede" data-scroll>
            Three bays, one operator — each carrying a different part of the same job.
            <span className="bays-hint">Hover a bay to bring the scanner across</span>
          </p>
        </header>

        <div className="bay-deck" ref={deckRef}>
          <div className="bay-rail" aria-hidden="true">
            <span className="bay-rail-id">Deck 03 · Systems Bay</span>
            <span className="bay-rail-line" />
            <span className="bay-rail-out">
              <i className="bay-rail-dot" />
              <span ref={outRef}>Standby</span>
            </span>
          </div>

          <div className="bay-row" ref={rowRef}>
            {/* One travelling element for all three bays */}
            <span className="bay-scan" ref={scanRef} aria-hidden="true">
              <i className="bay-scan-hot" ref={hotRef} />
            </span>

            {BAYS.map((bay) => {
              const Glyph = GLYPHS[bay.glyph];
              return (
                <article
                  key={bay.code}
                  className={`bay bay--${bay.tone}`}
                  aria-label={`${bay.callsign} — ${bay.title.join(" ")}`}
                >
                  <span className="bay-divider" aria-hidden="true" />
                  <BayTrace />

                  <div className="bay-body">
                    <div className="bay-mount" data-mark="-1" aria-hidden="true">
                      {/* Housing — static */}
                      <svg className="bay-bezel" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="mt-ring" />
                        <path d="M50 2v7M50 91v7M2 50h7M91 50h7" className="mt-tick" />
                        {/* Lit only by the machine's ring channel */}
                        <circle cx="50" cy="50" r="49" className="mt-lock" />
                      </svg>

                      {/* Collar — turns like a lens locking on */}
                      <svg className="bay-collar" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="39" className="mt-dash" />
                      </svg>

                      <Glyph />

                      {/* Every mark for this bay is rendered; the machine shows
                          one. They are static while hidden, so they cost paint
                          only for the one that is on. */}
                      {bay.stack.map((name, i) => (
                        <TechMark key={name} name={name} index={i} />
                      ))}
                    </div>

                    <p className="bay-code">
                      <span>{bay.code}</span>
                      <i aria-hidden="true" />
                      <span className="bay-callsign">{bay.callsign}</span>
                    </p>

                    <h3 className="bay-name">
                      {bay.title[0]}
                      <em>{bay.title[1]}</em>
                    </h3>

                    <p className="bay-brief">{bay.brief}</p>

                    <ul className="bay-stack" aria-label={`${bay.callsign} stack`}>
                      {bay.stack.map((name, i) => (
                        <li key={name} style={{ ["--i" as string]: i }}>
                          <button
                            type="button"
                            className="bay-chip"
                            data-chip={i}
                            aria-pressed="false"
                          >
                            {/* The label as it reads at rest. Keeps its own
                                colour transition, so the bay-wide brightening
                                still works underneath the sweep. */}
                            <span className="chip-base">{name}</span>
                            {/* The charge: the same word in the bay tone,
                                uncovered left to right by the machine. Hidden
                                from assistive tech so the label is read once. */}
                            <span className="chip-fill" aria-hidden="true">
                              {name}
                            </span>
                            <i className="chip-rule" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="bay-swipe" aria-hidden="true">
            <i />
            Swipe for the other bays
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Constellation,
  ORBIT_END,
  ORBIT_VIEWBOX,
  PLANE_Y,
  RING,
  STATIONS,
  SkyStars,
} from "./ascentSky";
import CosmicNebulaSeam from "./CosmicNebulaSeam";

gsap.registerPlugin(ScrollTrigger);

/**
 * ProcessSteps — the "How I Work" section, drawn as an orbital deck.
 *
 * A process has a direction and a duration, so it is drawn as one trajectory
 * with four stations on it, running out past the last one because launch is not
 * the end of the work. The section is one screen tall and never pins: a
 * four-stage answer should not cost four screens of scrolling.
 *
 * The information is not the interaction. All four stages are legible at rest
 * with nothing behind a selection — an earlier trajectory-chart version of this
 * section failed exactly there, hiding the answer to "what happens if I hire
 * you" behind a HUD. Hover is free to be pure personality because of that.
 *
 * Geometry is fixed. Nothing here animates width, height or flex — the cards
 * are four equal quarters at every state, which is what lets each station stay
 * welded to the centre of its card, lets the packet be placed from one table of
 * numbers, and keeps the reading experience still while the decoration moves.
 *
 * Element choice is load-bearing, not stylistic. The global transition rule at
 * the foot of portfolio.css matches div, span, p, headings, a and button, and
 * forces a 0.4s opacity/colour transition no single-class rule outranks. Every
 * decorative element animated here is therefore an <i>, and every card is an
 * <li> — neither appears in that selector, and nor do SVG elements.
 *
 * Every class is prefixed `hiw-`, because the stylesheet already owns a
 * .card-num that quietly won on source order and rendered the stage numerals at
 * 0.72rem instead of 2.4.
 *
 * Perf: the sky is painted once and never animates — no canvas, no rAF, no
 * blur, no backdrop-filter. The packet is two nested <i> elements moved by
 * transform on the compositor. GSAP runs the entry timeline once and the
 * character wave on hover. The only thing that loops is the drift, and it is
 * paused whenever the section is offscreen or the pointer is engaged.
 */

type Stage = {
  num: string;
  name: string;
  desc: string;
  time: string;
  gives: string;
  /** Midpoint of the range named in `time`, in weeks. The one real number. */
  weeks: number;
};

const STAGES: Stage[] = [
  {
    num: "01",
    name: "Discover",
    desc: "We agree on what we are building and why — before a single line of code exists.",
    time: "1–2 weeks",
    gives: "Brief + sitemap",
    weeks: 1.5,
  },
  {
    num: "02",
    name: "Design",
    desc: "Rough layouts first, then the real look: colour, type, spacing, motion.",
    time: "2–3 weeks",
    gives: "Clickable design",
    weeks: 2.5,
  },
  {
    num: "03",
    name: "Build",
    desc: "Clean, fast code. Tested on a mid-range phone, not just on my laptop.",
    time: "3–6 weeks",
    gives: "Staging site",
    weeks: 4.5,
  },
  {
    num: "04",
    name: "Launch",
    desc: "Ship it, watch the numbers, and fix whatever real traffic turns up.",
    time: "3–5 days",
    gives: "Live + monitored",
    weeks: 4 / 7,
  },
];

/* Both figures the section shows are derived from `weeks`, so the bar on a card
   and the readout on its station can never disagree with the duration printed
   beside them. An earlier version carried a hand-written `load` per stage whose
   four values summed to 1.28 while claiming to be a share of the whole. */
const TOTAL_WEEKS = STAGES.reduce((sum, stage) => sum + stage.weeks, 0);

/** This stage's slice of the engagement. Drawn as the bar under the copy. */
const SHARE = STAGES.map((stage) => stage.weeks / TOTAL_WEEKS);

/** How far along the whole job you are when this stage ends. Read on the plane. */
const CUMULATIVE = STAGES.map((_, i) => {
  const done = STAGES.slice(0, i + 1).reduce((sum, stage) => sum + stage.weeks, 0);
  return done / TOTAL_WEEKS;
});

const pct = (n: number) => (n * 100).toFixed(2) + "%";

/* Which end each character wave starts from. The same gesture on every stage,
   but a different direction each time, so running the cursor along the row has
   rhythm instead of repetition. */
const WAVE_FROM = ["start", "center", "end", "start"] as const;

/* The few stars that get a visible cross. Placed by hand rather than taken from
   the seeded field, because a flare is only worth drawing where nothing else is
   competing for the eye. [x%, y%, arm length px] */
const GLINTS: Array<[number, number, number]> = [
  [7.5, 19, 30],
  [61, 11, 22],
  [90, 63, 26],
  [31, 88, 18],
  [45, 34, 15],
];

const MOBILE = "(max-width: 860px)";

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function ProcessSteps() {
  const sectionRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const packetXRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLOListElement>(null);
  const swipeRef = useRef<HTMLParagraphElement>(null);
  const charTweens = useRef<(gsap.core.Timeline | null)[]>([]);

  /* ── Park the packet on a station ────────────────────────────────────────
     Written straight onto the element that consumes it rather than as a custom
     property on a container: an inherited property invalidates style for every
     descendant, and this is the only reader. Doing it here rather than in the
     stylesheet keeps STATIONS the single source of truth.

     The stations all sit on the plane, so the packet only ever travels in x —
     the y wrapper the bowed-ellipse version needed is gone with it. */
  const movePacket = useCallback((index: number) => {
    const station = STATIONS[index];
    if (!station || !packetXRef.current) return;
    packetXRef.current.style.transform =
      "translate3d(calc(" + station.x + "% + " + station.nudge + "px), 0, 0)";
  }, []);

  useEffect(() => {
    movePacket(0);
  }, [movePacket]);

  /* ── Entry: the sky lifts, the orbit draws, the cards arrive under it ──── */
  useEffect(() => {
    const root = deckRef.current;
    const section = sectionRef.current;
    if (!root || !section) return;

    const sky = section.querySelector<HTMLElement>(".hiw-sky");
    const cLines = gsap.utils.toArray<SVGElement>(".hiw-c-line", section);
    const cStars = gsap.utils.toArray<SVGElement>(".hiw-c-star", section);
    const plane = root.querySelector<SVGElement>(".hiw-plane");
    const ring = root.querySelector<SVGElement>(".hiw-ring");
    const stations = gsap.utils.toArray<HTMLElement>(".hiw-station", root);
    const drops = gsap.utils.toArray<HTMLElement>(".hiw-drop", root);
    const reads = gsap.utils.toArray<HTMLElement>(".hiw-read", root);
    const cards = gsap.utils.toArray<HTMLElement>(".hiw-card", root);
    const fills = gsap.utils.toArray<HTMLElement>(".hiw-load-fill", root);
    const reticle = root.querySelector<HTMLElement>(".hiw-reticle");
    const packet = root.querySelector<HTMLElement>(".hiw-packet");

    // The drift only ever runs while the deck is on screen. Killing the frame
    // for an offscreen decoration is the same trick the star chart uses.
    const live = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        if (self.isActive) section.dataset.live = "";
        else delete section.dataset.live;
      },
    });

    // Below 860px the deck becomes a swipe rail and, like the rest of this
    // page, shows its content without waiting for a trigger. Nothing needs
    // setting: the stylesheet already holds every rest value, and this branch
    // simply never takes them away.
    const skip = reducedMotion() || window.matchMedia(MOBILE).matches;

    if (skip) {
      root.dataset.ready = "";
      return () => {
        live.kill();
      };
    }

    // One fade on the sky rather than 520 tweens on its circles: the field is a
    // single composited element and never needs to be told about its contents.
    gsap.set(sky, { opacity: 0 });
    gsap.set(cStars, { opacity: 0 });
    // Every stroke carries pathLength="1", so one dashoffset of 1 draws a line
    // of any real length. The ring is closed, so it draws from its own start.
    gsap.set([...cLines, plane, ring], { strokeDashoffset: 1 });
    gsap.set(stations, { opacity: 0, scale: 0.4 });
    gsap.set(drops, { opacity: 0, scaleY: 0 });
    gsap.set([...reads, reticle, packet], { opacity: 0 });
    gsap.set(fills, { scaleX: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 80%", once: true },
      // Every hover state the stylesheet owns is scoped to [data-ready], so it
      // cannot transition the same properties this timeline is tweening.
      onComplete: () => {
        root.dataset.ready = "";
      },
    });

    // Each tween lands on the value the stylesheet already holds for its
    // target, so handing control back at the end is not a visible step.
    tl.to(sky, { opacity: 1, duration: 1.3, ease: "power1.out" })
      .to(
        cLines,
        { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: "power2.inOut" },
        0.1
      )
      .to(cStars, { opacity: 1, duration: 0.5, stagger: 0.04, ease: "power1.out" }, 0.4)
      .to(plane, { strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut" }, 0.25)
      .to(ring, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0.5)
      .to(
        stations,
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.09, ease: "back.out(2.2)" },
        0.75
      )
      .to(
        drops,
        { opacity: 1, scaleY: 1, duration: 0.5, stagger: 0.09, ease: "power2.out" },
        0.9
      )
      .to(reads, { opacity: 1, duration: 0.5, stagger: 0.09, ease: "power1.out" }, 0.95)
      .fromTo(
        cards,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.085,
          ease: "power3.out",
          // The sibling dim is a class, and an inline opacity left behind by
          // this tween would outrank it forever. Hand the property back.
          clearProps: "opacity",
        },
        0.9
      )
      // The bars fill to the width the stylesheet already holds for them, so
      // the tween never needs to know the numbers.
      .to(fills, { scaleX: 1, duration: 0.9, stagger: 0.085, ease: "power2.out" }, 1.25)
      .to([reticle, packet], { opacity: 1, duration: 0.6, ease: "power1.out" }, 1.4);

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
      observer.observe(section);
    }

    return () => {
      observer?.disconnect();
      tl.scrollTrigger?.kill();
      tl.kill();
      live.kill();
    };
  }, []);

  /* ── Focus: one handler, the whole deck answers ─────────────────────────
     The station lives in the orbit band and the stage lives in the row below
     it, so the two cannot be linked in CSS alone. Everything sustained is a
     data attribute the stylesheet owns; only the packet and the one-shot
     character wave are written here. */
  const handleEnter = useCallback(
    (index: number) => (event: React.PointerEvent<HTMLLIElement>) => {
      const deck = deckRef.current;
      if (!deck) return;

      // Sustained state: dims the siblings and lights the matching station.
      deck.dataset.focus = String(index);
      // Kept separately from focus, because it survives the pointer leaving.
      deck.dataset.park = String(index);
      event.currentTarget.dataset.active = "";
      movePacket(index);

      if (reducedMotion()) return;

      // Restart the scan sweep. Removing the class, forcing a reflow and
      // re-adding it is what makes the same animation replay on re-entry.
      const scan = event.currentTarget.querySelector<HTMLElement>(".hiw-scan");
      if (scan) {
        scan.classList.remove("is-sweeping");
        void scan.offsetWidth;
        scan.classList.add("is-sweeping");
      }

      const chars = gsap.utils.toArray<HTMLElement>(".hiw-char", event.currentTarget);
      if (chars.length) {
        charTweens.current[index]?.kill();
        const from = WAVE_FROM[index];
        charTweens.current[index] = gsap
          .timeline()
          .to(chars, {
            y: -10,
            duration: 0.17,
            stagger: { each: 0.028, from },
            ease: "power2.out",
          })
          .to(
            chars,
            {
              y: 0,
              duration: 0.78,
              stagger: { each: 0.028, from },
              ease: "elastic.out(1.2, 0.36)",
            },
            0.19
          );
      }
    },
    [movePacket]
  );

  const handleLeave = useCallback((event: React.PointerEvent<HTMLLIElement>) => {
    delete event.currentTarget.dataset.active;
    // data-park is deliberately left where it is: the packet stays at the last
    // station you visited rather than snapping home, so the orbit keeps a
    // memory of where your attention was. Only the dimming lifts.
    if (deckRef.current) delete deckRef.current.dataset.focus;
    // The character wave is left to land on its own — cutting it short on
    // leave is what makes a hover feel snatched away.
  }, []);

  useEffect(() => {
    const tweens = charTweens.current;
    return () => {
      tweens.forEach((t) => t?.kill());
    };
  }, []);

  /* ── The swipe rail (≤860px only) ───────────────────────────────────────
     A phone has no hover, so the card the rail is parked on becomes the active
     one. That is the same state the pointer produces on the desktop deck, so
     the rail gets the filled numeral and the lit deliverable for free rather
     than needing a second design.

     One rAF-batched listener that writes only when the rendered index changes,
     so a full swipe costs four writes rather than one per scroll event. */
  useEffect(() => {
    const cards = cardsRef.current;
    const swipe = swipeRef.current;
    if (!cards || !swipe) return;

    // Built once and updated on change: matchMedia allocates a new
    // MediaQueryList on every call, and this is read on a scroll path.
    const mq = window.matchMedia(MOBILE);
    const dots = Array.from(swipe.querySelectorAll<HTMLElement>(".hiw-dot"));
    const items = Array.from(cards.querySelectorAll<HTMLElement>(".hiw-card"));
    const counter = swipe.querySelector<HTMLElement>(".hiw-count");
    let frame = 0;
    let last = -1;

    const read = () => {
      frame = 0;
      const first = items[0];
      if (!first) return;
      const step = first.offsetWidth || 1;
      const index = Math.min(
        STAGES.length - 1,
        Math.max(0, Math.round(cards.scrollLeft / step))
      );
      if (index === last) return;
      // Only a real move retires the swipe hint; priming on mount must not.
      const moved = last !== -1;
      last = index;

      if (counter) counter.textContent = STAGES[index]!.num;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      items.forEach((card, i) => {
        if (i === index) card.dataset.active = "";
        else delete card.dataset.active;
      });
      if (moved) swipe.dataset.touched = "";
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    // The active card is the rail's idea, not the deck's — on a wide screen the
    // pointer owns that state and a card left marked active would sit lit with
    // nothing pointing at it.
    const sync = () => {
      if (mq.matches) {
        last = -1;
        read();
      } else {
        last = -1;
        items.forEach((card) => delete card.dataset.active);
      }
    };

    sync();
    mq.addEventListener("change", sync);
    cards.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", sync);
      cards.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const planeD = `M 0 ${PLANE_Y} L 1000 ${PLANE_Y}`;

  return (
    <section
      className="section hiw-section"
      id="workflow"
      aria-labelledby="ascent-heading"
      ref={sectionRef}
    >
      {/* ── The sky: Procedural cosmic nebula & glowing planet matching Image 2 ── */}
      <div className="hiw-sky" aria-hidden="true">
        <SkyStars />
        {GLINTS.map((g, i) => (
          <i
            key={"glint-" + i}
            className="hiw-glint"
            style={{
              ["--gx" as string]: g[0] + "%",
              ["--gy" as string]: g[1] + "%",
              ["--reach" as string]: g[2] + "px",
            }}
          />
        ))}

        {/* The two planets: orb-a on top-right, orb-b on left with glowing cyan crescent rim */}
        <i className="hiw-orb hiw-orb-a" />
        <i className="hiw-orb hiw-orb-b" />
      </div>

      {/* 100% Pure Code Procedural Volumetric Nebula Cloudscape Seam (Upper Half) */}
      <CosmicNebulaSeam part="upper" />

      <div className="container">
        <header className="ascent-head">
          <div className="ascent-head-title">
            <p className="ascent-eyebrow" data-scroll>
              <span className="eyebrow-rule" aria-hidden="true" />
              FLIGHT PLAN · FOUR STAGES
              <Constellation />
            </p>
            <h2 className="section-title ascent-title" id="ascent-heading" data-scroll>
              <i className="hiw-flare" aria-hidden="true" />
              How I Work
            </h2>
          </div>

          <p className="ascent-lede" data-scroll>
            The same four stages on every project. Here is what happens at each one, how long
            it takes, and what you get to hold at the end of it.
          </p>
        </header>

        <div className="ascent">
          <div className="ascent-deck" ref={deckRef} data-park="0">
            {/* ── The orbit band ── */}
            <div className="hiw-orbit" aria-hidden="true">
              {/* Inert geometry only. Anything that moves is an <i> above it,
                  because transforming an SVG child is not composited and would
                  re-rasterise the whole drawing every frame. */}
              <svg
                className="hiw-plot"
                viewBox={ORBIT_VIEWBOX}
                preserveAspectRatio="none"
                fill="none"
                focusable="false"
              >
                <defs>
                  {/* Mapped to the viewBox rather than to the path bounding
                      box, so the colour run spans what is actually on screen. */}
                  <linearGradient
                    id="hiw-plane-ramp"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2="1000"
                    y2="0"
                  >
                    <stop className="hiw-ramp-0" offset="0%" stopOpacity="0" />
                    <stop className="hiw-ramp-0" offset="12%" stopOpacity="0.75" />
                    <stop className="hiw-ramp-1" offset="38%" stopOpacity="0.75" />
                    <stop className="hiw-ramp-2" offset="63%" stopOpacity="0.8" />
                    <stop className="hiw-ramp-3" offset="88%" stopOpacity="0.9" />
                    <stop className="hiw-ramp-3" offset="100%" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* The ring is drawn first so the plane reads as passing in
                    front of it, which is what puts the ring behind the deck. */}
                <ellipse
                  className="hiw-ring"
                  cx={RING.cx}
                  cy={RING.cy}
                  rx={RING.rx}
                  ry={RING.ry}
                  pathLength={1}
                />
                <path className="hiw-plane" d={planeD} pathLength={1} />
              </svg>

              {/* A hairline from each station down toward the card it belongs
                  to, so the row below is visibly hanging off the trajectory
                  rather than merely sitting under it. */}
              {STATIONS.map((s, i) => (
                <i
                  key={"drop-" + i}
                  className="hiw-drop"
                  data-i={i}
                  style={{
                    ["--sx" as string]: s.x + "%",
                    ["--nudge" as string]: s.nudge + "px",
                    ["--tone-rgb" as string]: "var(--stage-tone-" + i + "-rgb)",
                  }}
                />
              ))}

              {STATIONS.map((s, i) => (
                <i
                  key={"station-" + i}
                  className="hiw-station"
                  data-i={i}
                  style={{
                    ["--sx" as string]: s.x + "%",
                    ["--nudge" as string]: s.nudge + "px",
                    ["--tone" as string]: "var(--stage-tone-" + i + ")",
                    ["--tone-rgb" as string]: "var(--stage-tone-" + i + "-rgb)",
                  }}
                >
                  <i className="hiw-bloom" />
                  <i className="hiw-spike hiw-spike-h" />
                  <i className="hiw-spike hiw-spike-v" />
                  <i className="hiw-core" />
                </i>
              ))}

              {STATIONS.map((s, i) => (
                <i
                  key={"read-" + i}
                  className="hiw-read"
                  data-i={i}
                  style={{
                    ["--sx" as string]: s.x + "%",
                    ["--nudge" as string]: s.nudge + "px",
                    ["--tone-rgb" as string]: "var(--stage-tone-" + i + "-rgb)",
                  }}
                >
                  {pct(CUMULATIVE[i]!)}
                </i>
              ))}

              {/* Where the trajectory leaves, past the ring's right vertex. */}
              <i
                className="hiw-reticle"
                style={{ ["--sx" as string]: ORBIT_END.x + "%" }}
              />

              {/* The focus marker. Rides the plane, so it only travels in x. */}
              <i className="hiw-packet-x" ref={packetXRef}>
                <i className="hiw-packet" />
              </i>

              {/* The idle drift. Parked by CSS whenever the deck is offscreen
                  or the pointer is working. */}
              <i className="hiw-drift-x">
                <i className="hiw-drift" />
              </i>
            </div>

            {/* ── The stages ── */}
            <ol className="hiw-cards" ref={cardsRef}>
              {STAGES.map((stage, i) => (
                <li
                  key={stage.num}
                  className="hiw-card"
                  data-cursor-text={"STAGE " + stage.num}
                  style={{
                    ["--tone" as string]: "var(--stage-tone-" + i + ")",
                    ["--tone-rgb" as string]: "var(--stage-tone-" + i + "-rgb)",
                    ["--share" as string]: SHARE[i],
                  }}
                  onPointerEnter={handleEnter(i)}
                  onPointerLeave={handleLeave}
                >
                  <i className="hiw-scan" aria-hidden="true" />
                  <i className="hiw-glow" aria-hidden="true" />
                  <i className="hiw-notch" aria-hidden="true" />

                  <p className="hiw-meta">
                    {/* Outline underneath, solid on top, wiped open left to
                        right. The same base/fill pair the bay chips use. */}
                    <span className="hiw-num">
                      <span className="hiw-num-base">{stage.num}</span>
                      <i className="hiw-num-fill" aria-hidden="true">
                        {stage.num}
                      </i>
                    </span>
                    <span className="hiw-time">{stage.time}</span>
                  </p>

                  {/* The same glyph as the station on the plane, so the marker
                      up there and the badge down here read as one object. Only
                      shown while the card is the active one. */}
                  <i className="hiw-badge" aria-hidden="true">
                    <i className="hiw-badge-ring">
                      <i className="hiw-badge-core" />
                      <i className="hiw-badge-spike" />
                    </i>
                    <i className="hiw-badge-read">{pct(CUMULATIVE[i]!)}</i>
                    <i className="hiw-badge-sub">ELAPSED</i>
                  </i>

                  {/* Split for the hover wave; screen readers still get one word. */}
                  <h3 className="hiw-name" aria-label={stage.name}>
                    {stage.name.split("").map((ch, j) => (
                      <span key={j} className="hiw-char" aria-hidden="true">
                        {ch}
                      </span>
                    ))}
                  </h3>

                  <p className="hiw-desc">{stage.desc}</p>

                  {/* How much of the whole engagement this stage is — the
                      duration named above, drawn. Reads as the card's divider,
                      but the lit portion is the real proportion. */}
                  <i className="hiw-load" aria-hidden="true">
                    <i className="hiw-load-fill" />
                  </i>

                  <p className="hiw-out">
                    <i aria-hidden="true">&rarr;</i>
                    {stage.gives}
                  </p>
                </li>
              ))}
            </ol>

            {/* Only rendered visibly at ≤860px, where the cards become a snap
                rail — it is what keeps "there are four of these, you are on the
                first" true when only one card is on screen. */}
            <p className="hiw-swipe" ref={swipeRef} aria-hidden="true">
              <span className="hiw-count">01</span>
              <span className="hiw-dots">
                {STAGES.map((stage, i) => (
                  <i
                    key={stage.num}
                    className={i === 0 ? "hiw-dot is-active" : "hiw-dot"}
                    style={{ ["--tone" as string]: "var(--stage-tone-" + i + ")" }}
                  />
                ))}
              </span>
              <span className="hiw-total">04</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

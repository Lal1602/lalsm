"use client";
import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import * as m from "motion/react-m";
import { AnimatePresence, useInView } from "motion/react";
import MotionRoot from "../motion/MotionRoot";
import Glyph, { type GlyphName } from "./wb/Glyphs";
import { useCalm, useMediaQuery } from "./hiw/hooks";

/**
 * AboutSection: "What I Build".
 *
 * Three disciplines, and for each one a working instrument instead of a description:
 *
 *   HELM     frame-time meter: measures this very page, frame by frame, and lets you
 *            spend its budget on purpose to see what a missed frame looks like;
 *   REACTOR  request trace: one request through edge, API, cache and database, with a
 *            cold cache and a failing database to switch on;
 *   PROBE    a small game on a fixed-timestep loop, playable by pointer, touch or keys.
 *
 * One bay is open at a time. On a wide screen the bays are a list on the left and the
 * open one's instrument fills the stage on the right (placed by CSS grid, so there is
 * no layout switch in JS). Only the open instrument exists, so only one loop can ever be
 * running, and each loads when the section is near rather than with the page.
 *
 * On a phone (the same 860px the CSS switches at) there are no instruments: the three
 * bays are three plain cards, each with its brief and its stack, and nothing to open.
 *
 * Everything the section says is readable at rest: the instruments add proof, not
 * information.
 */

interface Bay {
  code: string;
  callsign: string;
  tone: "cyan" | "violet" | "gold";
  glyph: GlyphName;
  title: [string, string];
  brief: string;
  stack: string[];
  demo: { name: string; line: string };
}

const BAYS: Bay[] = [
  {
    code: "SYS-01",
    callsign: "HELM",
    tone: "cyan",
    glyph: "helm",
    title: ["Frontend", "Engineering"],
    brief: "The part you touch. Typed components, motion that carries meaning, and a frame budget I hold to on a mid-range phone.",
    stack: ["TypeScript", "React", "Next.js", "GSAP", "Three.js", "Tailwind"],
    demo: { name: "Frame-time meter", line: "Measured live, on this page" },
  },
  {
    code: "SYS-02",
    callsign: "REACTOR",
    tone: "violet",
    glyph: "reactor",
    title: ["Backend &", "DevOps"],
    brief: "The part you do not. Schema design, APIs that stay honest under load, and the pipelines that get them shipped.",
    stack: ["Node.js", "Laravel", "PHP", "MySQL", "PostgreSQL", "Docker"],
    demo: { name: "Request trace", line: "A simulated request, slowed down to follow" },
  },
  {
    code: "SYS-03",
    callsign: "PROBE",
    tone: "gold",
    glyph: "probe",
    title: ["Mobile &", "Game Dev"],
    brief: "Sent out past the browser. Cross-platform builds and hand-tuned game loops, where input latency is the whole experience.",
    stack: ["React Native", "Flutter", "Phaser.js", "Canvas API", "Figma"],
    demo: { name: "Fixed-step game loop", line: "Playable: pointer, touch or arrow keys" },
  },
];

/** Reserves the instrument's footprint while its code loads, so nothing shifts. */
function DemoSkeleton() {
  return (
    <div className="wb-demo wb-skeleton" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}

const DEMOS = [
  dynamic(() => import("./wb/FrameMeter"), { ssr: false, loading: DemoSkeleton }),
  dynamic(() => import("./wb/RequestTrace"), { ssr: false, loading: DemoSkeleton }),
  dynamic(() => import("./wb/ProbeRun"), { ssr: false, loading: DemoSkeleton }),
];

/** Four corner marks that draw themselves in when an instrument opens. */
function Brackets({ calm }: { calm: boolean }) {
  return (
    <>
      {(["tl", "tr", "br", "bl"] as const).map((corner) => (
        <svg key={corner} className={`wb-bk wb-bk--${corner}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <m.path
            d="M1 15V1h14"
            inherit={false}
            initial={{ pathLength: calm ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: calm ? 0 : 0.7, ease: [0.2, 0.8, 0.2, 1], delay: calm ? 0 : 0.1 }}
          />
        </svg>
      ))}
    </>
  );
}

export default function AboutSection() {
  const { calm } = useCalm();
  const stacked = useMediaQuery("(max-width: 860px)");
  const deckRef = useRef<HTMLDivElement>(null);
  const near = useInView(deckRef, { once: true, margin: "900px 0px 900px 0px" });
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const choose = useCallback((i: number) => setActive(i), []);

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    // Only the bay buttons steer the list: the open instrument sits inside it, and its own keys
    // (the game's arrows) must not bubble up and switch bays.
    if (stacked || !(e.target as HTMLElement).closest(".wb-bay-btn")) return;
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (Math.max(0, active) + keys[e.key]! + BAYS.length) % BAYS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = BAYS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  const fade = calm ? { duration: 0 } : { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] as const };

  return (
    <MotionRoot>
      <section className="section wb-section" id="about" aria-labelledby="wb-heading">
        <div className="parallax-text" style={{ top: "40px", left: "-50px" }} data-speed="-0.1">
          ABOUT
        </div>

        <div className="container">
          <header className="wb-head">
            <div>
              <p className="wb-eyebrow" data-scroll>
                <span className="eyebrow-rule" aria-hidden="true" />
                <span className="wb-wide">SYSTEMS BAY · THREE INSTRUMENTS</span>
                <span className="wb-narrow">SYSTEMS BAY · THREE DISCIPLINES</span>
              </p>
              <h2 className="section-title wb-title" id="wb-heading" data-scroll>
                What I Build
              </h2>
            </div>
            <p className="wb-lede" data-scroll>
              <span className="wb-wide">
                Three disciplines, one operator. Each bay has a working instrument rather than a description: open it
                and press something.
              </span>
              <span className="wb-narrow">
                Three disciplines, one operator: the part you touch, the part you do not, and everything sent out past the
                browser.
              </span>
            </p>
          </header>

          <div className="wb-deck" ref={deckRef} data-motion>
            <ul
              className="wb-index"
              onKeyDown={onKeyDown}
              // The open bay takes the height it needs and the others share the rest (wide screens;
              // on a phone the list is a plain stack and this is ignored).
              style={{ gridTemplateRows: BAYS.map((_, i) => (i === active ? "auto" : "minmax(auto, 1fr)")).join(" ") }}
            >
              {BAYS.map((bay, i) => {
                const open = active === i && !stacked;
                const Demo = DEMOS[i]!;
                // The face of a bay: the same on a wide screen (a button that opens its instrument) and on a
                // phone (a card with nothing to open, lit in its own colour).
                const face = (
                  <>
                    {open ? (
                      <m.i className="wb-lit" layoutId="wb-lit" transition={calm ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38 }} />
                    ) : (
                      <i className="wb-lit wb-lit--static" />
                    )}
                    <span className="wb-bay-top">
                      <Glyph name={bay.glyph} />
                      <span className="wb-bay-code">
                        {bay.code}
                        <i aria-hidden="true" />
                        <b>{bay.callsign}</b>
                      </span>
                      {!stacked && (
                        <span className="wb-bay-live" aria-hidden="true">
                          <i />
                          live
                        </span>
                      )}
                    </span>
                    <span className="wb-bay-name">
                      {bay.title[0]} <em>{bay.title[1]}</em>
                    </span>
                    <span className="wb-bay-brief">{bay.brief}</span>
                  </>
                );
                return (
                  <li key={bay.code} className="wb-item" data-tone={bay.tone} data-active={open || stacked || undefined}>
                    <div className="wb-bay">
                      {stacked ? (
                        <div className="wb-bay-btn">{face}</div>
                      ) : (
                        <button
                          type="button"
                          className="wb-bay-btn"
                          id={`wb-tab-${i}`}
                          aria-expanded={open}
                          aria-controls={`wb-panel-${i}`}
                          ref={(el) => {
                            buttons.current[i] = el;
                          }}
                          onClick={() => choose(i)}
                        >
                          {face}
                        </button>
                      )}
                      <ul className="wb-stack" aria-label={`${bay.callsign} stack`}>
                        {bay.stack.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>

                    <AnimatePresence initial={false}>
                      {open ? (
                        <m.div
                          key="panel"
                          className="wb-stage"
                          id={`wb-panel-${i}`}
                          role="region"
                          aria-labelledby={`wb-tab-${i}`}
                          inherit={false}
                          initial={stacked ? { height: 0, opacity: 0 } : { opacity: 0, y: 12 }}
                          animate={stacked ? { height: "auto", opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={stacked ? { height: 0, opacity: 0 } : { opacity: 0, y: -8 }}
                          transition={fade}
                        >
                          <Brackets calm={calm} />
                          <div className="wb-stage-in">
                            <p className="wb-stage-head">
                              <span>{bay.demo.name}</span>
                              <i>{bay.demo.line}</i>
                            </p>
                            {near ? <Demo /> : <DemoSkeleton />}
                          </div>
                        </m.div>
                      ) : null}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </MotionRoot>
  );
}

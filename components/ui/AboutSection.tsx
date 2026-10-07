"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import * as m from "motion/react-m";
import { AnimatePresence, useInView } from "motion/react";
import MotionRoot from "../motion/MotionRoot";
import Glyph from "./wb/Glyphs";
import Plates, { type Phase } from "./wb/Plates";
import { useCalm } from "./hiw/hooks";
import { BAYS, archiveUse } from "@/lib/build/stack";
import { projects } from "@/data/projects";

/**
 * AboutSection: "What I Build".
 *
 * Three disciplines, drawn as an exploded view: three plates, one for each, tied by wires. The plate being inspected
 * rises and the ones above it open upward to uncover it, and each tool of that discipline is a small drawing on
 * it. Beside the view is the legend: the same tools as a list, each with what it is for and, where the public archive
 * shows it, in how many of its projects it appears (a real count from data/projects.ts, with the projects named).
 * Pointing at a tool lights its drawing and pointing at a drawing lights its tool, and left alone the deck steps
 * through the tools by itself, slowly, until someone takes it over.
 *
 * Everything the section says is readable at rest: the drawings add the picture, not the information. The names
 * and sentences are text in the page; the plates hold no text at all.
 */

const ARCHIVE = projects.map((p) => ({ title: p.title, tech: p.tech }));

/** True while the element is on screen and the tab is visible: what the plates do by themselves, they do only then. */
function useOnScreen(ref: RefObject<Element | null>): boolean {
  const inView = useInView(ref);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return inView && visible;
}

export default function AboutSection() {
  const { calm, rich } = useCalm();
  const deckRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const run = useOnScreen(deckRef);
  const seen = useInView(stageRef, { once: true, amount: 0.3 });

  const [active, setActive] = useState(0);
  const [userHot, setUserHot] = useState<string | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [auto, setAuto] = useState(0);
  const [armed, setArmed] = useState(false);

  // The stage opens (the plates come out of a stack) the first time it is seen. It starts open, so with no script and
  // for a visitor who is already looking at it nothing happens; only a stage that is below the fold is put away first.
  useEffect(() => {
    if (calm) return;
    const el = stageRef.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.9) setArmed(true);
  }, [calm]);
  const phase: Phase = armed ? (seen ? "in" : "armed") : "ready";

  const bay = BAYS[active]!;
  const tools = bay.tools;
  const uses = useMemo(() => tools.map((t) => archiveUse(t, ARCHIVE)), [tools]);

  const autoOn = run && rich && !engaged && userHot === null && phase !== "armed";
  useEffect(() => {
    if (!autoOn) return;
    const id = window.setInterval(() => setAuto((a) => (a + 1) % tools.length), 2600);
    return () => window.clearInterval(id);
  }, [autoOn, tools.length]);
  const hot = userHot ?? (autoOn ? (tools[auto % tools.length]?.id ?? null) : null);
  const hotIndex = hot ? tools.findIndex((t) => t.id === hot) : -1;
  const seenIn = hotIndex >= 0 ? uses[hotIndex]! : [];

  const pick = useCallback((i: number) => {
    setActive(i);
    setUserHot(null);
    setAuto(0);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!(e.target as HTMLElement).closest(".wb-bay-btn")) return;
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (active + keys[e.key]! + BAYS.length) % BAYS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = BAYS.length - 1;
    if (next === null) return;
    e.preventDefault();
    pick(next);
    buttons.current[next]?.focus();
  };

  const fade = calm ? { duration: 0 } : { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] as const };

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
                SYSTEMS BAY · THREE PLATES
              </p>
              <h2 className="section-title wb-title" id="wb-heading" data-scroll>
                What I Build
              </h2>
            </div>
            <p className="wb-lede" data-scroll>
              Three disciplines, one operator. Pick a plate to open it up: every tool on it is drawn where it works, and
              the archive says how often it has shipped.
            </p>
          </header>

          <div
            className="wb-deck"
            ref={deckRef}
            data-tone={bay.tone}
            onPointerEnter={() => setEngaged(true)}
            onPointerLeave={() => setEngaged(false)}
          >
            <ul className="wb-index" role="tablist" aria-label="Disciplines" aria-orientation="vertical" onKeyDown={onKeyDown}>
              {BAYS.map((b, i) => {
                const open = active === i;
                return (
                  <li key={b.code} className="wb-item" data-tone={b.tone} data-active={open || undefined} role="presentation">
                    <button
                      type="button"
                      className="wb-bay-btn"
                      role="tab"
                      id={`wb-tab-${i}`}
                      aria-selected={open}
                      aria-controls="wb-legend"
                      tabIndex={open ? 0 : -1}
                      ref={(el) => {
                        buttons.current[i] = el;
                      }}
                      onClick={() => pick(i)}
                    >
                      {open ? (
                        <m.i className="wb-lit" layoutId="wb-lit" transition={calm ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38 }} />
                      ) : (
                        <i className="wb-lit wb-lit--static" />
                      )}
                      <span className="wb-bay-top">
                        <Glyph name={b.glyph} />
                        <span className="wb-bay-code">
                          {b.code}
                          <i aria-hidden="true" />
                          <b>{b.callsign}</b>
                        </span>
                      </span>
                      <span className="wb-bay-name">
                        {b.title[0]} <em>{b.title[1]}</em>
                      </span>
                      <span className="wb-bay-brief">{b.brief}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="wb-stage" ref={stageRef}>
              <Plates active={active} hot={hot} phase={phase} run={run} calm={calm} rich={rich} onPick={pick} onHot={setUserHot} />
            </div>

            <div className="wb-legend" id="wb-legend" role="tabpanel" aria-labelledby={`wb-tab-${active}`}>
              <p className="wb-legend-head">
                <span>
                  {bay.callsign} · {bay.plate}
                </span>
                <i>{tools.length} tools</i>
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <m.ul
                  key={active}
                  className="wb-tools"
                  data-tone={bay.tone}
                  inherit={false}
                  initial={calm ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={calm ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={fade}
                >
                  {tools.map((tool, k) => {
                    const used = uses[k]!;
                    return (
                      <li key={tool.id}>
                        <button
                          type="button"
                          className="wb-tool"
                          data-hot={hot === tool.id || undefined}
                          aria-label={`${tool.name}, ${tool.tag}. ${tool.role}${used.length ? ` In ${used.length} of ${ARCHIVE.length} archive projects.` : ""}`}
                          onPointerEnter={(e) => e.pointerType === "mouse" && setUserHot(tool.id)}
                          onPointerLeave={(e) => e.pointerType === "mouse" && setUserHot(null)}
                          onFocus={() => setUserHot(tool.id)}
                          onBlur={() => setUserHot(null)}
                          onClick={(e) => {
                            // A mouse has hover. A tap holds the tool (the focus it gives the button already did, but a browser
                            // that does not focus a button on tap needs this), and a tap anywhere else lets go (the blur).
                            if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
                            setUserHot(tool.id);
                          }}
                        >
                          <i className="wb-tool-pin" aria-hidden="true" />
                          <span className="wb-tool-main">
                            <b className="wb-tool-name">{tool.name}</b>
                            <span className="wb-tool-tag">{tool.tag}</span>
                          </span>
                          {used.length > 0 && (
                            <span className="wb-pips" aria-hidden="true">
                              {ARCHIVE.map((p, n) => (
                                <i key={p.title} data-on={used.includes(n) || undefined} />
                              ))}
                              <em>
                                {used.length}/{ARCHIVE.length}
                              </em>
                            </span>
                          )}
                          <span className="wb-tool-role">{tool.role}</span>
                        </button>
                      </li>
                    );
                  })}
                </m.ul>
              </AnimatePresence>
              <p className="wb-seen" aria-live="polite">
                {seenIn.length > 0 ? (
                  <>
                    <b>In the archive:</b> {seenIn.slice(0, 4).map((n) => ARCHIVE[n]!.title).join(", ")}
                    {seenIn.length > 4 ? ` and ${seenIn.length - 4} more` : ""}
                  </>
                ) : (
                  "Point at a mark on the plate, or at a tool in the list."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </MotionRoot>
  );
}

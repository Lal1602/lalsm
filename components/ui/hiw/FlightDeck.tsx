"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import { animate, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type AnimationPlaybackControls } from "motion/react";
import Ship from "./Ship";
import Station from "./Station";
import StageBay from "./StageBay";
import RollingNumber from "./RollingNumber";
import { useCalm, useElementWidth, useMediaQuery } from "./hooks";
import {
  MAP_H,
  MAP_W,
  PATH_D,
  STATION_PTS,
  STATION_U,
  autoProgress,
  nearestStation,
  stagePosition,
  uAtX,
} from "@/lib/flight/path";
import { STAGES, TOTAL_RANGE, elapsedAtStage, pct } from "@/lib/flight/stages";

/** How loosely the ship follows where it is told to go. */
const SHIP_SPRING = { type: "spring" as const, stiffness: 82, damping: 17, mass: 0.9 };

const GRID_Y = [30, 60, 90, 120];
const GRID_X = Array.from({ length: 21 }, (_, i) => i * 50);

/** Station positions as percentages of the map, for the hairlines that drop to each bay. */
const STATION_X = STATION_PTS.map(([x]) => (x / MAP_W) * 100);
const STATION_Y = STATION_PTS.map(([, y]) => (y / MAP_H) * 100);

/** Ship progress for a rail scroll position (0..1): between the first and last station. A rail that has not been measured yet reports NaN, which must never reach a transform. */
const railToProgress = (p: number) => STATION_U[0]! + (Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0) * (STATION_U[STATION_U.length - 1]! - STATION_U[0]!);

const mapVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

/**
 * The flight deck: a trajectory with four stations, a ship that flies it, and a
 * docking bay under each station.
 *
 * Two things can fly the ship, and the deck never lets them fight:
 *
 *   autopilot   scrolling the section flies the ship from the launch pad to the last
 *               station. Native scroll, no pinning: the page is never held.
 *   manual      the moment you act on the deck (hover a bay, press a station, drag
 *               the ship, hold a button, press an arrow key) the ship goes where you
 *               send it and stays there, and scrolling stops moving it. Leaving the
 *               section, or pressing AUTOPILOT, hands it back to the page.
 *
 * On a phone the bays are a swipe rail and the rail drives the ship instead: your
 * thumb is the throttle.
 */
export default function FlightDeck() {
  const { calm, rich, particles } = useCalm();
  const isRail = useMediaQuery("(max-width: 860px)");

  const deckRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLOListElement>(null);

  // ── Where the ship is ──
  // One motion value, flown by an imperative spring that every driver calls through fly().
  // animate() carries the value's current velocity into each new spring, so being re-aimed on
  // every scroll event reads as one continuous flight rather than a string of restarts. (A
  // spring that follows a second motion value was tried first; a stale follow animation could
  // drag the ship back to its old position after it was placed.)
  const ship = useMotionValue(0);
  const flight = useRef<AnimationPlaybackControls | null>(null);
  /** Where the ship is heading, so a drag can dock at the right station on release. */
  const aim = useRef(0);
  const fly = useCallback(
    (to: number) => {
      aim.current = to;
      flight.current?.stop();
      if (calm) ship.set(to);
      else flight.current = animate(ship, to, SHIP_SPRING);
    },
    [calm, ship],
  );
  /** Put the ship somewhere without flying there. */
  const place = useCallback(
    (to: number) => {
      aim.current = to;
      flight.current?.stop();
      ship.set(to);
    },
    [ship],
  );
  const mapWidth = useElementWidth(mapRef);
  // The lit trail gets its OWN value derived from the ship's. Handing `ship` itself to the path as
  // style.pathLength let Motion reset it to 0 when that element was constructed, which parked the
  // ship on the launch pad no matter where it had been placed.
  const trail = useTransform(ship, (v) => v);

  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [engaged, setEngaged] = useState<number[]>([]);
  const [pulse, setPulse] = useState<number[]>(() => STAGES.map(() => 0));
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);

  // Event callbacks read these; keeping them in refs avoids re-subscribing every change.
  const modeRef = useRef(mode);
  const railRefFlag = useRef(isRail);
  const activeRef = useRef(0);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    railRefFlag.current = isRail;
  }, [isRail]);

  // ── Autopilot: the section's scroll position flies the ship ──
  // The flight starts as the deck's top edge enters the screen and ends when its bottom edge
  // reaches the middle of it, i.e. when the bays are properly in view: the ship arrives about
  // when the visitor has scrolled the deck into its reading position.
  const { scrollYProgress } = useScroll({ target: deckRef, offset: ["start 90%", "end 62%"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (modeRef.current === "auto" && !railRefFlag.current) fly(autoProgress(p));
  });

  // ── Rail (phones): the rail's own scroll flies the ship between station one and four ──
  const rail = useScroll({ container: railRef });
  useMotionValueEvent(rail.scrollXProgress, "change", (p) => {
    if (!railRefFlag.current) return;
    fly(railToProgress(p));
  });

  // Hand the ship to whichever driver applies now (first paint, resize across the breakpoint).
  // Placed, not flown: on first paint the ship simply is where the driver says.
  useEffect(() => {
    let u: number | null = null;
    if (isRail) u = railToProgress(rail.scrollXProgress.get());
    else if (mode === "auto") u = autoProgress(scrollYProgress.get());
    if (u !== null) place(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRail]);

  // The stage the ship is nearest to is the active one.
  useMotionValueEvent(ship, "change", (v) => {
    const k = nearestStation(v);
    if (k !== activeRef.current) {
      activeRef.current = k;
      setActive(k);
      // Passing a station pings it, so flying the route by scrolling is felt as well as seen.
      if (!calm) setPulse((prev) => prev.map((n, i) => (i === k ? n + 1 : n)));
    }
  });

  // ── Readouts, all derived from the ship's position ──
  const elapsedRaw = useTransform(ship, (v) => Math.round(elapsedAtStage(stagePosition(v)) * 100));
  // Spring between whole numbers: the wheels roll when the figure changes and rest exactly on a digit.
  const elapsedSprung = useSpring(elapsedRaw, { stiffness: 170, damping: 24, mass: 0.6 });
  const elapsed = calm ? elapsedRaw : elapsedSprung;

  // ── Commands ──
  const goTo = useCallback(
    (index: number) => {
      const k = Math.max(0, Math.min(STAGES.length - 1, index));
      if (railRefFlag.current) {
        const el = railRef.current;
        const card = el?.children[k] as HTMLElement | undefined;
        if (el && card) {
          const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
          el.scrollTo({ left: card.offsetLeft - pad, behavior: calm ? "auto" : "smooth" });
        }
      } else {
        setMode("manual");
        fly(STATION_U[k]!);
      }
      activeRef.current = k;
      setActive(k);
    },
    [calm, fly],
  );

  const engage = useCallback(
    (index: number) => {
      goTo(index);
      setEngaged((prev) => (prev.includes(index) ? prev : [...prev, index]));
      setPulse((prev) => prev.map((n, i) => (i === index ? n + 1 : n)));
    },
    [goTo],
  );

  const handBack = useCallback(() => {
    setMode("auto");
    setEngaged([]);
    if (!railRefFlag.current) fly(autoProgress(scrollYProgress.get()));
  }, [scrollYProgress, fly]);

  // Leaving the section hands the ship back to the page, so the next visit starts fresh.
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && modeRef.current === "manual") handBack();
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [handBack]);

  // ── Dragging the ship along the route ──
  const mapX = (clientX: number) => {
    const r = mapRef.current?.getBoundingClientRect();
    return r ? ((clientX - r.left) / r.width) * MAP_W : 0;
  };

  // ── Keyboard: arrows move between stations ──
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest(".fd-engage")) return;
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    const jump = e.key === "Home" ? 0 : e.key === "End" ? STAGES.length - 1 : -1;
    if (!dir && jump < 0) return;
    e.preventDefault();
    const next = jump >= 0 ? jump : Math.max(0, Math.min(STAGES.length - 1, activeRef.current + dir));
    goTo(next);
    mapRef.current?.querySelectorAll<HTMLElement>(".fd-st")[next]?.focus();
  };

  const [loLo, loHi] = TOTAL_RANGE;

  return (
    <div
      className="fd"
      ref={deckRef}
      data-motion
      data-mode={mode}
      data-ready={ready || undefined}
      data-calm={calm || undefined}
      data-rail={isRail || undefined}
      role="group"
      aria-label="Flight plan: four stages"
      onKeyDown={onKeyDown}
    >
      {/* ── The map ── */}
      <m.div
        className="fd-map"
        ref={mapRef}
        variants={mapVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <svg className="fd-plot" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="fd-ramp" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={MAP_W} y2="0">
              <stop offset="0%" stopColor="var(--stage-tone-0)" />
              <stop offset="38%" stopColor="var(--stage-tone-1)" />
              <stop offset="68%" stopColor="var(--stage-tone-2)" />
              <stop offset="100%" stopColor="var(--stage-tone-3)" />
            </linearGradient>
          </defs>
          {/* Blueprint ground: a few hairlines and a scale along the bottom. */}
          <g className="fd-grid">
            {GRID_Y.map((y) => (
              <line key={y} x1="0" x2={MAP_W} y1={y} y2={y} />
            ))}
            {GRID_X.map((x, i) => (
              <line key={x} x1={x} x2={x} y1={MAP_H} y2={MAP_H - (i % 5 === 0 ? 9 : 4)} />
            ))}
          </g>
          <path className="fd-route-dots" d={PATH_D} />
          <m.path
            className="fd-route"
            d={PATH_D}
            variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.7, ease: [0.65, 0, 0.35, 1] } } }}
          />
          {/* inherit={false}: the ship, its trail and the clock are driven by motion values, not by the entrance choreography. Inside the variant tree Motion held their updates back until the entrance had finished, which left the ship on the launch pad for the first couple of seconds. */}
          <m.path className="fd-trail" d={PATH_D} inherit={false} style={{ pathLength: trail }} />
        </svg>

        {STATION_U.map((_, i) => (
          <i
            key={i}
            className="fd-drop"
            aria-hidden="true"
            data-active={active === i || undefined}
            style={{
              left: `${STATION_X[i]}%`,
              top: `${STATION_Y[i]}%`,
              ["--tone-rgb" as string]: `var(--stage-tone-${i}-rgb)`,
            }}
          />
        ))}

        {/* The scrubber: drag anywhere on the map to fly the ship; let go and it docks at the nearest station. */}
        {!isRail && (
          <m.div
            className="fd-scrub"
            aria-hidden="true"
            tabIndex={-1}
            onPanStart={() => {
              setMode("manual");
              setDragging(true);
            }}
            onPan={(_, info) => fly(uAtX(mapX(info.point.x - window.scrollX)))}
            onPanEnd={() => {
              setDragging(false);
              goTo(nearestStation(aim.current));
            }}
            onTap={(_, info) => goTo(nearestStation(uAtX(mapX(info.point.x - window.scrollX))))}
          />
        )}

        {STATION_U.map((_, i) => (
          <Station key={i} i={i} active={active === i} engaged={engaged.includes(i)} pulse={pulse[i]!} rich={rich} onSelect={goTo} />
        ))}

        <Ship progress={ship} mapWidth={mapWidth} calm={calm} dragging={dragging} />

        {/* ── Mission readout ── */}
        <div className="fd-hud" aria-hidden="true">
          <p className="fd-hud-k">Mission clock</p>
          <div className="fd-hud-row">
            <p className="fd-hud-v">
              <RollingNumber value={elapsed} places={3} />
              <i>%</i>
            </p>
            <p className="fd-hud-s">
              elapsed
              <b>
                stage {STAGES[active]!.num} / 0{STAGES.length}
              </b>
            </p>
          </div>
        </div>

        <button
          type="button"
          className="fd-auto"
          aria-pressed={mode === "auto"}
          onClick={handBack}
          disabled={mode === "auto" && !isRail}
        >
          <i aria-hidden="true" />
          {isRail ? "Swipe to fly" : mode === "auto" ? "Autopilot" : "Resume autopilot"}
        </button>

        <p className="fd-total" aria-hidden="true">
          ≈ {Math.round(loLo)}–{Math.round(loHi)} weeks end to end <i>·</i> launch is not the end of the work
        </p>
      </m.div>

      {/* ── The bays ── */}
      <m.ol
        className="fd-bays"
        ref={railRef}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.02 } } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        onAnimationComplete={() => setReady(true)}
      >
        {STAGES.map((_, i) => (
          <StageBay
            key={i}
            i={i}
            active={active === i}
            engaged={engaged.includes(i)}
            calm={calm}
            rich={rich}
            particles={particles}
            // Hover or keyboard focus on a bay sends the ship to its station.
            onActivate={(k) => {
              if (activeRef.current !== k || modeRef.current === "auto") goTo(k);
            }}
            onEngage={engage}
          />
        ))}
      </m.ol>

      {/* Where you are, when only one bay fits on screen. */}
      <p className="fd-count" aria-hidden="true">
        <span>{STAGES[active]!.num}</span>
        <span className="fd-dots">
          {STAGES.map((_, i) => (
            <i key={i} data-on={i === active || undefined} style={{ ["--tone" as string]: `var(--stage-tone-${i})` }} />
          ))}
        </span>
        <span className="fd-count-total">04</span>
        <span className="fd-count-pct">{pct(elapsedAtStage(active + 1))}</span>
      </p>

      <p className="fd-live" aria-live="polite">
        {`Stage ${STAGES[active]!.num} of ${STAGES.length}: ${STAGES[active]!.name}, ${STAGES[active]!.time}. ${engaged.includes(active) ? "Engaged." : ""}`}
      </p>
    </div>
  );
}


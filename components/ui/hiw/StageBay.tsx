"use client";
import { useRef } from "react";
import * as m from "motion/react-m";
import { animate, stagger, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";
import EngageButton from "./EngageButton";
import { CUMULATIVE, SHARE, STAGES, pct } from "@/lib/flight/stages";

/** Which end each name's letter-wave starts from: same gesture, a different direction each time. */
const WAVE_FROM = ["first", "center", "last", "first"] as const;

/**
 * One stage, drawn as a docking bay: a flat tonal panel with hairline corner
 * brackets and a ruler along its top edge, not a rounded card.
 *
 * What is always on the page, with nothing behind a hover: the number, the name,
 * what happens, how long it takes, its share of the job and what you get at the end.
 * What the pointer adds is emphasis and play: the bay leans toward you on a spring
 * with a highlight that slides across its face, the numbers count up, the name's
 * letters ripple, and a scan line crosses it.
 */
export default function StageBay({
  i,
  active,
  engaged,
  calm,
  rich,
  particles,
  onActivate,
  onEngage,
}: {
  i: number;
  active: boolean;
  engaged: boolean;
  calm: boolean;
  rich: boolean;
  particles: number;
  onActivate: (i: number) => void;
  onEngage: (i: number) => void;
}) {
  const stage = STAGES[i]!;
  const root = useRef<HTMLLIElement>(null);
  const size = useRef({ w: 300, h: 360 });

  // ── Tilt: pointer position inside the bay, as -0.5..0.5, run through springs ──
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 170, damping: 17, mass: 0.7 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), spring);
  const sheenX = useSpring(useTransform(px, (v) => v * size.current.w * 1.1), spring);
  const sheenY = useSpring(useTransform(py, (v) => v * size.current.h * 1.1), spring);
  const sheenO = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });

  const track = (e: PointerEvent<HTMLLIElement>) => {
    if (!rich || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    size.current = { w: r.width, h: r.height };
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  // ── Counting: the duration and the share come up to their values when the bay is entered ──
  const lo = useMotionValue(0);
  const hi = useMotionValue(0);
  const share = useMotionValue(0);
  const loText = useTransform(lo, (v) => Math.round(v));
  const hiText = useTransform(hi, (v) => Math.round(v));
  const shareText = useTransform(share, (v) => `${Math.round(v)}%`);

  const countUp = () => {
    const to = { lo: stage.range[0], hi: stage.range[1], share: SHARE[i]! * 100 };
    if (calm) {
      lo.set(to.lo);
      hi.set(to.hi);
      share.set(to.share);
      return;
    }
    animate(lo, to.lo, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    animate(hi, to.hi, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    animate(share, to.share, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
  };

  // ── The name's letters ripple ──
  const scan = useRef<HTMLElement>(null);
  const ripple = () => {
    const el = root.current;
    if (!el || calm) return;
    const chars = el.querySelectorAll<HTMLElement>(".fd-char");
    // Three keyframes (up and back), so a tween: springs only take two.
    animate(chars, { y: [0, -9, 0] }, { delay: stagger(0.028, { from: WAVE_FROM[i] }), duration: 0.46, ease: "easeInOut" });
    const s = scan.current;
    if (s) animate(s, { y: [0, el.offsetHeight], opacity: [0, 1, 1, 0] }, { duration: 0.9, ease: "easeInOut" });
  };

  const enter = (e: PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    onActivate(i);
    sheenO.set(1);
    ripple();
    countUp();
  };
  const leave = () => {
    px.set(0);
    py.set(0);
    sheenO.set(0);
  };

  return (
    <m.li
      ref={root}
      className="fd-bay"
      data-active={active || undefined}
      data-engaged={engaged || undefined}
      data-cursor-text={`STAGE ${stage.num}`}
      style={{
        ["--tone" as string]: `var(--stage-tone-${i})`,
        ["--tone-rgb" as string]: `var(--stage-tone-${i}-rgb)`,
        rotateX: rich ? rotateX : 0,
        rotateY: rich ? rotateY : 0,
        transformPerspective: 900,
      }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20, delay: 0.1 + i * 0.09 } },
      }}
      viewport={{ once: true, amount: 0.35 }}
      onViewportEnter={() => window.setTimeout(countUp, 500 + i * 120)}
      onPointerEnter={enter}
      onPointerMove={track}
      onPointerLeave={leave}
      onFocusCapture={() => onActivate(i)}
    >
      <div className="fd-bay-in">
        <i className="fd-corner fd-corner-tl" aria-hidden="true" />
        <i className="fd-corner fd-corner-tr" aria-hidden="true" />
        <i className="fd-corner fd-corner-bl" aria-hidden="true" />
        <i className="fd-corner fd-corner-br" aria-hidden="true" />
        <i className="fd-ruler" aria-hidden="true" />
        <i className="fd-scan" ref={scan} aria-hidden="true" />
        {rich && <m.i className="fd-sheen" style={{ x: sheenX, y: sheenY, opacity: sheenO }} aria-hidden="true" />}

        <p className="fd-bay-meta">
          <span className="fd-num" aria-hidden="true">
            <span className="fd-num-base">{stage.num}</span>
            <i className="fd-num-fill">{stage.num}</i>
          </span>
          <span className="fd-bay-code">
            BAY {stage.num} <i>/ 04</i>
          </span>
        </p>

        <h3 className="fd-name" aria-label={stage.name}>
          {stage.name.split("").map((ch, j) => (
            <span key={j} className="fd-char" aria-hidden="true">
              {ch}
            </span>
          ))}
        </h3>

        <p className="fd-desc">{stage.desc}</p>

        <dl className="fd-data">
          <div>
            <dt>Duration</dt>
            <dd aria-label={stage.time}>
              <m.b>{loText}</m.b>–<m.b>{hiText}</m.b> <i>{stage.unit}</i>
            </dd>
          </div>
          <div>
            <dt>Share of job</dt>
            <dd>
              <m.b>{shareText}</m.b>
            </dd>
          </div>
        </dl>

        <div className="fd-share" aria-hidden="true">
          <m.i
            className="fd-share-fill"
            variants={{
              hidden: { scaleX: 0 },
              show: { scaleX: SHARE[i]!, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.1 } },
            }}
          />
          <i className="fd-share-mark" style={{ left: pct(CUMULATIVE[i]!) }} />
        </div>

        <p className="fd-out">
          <i className="fd-check" aria-hidden="true" />
          <span>
            <small>You get</small>
            {stage.gives}
          </span>
          <b className="fd-elapsed" aria-hidden="true">
            {pct(CUMULATIVE[i]!)}
            <small>elapsed</small>
          </b>
        </p>

        <EngageButton
          engaged={engaged}
          calm={calm}
          particles={particles}
          label={stage.name}
          onEngage={() => onEngage(i)}
        />
      </div>
    </m.li>
  );
}

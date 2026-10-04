"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useMotionValue, type MotionValue } from "motion/react";
import MotionRoot from "@/components/motion/MotionRoot";
import { getEntrance, getServerEntrance, setEntrance, subscribeEntrance } from "@/lib/entrance";
import { useLite } from "@/lib/lite";
import { useQuality } from "@/lib/quality";
import { useCalm, useHydrated, useMediaQuery } from "@/components/ui/hiw/hooks";
import { runEntrance } from "./entrance";
import { createPointerField, type PointerMode } from "./pointer";
import { createScrollOut } from "./scrollOut";
import { createOrbitField } from "./orbitField";
import { createPortraitDots, type PortraitDots } from "./portraitField";
import Orbit from "./Orbit";
import { createSpecimenField } from "./specimenField";
import Specimen from "./Specimen";
import Lens from "./Lens";
import Actions from "./Actions";
import { Corners, Cue, Ruler } from "./Chrome";
import Headline from "./Headline";
import Ledger from "./Ledger";
import Portrait from "./Portrait";

interface Props {
  name: string;
  affiliation: string;
  lede: string;
  archive: number;
  lat: number;
  lon: number;
}

/** If the preloader never reports (it always does on the home page), the hero must not stay hidden. */
const ENTRANCE_FAILSAFE_MS = 12000;

/**
 * The hero. Everything in it is real: the headline is the role, the ledger is facts, the corners
 * and ruler are instrument chrome. The page's starfield behind it is untouched; this section has no
 * background of its own.
 */
export default function HeroStage(props: Props) {
  return (
    <MotionRoot>
      <HeroBody {...props} />
    </MotionRoot>
  );
}

function HeroBody({ name, affiliation, lede, archive, lat, lon }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const dotsRef = useRef<PortraitDots | null>(null);
  const count: MotionValue<number> = useMotionValue(archive);
  const entrance = useSyncExternalStore(subscribeEntrance, getEntrance, getServerEntrance);

  // The preloader moves the state to "entering" as its curtain lifts; play the sequence then.
  useEffect(() => {
    if (entrance !== "entering") return;
    const root = rootRef.current;
    if (!root) return;
    const run = runEntrance({ root, count, archive, develop: dotsRef.current?.develop ?? null });
    void run.done.then(() => setEntrance("done"));
    return () => run.cancel();
  }, [entrance, count, archive]);

  // What answers the pointer, by what the visitor's settings and device can carry:
  //   a mouse on a capable device: lens, letters, portrait tilt and its lens, ruler;  a device that is struggling
  //   (any lower tier), or a touch screen: the lens alone, which is the cheap part and the signature;
  //   reduced motion: a lens that follows exactly, no springs;  Lite: nothing, the finished hero stays still.
  const { lite } = useLite();
  const { calm, rich } = useCalm();
  const { tier } = useQuality();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const hydrated = useHydrated();
  let mode: PointerMode | null = null;
  if (!lite) {
    if (calm) mode = fine ? "direct" : null;
    else if (fine && rich) mode = "full";
    else mode = "lens";
  }
  const lensed = hydrated && mode !== null;

  // The portrait's dots. They are there with the full site and with Lite alike (drawn once, they cost
  // nothing); the pointer system below drives their lens, and the entrance brings them in.
  useEffect(() => {
    if (!hydrated) return;
    const root = rootRef.current;
    if (!root) return;
    const handle = createPortraitDots(root, { sweep: !calm && !fine });
    dotsRef.current = handle;
    return () => {
      handle?.dispose();
      dotsRef.current = null;
    };
  }, [hydrated, calm, fine]);

  useEffect(() => {
    if (entrance !== "done" || !lensed || !mode) return;
    const root = rootRef.current;
    if (!root) return;
    return createPointerField(root, mode, dotsRef.current);
  }, [entrance, lensed, mode, calm, fine]);

  // Leaving the hero: its parts come apart as the page scrolls. Not for calm visitors or the leanest tier.
  const scrolls = hydrated && !calm && tier < 3;
  useEffect(() => {
    if (entrance !== "done" || !scrolls) return;
    const root = rootRef.current;
    if (!root) return;
    return createScrollOut(root);
  }, [entrance, scrolls]);

  // The rings round the full stop. Present whenever the full site is (not Lite); they turn slowly on
  // their own, take extra turn from scrolling and brighten near the pointer, unless the visitor is calm.
  const orbited = hydrated && !lite;
  useEffect(() => {
    if (!orbited) return;
    const root = rootRef.current;
    if (!root) return;
    return createOrbitField(root, { motion: !calm && tier < 3, pointer: !calm && fine });
  }, [orbited, calm, tier, fine]);

  // The type-specimen guides behind the headline: present with the full site, awake near a mouse.
  useEffect(() => {
    if (!orbited) return;
    const root = rootRef.current;
    if (!root) return;
    return createSpecimenField(root, { pointer: !calm && fine });
  }, [orbited, calm, fine]);

  useEffect(() => {
    if (entrance !== "waiting") return;
    const timer = window.setTimeout(() => setEntrance("entering"), ENTRANCE_FAILSAFE_MS);
    return () => window.clearTimeout(timer);
  }, [entrance]);

  return (
    <>
      <section id="home" ref={rootRef} className="hx" data-motion aria-label="Introduction">
        {orbited && <Specimen />}
        {orbited && <Orbit />}
        <Corners />
        <Ruler />

        <div className="hx-frame">
          <p className="hx-kicker">
            <i className="eyebrow-rule" aria-hidden="true" />
            <span>{name}</span>
            <span className="hx-kicker-dim">{affiliation}</span>
          </p>

          <Headline />

          <div className="hx-aside">
            <p className="hx-lede">{lede}</p>
            <Actions />
          </div>

          <Portrait name={name} />
          {lensed && <Lens />}
        </div>

        <div className="hx-foot">
          <i className="hx-hair" aria-hidden="true" />
          <Ledger count={count} archive={archive} lat={lat} lon={lon} />
          <Cue />
        </div>
      </section>
    </>
  );
}

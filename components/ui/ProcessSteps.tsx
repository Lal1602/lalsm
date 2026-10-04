"use client";
import { useRef } from "react";
import { Constellation } from "./ascentSky";
import CosmicNebulaSeam from "./CosmicNebulaSeam";
import FlightDeck from "./hiw/FlightDeck";
import HiwSky from "./hiw/HiwSky";
import MotionRoot from "../motion/MotionRoot";
import { useSeamSnap } from "./useSeamSnap";

/**
 * ProcessSteps — the "How I Work" section, as a flight deck.
 *
 * A process has a direction and a duration, so it is one trajectory with four
 * stations on it, running out past the last because launch is not the end of the
 * work. A ship flies it: scrolling the section is the autopilot, and acting on the
 * deck (hover, press, drag, hold, arrow keys) takes the controls. The section is one
 * screen tall and never pins: four stages should not cost four screens of scrolling.
 *
 * All four stages are legible at rest with nothing behind a selection. What the
 * interactions add is emphasis and play, never information.
 *
 * The pieces (components/ui/hiw):
 *   HiwSky        three depth layers of stars and two planets, moved by scroll,
 *                 pointer and scroll velocity (Framer Motion, transforms only);
 *   FlightDeck    the map, the ship, the readouts, the state machine;
 *   StageBay      one docking bay: tilt, count-up, letter ripple, hold-to-engage;
 *   Station, Ship, EngageButton, RollingNumber: the parts.
 * The geometry and every figure shown come from lib/flight, which is pure and tested.
 */
export default function ProcessSteps() {
  const sectionRef = useRef<HTMLElement>(null);
  // Its bottom edge is the seam into the Playground: keep it on a whole device pixel (lib/seamGrid).
  useSeamSnap(sectionRef);

  return (
    <MotionRoot>
      <section className="section hiw-section" id="workflow" aria-labelledby="ascent-heading" ref={sectionRef}>
        <HiwSky sectionRef={sectionRef} />

        {/* The nebula seam, upper half (the shared renderer in lib/space). */}
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
            <FlightDeck />
          </div>
        </div>
      </section>
    </MotionRoot>
  );
}

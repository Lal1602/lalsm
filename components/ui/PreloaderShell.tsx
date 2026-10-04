import { DIAL_TICKS, SPLASH_TASKS } from "@/lib/splash";

/**
 * The splash screen's markup. A server component with no state of its own: it is part of the HTML the server
 * sends, so it is in the very first paint (the stylesheet that dresses it is render-blocking), before any
 * script has run and long before the page's own components have hydrated. The hero and everything else are
 * behind it from the first pixel, not from the moment a lazily loaded component arrives.
 *
 * The controller (Preloader.tsx) finds these elements by their data-pl attributes and writes the real numbers
 * into them; the intro (the dial fading up, the horizon drawing itself, the sweep turning) is CSS and runs
 * without it. The markup is not part of any React tree on the client, so there is nothing to hydrate.
 */

const CENTRE = 200;
const ARC_RADIUS = 148;

const polar = (radius: number, degrees: number) => {
  const a = ((degrees - 90) * Math.PI) / 180;
  return `${(CENTRE + radius * Math.cos(a)).toFixed(2)} ${(CENTRE + radius * Math.sin(a)).toFixed(2)}`;
};

/** The arc of one task on the dial: an eighth of a turn, less a gap at each end. */
function arcPath(index: number, count: number) {
  const span = 360 / count;
  const gap = 3.2;
  return `M ${polar(ARC_RADIUS, index * span + gap)} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${polar(ARC_RADIUS, (index + 1) * span - gap)}`;
}

const ticks = Array.from({ length: DIAL_TICKS }, (_, i) => {
  const long = i % 5 === 0;
  return { angle: (i * 360) / DIAL_TICKS, y2: long ? 30 : 20, long };
});

/** A reel of the odometer. The leading zeros start dim (the controller keeps them so while they are leading). */
const column = (cells: string[], ghost: boolean) => (
  <span className={ghost ? "pl-digit is-ghost" : "pl-digit"}>
    <span className="pl-reel" data-pl="reel">
      {cells.map((c, i) => (
        <i key={i}>{c}</i>
      ))}
    </span>
  </span>
);

export default function PreloaderShell() {
  const count = SPLASH_TASKS.length;
  return (
    <div
      className="preloader"
      role="progressbar"
      aria-label="Loading the portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <i className="pl-horizon" data-pl="horizon" aria-hidden="true" />
      <div className="pl-stage" data-pl="stage">
        <div className="pl-field" data-pl="field" aria-hidden="true" />

        <div className="pl-dial" aria-hidden="true">
          <div className="pl-sweep" />
          <svg viewBox="0 0 400 400" focusable="false">
            <g className="pl-ticks">
              {ticks.map((t, i) => (
                <line
                  key={i}
                  className={t.long ? "pl-tick pl-tick--long" : "pl-tick"}
                  data-pl="tick"
                  x1={CENTRE}
                  y1={8}
                  x2={CENTRE}
                  y2={t.y2}
                  transform={`rotate(${t.angle} ${CENTRE} ${CENTRE})`}
                />
              ))}
            </g>
            <g className="pl-arcs">
              {SPLASH_TASKS.map((task, i) => (
                <path key={task.name} className="pl-arc" data-task={task.name} d={arcPath(i, count)} />
              ))}
            </g>
          </svg>

          <div className="pl-count">
            {column(["0", "1"], true)}
            {column(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], true)}
            {column(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], false)}
            <span className="pl-pct">%</span>
          </div>
        </div>

        <p className="pl-read" data-pl="read" aria-hidden="true">
          {`Waiting on ${count} systems`}
        </p>

        <span className="pl-corner pl-corner--tl" aria-hidden="true">
          LALSM / Observatory
        </span>
        <span className="pl-corner pl-corner--tr" data-pl="clock" aria-hidden="true">
          WIB --:--
        </span>
        <span className="pl-corner pl-corner--bl" data-pl="locked" aria-hidden="true">
          {`0/${count} locked`}
        </span>
        <span className="pl-corner pl-corner--br" data-pl="elapsed" aria-hidden="true">
          0.0s
        </span>
      </div>
    </div>
  );
}

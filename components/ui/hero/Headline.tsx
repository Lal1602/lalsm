import type { CSSProperties } from "react";
import { kernBefore } from "@/lib/hero/kerning";
import { nodesFor, pointsAttr, skeletonFor } from "@/lib/hero/skeleton";

/** The two lines of the headline. The full stop after the last one is the beacon. */
export const HEADLINE_LINES = ["Creative", "Developer"] as const;

/**
 * A letter's skeleton drawn as a constellation: its strokes' centre lines, and a star at each joint.
 * Only in the lit copy (what the lens shows); the real headline never carries it.
 */
function Constellation({ letter }: { letter: string }) {
  const strokes = skeletonFor(letter);
  if (strokes.length === 0) return null;
  const nodes = nodesFor(letter);
  return (
    <span className="hx-sk" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        {strokes.map((stroke, i) => (
          <polyline key={i} points={pointsAttr(stroke)} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {nodes.map(([x, y], i) => (
        <i key={i} className="hx-node" style={{ left: `${x}%`, top: `${y}%` }} />
      ))}
    </span>
  );
}

function Word({ word, offset, lit }: { word: string; offset: number; lit: boolean }) {
  return (
    <>
      {Array.from(word).map((ch, i) => {
        const k = kernBefore(word[i - 1], ch);
        return (
          <span
            key={i}
            className="hx-ch"
            data-i={offset + i}
            style={k ? ({ ["--k" as string]: k } as CSSProperties) : undefined}
          >
            {ch}
            {lit && <Constellation letter={ch} />}
          </span>
        );
      })}
    </>
  );
}

/**
 * The headline, set one letter per element. Plain markup with no state, so it can be rendered twice:
 * once as the real <h1> and once, hidden from assistive tech, as the lit copy the lens reveals.
 * The text is written in sentence case and set in capitals by CSS, so what a screen reader and the
 * text content see is "Creative Developer."
 */
export default function Headline({ lit = false }: { lit?: boolean }) {
  const [first, second] = HEADLINE_LINES;
  const body = (
    <>
      <span className="hx-line" data-line="0" aria-hidden="true">
        <span className="hx-line-in">
          <Word word={first} offset={0} lit={lit} />
        </span>
      </span>{" "}
      <span className="hx-line" data-line="1" aria-hidden="true">
        <span className="hx-line-in">
          <Word word={second} offset={first.length} lit={lit} />
          <span className="hx-stop" aria-hidden="true">
            <i className="hx-ping" />.
          </span>
        </span>
      </span>
    </>
  );

  if (lit) {
    return (
      <div className="hx-title hx-title-lit" aria-hidden="true">
        {body}
      </div>
    );
  }
  return (
    <h1 className="hx-title" aria-label="Creative Developer">
      {body}
    </h1>
  );
}

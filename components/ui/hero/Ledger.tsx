"use client";
import type { MotionValue } from "motion/react";
import RollingNumber from "@/components/ui/hiw/RollingNumber";
import { formatLat, formatLon } from "@/lib/hero/format";
import { useJakartaClock } from "./hooks";

/**
 * One row of facts under the headline, each of them true: how many plates are in the archive, what
 * time it is where the work is made, and where that is.
 */
export default function Ledger({
  count,
  archive,
  lat,
  lon,
}: {
  /** The archive figure as a motion value: the entrance rolls it up from zero. */
  count: MotionValue<number>;
  archive: number;
  lat: number;
  lon: number;
}) {
  const clock = useJakartaClock();
  const places = String(archive).length;

  return (
    <dl className="hx-ledger">
      <div className="hx-cell">
        <dt>Archive</dt>
        <dd>
          <a href="#projects" className="hx-cell-link">
            <RollingNumber value={count} places={places} label={String(archive)} />
            <span className="hx-unit">plates</span>
          </a>
        </dd>
      </div>
      <div className="hx-cell">
        <dt>Surabaya</dt>
        <dd className="hx-clock" suppressHydrationWarning>
          {clock}
          <span className="hx-unit">WIB</span>
        </dd>
      </div>
      <div className="hx-cell hx-cell-pos">
        <dt>Position</dt>
        <dd>
          {formatLat(lat)} <span className="hx-sep">·</span> {formatLon(lon)}
        </dd>
      </div>
    </dl>
  );
}

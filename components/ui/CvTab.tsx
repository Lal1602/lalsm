"use client";

import { useEffect, useRef, useState } from "react";
import { cvUpdatedLabel } from "@/data/cv";
import { openCvChooser, useCvChooser } from "@/lib/cv/chooser";
import { NUDGE_AFTER_MS, NUDGE_KEY, NUDGE_SHOW_MS, shouldNudge } from "@/lib/cv/nudge";
import { useLite } from "@/lib/lite";
import { SheetIcon } from "@/components/ui/CvDownload";

/**
 * The CV tab: a slim tab on the right edge of the window that stays with the visitor all the way down the page, so
 * the CV is one click away from any section. Pointing at it slides out what it is (when it was last updated, in which
 * languages). Once per visit, when the visitor reaches the evidence (the achievements section comes into view) or has
 * been reading for 45 seconds, it slides out by itself for a few seconds and says so.
 *
 * Hidden while the splash is up, while the chooser is open and while the assistant's sidebar is open (CSS). The
 * motion is one-shot CSS (transform and opacity); there is no scroll listener (an IntersectionObserver watches one
 * section) and nothing per frame.
 */
export default function CvTab() {
  const { open, source } = useCvChooser();
  const { lite } = useLite();
  const [nudging, setNudging] = useState(false);
  // What the observer and the timer need to read when they fire, without re-subscribing.
  const live = useRef({ open, lite });
  useEffect(() => {
    live.current = { open, lite };
  }, [open, lite]);

  useEffect(() => {
    const started = performance.now();
    const calmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let evidenceSeen = false;
    let hideTimer = 0;

    const nudged = () => {
      try {
        return sessionStorage.getItem(NUDGE_KEY) === "1";
      } catch {
        return false;
      }
    };

    const tryNudge = () => {
      const ok = shouldNudge({
        calm: calmQuery.matches || live.current.lite,
        alreadyNudged: nudged(),
        splashUp: document.documentElement.hasAttribute("data-splash"),
        chooserOpen: live.current.open,
        evidenceSeen,
        elapsedMs: performance.now() - started,
      });
      if (!ok) return;
      try {
        sessionStorage.setItem(NUDGE_KEY, "1");
      } catch {
        // storage blocked: it may speak again on a reload, which is acceptable
      }
      setNudging(true);
      hideTimer = window.setTimeout(() => setNudging(false), NUDGE_SHOW_MS);
    };

    const section = document.getElementById("achievements");
    const observer = section
      ? new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            evidenceSeen = true;
            observer?.disconnect();
            tryNudge();
          },
          { threshold: 0.25 },
        )
      : null;
    if (section) observer?.observe(section);
    const idle = window.setTimeout(tryNudge, NUDGE_AFTER_MS);

    return () => {
      observer?.disconnect();
      window.clearTimeout(idle);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <button
      type="button"
      className="cvd-tab"
      data-nudge={nudging ? "" : undefined}
      data-hidden={open ? "" : undefined}
      aria-haspopup="dialog"
      aria-expanded={open && source === "tab"}
      aria-label="Download CV, English or Indonesian"
      data-cursor-text="CV ↓"
      onClick={(e) => openCvChooser("tab", e.currentTarget)}
    >
      <span className="cvd-tab-out" aria-hidden="true">
        <span className="cvd-tab-hint">
          <b>Download CV</b>
          <i>PDF · EN / ID · updated {cvUpdatedLabel()}</i>
        </span>
        <span className="cvd-tab-say">
          <b>Seen the work?</b>
          <i>Take the CV with you.</i>
        </span>
      </span>
      <span className="cvd-tab-body">
        <span className="cvd-tab-ping" aria-hidden="true" />
        <SheetIcon />
        <span className="cvd-tab-v">CURRICULUM VITAE</span>
        <span className="cvd-tab-chips" aria-hidden="true">
          <span>EN</span>
          <span>ID</span>
        </span>
      </span>
    </button>
  );
}

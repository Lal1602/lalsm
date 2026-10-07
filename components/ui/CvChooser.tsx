"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CV_LANGS, cv, cvFacts, cvPdfName, cvPdfPath, cvUpdatedLabel, type CvLang } from "@/data/cv";
import { sheetPlan } from "@/lib/cv/sheet";
import { reportCvChooserOpen, takeCvChooserReturn, useCvChooser } from "@/lib/cv/chooser";
import { track } from "@/lib/analytics";

/**
 * The CV chooser: a dialog with the two editions (English, Indonesian) as cards. Each card carries a miniature of its
 * own CV (lib/cv/sheet.ts, drawn from the real sections and entries); choosing one downloads that PDF, and the card
 * is stamped before the dialog closes.
 *
 * There is one of it on the page, opened from the handles in components/ui/CvDownload.tsx and the edge tab through
 * lib/cv/chooser.ts. It is a modal dialog in a portal (the career slide is pinned and transformed, so a fixed layer
 * inside it would not be fixed). Nothing here moves per frame: it is state-driven CSS (transform and opacity only,
 * app/styles/96-cv-download.css), and the page's smooth scroll is paused while it is open.
 */

type Phase = "closed" | "open" | "closing";

const CLOSE_MS = 240;
/** How long the stamp stays before the chooser closes by itself. */
const STAMP_MS = 1150;

const PLANS = Object.fromEntries(CV_LANGS.map((l) => [l, sheetPlan(l)])) as Record<CvLang, ReturnType<typeof sheetPlan>>;

export default function CvChooser() {
  const { seq, open, source } = useCvChooser();
  const [phase, setPhase] = useState<Phase>("closed");
  // A request made before this loaded (it is a lazy chunk) is still waiting: it opens now. Old requests do not.
  const [seen, setSeen] = useState(() => (open ? 0 : seq));
  const [stamped, setStamped] = useState<CvLang | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const titleId = useId();

  // A new request from a handle opens the dialog (state derived while rendering, not in an effect).
  if (seq !== seen) {
    setSeen(seq);
    setStamped(null);
    setPhase("open");
  }

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const close = useCallback(() => {
    clearTimers();
    setPhase((p) => (p === "open" ? "closing" : p));
    timers.current.push(window.setTimeout(() => setPhase("closed"), CLOSE_MS));
  }, []);

  // Tell the handles and the tab whether it is on screen; when it is gone, give the focus back to what opened it.
  useEffect(() => {
    reportCvChooserOpen(phase !== "closed");
    if (phase !== "closed" || seen === 0) return;
    // The handle may have been hidden while the chooser was open (the edge tab is): let it come back first.
    const back = window.setTimeout(() => takeCvChooserReturn()?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(back);
  }, [phase, seen]);

  // While it is open: the page behind stands still, the keys work, and focus stays inside.
  useEffect(() => {
    if (phase !== "open") return;
    window.__lenis?.stop();
    const dialog = dialogRef.current;
    const cards = () => Array.from(dialog?.querySelectorAll<HTMLElement>("a.cvd-card") ?? []);
    const first = window.requestAnimationFrame(() => cards()[0]?.focus({ preventScroll: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      const items = [...cards(), ...Array.from(dialog?.querySelectorAll<HTMLElement>("button.cvd-close") ?? [])];
      if (items.length === 0) return;
      const at = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Tab") {
        e.preventDefault();
        items[(at + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus({ preventScroll: true });
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const list = cards();
        const i = list.indexOf(document.activeElement as HTMLElement);
        list[(i + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length]?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(first);
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [phase, close]);

  useEffect(
    () => () => {
      clearTimers();
      reportCvChooserOpen(false);
    },
    [],
  );

  const choose = (lang: CvLang) => {
    track("cv_download", { source, lang });
    setStamped(lang);
    clearTimers();
    timers.current.push(window.setTimeout(close, STAMP_MS));
  };

  if (phase === "closed") return null;

  return createPortal(
    <div className="cvd-layer" data-state={phase}>
      <div className="cvd-scrim" onClick={close} aria-hidden="true" />
      <div ref={dialogRef} className="cvd-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} data-lenis-prevent>
        <header className="cvd-head">
          <p className="cvd-kicker">CURRICULUM VITAE · 2 EDITIONS · UPDATED {cvUpdatedLabel().toUpperCase()}</p>
          <h2 className="cvd-title" id={titleId}>
            <span lang="en">{cv.en.ui.pickTitle}</span>
            <span lang="id">{cv.id.ui.pickTitle}</span>
          </h2>
        </header>

        <div className="cvd-deck" data-stamped={stamped ?? undefined}>
          {CV_LANGS.map((lang, i) => {
            const c = cv[lang];
            return (
              <a
                key={lang}
                className="cvd-card"
                style={{ "--i": i } as React.CSSProperties}
                href={cvPdfPath(lang)}
                download={cvPdfName(lang)}
                lang={c.tag}
                data-stamped={stamped === lang ? "" : undefined}
                aria-label={`${c.ui.getPdf}: ${c.label} (PDF)`}
                onClick={() => choose(lang)}
              >
                <span className="cvd-top">
                  <span className="cvd-mono">{lang.toUpperCase()}</span>
                  <span className="cvd-fmt">PDF · A4</span>
                </span>

                <span className="cvd-sheet" aria-hidden="true">
                  <span className="cvd-sheet-head">
                    <i className="cvd-sheet-name" />
                    <i className="cvd-sheet-role" />
                  </span>
                  {PLANS[lang].map((block) => (
                    <span className="cvd-blk" key={block.heading}>
                      <i className="cvd-h" />
                      {block.lines.map((w, n) => (
                        <i className="cvd-l" key={n} style={{ "--w": `${w}%` } as React.CSSProperties} />
                      ))}
                    </span>
                  ))}
                </span>

                <span className="cvd-name">{c.name}</span>
                <span className="cvd-sub">{c.ui.audience}</span>
                <span className="cvd-facts">{cvFacts(lang)}</span>

                <span className="cvd-get">
                  {c.ui.getPdf}
                  <i aria-hidden="true">↓</i>
                </span>

                <span className="cvd-stamp" aria-hidden="true">
                  <b>{c.ui.stamp}</b>
                  <i>{lang.toUpperCase()} · PDF</i>
                </span>
              </a>
            );
          })}
        </div>

        <p className="cvd-hint" aria-hidden="true">
          ← → · Esc
        </p>
        <p className="cvd-sr" role="status">
          {stamped ? `${cv[stamped].ui.stamp}: ${cvPdfName(stamped)}` : ""}
        </p>
        <button type="button" className="cvd-close" onClick={close} aria-label="Close / Tutup">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/*
  CONTACT — Ground Station SUB-1
  ─────────────────────────────────────────────────────────────────────────
  One instrument panel instead of two floating glass cards. Three ideas
  carry the section, and everything else stays out of their way:

    1. A steerable dish that actually points at the pointer, with honest
       azimuth/elevation numbers derived from where the pointer is.
    2. A scope whose trace IS the message — each character modulates the
       carrier, so the waveform scrolls in from the right as you type.
    3. Sending happens in place (fetch, not a form POST that throws the
       visitor at a raw JSON endpoint) and answers with a packet receipt.

  Deliberately cheap to draw: no backdrop-filter, no blur, no extra canvas.
  Everything that moves here is a transform, an opacity, or a text node.
*/

const WEB3FORMS_KEY = "25ba6941-8e69-4b9f-b267-15d2cd90f679";

// Surabaya, in DMS — 7.2575°S, 112.7521°E.
const STATION_LAT = "07°15′27″ S";
const STATION_LON = "112°45′08″ E";

// ── Signal scope ──────────────────────────────────────────────────────────
const SCOPE_W = 260;
const SCOPE_H = 44;
const SCOPE_MID = SCOPE_H / 2;
const SCOPE_SAMPLES = 76;
const SCOPE_STEP = SCOPE_W / (SCOPE_SAMPLES - 1);

/**
 * Turns the message into a polyline. Samples are right-aligned so the newest
 * character sits at the right edge and older ones scroll off the left, the way
 * a strip chart reads. Slots with no character yet stay on the idle carrier —
 * a shallow ripple rather than a dead flat line.
 */
function buildTrace(message: string): string {
  const chars = message.slice(-SCOPE_SAMPLES);
  const start = SCOPE_SAMPLES - chars.length;
  const points: string[] = [];

  for (let i = 0; i < SCOPE_SAMPLES; i++) {
    let y = SCOPE_MID + Math.sin(i * 0.42) * 1.1;
    if (i >= start) {
      const code = chars.charCodeAt(i - start);
      // Two harmonics off the character code: the first gives each glyph its
      // own level, the second keeps runs of one letter from flatlining.
      const amp = Math.sin(code * 1.7) * 0.72 + Math.sin(code * 0.31 + i * 0.8) * 0.28;
      y = SCOPE_MID - amp * (SCOPE_MID - 5);
    }
    points.push(`${(i * SCOPE_STEP).toFixed(1)},${y.toFixed(2)}`);
  }

  return points.join(" ");
}

function byteLength(value: string): number {
  if (!value) return 0;
  return new TextEncoder().encode(value).length;
}

function makePacketId(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const salt = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return `TX-${stamp}-${salt}`;
}

type Status = "idle" | "sending" | "sent" | "error";

// Resting angle of the dish when nothing is being tracked. Mirrored in CSS so
// the markup looks right before the script runs and on touch devices.
const REST_ANGLE = -22;
const SLEW_LIMIT = 68;
const EASE = 0.16;

export default function ContactSection() {
  const consoleRef = useRef<HTMLDivElement>(null);
  const dishRef = useRef<SVGSVGElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const azRef = useRef<HTMLSpanElement>(null);
  const elRef = useRef<HTMLSpanElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [packetId, setPacketId] = useState("");
  const [clock, setClock] = useState("");
  const [visitorTime, setVisitorTime] = useState("");

  // Station clock — the station keeps Jakarta time whoever is looking at it.
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    // The visitor's own clock and how far it sits from the station. Real
    // information, and the thing a client actually wants to know before
    // deciding whether to expect a reply today.
    const localFormat = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const tick = () => {
      const now = new Date();
      setClock(format.format(now));
      // getTimezoneOffset() counts backwards; WIB is UTC+7, i.e. 420 minutes.
      const deltaHours = (-now.getTimezoneOffset() - 420) / 60;
      const magnitude = Math.abs(deltaHours);
      const offset =
        deltaHours === 0
          ? "SAME ZONE"
          : `${deltaHours > 0 ? "+" : "−"}${Number.isInteger(magnitude) ? magnitude : magnitude.toFixed(1)}H`;
      setVisitorTime(`YOU · ${localFormat.format(now)} · ${offset}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Dish tracking. One pointermove listener, one self-terminating rAF, and
  // three rules that came out of measuring this panel rather than guessing.
  // Each cost was isolated with an A/B that toggles only pointer-events, so the
  // DOM and paint state stay identical between the two arms:
  //   · write the leaf, not the panel. Setting an inherited custom property on
  //     the console invalidated style for every descendant — ~7ms a frame. The
  //     transform below goes straight onto the element that uses it.
  //   · cache the geometry. The rect is only re-read on frames where the panel
  //     can actually have moved: entering it, scrolling, resizing.
  //   · ease in JS, not with a CSS transition. A transition whose target moves
  //     every frame keeps restarting the animation machinery and owned the
  //     frame-time tail (p95 27.7ms against 21.5ms without it). The lerp below
  //     is the same motion and stops scheduling once it has settled.
  // Together with rotating a composited wrapper instead of an SVG group (see
  // the markup) this went from p95 27.8ms to 7.4ms against a 7.1ms control.
  // A pointer-following light layer lived here too and was cut: it repainted
  // the panel every frame for something you could barely see.
  useEffect(() => {
    const panel = consoleRef.current;
    const dish = dishRef.current;
    const rotor = rotorRef.current;
    if (!panel || !dish || !rotor) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;

    let pivotX = 0;
    let pivotY = 0;
    let stale = true;

    let targetRotation = REST_ANGLE;
    let currentRotation = REST_ANGLE;
    let tracking = false;

    function measure() {
      if (!dish) return;
      const dishRect = dish.getBoundingClientRect();
      // The mast base sits at (80, 116) of the 160x140 viewBox.
      pivotX = dishRect.left + dishRect.width * 0.5;
      pivotY = dishRect.top + dishRect.height * (116 / 140);
      stale = false;
    }

    function markStale() {
      stale = true;
    }

    function step() {
      frame = 0;
      if (!rotor) return;

      if (tracking) {
        if (stale) measure();

        const dx = pointerX - pivotX;
        const dy = pivotY - pointerY; // up is positive

        let bearing: number;
        if (dy <= 0) {
          // Pointer is below the mount — park the dish on its slew limit.
          bearing = dx >= 0 ? 90 : -90;
        } else {
          bearing = Math.atan2(dx, dy) * (180 / Math.PI);
        }

        targetRotation = Math.max(-SLEW_LIMIT, Math.min(SLEW_LIMIT, bearing));

        const elevation = dy <= 0 ? 0 : Math.atan2(dy, Math.abs(dx)) * (180 / Math.PI);
        const azimuth = (bearing + 360) % 360;
        if (azRef.current) azRef.current.textContent = azimuth.toFixed(1).padStart(5, "0");
        if (elRef.current) elRef.current.textContent = elevation.toFixed(1).padStart(4, "0");
      }

      currentRotation += (targetRotation - currentRotation) * EASE;
      if (Math.abs(targetRotation - currentRotation) < 0.03) currentRotation = targetRotation;
      rotor.style.transform = `rotate(${currentRotation.toFixed(2)}deg)`;

      // Keep going only until the servo has caught up; then stop scheduling.
      if (currentRotation !== targetRotation) frame = requestAnimationFrame(step);
    }

    function onMove(event: PointerEvent) {
      tracking = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = requestAnimationFrame(step);
    }

    function onLeave() {
      // Slew back to rest, then the loop stops on its own.
      tracking = false;
      targetRotation = REST_ANGLE;
      if (!frame) frame = requestAnimationFrame(step);
    }

    panel.addEventListener("pointerenter", markStale);
    panel.addEventListener("pointermove", onMove, { passive: true });
    panel.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", markStale, { passive: true });
    window.addEventListener("resize", markStale);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      panel.removeEventListener("pointerenter", markStale);
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", markStale);
      window.removeEventListener("resize", markStale);
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Uplink from ${name.trim() || "an unlisted callsign"}`,
          from_name: "Portfolio Uplink",
          name,
          email,
          message,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) throw new Error(result?.message ?? "rejected");

      setPacketId(makePacketId());
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  const filled = [name, email, message].filter((value) => value.trim().length > 0).length;
  const isSending = status === "sending";

  return (
    <section className="section uplink-section" id="contact" aria-label="Contact Section">
      <div className="container">
        <header className="uplink-head" data-scroll>
          <p className="uplink-eyebrow">
            <span className="uplink-eyebrow-mark" aria-hidden="true" />
            CONTACT
          </p>
          <h2 className="section-title">Open A Channel</h2>
          <p className="uplink-lede">
            A project, a question, or a bug you swear isn&apos;t your fault — send it up.
            I read every packet that lands here, usually within a day.
          </p>
        </header>

        <div className="uplink-console" ref={consoleRef} data-scroll>
          {/* ── Top rail ─────────────────────────────────────────────── */}
          <div className="uplink-rail uplink-rail--top">
            <span className="rail-cell">
              <span className="rail-live" aria-hidden="true" />
              GROUND STATION <b>SUB-1</b>
            </span>
            <span className="rail-cell rail-cell--coords" aria-hidden="true">
              {STATION_LAT} · {STATION_LON}
            </span>
            <span className="rail-cell rail-cell--clock">
              <span suppressHydrationWarning>{clock || "--:--:--"}</span> WIB
            </span>
          </div>

          <div className="uplink-body">
            {/* ── Station column ─────────────────────────────────────── */}
            <aside className="uplink-station">
              <div className="station-plate">
                <span className="station-kicker">Callsign</span>
                <strong className="station-callsign">SUB-1</strong>
              </div>

              <div className="station-dish-wrap">
                {/*
                  The dish is drawn as two overlaid SVGs on the same viewBox:
                  the mount stays put, and everything that swings lives inside
                  an HTML wrapper. Rotating an SVG <g> re-rasterised the whole
                  drawing every frame; rotating the wrapper is compositor work.
                */}
                <div className="station-dish-stack">
                  <svg
                    ref={dishRef}
                    className="station-dish"
                    viewBox="0 0 160 140"
                    role="presentation"
                    aria-hidden="true"
                  >
                    {/* Slew limits — the dish really is clamped to ±68°. */}
                    <path className="dish-limit" d="M 22.5 92.8 A 62 62 0 0 1 137.5 92.8" fill="none" />
                    <path className="dish-base" d="M 58 116 L 102 116" fill="none" />
                    <path className="dish-leg" d="M 64 117 L 55 131 M 96 117 L 105 131" fill="none" />
                    <path className="dish-ground" d="M 38 131 L 122 131" fill="none" />
                  </svg>

                  <div className="station-dish-rotor" ref={rotorRef} aria-hidden="true">
                    <svg
                      className="station-dish station-dish--rotor"
                      viewBox="0 0 160 140"
                      role="presentation"
                    >
                      <defs>
                        <linearGradient id="uplink-beam" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.13" />
                          <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      <polygon className="dish-beam" points="36,64 124,64 138,9 22,9" fill="url(#uplink-beam)" />
                      <path className="dish-boresight" d="M 80 30 L 80 6" fill="none" />
                      <path className="dish-bowl-fill" d="M 30 66 Q 80 118 130 66 Z" />
                      <path className="dish-bowl" d="M 30 66 Q 80 118 130 66" fill="none" />
                      <ellipse className="dish-rim" cx="80" cy="66" rx="50" ry="7" fill="none" />
                      <path className="dish-strut" d="M 37 63 L 80 37 M 123 63 L 80 37" fill="none" />
                      <circle className="dish-feed-halo" cx="80" cy="37" r="8" fill="none" />
                      <circle className="dish-feed" cx="80" cy="37" r="3" />
                      <circle className="dish-gear" cx="80" cy="96" r="6" fill="none" />
                      <path className="dish-mast" d="M 80 96 L 80 116" fill="none" />
                    </svg>
                  </div>
                </div>

                <dl className="station-readout" aria-hidden="true">
                  <div>
                    <dt>AZ</dt>
                    <dd>
                      <span ref={azRef}>336.0</span>°
                    </dd>
                  </div>
                  <div>
                    <dt>EL</dt>
                    <dd>
                      <span ref={elRef}>66.0</span>°
                    </dd>
                  </div>
                </dl>
              </div>

              <ul className="station-channels">
                <li>
                  <a href="mailto:bilal.lalsm@gmail.com">
                    <span className="channel-key">Email</span>
                    <span className="channel-value">bilal.lalsm@gmail.com</span>
                    <span className="channel-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+62895340180343">
                    <span className="channel-key">Voice</span>
                    <span className="channel-value">+62 895-3401-80343</span>
                    <span className="channel-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
                <li>
                  <span className="channel-static">
                    <span className="channel-key">Origin</span>
                    <span className="channel-value">Surabaya, East Java, ID</span>
                  </span>
                </li>
              </ul>
            </aside>

            {/* ── Composer column ────────────────────────────────────── */}
            <div className="uplink-composer">
              {status === "sent" ? (
                <div className="uplink-ack" role="status">
                  <span className="ack-mark" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="21" />
                      <path d="M15 24.5 L21.5 31 L34 18" />
                    </svg>
                  </span>
                  <h3 className="ack-title">Signal received</h3>
                  <p className="ack-copy">
                    Your packet is queued and on my side of the link. Expect a reply within 24
                    hours — check the spam folder if the sky stays quiet.
                  </p>
                  <p className="ack-packet">
                    PACKET <b>{packetId}</b>
                  </p>
                  <button type="button" className="uplink-reset" onClick={() => setStatus("idle")}>
                    Send another
                  </button>
                </div>
              ) : (
                <form
                  className="uplink-form"
                  action="https://api.web3forms.com/submit"
                  method="POST"
                  onSubmit={handleSubmit}
                  aria-label="Contact form"
                >
                  {/* Kept so the form still submits if the script never runs. */}
                  <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />

                  <div className="composer-head">
                    <span className="composer-title">Payload Composer</span>
                    <span className="composer-progress" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <i key={i} className={i < filled ? "is-set" : undefined} />
                      ))}
                      <em>{filled}/3</em>
                    </span>
                  </div>

                  <div className="uplink-field">
                    <span className="field-index" aria-hidden="true">01</span>
                    <div className="field-body">
                      <input
                        type="text"
                        name="name"
                        id="contact-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        placeholder=" "
                      />
                      <label htmlFor="contact-name">Name</label>
                      <span className="field-line" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="uplink-field">
                    <span className="field-index" aria-hidden="true">02</span>
                    <div className="field-body">
                      <input
                        type="email"
                        name="email"
                        id="contact-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder=" "
                      />
                      <label htmlFor="contact-email">Email</label>
                      <span className="field-line" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="uplink-field uplink-field--message">
                    <span className="field-index" aria-hidden="true">03</span>
                    <div className="field-body">
                      <textarea
                        name="message"
                        id="contact-message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        placeholder=" "
                      />
                      <label htmlFor="contact-message">Message</label>
                      <span className="field-line" aria-hidden="true" />
                    </div>
                  </div>

                  {/* The trace is the message: every character modulates it. */}
                  <div className="uplink-scope" aria-hidden="true">
                    <svg viewBox={`0 0 ${SCOPE_W} ${SCOPE_H}`} preserveAspectRatio="none">
                      <line x1="0" y1={SCOPE_MID} x2={SCOPE_W} y2={SCOPE_MID} className="scope-axis" />
                      <polyline className="scope-trace scope-trace--halo" points={buildTrace(message)} />
                      <polyline className="scope-trace" points={buildTrace(message)} />
                    </svg>
                    <span className="scope-meta">
                      {message ? "MODULATING" : "CARRIER IDLE"} · {byteLength(message)} B
                    </span>
                  </div>

                  <div className="uplink-actions">
                    <button
                      type="submit"
                      className="uplink-send"
                      data-cursor-text="SEND"
                      disabled={isSending}
                    >
                      <span className="send-label">{isSending ? "Transmitting" : "Transmit"}</span>
                      <span className="send-arrow" aria-hidden="true">
                        <svg viewBox="0 0 20 20" fill="none">
                          <path d="M2 10h14M11 5l5 5-5 5" />
                        </svg>
                      </span>
                      <span className="send-sweep" aria-hidden="true" />
                    </button>

                    <p
                      className={status === "error" ? "uplink-note uplink-note--error" : "uplink-note"}
                      role="status"
                    >
                      {status === "error"
                        ? "Uplink refused the packet. Mail me directly at bilal.lalsm@gmail.com."
                        : "Typical response ≤ 24h"}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── Bottom rail ──────────────────────────────────────────── */}
          <div className="uplink-rail uplink-rail--bottom">
            <span className="rail-cell rail-cell--open">
              <span className="rail-live" aria-hidden="true" />
              AVAILABLE FOR FREELANCE &amp; COLLAB
            </span>
            <span className="rail-cell rail-cell--muted">
              <span suppressHydrationWarning>{visitorTime || "YOU · --:-- · --"}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import type { SectionId } from "@/lib/chat/actions";
import { sectionLabel, suggestionsFor } from "@/lib/chat/context";
import { CHAT_LANGS, COPY, type ChatLang } from "@/lib/chat/copy";
import { conversationSummary, mailtoHref } from "@/lib/chat/export";
import { runChatActions } from "@/lib/chat/runActions";
import { TONES } from "@/lib/chat/tone";
import { TOUR_LENGTH } from "@/lib/chat/tour";
import { parseSuggestion, type Suggestion } from "@/lib/chat/types";
import { PREFILL_CONTACT_EVENT, type PrefillContactDetail } from "@/lib/events";
import { track } from "@/lib/analytics";
import { useChatStore, statusLine } from "@/stores/chatStore";
import { useMediaQuery } from "@/components/ui/hiw/hooks";
import Composer from "./chat/Composer";
import MessageView from "./chat/MessageView";
import Orb, { type OrbState } from "./chat/Orb";
import { useSpeechOutput } from "./chat/speech";
import { useCurrentSection } from "./chat/useCurrentSection";

/**
 * B.I.L.A.L., the portfolio's assistant. A launcher in the corner opens a panel that floats at the right edge (it does
 * not push the page: the page stays as it is, and the assistant can point at it). The panel knows where the visitor
 * is on the page, answers from a live model (or, when there is none, from offline rules, and says which), renders
 * what it writes as markdown, shows what it points at as cards, understands slash commands, can be spoken to and
 * can read aloud. The conversation, its language and its tone are kept between visits.
 *
 * The pieces: stores/chatStore.ts (the conversation and the request), lib/chat/* (what is pure: markdown, commands,
 * cards, copy, context, tour), components/ui/chat/* (orb, messages, composer, speech), app/styles/97-ai-chat.css.
 */

const TEASER_KEY = "ai-teaser-shown";
const TEASER_AFTER_MS = 14_000;
const TEASER_SHOW_MS = 8_000;

const closeIcon = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
  </svg>
);
const moreIcon = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="3.5" cy="8" r="1.2" />
    <circle cx="8" cy="8" r="1.2" />
    <circle cx="12.5" cy="8" r="1.2" />
  </svg>
);

export default function AiChatOverlay() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const lang = useChatStore((s) => s.lang);
  const tone = useChatStore((s) => s.tone);
  const section = useChatStore((s) => s.section);
  const live = useChatStore((s) => s.live);
  const tour = useChatStore((s) => s.tour);
  const { submit, stop, regenerate, clearHistory, setLang, setTone, setSection, refreshStatus } = useChatStore.getState();
  const c = COPY[lang];

  const [open, setOpen] = useState(false);
  const [openSeq, setOpenSeq] = useState(0);
  const [menu, setMenu] = useState(false);
  const [listening, setListening] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [teaser, setTeaser] = useState(false);
  const mobile = useMediaQuery("(max-width: 768px)");

  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const voice = useSpeechOutput(lang);

  const last = messages[messages.length - 1];
  const streaming = Boolean(last?.streaming);
  const busy = isLoading || streaming;
  const orbState: OrbState = listening ? "listening" : isLoading ? "thinking" : streaming || voice.speaking ? "speaking" : "idle";

  const openPanel = useCallback(() => {
    setOpen(true);
    setOpenSeq((n) => n + 1);
    setTeaser(false);
    track("chat_open");
  }, []);
  const closePanel = useCallback(() => {
    setOpen(false);
    setMenu(false);
    voice.cancel();
  }, [voice]);

  // Where the visitor is, while the panel is open.
  useCurrentSection(open, useCallback((s: SectionId | null) => setSection(s), [setSection]));

  // Whether a live model is behind it, asked once when it is first opened.
  useEffect(() => {
    if (open && live === "unknown") void refreshStatus();
  }, [open, live, refreshStatus]);

  // The rest of the site reads this class (the CV tab steps aside while the assistant is open).
  useEffect(() => {
    document.body.classList.toggle("ai-chat-sidebar-open", open);
    return () => document.body.classList.remove("ai-chat-sidebar-open");
  }, [open]);

  // On a phone the panel is the whole screen: the page behind it stands still.
  useEffect(() => {
    if (!open || !mobile) return;
    window.__lenis?.stop();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = before;
    };
  }, [open, mobile]);

  // Opening focuses the box (not on a touch screen, where it would throw the keyboard up unasked); closing gives the focus back.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const timer = window.setTimeout(() => !coarse && inputRef.current?.focus(), 420);
    return () => {
      window.clearTimeout(timer);
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  // Keys: Esc closes the menu, then the panel; Ctrl or Cmd K opens and closes it from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closePanel();
        else openPanel();
        return;
      }
      if (e.key === "Escape" && open && !e.defaultPrevented) {
        if (menu) setMenu(false);
        else closePanel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, menu, openPanel, closePanel]);

  // The menu closes when something else is pressed.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !(e.target as HTMLElement).closest(".ai-menu-btn")) setMenu(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menu]);

  // Keeps the newest words in view unless the visitor has scrolled up to read.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stick.current) return;
    const frame = window.requestAnimationFrame(() => {
      // The first screen is read from its top; a conversation is read from its end.
      el.scrollTop = messages.length === 0 ? 0 : el.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, isLoading, open]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 72;
    stick.current = near;
    setAtBottom(near);
  };
  const jump = () => {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: calmMotion() ? "auto" : "smooth" });
  };

  // One invitation per visit, a while after the page is up, never over the splash.
  useEffect(() => {
    if (open) return;
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return;
    } catch {
      return;
    }
    let hide = 0;
    const show = window.setTimeout(function attempt() {
      if (document.documentElement.hasAttribute("data-splash")) {
        window.setTimeout(attempt, 2000);
        return;
      }
      try {
        sessionStorage.setItem(TEASER_KEY, "1");
      } catch {
        // storage blocked: it may speak again after a reload
      }
      setTeaser(true);
      hide = window.setTimeout(() => setTeaser(false), TEASER_SHOW_MS);
    }, TEASER_AFTER_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [open]);

  const send = (text: string) => {
    stick.current = true;
    void submit(text);
  };
  const choose = (s: Suggestion) => {
    const p = parseSuggestion(s);
    send(p.command ?? p.text);
  };
  const recall = () => [...messages].reverse().find((m) => m.role === "user")?.text;

  // What a card did to the page: on a phone the assistant steps aside so the page can be seen.
  const onCardOpened = () => {
    if (mobile) closePanel();
  };

  const sendToBilal = () => {
    const message = conversationSummary(messages, lang);
    window.dispatchEvent(new CustomEvent<PrefillContactDetail>(PREFILL_CONTACT_EVENT, { detail: { message } }));
    runChatActions([{ type: "scroll", sectionId: "contact" }]);
    track("chat_send_to_bilal");
    setMenu(false);
    if (mobile) closePanel();
  };

  const here = section ? sectionLabel(section, lang) : null;

  return (
    <>
      <aside
        className="ai-panel"
        data-motion="true"
        data-open={open ? "" : undefined}
        data-tone={tone}
        role="dialog"
        aria-label={`${c.name}: ${c.expansion}`}
        aria-modal={open && mobile ? true : undefined}
        aria-hidden={!open}
        inert={!open}
        lang={lang}
      >
        <div className="ai-panel-bg" aria-hidden="true" />

        <header className="ai-head">
          <Orb state={orbState} size="md" />
          <div className="ai-head-text">
            <h2 className="ai-title">{c.name}</h2>
            <p className="ai-status" data-live={live} data-busy={busy ? "" : undefined} aria-live="polite">
              <i aria-hidden="true" />
              <span>{listening ? c.statusListening : isLoading ? c.statusThinking : statusLine(live, lang)}</span>
            </p>
          </div>
          <div className="ai-head-actions">
            <button type="button" className="ai-icon-btn ai-menu-btn" aria-label={c.menu} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
              {moreIcon}
            </button>
            <button type="button" className="ai-icon-btn" aria-label={c.close} onClick={closePanel}>
              {closeIcon}
            </button>
          </div>

          {menu && (
            <div className="ai-menu" role="menu" ref={menuRef}>
              <p className="ai-menu-label">{c.tone}</p>
              <div className="ai-seg" role="group" aria-label={c.tone}>
                {TONES.map((t) => (
                  <button key={t} type="button" role="menuitemradio" aria-checked={tone === t} onClick={() => setTone(t)} title={c.tones[t].hint}>
                    {c.tones[t].label}
                  </button>
                ))}
              </div>
              <p className="ai-menu-label">{c.language}</p>
              <div className="ai-seg" role="group" aria-label={c.language}>
                {CHAT_LANGS.map((l: ChatLang) => (
                  <button key={l} type="button" role="menuitemradio" aria-checked={lang === l} onClick={() => setLang(l)}>
                    {l === "id" ? "Bahasa" : "English"}
                  </button>
                ))}
              </div>
              <div className="ai-menu-sep" />
              <button type="button" role="menuitem" onClick={() => { setMenu(false); void submit("/export"); }}>
                {c.export}
                <kbd>.md</kbd>
              </button>
              <button type="button" role="menuitem" onClick={sendToBilal}>
                {c.sendToBilal}
              </button>
              <a
                role="menuitem"
                href={mailtoHref(profile.email, lang, conversationSummary(messages, lang))}
                onClick={() => {
                  track("chat_email_summary");
                  setMenu(false);
                }}
              >
                {c.emailSummary}
              </a>
              <button
                type="button"
                role="menuitem"
                data-danger=""
                onClick={() => {
                  setMenu(false);
                  voice.cancel();
                  clearHistory();
                }}
              >
                {c.reset}
              </button>
              <p className="ai-menu-keys">{c.shortcuts}</p>
            </div>
          )}
        </header>

        <div className="ai-ctx" aria-live="polite">
          {here ? (
            <span className="ai-ctx-here">
              <i aria-hidden="true" />
              {c.hereNow(here)}
            </span>
          ) : (
            <span />
          )}
          {tour >= 0 ? (
            <span className="ai-ctx-tour">
              {lang === "id" ? "Tur" : "Tour"} {tour + 1}/{TOUR_LENGTH}
            </span>
          ) : (
            tone !== "default" && <span className="ai-ctx-tone">{c.tones[tone].label}</span>
          )}
        </div>

        <div className="ai-scroll" ref={scrollRef} onScroll={onScroll} role="log" aria-live="polite" aria-busy={busy} data-lenis-prevent tabIndex={-1}>
          {messages.length === 0 ? (
            <section className="ai-welcome" key={openSeq}>
              <div className="ai-welcome-orb">
                <Orb state={orbState === "idle" ? "idle" : orbState} size="xl" />
              </div>
              <h3 className="ai-welcome-title">{c.welcomeTitle}</h3>
              <p className="ai-welcome-expansion">{c.expansion}</p>
              <p className="ai-welcome-body">{c.welcomeBody}</p>

              <div className="ai-quick" role="group" aria-label={c.commands}>
                {c.quick.map((q, i) => (
                  <button key={q.id} type="button" className="ai-quick-tile" style={{ "--i": i } as React.CSSProperties} onClick={() => send(`/${q.id}`)}>
                    <b>{q.label}</b>
                    <i>{q.hint}</i>
                  </button>
                ))}
              </div>

              <div className="ai-chips ai-chips-welcome" role="group" aria-label="Suggestions">
                {suggestionsFor(section, lang).map((s, i) => (
                  <button key={s} type="button" className="ai-chip" style={{ "--i": i + 6 } as React.CSSProperties} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            messages.map((m, i) => (
              <MessageView
                key={m.id}
                message={m}
                lang={lang}
                last={i === messages.length - 1}
                busy={busy}
                speaking={voice.speaking === m.id}
                canSpeak={voice.supported}
                onSpeak={voice.speak}
                onStopSpeaking={voice.cancel}
                onSuggestion={choose}
                onRegenerate={() => void regenerate()}
                onCardOpened={onCardOpened}
              />
            ))
          )}

          {isLoading && (
            <article className="ai-msg ai-msg-bot ai-typing" aria-label={c.statusThinking}>
              <header className="ai-bot-meta">
                <Orb state="thinking" size="sm" />
                <span className="ai-bot-name">{c.name}</span>
              </header>
              <div className="ai-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </article>
          )}
        </div>

        {!atBottom && messages.length > 0 && (
          <button type="button" className="ai-jump" onClick={jump}>
            <span aria-hidden="true">↓</span> {c.newMessages}
          </button>
        )}

        <Composer lang={lang} busy={busy} inputRef={inputRef} onSend={send} onStop={stop} recall={recall} onListening={setListening} />
      </aside>

      {teaser && !open && (
        <aside className="ai-teaser" data-motion="true" role="status">
          <button type="button" className="ai-teaser-open" onClick={openPanel}>
            {c.teaser}
          </button>
          <button type="button" className="ai-teaser-x" aria-label={c.close} onClick={() => setTeaser(false)}>
            {closeIcon}
          </button>
        </aside>
      )}

      <button
        ref={toggleRef}
        type="button"
        className={`ai-chat-toggle-btn${open ? " active" : ""}`}
        data-motion="true"
        data-state={orbState}
        aria-label={c.launcher}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? closePanel() : openPanel())}
      >
        <span className="ai-launcher-label" aria-hidden="true">
          {c.launcher}
          <kbd>Ctrl K</kbd>
        </span>
        <Orb state={orbState === "idle" ? "idle" : orbState} size="lg" />
      </button>
    </>
  );
}

function calmMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}


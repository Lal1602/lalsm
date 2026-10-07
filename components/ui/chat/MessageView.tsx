"use client";

import { memo, useRef, useState } from "react";
import { cvUpdatedLabel } from "@/data/cv";
import type { ChatCard } from "@/lib/chat/cards";
import { COPY, type ChatLang } from "@/lib/chat/copy";
import { sectionLabel } from "@/lib/chat/context";
import { runChatActions } from "@/lib/chat/runActions";
import { parseSuggestion, type Message, type Suggestion } from "@/lib/chat/types";
import { openCvChooser } from "@/lib/cv/chooser";
import { track } from "@/lib/analytics";
import { SheetIcon } from "@/components/ui/CvDownload";
import Markdown from "./Markdown";
import Orb from "./Orb";

const icon = {
  copy: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h.5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 8.5 3.2 3.2L13 4.8" />
    </svg>
  ),
  speak: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 6v4h2.6L9 12.8V3.2L5.1 6z" />
      <path d="M11.2 5.6a3.6 3.6 0 0 1 0 4.8M12.9 3.9a6 6 0 0 1 0 8.2" />
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1.5" />
    </svg>
  ),
  again: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  ),
  medal: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="6" r="3.6" />
      <path d="m5.6 8.9-1.1 4.6L8 12l3.5 1.5-1.1-4.6" />
    </svg>
  ),
};

function Cards({ cards, lang, onOpened }: { cards: ChatCard[]; lang: ChatLang; onOpened: () => void }) {
  const c = COPY[lang];
  return (
    <div className="ai-cards">
      {cards.map((card, i) => {
        const style = { "--i": i } as React.CSSProperties;
        if (card.kind === "project") {
          return (
            <button
              key={`p${card.title}`}
              type="button"
              className="ai-card"
              style={style}
              onClick={() => {
                track("chat_card", { kind: "project" });
                runChatActions([{ type: "project", title: card.title }]);
                onOpened();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ai-card-thumb" src={card.image} alt="" loading="lazy" width="56" height="56" />
              <span className="ai-card-body">
                <b>{card.title}</b>
                <i>{card.tech.join(" · ")}</i>
              </span>
              <span className="ai-card-go">
                {c.openOnPage}
                {icon.arrow}
              </span>
            </button>
          );
        }
        if (card.kind === "achievement") {
          return (
            <button
              key={`a${card.title}`}
              type="button"
              className="ai-card"
              style={style}
              onClick={() => {
                track("chat_card", { kind: "achievement" });
                runChatActions([{ type: "achievement", title: card.title }]);
                onOpened();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ai-card-thumb" src={card.image} alt="" loading="lazy" width="56" height="56" />
              <span className="ai-card-body">
                <b>{card.title}</b>
                <i>{card.meta}</i>
              </span>
              <span className="ai-card-go">
                {c.openOnPage}
                {icon.arrow}
              </span>
            </button>
          );
        }
        if (card.kind === "cv") {
          return (
            <button
              key="cv"
              type="button"
              className="ai-card ai-card-cv"
              style={style}
              onClick={(e) => {
                track("chat_card", { kind: "cv" });
                openCvChooser("assistant", e.currentTarget);
              }}
            >
              <span className="ai-card-sheet">
                <SheetIcon />
              </span>
              <span className="ai-card-body">
                <b>Curriculum Vitae</b>
                <i>PDF · EN / ID · {cvUpdatedLabel()}</i>
              </span>
              <span className="ai-card-go">
                {c.open}
                {icon.arrow}
              </span>
            </button>
          );
        }
        return (
          <button
            key={`s${card.id}`}
            type="button"
            className="ai-card"
            style={style}
            onClick={() => {
              track("chat_card", { kind: "section" });
              runChatActions([{ type: "scroll", sectionId: card.id }]);
              onOpened();
            }}
          >
            <span className="ai-card-sheet">{icon.arrow}</span>
            <span className="ai-card-body">
              <b>{sectionLabel(card.id, lang)}</b>
              <i>#{card.id}</i>
            </span>
            <span className="ai-card-go">
              {c.openOnPage}
              {icon.arrow}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export interface MessageViewProps {
  message: Message;
  lang: ChatLang;
  /** The last message of the conversation: only it shows the suggestions and the "answer again" button. */
  last: boolean;
  busy: boolean;
  speaking: boolean;
  canSpeak: boolean;
  onSpeak: (id: string, text: string) => void;
  onStopSpeaking: () => void;
  onSuggestion: (s: Suggestion) => void;
  onRegenerate: () => void;
  /** A card sent the visitor somewhere on the page: on a phone the assistant steps out of the way. */
  onCardOpened: () => void;
}

function MessageView({ message: m, lang, last, busy, speaking, canSpeak, onSpeak, onStopSpeaking, onSuggestion, onRegenerate, onCardOpened }: MessageViewProps) {
  const c = COPY[lang];
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);
  const time = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(m.ts));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
      track("chat_copy");
    } catch {
      // clipboard blocked: nothing to do
    }
  };

  if (m.role === "user") {
    return (
      <article className="ai-msg ai-msg-user" aria-label={c.you}>
        <div className="ai-user-bubble">{m.text}</div>
        <time className="ai-time" dateTime={new Date(m.ts).toISOString()}>
          {time}
        </time>
      </article>
    );
  }

  const suggestions = last && !busy && !m.streaming ? m.suggestions : undefined;

  return (
    <article className="ai-msg ai-msg-bot" data-failed={m.failed ? "" : undefined} aria-label={c.name}>
      <header className="ai-bot-meta">
        <Orb state="still" size="sm" />
        <span className="ai-bot-name">{c.name}</span>
        <time className="ai-time" dateTime={new Date(m.ts).toISOString()}>
          {time}
        </time>
        {m.source === "offline" && <span className="ai-tag">offline</span>}
        {m.stopped && <span className="ai-tag">{c.stopped}</span>}
      </header>

      <div className="ai-bot-body" data-streaming={m.streaming ? "" : undefined}>
        <Markdown text={m.text} copyLabel={c.copy} copiedLabel={c.copied} />
        {m.streaming && !m.text && <span className="ai-caret" aria-hidden="true" />}
      </div>

      {m.cards && m.cards.length > 0 && <Cards cards={m.cards} lang={lang} onOpened={onCardOpened} />}

      {!m.streaming && m.text && (
        <div className="ai-tools" role="group" aria-label={c.name}>
          <button type="button" onClick={copy} aria-label={copied ? c.copied : c.copy} title={copied ? c.copied : c.copy} data-on={copied ? "" : undefined}>
            {copied ? icon.check : icon.copy}
          </button>
          {canSpeak && (
            <button
              type="button"
              onClick={() => (speaking ? onStopSpeaking() : onSpeak(m.id, m.text))}
              aria-label={speaking ? c.speakStop : c.speak}
              title={speaking ? c.speakStop : c.speak}
              data-on={speaking ? "" : undefined}
            >
              {speaking ? icon.stop : icon.speak}
            </button>
          )}
          {last && !busy && (
            <button type="button" onClick={onRegenerate} aria-label={m.failed ? c.retry : c.regenerate} title={m.failed ? c.retry : c.regenerate}>
              {icon.again}
              {m.failed && <span>{c.retry}</span>}
            </button>
          )}
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="ai-chips" role="group" aria-label="Suggestions">
          {suggestions.map((s, i) => {
            const p = parseSuggestion(s);
            return (
              <button key={`${i}${p.text}`} type="button" className="ai-chip" style={{ "--i": i } as React.CSSProperties} onClick={() => onSuggestion(s)}>
                {p.tag && <em>{p.tag}</em>}
                {p.text}
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default memo(MessageView);

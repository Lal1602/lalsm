"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { matchCommands, type CommandDef } from "@/lib/chat/commands";
import { COPY, type ChatLang } from "@/lib/chat/copy";
import { MAX_MESSAGE_CHARS } from "@/lib/chat/validate";
import { useSpeechInput } from "./speech";

const RING = 2 * Math.PI * 15;

const commandIcon: Record<string, string> = {
  projects: "▦",
  skills: "◈",
  certificates: "✦",
  cv: "⎘",
  contact: "✉",
  tour: "➜",
  theme: "◐",
  tone: "♪",
  export: "⤓",
  clear: "↺",
  help: "?",
};

export interface ComposerProps {
  lang: ChatLang;
  busy: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSend: (text: string) => void;
  onStop: () => void;
  /** The visitor's last message, for the up arrow. */
  recall: () => string | undefined;
  /** Dictation started or stopped, for the orb. */
  onListening: (listening: boolean) => void;
}

export default function Composer({ lang, busy, inputRef, onSend, onStop, recall, onListening }: ComposerProps) {
  const c = COPY[lang];
  const [value, setValue] = useState("");
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const base = useRef("");
  const listId = useId();

  const matches = matchCommands(value);
  const open = focused && matches.length > 0;
  const active = Math.min(index, Math.max(0, matches.length - 1));

  // Dictation fills the box as it goes; what was there before stays in front of it.
  const speech = useSpeechInput(lang, (text) => {
    const next = `${base.current}${base.current && text ? " " : ""}${text}`.slice(0, MAX_MESSAGE_CHARS);
    setValue(next);
  });
  useEffect(() => onListening(speech.listening), [speech.listening, onListening]);

  // The box grows with what is written, up to a few lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [value, inputRef]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    if (speech.listening) speech.stop();
    onSend(clean);
    setValue("");
    setIndex(0);
  };

  const choose = (command: CommandDef) => {
    if (command.needsArg) {
      // It wants an argument: finish the word and let the visitor type it.
      setValue(`/${command.name} `);
      setIndex(0);
      inputRef.current?.focus();
      return;
    }
    send(`/${command.name}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((active + 1) % matches.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((active - 1 + matches.length) % matches.length);
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        // A command typed out in full runs; one only begun is completed (or run) from the list.
        const typed = value.trim().slice(1).toLowerCase();
        const exact = matches.find((m) => m.name === typed || m.aliases.includes(typed));
        if (exact && e.key === "Enter") send(value);
        else choose(matches[active]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setValue("");
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(value);
      return;
    }
    if (e.key === "ArrowUp" && !value) {
      const last = recall();
      if (last) {
        e.preventDefault();
        setValue(last);
      }
    }
  };

  const left = MAX_MESSAGE_CHARS - value.length;
  const ratio = Math.min(1, value.length / MAX_MESSAGE_CHARS);
  const canSend = value.trim().length > 0 && !busy;

  return (
    <form
      className="ai-composer"
      onSubmit={(e) => {
        e.preventDefault();
        send(value);
      }}
    >
      {open && (
        <ul className="ai-palette" role="listbox" id={listId} aria-label={c.commands}>
          {matches.map((cmd, i) => (
            <li
              key={cmd.id}
              id={`${listId}-${cmd.id}`}
              role="option"
              aria-selected={i === active}
              data-active={i === active ? "" : undefined}
              onMouseEnter={() => setIndex(i)}
              // mousedown, not click: the textarea must not lose its focus (and close the list) first
              onMouseDown={(e) => {
                e.preventDefault();
                choose(cmd);
              }}
            >
              <span className="ai-palette-icon" aria-hidden="true">
                {commandIcon[cmd.id] ?? "•"}
              </span>
              <span className="ai-palette-name">
                /{cmd.name}
                {cmd.arg && <small> {cmd.arg}</small>}
              </span>
              <span className="ai-palette-hint">{cmd.hint[lang]}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="ai-composer-box" data-focus={focused ? "" : undefined} data-listening={speech.listening ? "" : undefined}>
        <button
          type="button"
          className="ai-slash"
          aria-label={c.commands}
          title={c.commands}
          onClick={() => {
            setValue(value.startsWith("/") ? "" : "/");
            inputRef.current?.focus();
          }}
        >
          /
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          maxLength={MAX_MESSAGE_CHARS}
          value={value}
          placeholder={speech.listening ? c.placeholderListening : c.placeholder}
          aria-label={c.placeholder}
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? `${listId}-${matches[active].id}` : undefined}
          autoComplete="off"
          enterKeyHint="send"
          onChange={(e) => {
            setValue(e.target.value);
            setIndex(0);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {speech.supported && (
          <button
            type="button"
            className="ai-mic"
            data-on={speech.listening ? "" : undefined}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? c.micStop : c.mic}
            title={speech.listening ? c.micStop : c.mic}
            onClick={() => {
              if (speech.listening) speech.stop();
              else {
                base.current = value.trim();
                speech.start();
              }
            }}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="6" y="1.5" width="4" height="8" rx="2" />
              <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5M5.5 14.5h5" />
            </svg>
          </button>
        )}

        {busy ? (
          <button type="button" className="ai-send ai-stop" onClick={onStop} aria-label={c.stop} title={c.stop}>
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <circle className="ai-send-track" cx="18" cy="18" r="15" />
              <circle className="ai-send-spin" cx="18" cy="18" r="15" />
              <rect x="13" y="13" width="10" height="10" rx="2" />
            </svg>
          </button>
        ) : (
          <button type="submit" className="ai-send" disabled={!canSend} aria-label={c.send} title={c.send} data-warn={left <= 60 ? (left < 0 ? "hot" : "warm") : undefined}>
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <circle className="ai-send-track" cx="18" cy="18" r="15" />
              <circle className="ai-send-fill" cx="18" cy="18" r="15" strokeDasharray={RING} strokeDashoffset={RING * (1 - ratio)} />
              <path d="M12.5 18h11M19 13.5 23.5 18 19 22.5" />
            </svg>
          </button>
        )}
      </div>

      <p className="ai-composer-meta" aria-live="polite">
        <span className="ai-keys">
          <kbd>↵</kbd> {lang === "id" ? "kirim" : "send"} <kbd>⇧↵</kbd> {lang === "id" ? "baris baru" : "new line"} <kbd>/</kbd> {c.commands.toLowerCase()}
        </span>
        {left <= 80 && <span className="ai-left" data-hot={left < 20 ? "" : undefined}>{c.limit(Math.max(0, left))}</span>}
      </p>
    </form>
  );
}

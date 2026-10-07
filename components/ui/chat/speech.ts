"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatLang } from "@/lib/chat/copy";
import { plainText } from "@/lib/chat/markdown";

/**
 * Speaking to the assistant and having it read aloud, with what the browser already has (no service, no key, no
 * download). Both are offered only where they exist. Speech recognition in Chrome is done by the browser's own
 * service, which is why the button says what it does and nothing is listening until it is pressed.
 */

const LOCALE: Record<ChatLang, string> = { id: "id-ID", en: "en-US" };

interface RecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEventLike {
  results: ArrayLike<RecognitionResultLike>;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => RecognitionLike;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Dictation: the words are handed over as they come (interim) and once more when they are final. */
export function useSpeechInput(lang: ChatLang, onText: (text: string, final: boolean) => void) {
  const [supported] = useState(() => recognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const rec = useRef<RecognitionLike | null>(null);
  const handler = useRef(onText);
  useEffect(() => {
    handler.current = onText;
  }, [onText]);

  const stop = useCallback(() => {
    rec.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor || rec.current) return;
    const r = new Ctor();
    r.lang = LOCALE[lang];
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (event) => {
      let text = "";
      let final = false;
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
        final = event.results[i].isFinal;
      }
      handler.current(text.trim(), final);
    };
    const done = () => {
      rec.current = null;
      setListening(false);
    };
    r.onend = done;
    r.onerror = done;
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      done();
    }
  }, [lang]);

  useEffect(() => () => rec.current?.abort(), []);

  return { supported, listening, start, stop };
}

/** Reading a reply aloud: one at a time, stopped by pressing again, by leaving, or by starting another. */
export function useSpeechOutput(lang: ChatLang) {
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(null);
  }, []);

  const speak = useCallback(
    (id: string, markdown: string) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const text = plainText(markdown);
      if (!text) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LOCALE[lang];
      u.onend = () => setSpeaking((current) => (current === id ? null : current));
      u.onerror = u.onend;
      setSpeaking(id);
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return { supported, speaking, speak, cancel };
}

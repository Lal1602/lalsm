import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractActions, stripActionTagsForDisplay, type SectionId } from '@/lib/chat/actions';
import { cardsFromActions } from '@/lib/chat/cards';
import { parseCommand } from '@/lib/chat/commands';
import { COPY, defaultChatLang, type ChatLang } from '@/lib/chat/copy';
import { runCommand } from '@/lib/chat/runCommand';
import { runChatActions } from '@/lib/chat/runActions';
import { isTone, type Tone } from '@/lib/chat/tone';
import { newMessageId, type Message, type Suggestion } from '@/lib/chat/types';
import { MAX_HISTORY_ITEMS, MAX_MESSAGE_CHARS } from '@/lib/chat/validate';
import { track } from '@/lib/analytics';

export type { Message, Suggestion } from '@/lib/chat/types';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  lang: ChatLang;
  tone: Tone;
  /** The section under the middle of the window (set by the overlay). */
  section: SectionId | null;
  /** Whether a live model answers, as the server says; unknown until asked. */
  live: 'unknown' | 'live' | 'offline';
  /** The current stop of the tour, or -1. */
  tour: number;

  /** What the visitor typed or chose: a slash command runs here, anything else goes to the model. */
  submit: (input: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  /** Ends the answer that is arriving, keeping what has arrived. */
  stop: () => void;
  /** Asks the last question again (also the way to retry one that did not get through). */
  regenerate: () => Promise<void>;
  clearHistory: () => void;
  setLang: (lang: ChatLang) => void;
  setTone: (tone: Tone) => void;
  setSection: (section: SectionId | null) => void;
  refreshStatus: () => Promise<void>;
}

/** How many past messages are kept in localStorage. */
const MAX_STORED_MESSAGES = 40;

interface DoneEvent {
  reply: string;
  suggestions: string[];
  model?: string;
  source?: string;
}

type StreamEvent =
  | { type: 'delta'; text: string }
  | ({ type: 'done' } & DoneEvent);

/** Reads newline-delimited JSON events from a streaming response body. */
async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline: number;
    while ((newline = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line) as StreamEvent;
      } catch {
        // Ignore a malformed line rather than killing the whole answer.
      }
    }
  }
}

let inFlight: AbortController | null = null;

const calm = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * An answer that arrived whole (the offline one) is shown the way a streamed one is: a few words at a time, so the two
 * feel alike and the Stop button means the same. Resolves when it is all shown, or when it is stopped.
 */
function reveal(text: string, signal: AbortSignal, show: (partial: string) => void): Promise<void> {
  if (calm() || text.length < 24) {
    show(text);
    return Promise.resolve();
  }
  const tokens = text.match(/\s*\S+/g) ?? [text];
  return new Promise((resolve) => {
    let shown = 0;
    const tick = window.setInterval(() => {
      if (signal.aborted) {
        window.clearInterval(tick);
        resolve();
        return;
      }
      shown = Math.min(tokens.length, shown + 2);
      show(tokens.slice(0, shown).join(''));
      if (shown >= tokens.length) {
        window.clearInterval(tick);
        resolve();
      }
    }, 28);
  });
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const lang = () => get().lang;
      const t = () => COPY[get().lang];

      const append = (message: Message) => set((state) => ({ messages: [...state.messages, message] }));
      const patchLast = (patch: Partial<Message>) =>
        set((state) => {
          const messages = state.messages.slice();
          if (messages.length === 0) return {};
          messages[messages.length - 1] = { ...messages[messages.length - 1], ...patch };
          return { messages };
        });

      /** An assistant message made by the interface itself (a command's reply). */
      const say = (m: { text: string; cards?: Message['cards']; suggestions?: Suggestion[] }) =>
        append({ id: newMessageId(), role: 'ai', ts: Date.now(), text: m.text, cards: m.cards, suggestions: m.suggestions });

      const failWith = (text: string) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { id: newMessageId(), role: 'ai', ts: Date.now(), text, failed: true, suggestions: COPY[state.lang].suggestions.slice(0, 3) },
          ],
          isLoading: false,
        }));

      return {
        messages: [],
        isLoading: false,
        lang: typeof navigator === 'undefined' ? 'en' : defaultChatLang(navigator.languages ?? [navigator.language]),
        tone: 'default',
        section: null,
        live: 'unknown',
        tour: -1,

        setLang: (next) => set({ lang: next }),
        setTone: (next) => {
          if (!isTone(next)) return;
          set({ tone: next });
          track('chat_tone', { tone: next });
        },
        setSection: (section) => {
          if (get().section !== section) set({ section });
        },

        refreshStatus: async () => {
          try {
            const response = await fetch('/api/ai/chat', { cache: 'no-store' });
            if (!response.ok) throw new Error(String(response.status));
            const data = (await response.json()) as { live?: boolean };
            set({ live: data.live ? 'live' : 'offline' });
          } catch {
            // Not knowing is fine: the first answer says which it was.
          }
        },

        submit: async (input) => {
          const text = input.trim();
          if (!text) return;
          const parsed = parseCommand(text);
          if (!parsed) {
            await get().sendMessage(text);
            return;
          }
          if (get().isLoading) return;
          track('chat_command', { command: parsed.command.id });
          // The visitor's line stays in the conversation, as a message they wrote.
          append({ id: newMessageId(), role: 'user', ts: Date.now(), text: text.slice(0, MAX_MESSAGE_CHARS) });
          runCommand(parsed, {
            lang: lang(),
            tone: get().tone,
            tour: get().tour,
            messages: () => get().messages,
            say,
            setTone: (tone) => get().setTone(tone),
            setTour: (tour) => set({ tour }),
            clear: () => get().clearHistory(),
          });
        },

        sendMessage: async (rawText: string) => {
          const text = rawText.trim().slice(0, MAX_MESSAGE_CHARS);
          if (!text || get().isLoading) return;

          const history = get()
            .messages.filter((m) => m.text && !m.failed)
            .slice(-MAX_HISTORY_ITEMS)
            .map(({ role, text: body }) => ({ role, text: body }));

          append({ id: newMessageId(), role: 'user', ts: Date.now(), text });
          set({ isLoading: true });
          track('chat_message', { length: text.length });

          const controller = new AbortController();
          inFlight = controller;

          try {
            const { tone, section } = get();
            const response = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text, history, tone, section: section ?? undefined, lang: lang() }),
              signal: controller.signal,
            });

            if (response.status === 429) {
              const data = await response.json().catch(() => ({}));
              const wait = Number(data.retryAfter) || Number(response.headers.get('Retry-After')) || 30;
              track('chat_rate_limited');
              failWith(t().rateLimited(wait));
              return;
            }
            if (!response.ok) throw new Error(`Chat request failed (${response.status})`);

            const contentType = response.headers.get('Content-Type') ?? '';

            // No API key on the server: a plain JSON answer from the offline rules.
            if (contentType.includes('application/json')) {
              const data = (await response.json()) as DoneEvent;
              set({ live: 'offline' });
              const { text: reply, actions } = extractActions(data.reply || '');
              const full = reply || t().fallback;
              const id = newMessageId();
              set((state) => ({
                messages: [...state.messages, { id, role: 'ai', ts: Date.now(), text: '', streaming: true, source: 'offline' }],
                isLoading: false,
              }));
              await reveal(full, controller.signal, (partial) => patchLast({ text: partial }));
              if (controller.signal.aborted) return;
              patchLast({ text: full, streaming: false, suggestions: data.suggestions ?? [], cards: cardsFromActions(actions) });
              runChatActions(actions);
              return;
            }

            if (!response.body) throw new Error('Empty response body');

            let streamedText = '';
            let started = false;
            let finished = false;

            for await (const event of readEvents(response.body)) {
              if (event.type === 'delta') {
                streamedText += event.text;
                const visible = stripActionTagsForDisplay(streamedText);
                if (!visible) continue;

                if (!started) {
                  started = true;
                  set((state) => ({
                    messages: [...state.messages, { id: newMessageId(), role: 'ai', ts: Date.now(), text: visible, streaming: true, source: 'live' }],
                    isLoading: false,
                  }));
                } else {
                  patchLast({ text: visible });
                }
              } else if (event.type === 'done') {
                finished = true;
                const offline = event.model === 'simulated';
                set({ live: offline ? 'offline' : 'live' });
                const { text: reply, actions } = extractActions(event.reply);
                const final: Partial<Message> = {
                  text: reply || t().fallback,
                  streaming: false,
                  suggestions: event.suggestions,
                  cards: cardsFromActions(actions),
                  source: offline ? 'offline' : 'live',
                };
                if (started) patchLast(final);
                else append({ id: newMessageId(), role: 'ai', ts: Date.now(), text: '', ...final } as Message);
                set({ isLoading: false });
                runChatActions(actions);
              }
            }

            if (!finished) throw new Error('Stream ended before completion');
          } catch (error) {
            if (controller.signal.aborted) return; // stopped, reset or a new page load: the stop path has done its part
            console.error('Error sending chat message:', error);
            track('chat_error');

            // Keep whatever text already arrived instead of replacing it with an error.
            const last = get().messages[get().messages.length - 1];
            if (last?.streaming) {
              patchLast({ streaming: false, stopped: true, suggestions: COPY[lang()].suggestions.slice(0, 3) });
              set({ isLoading: false });
            } else {
              failWith(t().fallback);
            }
          } finally {
            if (inFlight === controller) inFlight = null;
          }
        },

        stop: () => {
          if (!inFlight) return;
          inFlight.abort();
          inFlight = null;
          const last = get().messages[get().messages.length - 1];
          if (last?.streaming) patchLast({ streaming: false, stopped: true, suggestions: COPY[lang()].suggestions.slice(0, 3) });
          set({ isLoading: false });
          track('chat_stop');
        },

        regenerate: async () => {
          if (get().isLoading) return;
          const messages = get().messages;
          let at = -1;
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user' && !parseCommand(messages[i].text)) {
              at = i;
              break;
            }
          }
          if (at === -1) return;
          const question = messages[at].text;
          // Drop that question and everything after it; asking again puts the question back.
          set({ messages: messages.slice(0, at) });
          track('chat_regenerate');
          await get().sendMessage(question);
        },

        clearHistory: () => {
          inFlight?.abort();
          inFlight = null;
          set({ messages: [], isLoading: false, tour: -1 });
          track('chat_reset');
        },
      };
    },
    {
      name: 'bilal-chat-storage',
      version: 2,
      partialize: (state) => ({
        // Only durable fields: a reply caught mid-stream by a reload must not come back "streaming".
        messages: state.messages
          .filter((m) => !m.streaming)
          .slice(-MAX_STORED_MESSAGES)
          .map((m) => ({
            id: m.id,
            role: m.role,
            ts: m.ts,
            text: m.text,
            suggestions: m.suggestions,
            cards: m.cards,
            stopped: m.stopped,
            failed: m.failed,
            source: m.source,
          })),
        lang: state.lang,
        tone: state.tone,
      }),
      migrate: (persisted) => {
        // Version 1 kept a greeting as its first message; the greeting is the empty state now.
        const old = (persisted ?? {}) as { messages?: Array<Partial<Message> & { welcome?: boolean }> };
        const messages = (old.messages ?? [])
          .filter((m) => m && !m.welcome && typeof m.text === 'string' && m.text && (m.role === 'user' || m.role === 'ai'))
          .map((m, i) => ({ id: m.id ?? newMessageId(), role: m.role as 'user' | 'ai', text: m.text as string, ts: m.ts ?? Date.now() - (old.messages!.length - i) * 1000, suggestions: m.suggestions }));
        return { messages } as never;
      },
    }
  )
);

/** The assistant's status line, from what is known (never from a guess). */
export function statusLine(live: ChatStore['live'], lang: ChatLang): string {
  const c = COPY[lang];
  if (live === 'live') return c.statusLive;
  if (live === 'offline') return c.statusOffline;
  return c.statusUnknown;
}

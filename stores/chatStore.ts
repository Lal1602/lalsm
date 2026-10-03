import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractActions, stripActionTagsForDisplay } from '@/lib/chat/actions';
import { runChatActions } from '@/lib/chat/runActions';
import { MAX_HISTORY_ITEMS, MAX_MESSAGE_CHARS } from '@/lib/chat/validate';
import { track } from '@/lib/analytics';

export interface Message {
  role: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  /** True while the reply is still arriving from the stream. */
  streaming?: boolean;
  /** The opening greeting — shown to the visitor but never sent to the model. */
  welcome?: boolean;
  /** Reveal the text with the typewriter effect. Session-only, never persisted. */
  typewriter?: boolean;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

/** How many past messages are kept in localStorage. */
const MAX_STORED_MESSAGES = 40;

const DEFAULT_SUGGESTIONS = [
  'Tunjukkan galeri proyekmu!',
  'Apa saja keahlian/skill coding Bilal?',
  'Bagaimana cara menghubungi Bilal?',
  'Ceritakan tentang kuliahnya di PENS',
];

const getRandomGreeting = () => {
  const greetings = [
    "Halo! Saya B.I.L.A.L., asisten virtual cerdas Bilal. Ada yang bisa saya bantu terkait proyek, skill, atau pengalaman kerja Bilal?",
    "System Online. Saya B.I.L.A.L., asisten pribadi Bilal. Ingin tahu lebih dalam tentang teknologi yang Bilal kuasai atau proyek terbarunya?",
    "Selamat datang! B.I.L.A.L. siap melayani. Silakan jelajahi portofolio ini, atau tanyakan apa pun tentang perjalanan karir dan karya Bilal.",
    "B.I.L.A.L. stands by. Mari kita bedah portofolio ini bersama! Kamu ingin melihat galeri proyek atau mengetahui skill coding utama Bilal?",
    "Halo, penjelajah digital! Saya B.I.L.A.L., asisten cerdas Bilal. Ada hal spesifik yang ingin kamu ketahui tentang sang kreator hari ini?"
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

const createWelcomeMessage = (): Message => ({
  role: 'ai',
  text: getRandomGreeting(),
  suggestions: DEFAULT_SUGGESTIONS,
  welcome: true,
  typewriter: true,
});

const FALLBACK_TEXT =
  'Maaf, saya sedang kesulitan menghubungi server otak utama saya. Tapi jangan ragu untuk menanyakan hal seputar portofolio Bilal, keahliannya di bidang React/Three.js/GSAP, atau menjelajahi proyek-proyek di halaman ini!';

interface DoneEvent {
  reply: string;
  suggestions: string[];
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

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const appendAi = (message: Message) =>
        set((state) => ({ messages: [...state.messages, message], isLoading: false }));

      const failWith = (text: string) =>
        appendAi({ role: 'ai', text, suggestions: DEFAULT_SUGGESTIONS.slice(0, 3), typewriter: true });

      return {
        messages: [createWelcomeMessage()],
        isLoading: false,

        sendMessage: async (rawText: string) => {
          const text = rawText.trim().slice(0, MAX_MESSAGE_CHARS);
          if (!text || get().isLoading) return;

          const history = get()
            .messages.filter((m) => !m.welcome && m.text)
            .slice(-MAX_HISTORY_ITEMS)
            .map(({ role, text }) => ({ role, text }));

          set((state) => ({
            messages: [...state.messages, { role: 'user', text }],
            isLoading: true,
          }));
          track('chat_message', { length: text.length });

          const controller = new AbortController();
          inFlight = controller;

          try {
            const response = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text, history }),
              signal: controller.signal,
            });

            if (response.status === 429) {
              const data = await response.json().catch(() => ({}));
              const wait = Number(data.retryAfter) || Number(response.headers.get('Retry-After')) || 30;
              track('chat_rate_limited');
              failWith(`Pesannya terlalu cepat, B.I.L.A.L. perlu napas sebentar. Coba lagi dalam ${wait} detik ya!`);
              return;
            }
            if (!response.ok) throw new Error(`Chat request failed (${response.status})`);

            const contentType = response.headers.get('Content-Type') ?? '';

            // No API key on the server: a plain JSON answer from the local simulation.
            if (contentType.includes('application/json')) {
              const data = (await response.json()) as DoneEvent;
              const { text: reply, actions } = extractActions(data.reply || '');
              appendAi({ role: 'ai', text: reply || FALLBACK_TEXT, suggestions: data.suggestions ?? [], typewriter: true });
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
                    messages: [...state.messages, { role: 'ai', text: visible, streaming: true }],
                    isLoading: false,
                  }));
                } else {
                  set((state) => {
                    const messages = state.messages.slice();
                    messages[messages.length - 1] = { role: 'ai', text: visible, streaming: true };
                    return { messages };
                  });
                }
              } else if (event.type === 'done') {
                finished = true;
                const { text: reply, actions } = extractActions(event.reply);
                const finalMessage: Message = {
                  role: 'ai',
                  text: reply || FALLBACK_TEXT,
                  suggestions: event.suggestions,
                };

                set((state) => {
                  const messages = state.messages.slice();
                  if (started) messages[messages.length - 1] = finalMessage;
                  else messages.push(finalMessage);
                  return { messages, isLoading: false };
                });
                runChatActions(actions);
              }
            }

            if (!finished) throw new Error('Stream ended before completion');
          } catch (error) {
            if (controller.signal.aborted) return; // reset or new page load — stay quiet
            console.error('Error sending chat message:', error);
            track('chat_error');

            // Keep whatever text already arrived instead of replacing it with an error.
            set((state) => {
              const last = state.messages[state.messages.length - 1];
              if (last?.streaming) {
                const messages = state.messages.slice();
                messages[messages.length - 1] = {
                  role: 'ai',
                  text: last.text,
                  suggestions: DEFAULT_SUGGESTIONS.slice(0, 3),
                };
                return { messages, isLoading: false };
              }
              return {
                messages: [
                  ...state.messages,
                  { role: 'ai', text: FALLBACK_TEXT, suggestions: DEFAULT_SUGGESTIONS.slice(0, 3) },
                ],
                isLoading: false,
              };
            });
          } finally {
            if (inFlight === controller) inFlight = null;
          }
        },

        clearHistory: () => {
          inFlight?.abort();
          inFlight = null;
          set({ messages: [createWelcomeMessage()], isLoading: false });
          track('chat_reset');
        },
      };
    },
    {
      name: 'bilal-chat-storage',
      partialize: (state) => ({
        // Only durable fields: a reply caught mid-stream by a reload must not
        // come back "streaming", and old replies should not re-type themselves.
        messages: state.messages.slice(-MAX_STORED_MESSAGES).map((m) => ({
          role: m.role,
          text: m.text,
          suggestions: m.suggestions,
          welcome: m.welcome,
        })),
      }),
    }
  )
);

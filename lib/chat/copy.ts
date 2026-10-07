/**
 * Every word the assistant's interface says, in the two languages of the site's CV. The visitor's language is chosen
 * from the browser the first time and can be changed in the assistant's menu. (What the model says follows what the
 * visitor writes; this file is only the interface and the replies the interface makes by itself.)
 */

export type ChatLang = "id" | "en";
export const CHAT_LANGS: readonly ChatLang[] = ["id", "en"];

export interface ChatCopy {
  name: string;
  expansion: string;
  statusLive: string;
  statusOffline: string;
  statusUnknown: string;
  statusThinking: string;
  statusListening: string;
  statusSpeaking: string;
  welcomeTitle: string;
  welcomeBody: string;
  hereNow: (section: string) => string;
  quick: { id: string; label: string; hint: string }[];
  placeholder: string;
  placeholderListening: string;
  send: string;
  stop: string;
  mic: string;
  micStop: string;
  commands: string;
  newMessages: string;
  you: string;
  copy: string;
  copied: string;
  speak: string;
  speakStop: string;
  regenerate: string;
  open: string;
  openOnPage: string;
  menu: string;
  close: string;
  tone: string;
  tones: Record<"default" | "bro" | "sensei", { label: string; hint: string }>;
  language: string;
  export: string;
  sendToBilal: string;
  emailSummary: string;
  reset: string;
  shortcuts: string;
  launcher: string;
  teaser: string;
  limit: (left: number) => string;
  rateLimited: (seconds: number) => string;
  fallback: string;
  stopped: string;
  failed: string;
  retry: string;
  suggestions: string[];
}

const ID: ChatCopy = {
  name: "B.I.L.A.L.",
  expansion: "Brain & Intelligent Logic Assistant Link",
  statusLive: "Live",
  statusOffline: "Mode offline · jawaban lokal",
  statusUnknown: "Menghubungkan…",
  statusThinking: "Berpikir…",
  statusListening: "Mendengarkan…",
  statusSpeaking: "Menjawab…",
  welcomeTitle: "Halo, aku B.I.L.A.L.",
  welcomeBody: "Aku kenal karya Bilal dan tahu kamu sedang di bagian mana. Tanya apa saja, atau pilih jalan pintas.",
  hereNow: (section) => `Kamu sedang di ${section}`,
  quick: [
    { id: "projects", label: "Proyek", hint: "Galeri karya" },
    { id: "skills", label: "Keahlian", hint: "Stack & tools" },
    { id: "certificates", label: "Sertifikat", hint: "Prestasi" },
    { id: "cv", label: "CV", hint: "Unduh EN / ID" },
    { id: "contact", label: "Kontak", hint: "Hubungi Bilal" },
    { id: "tour", label: "Tur", hint: "Keliling situs" },
  ],
  placeholder: "Tanya soal Bilal, atau ketik /",
  placeholderListening: "Bicara saja, aku mendengarkan…",
  send: "Kirim pesan",
  stop: "Hentikan jawaban",
  mic: "Bicara",
  micStop: "Berhenti mendengarkan",
  commands: "Perintah",
  newMessages: "Pesan baru",
  you: "Kamu",
  copy: "Salin",
  copied: "Tersalin",
  speak: "Bacakan",
  speakStop: "Hentikan suara",
  regenerate: "Jawab ulang",
  open: "Buka",
  openOnPage: "Lihat di halaman",
  menu: "Menu",
  close: "Tutup asisten",
  tone: "Gaya bicara",
  tones: {
    default: { label: "Standar", hint: "Hangat dan ringkas" },
    bro: { label: "Santai", hint: "Slang, cuy" },
    sensei: { label: "Sensei", hint: "Formal dan tegas" },
  },
  language: "Bahasa antarmuka",
  export: "Ekspor percakapan",
  sendToBilal: "Kirim ke Bilal lewat form",
  emailSummary: "Email ringkasan",
  reset: "Mulai ulang",
  shortcuts: "Ctrl K buka · Esc tutup · / perintah",
  launcher: "Tanya B.I.L.A.L.",
  teaser: "Tanya aku soal Bilal, proyeknya, atau CV-nya",
  limit: (left) => `${left} lagi`,
  rateLimited: (seconds) => `Pesannya terlalu cepat, B.I.L.A.L. perlu napas sebentar. Coba lagi dalam ${seconds} detik ya!`,
  fallback:
    "Maaf, aku sedang kesulitan menghubungi server otakku. Tapi kamu tetap bisa tanya soal portofolio Bilal, atau pakai perintah seperti /proyek, /cv, dan /kontak.",
  stopped: "Dihentikan",
  failed: "Gagal terkirim",
  retry: "Coba lagi",
  suggestions: ["Tunjukkan galeri proyekmu!", "Apa saja keahlian coding Bilal?", "Bagaimana cara menghubungi Bilal?", "Ceritakan tentang kuliahnya di PENS"],
};

const EN: ChatCopy = {
  name: "B.I.L.A.L.",
  expansion: "Brain & Intelligent Logic Assistant Link",
  statusLive: "Live",
  statusOffline: "Offline mode · local answers",
  statusUnknown: "Connecting…",
  statusThinking: "Thinking…",
  statusListening: "Listening…",
  statusSpeaking: "Answering…",
  welcomeTitle: "Hello, I'm B.I.L.A.L.",
  welcomeBody: "I know Bilal's work and which part of the page you are on. Ask anything, or take a shortcut.",
  hereNow: (section) => `You are at ${section}`,
  quick: [
    { id: "projects", label: "Projects", hint: "The archive" },
    { id: "skills", label: "Skills", hint: "Stack & tools" },
    { id: "certificates", label: "Certificates", hint: "Awards" },
    { id: "cv", label: "CV", hint: "Download EN / ID" },
    { id: "contact", label: "Contact", hint: "Reach Bilal" },
    { id: "tour", label: "Tour", hint: "Walk the site" },
  ],
  placeholder: "Ask about Bilal, or type /",
  placeholderListening: "Just speak, I'm listening…",
  send: "Send message",
  stop: "Stop the answer",
  mic: "Speak",
  micStop: "Stop listening",
  commands: "Commands",
  newMessages: "New messages",
  you: "You",
  copy: "Copy",
  copied: "Copied",
  speak: "Read aloud",
  speakStop: "Stop reading",
  regenerate: "Answer again",
  open: "Open",
  openOnPage: "Show on the page",
  menu: "Menu",
  close: "Close assistant",
  tone: "Tone",
  tones: {
    default: { label: "Default", hint: "Warm and brief" },
    bro: { label: "Casual", hint: "Slang, relaxed" },
    sensei: { label: "Sensei", hint: "Formal and firm" },
  },
  language: "Interface language",
  export: "Export conversation",
  sendToBilal: "Send to Bilal through the form",
  emailSummary: "Email a summary",
  reset: "Start over",
  shortcuts: "Ctrl K open · Esc close · / commands",
  launcher: "Ask B.I.L.A.L.",
  teaser: "Ask me about Bilal, his projects, or his CV",
  limit: (left) => `${left} left`,
  rateLimited: (seconds) => `That was quick: B.I.L.A.L. needs a moment to breathe. Try again in ${seconds} seconds.`,
  fallback:
    "Sorry, I'm having trouble reaching my brain server. You can still ask about Bilal's portfolio, or use commands like /projects, /cv and /contact.",
  stopped: "Stopped",
  failed: "Not sent",
  retry: "Try again",
  suggestions: ["Show me your project gallery", "What are Bilal's coding skills?", "How can I contact Bilal?", "Tell me about his studies at PENS"],
};

export const COPY: Record<ChatLang, ChatCopy> = { id: ID, en: EN };

/** The language to start in: the browser's, Indonesian if it is one of the Indonesian locales. */
export function defaultChatLang(languages: readonly string[] | undefined): ChatLang {
  const first = (languages?.[0] ?? "").toLowerCase();
  return first === "id" || first.startsWith("id-") ? "id" : "en";
}


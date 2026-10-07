import { projects } from "@/data/projects";
import { achievements } from "@/data/achievements";
import type { SectionId } from "./actions";
import { suggestionsFor } from "./context";
import { tonify, type Tone } from "./tone";
import type { ChatHistoryItem } from "./validate";

/**
 * Offline fallback for the assistant: answers common questions from keyword
 * rules when there is no API key, the quota is exhausted, or every model fails.
 */

export interface SimulatedReply {
  reply: string;
  suggestions: string[];
}

/**
 * Keyword test. Very short keys must be whole words ("hi" must not fire on
 * "this"), 3–4 letter keys must start a word ("form" must not fire on
 * "informasi"), longer keys match as plain substrings.
 */
function has(msg: string, ...keys: string[]): boolean {
  return keys.some((key) => {
    if (key.length <= 2) return new RegExp(`\\b${key}\\b`).test(msg);
    if (key.length <= 4) return new RegExp(`\\b${key}`).test(msg);
    return msg.includes(key);
  });
}

const ACHIEVEMENT_KEYS: Array<{ key: string; match: string }> = [
  { key: "lks", match: "LKS Web Technologies" },
  { key: "kumon", match: "Kumon" },
  { key: "bnsp", match: "BNSP" },
  { key: "toeic", match: "TOEIC" },
  { key: "timedoor", match: "Timedoor" },
  { key: "bee", match: "Bee Coding" },
  { key: "hmtc", match: "HMTC" },
];

function findAchievementTitle(match: string): string | undefined {
  return achievements.find((a) => a.title.includes(match))?.title;
}

const BLOCKED_PROBES = ["system prompt", "system instruction", "jailbreak", "ignore previous", "kamu adalah asisten", "prompt rahasia"];

export interface SimulatedOptions {
  tone?: Tone;
  /** Where the visitor is, for the suggestions when nothing in the question matched. */
  section?: SectionId;
}

/** The offline answer, dressed in the tone the visitor chose (the live model does that for real). */
export function getSimulatedReply(message: string, history: ChatHistoryItem[] = [], options: SimulatedOptions = {}): SimulatedReply {
  const reply = baseReply(message, history, options.section);
  return options.tone && options.tone !== "default" ? { ...reply, reply: tonify(reply.reply, options.tone) } : reply;
}

function baseReply(message: string, history: ChatHistoryItem[], section?: SectionId): SimulatedReply {
  const msg = message.toLowerCase();

  if (BLOCKED_PROBES.some((p) => msg.includes(p))) {
    return {
      reply:
        "Maaf, saya tidak dapat membagikan instruksi internal atau rahasia sistem saya. Namun, saya sangat senang mendiskusikan keahlian teknologi web Bilal atau membantu Anda menjelajahi website ini!",
      suggestions: ["Apa saja keahlian coding Bilal?", "Tunjukkan proyek game buatanmu", "Bagaimana cara menghubungi Bilal?"],
    };
  }

  if (has(msg, "cv", "resume", "curriculum", "berkas lamaran", "riwayat hidup")) {
    return {
      reply:
        "CV Bilal tersedia dalam dua edisi, bahasa Indonesia dan Inggris, keduanya PDF dua halaman dengan isi yang sama. Aku bukakan pilihannya. [ACTION:OPEN_CV]",
      suggestions: ["Apa saja keahlian coding Bilal?", "Tunjukkan proyek di CV-nya", "Bagaimana cara menghubungi Bilal?"],
    };
  }

  // Context from the last assistant turn, for follow-ups like "yang mana?".
  const isFollowUp = has(msg, "yang mana", "mana", "buka", "tunjukkan", "tampilkan");
  const lastAi = [...history].reverse().find((h) => h.role === "ai")?.text.toLowerCase() ?? "";
  const followUpContact =
    isFollowUp && ["form", "footer", "hubung", "kontak", "email", "uplink"].some((k) => lastAi.includes(k));
  const followUpProjects =
    !followUpContact &&
    isFollowUp &&
    ["proyek", "project", "karya", "game", "phaser"].some((k) => lastAi.includes(k));

  if (has(msg, "react", "next.js", "three.js", "gsap", "web development", "coding", "programming", "frontend", "backend", "cara kerja")) {
    return {
      reply:
        "Teknologi tersebut adalah pilar utama web development modern! Bilal sendiri menggunakan React/Next.js untuk struktur, Three.js untuk rendering 3D WebGL, dan GSAP untuk performa animasi di website ini. Ingin melihat detail keahlian coding miliknya? Saya bantu scroll ke bagian About! [ACTION:SCROLL_AND_HIGHLIGHT:about]",
      suggestions: ["Buka terminal skill di bagian About", "Tunjukkan sertifikat prestasi", "Bagaimana dengan proyek game?"],
    };
  }

  if (followUpContact) {
    return {
      reply:
        "Tentu! Ini dia form kontak (UPLINK_FORM.exe) dan footer holografik yang terletak di bagian paling bawah website. Saya bantu arahkan layar Anda langsung ke sana ya! [ACTION:SCROLL_AND_HIGHLIGHT:contact]",
      suggestions: ["Kirim email ke Bilal", "Tampilkan sosial media Bilal", "Kembali ke halaman atas"],
    };
  }

  if (followUpProjects) {
    return {
      reply:
        "Bilal merekomendasikan Game Petualangan 2D (Phaser.js) atau website premium NOIR Photography. Saya bantu scroll ke galeri proyek agar Anda bisa melihatnya! [ACTION:SCROLL_AND_HIGHLIGHT:projects]",
      suggestions: ["Buka game MindPoint", "Lihat website NOIR Photography", "Apa keahlian coding Bilal?"],
    };
  }

  // Specific project by name → open it.
  const project = projects.find((p) => msg.includes(p.title.toLowerCase()));
  if (project) {
    return {
      reply: `Tentu! Saya bantu Anda menavigasi ke proyek "${project.title}" dan membuka detailnya sekarang juga! [ACTION:OPEN_PROJECT:${project.title}]`,
      suggestions: ["Apa tech stack proyek ini?", "Ceritakan tantangan membuatnya", "Tunjukkan proyek lainnya"],
    };
  }

  // Specific certificate by keyword → open it.
  for (const { key, match } of ACHIEVEMENT_KEYS) {
    const title = has(msg, key) ? findAchievementTitle(match) : undefined;
    if (title) {
      return {
        reply: `Tentu! Ini dia sertifikat prestasi "${title}" milik Bilal. Saya bantu scroll dan membukanya untuk Anda! [ACTION:OPEN_ACHIEVEMENT:${title}]`,
        suggestions: ["Tunjukkan sertifikat LKS", "Tunjukkan sertifikat BNSP", "Lihat galeri proyek"],
      };
    }
  }

  if (has(msg, "tampilkan proyek", "tunjukkan proyek", "buka proyek", "lihat proyek", "tampilkan portfolio", "tunjukkan portfolio")) {
    return {
      reply:
        "Tentu! Ini adalah bagian galeri proyek interaktif Bilal. Di sini Anda bisa menjelajahi berbagai eksperimen game Phaser, partikel Canvas, dan website Awwwards-style miliknya! [ACTION:SCROLL_AND_HIGHLIGHT:projects]",
      suggestions: ["Buka game Ghost Buster", "Buka Aether Dreamscape", "Lihat sertifikat prestasi"],
    };
  }

  if (has(msg, "tampilkan prestasi", "tunjukkan prestasi", "tampilkan sertifikat", "tunjukkan sertifikat", "sertifikat", "prestasi", "penghargaan")) {
    return {
      reply:
        "Dengan senang hati! Ini adalah bagian Achievements, berisi prestasi dan sertifikasi Bilal: juara kompetisi LKS, sertifikasi nasional BNSP, Kumon matematika, hingga kursus Timedoor! [ACTION:SCROLL_AND_HIGHLIGHT:achievements]",
      suggestions: ["Buka sertifikat BNSP", "Buka sertifikat Kumon", "Bagaimana cara menghubungi Bilal?"],
    };
  }

  if (has(msg, "hubungi", "kontak", "email", "form", "uplink")) {
    return {
      reply:
        "Ingin menghubungi Bilal secara langsung? Scroll ke bagian bawah untuk mengisi UPLINK_FORM.exe atau menemukan media sosialnya. Saya bantu gulirkan layar Anda ke sana sekarang! [ACTION:SCROLL_AND_HIGHLIGHT:contact]",
      suggestions: ["Salin email Bilal", "Tampilkan media sosialnya", "Tunjukkan galeri proyek"],
    };
  }

  if (has(msg, "halo", "hai", "hi", "hello", "pagi", "siang", "sore", "malam", "bro", "kabar", "sehat")) {
    return {
      reply:
        "Halo! Kabar saya sangat baik, terima kasih! Sebagai asisten virtual Bilal, saya senang membantu Anda menjelajahi portofolio 3D, proyek game Phaser, sertifikasi LKS, kuliahnya di PENS Surabaya, hingga layanan freelance-nya. Ada yang ingin Anda tanyakan?",
      suggestions: ["Apa saja keahlian coding Bilal?", "Tunjukkan proyek game buatanmu", "Kuliah di mana?"],
    };
  }

  if (has(msg, "yang mana", "apa saja", "proyek mana", "proyek apa", "mana aja", "mana saja", "rekomendasi")) {
    return {
      reply:
        "Bilal sangat merekomendasikan Anda mencoba proyek game 2D miliknya (dibuat dengan Phaser.js) atau mengeksplorasi asisten interaktif yang sedang Anda gunakan saat ini! Ada juga proyek web bergaya Awwwards seperti NOIR Photography dan e-commerce Herbal Mart. Proyek mana yang paling membuat Anda penasaran?",
      suggestions: ["Lihat NOIR Photography", "Buka game MindPoint", "Apa keahlian coding Bilal?"],
    };
  }

  if (has(msg, "oke", "ok", "sip", "mantap", "keren", "hebat", "bagus", "wow", "gokil", "seru", "oh ya", "oh gitu")) {
    return {
      reply:
        "Terima kasih banyak! Bilal memang berkomitmen menyajikan performa website terbaik dengan visual 3D WebGL dan animasi GSAP yang premium. Ada hal spesifik tentang kuliahnya di PENS, prestasi kompetisinya, atau hobinya yang ingin Anda ketahui?",
      suggestions: ["Ceritakan tentang UKM Softdev PENS", "Apa hobinya Bilal?", "Laptop apa yang dipakai Bilal?"],
    };
  }

  if (has(msg, "game dev", "bikin game", "phaser", "permainan")) {
    return {
      reply:
        "Di bidang Game Dev, Bilal banyak bereksperimen dengan Phaser.js dan Canvas. Beberapa karyanya adalah Aether Dreamscape, MindPoint, Ghost Buster, Memory Game, Math Fighter, hingga Bunny Jump Lite!",
      suggestions: ["Buka game MindPoint", "Buka game Ghost Buster", "Bagaimana dengan proyek web?"],
    };
  }

  if (has(msg, "proyek", "karya", "project", "bikin apa", "portofolio", "portfolio", "website")) {
    return {
      reply: `Bilal punya ${projects.length} proyek di galeri ini! Mulai dari web sekelas Awwwards (NOIR Photography, LUMIERA, Digital Craftsman) yang sarat animasi GSAP dan Three.js, hingga e-commerce Herbal Mart dan eksperimen partikel Canvas.`,
      suggestions: ["Lihat NOIR Photography", "Lihat e-commerce Herbal Mart", "Main game MindPoint"],
    };
  }

  if (has(msg, "python", "ai", "computer vision", "opencv", "mediapipe", "isyarat", "bisindo")) {
    return {
      reply:
        "Selain web, Bilal mengerjakan Sign Language Recognition System: aplikasi interpretasi bahasa isyarat real-time berbasis kamera dengan Python, OpenCV, dan MediaPipe. Ia juga belajar BISINDO, bahasa isyarat Indonesia.",
      suggestions: ["Apa saja keahlian coding Bilal?", "Tunjukkan CV-nya", "Tunjukkan proyek web"],
    };
  }

  if (has(msg, "organisasi", "ukm", "softdev", "helpdesk")) {
    return {
      reply:
        "Bilal aktif sebagai pengembang di UKM Software Development (Softdev) PENS dan ikut membangun sistem HelpDesk UKM Softdev, dari arsitektur frontend sampai backend: API dan dashboard yang responsif.",
      suggestions: ["Tunjukkan CV-nya", "Apa saja keahlian coding Bilal?", "Tunjukkan galeri proyek"],
    };
  }

  if (has(msg, "keahlian", "skill", "bisa apa", "bahasa", "framework", "tech", "teknologi")) {
    return {
      reply:
        "Tech stack andalan Bilal meliputi ekosistem React/Next.js dengan TypeScript. Untuk animasi dan 3D, ia mendalami GSAP, Lenis (smooth scroll), dan Three.js/WebGL. Di sisi backend ia terbiasa dengan Node.js, Laravel, dan PHP.",
      suggestions: ["Tunjukkan sertifikat BNSP", "Bagaimana dengan Three.js?", "Tunjukkan proyek game"],
    };
  }

  if (has(msg, "sekolah", "kuliah", "pendidikan", "pens", "mahasiswa", "kampus", "d3 it")) {
    return {
      reply:
        "Bilal adalah mahasiswa D3 Teknik Informatika di PENS (Politeknik Elektronika Negeri Surabaya). Sebelumnya ia lulusan jurusan RPL SMKN 10 Surabaya. Oh ya, ia juga PJ Mata Kuliah Agama di kelasnya lho!",
      suggestions: ["Apa proyek kuliahnya?", "Bagaimana prestasi akademiknya?", "Tunjukkan sertifikat Kumon"],
    };
  }

  if (has(msg, "lks", "lsp", "bnsp", "sertifikasi", "juara")) {
    return {
      reply:
        "Sederet prestasinya: Juara Harapan 2 LKS Web Technologies Kota Surabaya (2024), sertifikasi BNSP Junior Programmer, skor TOEIC 610, lulus level akhir Kumon Matematika, serta sertifikat Timedoor Academy (Game, Web & Android Dev).",
      suggestions: ["Buka sertifikat LKS", "Buka sertifikat BNSP", "Tunjukkan galeri proyek"],
    };
  }

  if (has(msg, "freelance", "upwork", "fiverr", "kerja", "hire", "jasa")) {
    return {
      reply:
        'Bilal terbuka untuk pekerjaan freelance dan kolaborasi. Silakan gunakan form "Uplink" di bagian Contact untuk mendiskusikan proyekmu.',
      suggestions: ["Bagaimana cara menghubungi?", "Tunjukkan keahlian coding", "Tunjukkan galeri proyek"],
    };
  }

  if (has(msg, "laptop", "komputer", "gear", "spesifikasi", "rig")) {
    return {
      reply:
        "Untuk meracik kode dan merender 3D, Bilal mengandalkan laptop Lenovo LOQ 15IRX9 dengan Intel Core i7-13650HX dan GPU NVIDIA RTX 4050, dikontrol dengan G-Helper.",
      suggestions: ["Buka profil lengkap", "Tunjukkan proyek game", "Apa hobinya Bilal?"],
    };
  }

  if (has(msg, "hobi", "waktu luang", "suka apa", "game", "main", "gunung", "hiking")) {
    return {
      reply:
        "Di luar coding, Bilal suka mendaki gunung dan camping (seperti ke Puthuk Gragal & Ijen), merawat motor Astrea Prima hitam kesayangannya, serta bermain game seperti Minecraft, Wuthering Waves, Terraria, hingga Mobile Legends.",
      suggestions: ["Gunung mana saja yang pernah didaki?", "Astrea Prima tahun berapa?", "Tunjukkan proyek game"],
    };
  }

  if (has(msg, "parfum", "wangi", "fragrance", "braven")) {
    return {
      reply:
        "Fakta unik: Bilal lumayan menyukai wewangian! Beberapa koleksinya termasuk Mykonos California dan seri Braven (Tobacco, Dream Water, hingga Cool Wootah).",
      suggestions: ["Apa hobi Bilal selain parfum?", "Tunjukkan proyek web", "Bagaimana cara menghubungi?"],
    };
  }

  if (has(msg, "dimas", "adrian", "dzaki", "tazakka")) {
    return {
      reply:
        'Bilal sering berkolaborasi dan nongkrong bareng teman-teman seperjuangannya seperti Dimas, Adrian, serta saudaranya, Tazakka. Dan tentu ada sosok spesial berinisial "W" yang jadi support system utamanya!',
      suggestions: ["Apakah mereka kuliah di PENS juga?", "Buka proyek kolaboratif", "Tunjukkan prestasi Bilal"],
    };
  }

  if (has(msg, "whatsapp", "sosmed", "ig", "instagram")) {
    return {
      reply:
        "Ingin terkoneksi? Scroll ke bagian bawah (holographic footer) untuk menemukan tautan GitHub, Discord, dan Instagram Bilal, atau isi form UPLINK_FORM.exe untuk mengirim pesan langsung ke emailnya. [ACTION:SCROLL_AND_HIGHLIGHT:contact]",
      suggestions: ["Salin email Bilal", "Tunjukkan form hubungi", "Kembali ke atas"],
    };
  }

  if (has(msg, "siapa", "bilal", "biografi", "profil", "profile", "tentang")) {
    return {
      reply:
        "Bilal Sanayu Majid adalah Creative Developer & Full Stack Web Developer yang berbasis di Surabaya. Ia memadukan performa kode web yang kokoh dengan estetika visual 3D interaktif.",
      suggestions: ["Apa saja keahlian coding Bilal?", "Tunjukkan proyek buatanmu", "Bagaimana cara menghubungi?"],
    };
  }

  return {
    reply:
      "Saya mengerti! Sebagai asisten virtual Bilal, saya bisa bercerita soal keahliannya di Next.js & Three.js/GSAP, kuliahnya di PENS, prestasi LKS Web Technologies, hobi mendaki gunung, hingga proyek-proyek di galeri ini. Silakan tanyakan salah satunya!",
    suggestions: suggestionsFor(section, "id"),
  };
}

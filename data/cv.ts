/**
 * The CV, in two languages. The web page (/cv, /cv/id) and the PDFs (/cv.pdf, /cv-id.pdf) all read this file, so the
 * two languages and the two formats cannot drift apart. Name, role, e-mail and GitHub come from data/profile.ts.
 *
 * Nothing here is invented: every line is a fact the owner supplied. Where no start date was given (the campus
 * communities), the period says only that it is ongoing.
 */

export type CvLang = "en" | "id";

export const CV_LANGS: readonly CvLang[] = ["en", "id"];

export interface CvEntry {
  title: string;
  org: string;
  period: string;
  bullets: string[];
}

export interface CvEducation {
  school: string;
  program: string;
  period: string;
  /** Short facts under the programme (cohort, class). */
  notes: string[];
}

export interface CvProject {
  title: string;
  /** Public address, when the project has one. */
  link?: string;
  stack: string;
  desc: string;
}

export interface CvSkillGroup {
  label: string;
  items: string[];
}

export interface CvCredential {
  title: string;
  issuer: string;
  /** Only where the year is known. */
  year?: string;
}

export interface CvLanguageSkill {
  name: string;
  level: string;
}

export interface CvContent {
  /** BCP 47 tag for the `lang` attribute. */
  tag: string;
  /** Short, for the language switch. */
  label: string;
  /** The language's own name, in full. */
  name: string;
  pdfLabel: string;
  headings: {
    profile: string;
    education: string;
    experience: string;
    projects: string;
    skills: string;
    credentials: string;
    languages: string;
  };
  ui: {
    download: string;
    print: string;
    switchLabel: string;
    otherDownload: string;
    /** The download button's chooser: what this edition is for, and the words on its card. */
    audience: string;
    getPdf: string;
    stamp: string;
    pickTitle: string;
  };
  summary: string;
  /** Profiles that have no address to link to (marketplaces the owner sells and freelances on). */
  elsewhere: string;
  education: CvEducation[];
  experience: CvEntry[];
  projects: CvProject[];
  skills: CvSkillGroup[];
  credentials: CvCredential[];
  languages: CvLanguageSkill[];
}

/** When the CV's content was last brought up to date (year-month). Shown on the download tab and in the chooser. */
export const cvUpdated = "2026-10";

/** "Oct 2026", the same everywhere (fixed locale and zone, so the server and the browser print the same text). */
export function cvUpdatedLabel(): string {
  const [year, month] = cvUpdated.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/** Same in both languages. */
export const cvContact = {
  website: "lalsm.vercel.app",
  websiteUrl: "https://lalsm.vercel.app",
} as const;

const skillsEn: CvSkillGroup[] = [
  {
    label: "Frontend & creative web",
    items: ["React", "Next.js (App Router)", "TypeScript", "JavaScript", "Tailwind CSS", "Zustand"],
  },
  {
    label: "Animation & 3D",
    items: ["Three.js", "React Three Fiber", "WebGL / GLSL shaders", "GSAP", "Framer Motion", "Lenis", "Rive"],
  },
  {
    label: "Backend & database",
    items: ["Node.js", "Express", "Python", "PHP", "Laravel", "C", "C++", "PostgreSQL", "MySQL", "SQLite", "SQL query optimisation"],
  },
  {
    label: "Mobile & game",
    items: ["React Native (TypeScript)", "Kodular", "Roblox Studio (Lua, physics scripting)", "2D HTML5 Canvas game engine"],
  },
  {
    label: "AI & computer vision",
    items: ["OpenCV", "MediaPipe", "Local LLM orchestration with Ollama (Qwen, multi-agent routing)"],
  },
  {
    label: "Tools & networking",
    items: ["Git", "GitHub", "Docker", "Postman", "Vercel", "Netlify", "VS Code", "Google AI Studio", "Google Antigravity IDE", "Wireshark", "Cisco Packet Tracer"],
  },
];

const skillsId: CvSkillGroup[] = [
  {
    label: "Frontend & web kreatif",
    items: ["React", "Next.js (App Router)", "TypeScript", "JavaScript", "Tailwind CSS", "Zustand"],
  },
  {
    label: "Animasi & 3D",
    items: ["Three.js", "React Three Fiber", "WebGL / shader GLSL", "GSAP", "Framer Motion", "Lenis", "Rive"],
  },
  {
    label: "Backend & basis data",
    items: ["Node.js", "Express", "Python", "PHP", "Laravel", "C", "C++", "PostgreSQL", "MySQL", "SQLite", "Optimasi query SQL"],
  },
  {
    label: "Mobile & game",
    items: ["React Native (TypeScript)", "Kodular", "Roblox Studio (Lua, skrip fisika)", "Mesin game 2D HTML5 Canvas"],
  },
  {
    label: "AI & computer vision",
    items: ["OpenCV", "MediaPipe", "Orkestrasi LLM lokal dengan Ollama (Qwen, multi-agent routing)"],
  },
  {
    label: "Tools & jaringan",
    items: ["Git", "GitHub", "Docker", "Postman", "Vercel", "Netlify", "VS Code", "Google AI Studio", "Google Antigravity IDE", "Wireshark", "Cisco Packet Tracer"],
  },
];

/** Credentials are proper names, so they are the same in both languages; only the issuer line is translated. */
const credentials = (lang: CvLang): CvCredential[] => [
  { title: "BNSP Competency Certificate: Junior Programmer", issuer: "BNSP Indonesia", year: "2024" },
  {
    title: lang === "en" ? "2nd Runner-Up (Juara Harapan 2), Web Technologies" : "Juara Harapan 2, Web Technologies",
    issuer: lang === "en" ? "LKS Surabaya (city-level student competency competition)" : "LKS Surabaya (lomba kompetensi siswa tingkat kota)",
    year: "2024",
  },
  { title: "TOEIC Listening & Reading, score 610", issuer: "ETS" },
  {
    title: "Web Developer, Game Developer (JavaScript & Phaser 3), Android Apps Developer",
    issuer: "Timedoor Academy",
    year: "2023–2024",
  },
  { title: "Machine Learning 1 and Machine Learning 2", issuer: lang === "en" ? "Course certificates" : "Sertifikat kursus" },
  { title: "Bee Coding Competition", issuer: "Bee-Software Accounting", year: "2024" },
  { title: lang === "en" ? "HMTC Goes To School: Laravel workshop" : "HMTC Goes To School: workshop Laravel", issuer: "HMTC", year: "2024" },
];

export const cv: Record<CvLang, CvContent> = {
  en: {
    tag: "en",
    label: "English",
    name: "English",
    pdfLabel: "PDF · English",
    headings: {
      profile: "Profile",
      education: "Education",
      experience: "Experience & community",
      projects: "Selected projects",
      skills: "Technical skills",
      credentials: "Certifications & awards",
      languages: "Languages",
    },
    ui: {
      download: "Download PDF",
      print: "Print",
      switchLabel: "CV language",
      otherDownload: "Bahasa Indonesia PDF",
      audience: "For international applications",
      getPdf: "Download PDF",
      stamp: "Downloaded",
      pickTitle: "Pick your edition",
    },
    summary:
      "Informatics student and creative developer from Surabaya. I build interactive, performance-minded web experiences with Next.js, TypeScript, Three.js and GSAP, and ship full-stack products with Node.js, PHP and Laravel. I also work in computer vision (OpenCV, MediaPipe), game logic (Roblox Studio, HTML5 Canvas) and local LLM tooling, and I teach game development to school-age students.",
    elsewhere: "Envato Market author · Upwork freelancer",
    education: [
      {
        school: "Politeknik Elektronika Negeri Surabaya (PENS)",
        program: "D3 Informatics Engineering",
        period: "2025 – Present",
        notes: ["Class of 2025, D3 IT B"],
      },
      {
        school: "SMKN 10 Surabaya",
        program: "Software Engineering (RPL)",
        period: "2022 – 2025",
        notes: [],
      },
    ],
    experience: [
      {
        title: "Roblox Studio Tutor",
        org: "Teaching",
        period: "August 2026",
        bullets: ["Taught game development and computational logic with Roblox Studio to primary-school students."],
      },
      {
        title: "Software Developer",
        org: "UKM Software Development (Softdev), PENS",
        period: "Present",
        bullets: [
          "Active developer in the campus software development unit.",
          "Built internal projects, among them the UKM Softdev HelpDesk system (frontend and backend architecture).",
        ],
      },
      {
        title: "Committee member",
        org: "PKKMB x Technogear PENS 2026",
        period: "2026",
        bullets: ["Involved in the campus orientation programme."],
      },
    ],
    projects: [
      {
        title: "Interactive Creative Portfolio",
        link: "https://lalsm.vercel.app",
        stack: "Next.js · Three.js / R3F · GSAP · Lenis",
        desc: "Interactive portfolio with 3D scenes, GSAP and Lenis scroll transitions, and Next.js performance tuning.",
      },
      {
        title: "Sign Language Recognition System",
        stack: "Python · OpenCV · MediaPipe",
        desc: "Real-time, camera-based sign language interpretation (computer vision).",
      },
      {
        title: "HelpDesk UKM Softdev Application",
        stack: "Backend API · Responsive dashboard",
        desc: "Campus ticketing system: the backend API and a responsive dashboard.",
      },
      {
        title: "Interactive Canvas & Creative Web Experiments",
        stack: "HTML5 Canvas · CSS · Audio",
        desc: "Interactive web pieces built on canvas particle manipulation, CSS micro-animations and background audio sync.",
      },
      {
        title: "Tower Defense Simulator & Game Logic",
        stack: "2D Canvas · Roblox Studio",
        desc: "A booster system and calculation logic for a 2D canvas web game, plus constraint-based simulation mechanics in Roblox Studio.",
      },
    ],
    skills: skillsEn,
    credentials: credentials("en"),
    languages: [
      { name: "Indonesian", level: "Native" },
      { name: "English", level: "Intermediate" },
      { name: "BISINDO (Indonesian Sign Language)", level: "Intermediate" },
    ],
  },
  id: {
    tag: "id",
    label: "Indonesia",
    name: "Bahasa Indonesia",
    pdfLabel: "PDF · Indonesia",
    headings: {
      profile: "Profil",
      education: "Pendidikan",
      experience: "Pengalaman & komunitas",
      projects: "Proyek pilihan",
      skills: "Keahlian teknis",
      credentials: "Sertifikasi & penghargaan",
      languages: "Bahasa",
    },
    ui: {
      download: "Unduh PDF",
      print: "Cetak",
      switchLabel: "Bahasa CV",
      otherDownload: "PDF English",
      audience: "Untuk lamaran di Indonesia",
      getPdf: "Unduh PDF",
      stamp: "Terunduh",
      pickTitle: "Pilih edisi CV",
    },
    summary:
      "Mahasiswa Teknik Informatika dan creative developer dari Surabaya. Saya membangun pengalaman web interaktif yang mengutamakan performa dengan Next.js, TypeScript, Three.js, dan GSAP, serta merilis produk full-stack dengan Node.js, PHP, dan Laravel. Saya juga mengerjakan computer vision (OpenCV, MediaPipe), logika game (Roblox Studio, HTML5 Canvas), dan LLM lokal, serta mengajar pengembangan game untuk siswa usia sekolah.",
    elsewhere: "Penulis Envato Market · Freelancer Upwork",
    education: [
      {
        school: "Politeknik Elektronika Negeri Surabaya (PENS)",
        program: "D3 Teknik Informatika",
        period: "2025 – Sekarang",
        notes: ["Angkatan 2025, kelas D3 IT B"],
      },
      {
        school: "SMKN 10 Surabaya",
        program: "Rekayasa Perangkat Lunak (RPL)",
        period: "2022 – 2025",
        notes: [],
      },
    ],
    experience: [
      {
        title: "Tutor Roblox Studio",
        org: "Pengajaran",
        period: "Agustus 2026",
        bullets: ["Mengajar pengembangan game dan logika komputasi dengan Roblox Studio untuk siswa usia sekolah dasar."],
      },
      {
        title: "Software Developer",
        org: "UKM Software Development (Softdev), PENS",
        period: "Sekarang",
        bullets: [
          "Aktif sebagai pengembang perangkat lunak di unit kegiatan mahasiswa pengembangan perangkat lunak kampus.",
          "Membangun proyek internal, di antaranya sistem HelpDesk UKM Softdev (arsitektur frontend dan backend).",
        ],
      },
      {
        title: "Anggota kepanitiaan",
        org: "PKKMB x Technogear PENS 2026",
        period: "2026",
        bullets: ["Terlibat dalam agenda orientasi kampus."],
      },
    ],
    projects: [
      {
        title: "Interactive Creative Portfolio",
        link: "https://lalsm.vercel.app",
        stack: "Next.js · Three.js / R3F · GSAP · Lenis",
        desc: "Web portofolio interaktif dengan scene 3D, transisi animasi GSAP dan Lenis, serta optimasi performa Next.js.",
      },
      {
        title: "Sign Language Recognition System",
        stack: "Python · OpenCV · MediaPipe",
        desc: "Aplikasi interpretasi bahasa isyarat real-time berbasis kamera (computer vision).",
      },
      {
        title: "HelpDesk UKM Softdev Application",
        stack: "API backend · Dashboard responsif",
        desc: "Sistem tiket helpdesk kampus: API backend dan dashboard antarmuka yang responsif.",
      },
      {
        title: "Interactive Canvas & Creative Web Experiments",
        stack: "HTML5 Canvas · CSS · Audio",
        desc: "Web interaktif dengan manipulasi partikel HTML5 Canvas, mikro-animasi CSS, dan sinkronisasi audio latar.",
      },
      {
        title: "Tower Defense Simulator & Game Logic",
        stack: "2D Canvas · Roblox Studio",
        desc: "Sistem booster dan kalkulasi logika untuk game web 2D canvas, serta mekanisme simulasi constraint di Roblox Studio.",
      },
    ],
    skills: skillsId,
    credentials: credentials("id"),
    languages: [
      { name: "Bahasa Indonesia", level: "Bahasa ibu" },
      { name: "Bahasa Inggris", level: "Menengah" },
      { name: "BISINDO (Bahasa Isyarat Indonesia)", level: "Menengah" },
    ],
  },
};

export function getCv(lang: CvLang): CvContent {
  return cv[lang];
}

/** One line of what a CV holds, counted from the data itself (the download chooser shows it on each edition). */
export function cvFacts(lang: CvLang): string {
  const c = cv[lang];
  return lang === "en"
    ? `${c.projects.length} projects · ${c.credentials.length} certifications · A4`
    : `${c.projects.length} proyek · ${c.credentials.length} sertifikasi · A4`;
}

export const cvPath = (lang: CvLang) => (lang === "en" ? "/cv" : "/cv/id");
export const cvPdfPath = (lang: CvLang) => (lang === "en" ? "/cv.pdf" : "/cv-id.pdf");
export const cvPdfName = (lang: CvLang) => `Bilal-Sanayu-Majid-CV-${lang.toUpperCase()}.pdf`;

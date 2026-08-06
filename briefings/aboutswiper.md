# About Section — Sticky Scroll-Stacking Card Redesign
## Implementation Briefing v2.0 — "IDE Code Window" Concept

> Mekanisme scroll: **CSS Sticky Scroll-Stacking** (sama seperti sebelumnya).
> Yang berubah total: **visual card** — tidak pakai glassmorphism.
> Gantinya: setiap card tampak seperti file code editor yang sedang dibuka.

---

## 1. Konsep Visual: "Live Code File"

### Ide Inti
Setiap card disiplin (Frontend / Backend / Mobile+Game) ditampilkan sebagai
**jendela code editor** — lengkap dengan:
- **Tab bar** di atas (nama file + icon)
- **Line numbers** di kiri
- **Pseudo-code** yang syntax-highlighted, berisi deskripsi skill dalam
  bentuk komentar dan variabel (bukan lorem ipsum, bukan bullet list)
- **Status bar** di bawah (language, branch, warnings = 0)
- Warna latar per-card sedikit berbeda (dark editor theme masing-masing)

### Mengapa Ini Out-of-the-Box & Relevan
1. Developer membaca code setiap hari — card ini langsung "berbicara" kepada
   pengunjung yang juga developer
2. Belum ada portofolio di Awwwards yang menggunakan IDE window sebagai card
3. Konten (tech stack, deskripsi) sudah embedded di dalam "kode" — tidak perlu
   label terpisah
4. Setiap disiplin punya "file extension" berbeda: `.tsx` / `.php` / `.dart`
   yang langsung menyiratkan domain teknologinya
5. Subtle micro-animasi (cursor berkedip, line highlight, typing effect singkat)
   menambah kesan "live" tanpa berlebihan

---

## 2. Konten Kode per Card

### Card 1 — frontend.tsx (cyan theme, VSCode-style)
```
Tab label: frontend.tsx
Language:  TypeScript React

Line content (pseudo-code):
──────────────────────────────────────────────
 1  // DISCIPLINE_01 — Frontend Engineering
 2  import { passion, precision } from '@bilal/core';
 3
 4  const skills = {
 5    frameworks : ['React.js', 'Next.js 14', 'TypeScript'],
 6    styling    : ['Tailwind CSS', 'Vanilla CSS', 'GSAP'],
 7    immersive  : ['Three.js', 'WebGL', 'Canvas API'],   // ← highlight line
 8  };
 9
10  export default function buildExperience() {
11    return 'pixel-perfect, immersive web experiences';
12  }
──────────────────────────────────────────────

Status bar: TypeScript · UTF-8 · main · ⚠ 0 · ✓ Bilal
```

### Card 2 — backend.php (purple theme, VSCode-style)
```
Tab label: backend.php
Language:  PHP

Line content:
──────────────────────────────────────────────
 1  <?php
 2  // DISCIPLINE_02 — Backend & DevOps
 3
 4  $stack = [
 5    'runtime'  => ['Node.js', 'PHP 8+', 'Laravel'],
 6    'database' => ['MySQL', 'PostgreSQL', 'Firebase'],
 7    'infra'    => ['Docker', 'Git', 'Cloud Deploy'],  // ← highlight line
 8  ];
 9
10  function buildServer(array $stack): string {
11    return 'robust APIs & scalable infrastructure';
12  }
──────────────────────────────────────────────

Status bar: PHP · UTF-8 · main · ⚠ 0 · ✓ Bilal
```

### Card 3 — mobile.dart (green theme, VSCode-style)
```
Tab label: mobile.dart
Language:  Dart

Line content:
──────────────────────────────────────────────
 1  // DISCIPLINE_03 — Mobile & Game Dev
 2  import 'package:bilal/creative_engine.dart';
 3
 4  final Map<String, List<String>> disciplines = {
 5    'mobile' : ['React Native', 'Android Studio', 'Flutter'],
 6    'game'   : ['Phaser.js', 'Canvas API', 'JavaScript'],   // ← highlight line
 7    'design' : ['Figma', 'Motion', 'Prototyping'],
 8  };
 9
10  Future<String> craft() async {
11    return 'cross-platform apps & interactive games';
12  }
──────────────────────────────────────────────

Status bar: Dart · UTF-8 · main · ⚠ 0 · ✓ Bilal
```

---

## 3. Anatomi Visual Card

```
┌─────────────────────────────────────────────────────────────┐
│ ● ● ●  [frontend.tsx ×]  [backend.php]  [mobile.dart]       │  ← Tab bar
├────┬────────────────────────────────────────────────────────┤
│    │  1  // DISCIPLINE_01 — Frontend Engineering             │
│    │  2  import { passion, precision } from '@bilal/core';   │
│    │  3                                                       │
│ LN │  4  const skills = {                                    │  ← Line nums
│    │  5    frameworks : ['React.js', 'Next.js 14', ...],     │
│    │  6    styling    : ['Tailwind CSS', 'GSAP', ...],       │
│    │  7    immersive  : ['Three.js', 'WebGL', 'Canvas'],     │  ← Highlighted
│    │  8  };                                                   │
│    │  9                                                       │
│    │ 10  export default function buildExperience() {         │
│    │ 11    return 'pixel-perfect, immersive web experiences'; │
│    │ 12  }                                                    │
├────┴────────────────────────────────────────────────────────┤
│ TypeScript · UTF-8 · ⎇ main · ⚠ 0 · ✓ Bilal               │  ← Status bar
└─────────────────────────────────────────────────────────────┘
```

---

## 4. CSS Lengkap (Vanilla CSS)

```css
/* ═══════════════════════════════════════════════════════════════
   ABOUT SECTION — IDE Code Window Sticky Scroll Cards
   ═══════════════════════════════════════════════════════════════ */

/* Outer section */
.about-swiper-section {
  display: flex;
  align-items: flex-start;
  min-height: 300vh;
  padding: 0 8%;
  position: relative;
  gap: 80px;
}

/* ── Left sticky label ─────────────────────────────────────────── */
.about-swiper-sticky-label {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 0 0 300px;
  padding-right: 40px;
  z-index: 2;
}

.about-swiper-eyebrow {
  font-family: var(--font-code);
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  color: var(--accent-cyan);
  text-transform: uppercase;
  margin-bottom: 20px;
  opacity: 0.65;
}

.about-swiper-heading {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 4.5vw, 4rem);
  font-weight: 900;
  line-height: 1.08;
  color: #fff;
  margin-bottom: 18px;
}

.about-swiper-heading em {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.55);
  font-style: normal;
}

.about-swiper-subtext {
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin-bottom: 36px;
}

/* Animated sweep line as scroll cue */
.about-swiper-scroll-cue {
  display: flex;
  align-items: center;
  gap: 12px;
}
.about-swiper-cue-line {
  display: block;
  width: 32px;
  height: 1px;
  background: rgba(0, 243, 255, 0.2);
  position: relative;
  overflow: hidden;
}
.about-swiper-cue-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent-cyan);
  transform: translateX(-100%);
  animation: cueLineSweep 2.2s ease-in-out infinite;
}
@keyframes cueLineSweep {
  0%   { transform: translateX(-100%); opacity: 1; }
  60%  { transform: translateX(0%);    opacity: 1; }
  100% { transform: translateX(100%);  opacity: 0; }
}
.about-swiper-cue-text {
  font-family: var(--font-code);
  font-size: 0.64rem;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.22);
}

/* ── Cards area (kanan) ────────────────────────────────────────── */
.about-swiper-cards-area {
  flex: 1;
  display: grid;
}

.about-swiper-item {
  position: sticky;
  top: 0;
  height: 100vh;
  display: grid;
  place-content: center;
  margin: 0;
}

/* ── IDE Card shell ────────────────────────────────────────────── */
.ide-card {
  width: clamp(440px, 44vw, 600px);
  border-radius: 10px;
  /* No glassmorphism — solid dark editor background */
  background: #0d0d12;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 24px 72px rgba(0, 0, 0, 0.7),
    0 8px 24px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  /* Subtle tilt per card — CSS variable override */
  transform: rotate(var(--card-tilt, -1.5deg));
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.35s ease;
}

.ide-card:hover {
  transform: rotate(0deg) translateY(-6px) !important;
}

/* Per-card tilt */
.ide-card--cyan   { --card-tilt: -2deg;   }
.ide-card--purple { --card-tilt: 1.5deg;  }
.ide-card--green  { --card-tilt: -1deg;   }

/* Glow on hover — coloured by card accent */
.ide-card--cyan:hover   { box-shadow: 0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,243,255,0.15), 0 0 48px rgba(0,243,255,0.07); }
.ide-card--purple:hover { box-shadow: 0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(188,19,254,0.18), 0 0 48px rgba(188,19,254,0.07); }
.ide-card--green:hover  { box-shadow: 0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(57,255,110,0.15), 0 0 48px rgba(57,255,110,0.06); }

/* Stack depth — cards behind are slightly darker */
.about-swiper-item:nth-child(2) .ide-card { filter: brightness(0.88); }
.about-swiper-item:nth-child(3) .ide-card { filter: brightness(0.76); }
.about-swiper-item:hover .ide-card { filter: brightness(1) !important; }

/* ── Tab bar ───────────────────────────────────────────────────── */
.ide-tabbar {
  display: flex;
  align-items: center;
  background: #090910;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0;
  gap: 0;
  position: relative;
}

/* Traffic lights */
.ide-traffic-lights {
  display: flex;
  gap: 6px;
  padding: 12px 14px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.05);
}
.ide-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.ide-dot--close  { background: #ff5f57; }
.ide-dot--min    { background: #febc2e; }
.ide-dot--max    { background: #28c840; }

/* Tabs */
.ide-tab {
  padding: 9px 18px;
  font-family: var(--font-code);
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  color: rgba(255,255,255,0.28);
  border-right: 1px solid rgba(255,255,255,0.05);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: default;
}
.ide-tab.is-active {
  color: rgba(255, 255, 255, 0.88);
  background: #0d0d12;
  border-top: 1.5px solid;       /* coloured top border = active tab indicator */
  padding-top: calc(9px - 1.5px);
}
.ide-tab--cyan.is-active   { border-top-color: #00f3ff; }
.ide-tab--purple.is-active { border-top-color: #bc13fe; }
.ide-tab--green.is-active  { border-top-color: #39ff6e; }

/* Tab icon (tiny circle matching accent) */
.ide-tab-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0.6;
}
.ide-tab--cyan   .ide-tab-dot { background: #00f3ff; }
.ide-tab--purple .ide-tab-dot { background: #bc13fe; }
.ide-tab--green  .ide-tab-dot { background: #39ff6e; }

/* ── Code body ─────────────────────────────────────────────────── */
.ide-body {
  display: flex;
  font-family: var(--font-code);
  font-size: 0.78rem;
  line-height: 1.72;
  padding: 16px 0 16px;
  overflow: hidden;
}

/* Line numbers column */
.ide-line-nums {
  flex-shrink: 0;
  width: 42px;
  text-align: right;
  padding: 0 12px 0 8px;
  color: rgba(255, 255, 255, 0.16);
  user-select: none;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}
.ide-line-num {
  display: block;
  height: calc(0.78rem * 1.72);  /* same as line-height */
}

/* Code area */
.ide-code {
  flex: 1;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
}
.ide-code::-webkit-scrollbar { display: none; }

.ide-line {
  display: block;
  height: calc(0.78rem * 1.72);
  white-space: pre;
}

/* Highlighted line (the "immersive" / "infra" / "game" line) */
.ide-line.is-highlighted {
  background: rgba(255, 255, 255, 0.04);
  border-left: 2px solid;
  padding-left: 4px;
  margin-left: -6px;
}
.ide-card--cyan   .ide-line.is-highlighted { border-left-color: #00f3ff; }
.ide-card--purple .ide-line.is-highlighted { border-left-color: #bc13fe; }
.ide-card--green  .ide-line.is-highlighted { border-left-color: #39ff6e; }

/* Syntax token colours — dark theme (similar to Tokyo Night) */
.tok-comment  { color: #636e8a; }
.tok-keyword  { color: #bb9af7; }  /* import, const, function, export default, return */
.tok-fn       { color: #7aa2f7; }  /* function names */
.tok-var      { color: #e0af68; }  /* variable names */
.tok-prop     { color: #73daca; }  /* object keys */
.tok-string   { color: #9ece6a; }  /* string values */
.tok-punct    { color: rgba(255,255,255,0.45); }
.tok-accent-cyan   { color: #00f3ff; font-weight: 600; }
.tok-accent-purple { color: #bc13fe; font-weight: 600; }
.tok-accent-green  { color: #39ff6e; font-weight: 600; }

/* Blinking cursor on the active card */
.ide-cursor {
  display: inline-block;
  width: 8px;
  height: 0.9em;
  background: rgba(255, 255, 255, 0.65);
  vertical-align: middle;
  margin-left: 2px;
  animation: ideCursorBlink 1.1s step-start infinite;
}
@keyframes ideCursorBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* ── Status bar ─────────────────────────────────────────────────── */
.ide-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 14px 5px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-family: var(--font-code);
  font-size: 0.62rem;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.25);
  gap: 12px;
  background: #090910;
}
.ide-statusbar-left,
.ide-statusbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ide-status-lang {
  padding: 1px 8px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
}
.ide-card--cyan   .ide-status-lang { background: rgba(0,243,255,0.1);  color: #00f3ff; }
.ide-card--purple .ide-status-lang { background: rgba(188,19,254,0.1); color: #bc13fe; }
.ide-card--green  .ide-status-lang { background: rgba(57,255,110,0.1); color: #39ff6e; }

.ide-status-branch::before { content: '⎇ '; }
.ide-status-ok { color: #28c840; }

/* ── Mobile fallback ─────────────────────────────────────────────── */
@media (max-width: 968px) {
  .about-swiper-section {
    flex-direction: column;
    gap: 40px;
    min-height: auto;
    padding: 60px 5%;
  }
  .about-swiper-sticky-label {
    position: relative;
    height: auto;
    flex: none;
    padding-right: 0;
  }
  .about-swiper-item {
    position: relative;
    height: auto;
    margin-bottom: 24px;
  }
  .ide-card {
    width: 100%;
    transform: none !important;
  }
  .about-swiper-scroll-cue { display: none; }
}
```

---

## 5. Component TSX Baru: AboutSection.tsx

```tsx
"use client";
import React from "react";

interface CodeLine {
  num: number;
  content: React.ReactNode;
  highlighted?: boolean;
}

interface IdeCard {
  tabName: string;
  accent: "cyan" | "purple" | "green";
  language: string;
  branch: string;
  otherTabs: { name: string; accent: "cyan" | "purple" | "green" }[];
  lines: CodeLine[];
}

// ─── Card data ───────────────────────────────────────────────────
const CARDS: IdeCard[] = [
  // ── Card 1: frontend.tsx ───────────────────────────────────────
  {
    tabName: "frontend.tsx",
    accent: "cyan",
    language: "TypeScript",
    branch: "main",
    otherTabs: [
      { name: "backend.php",  accent: "purple" },
      { name: "mobile.dart",  accent: "green"  },
    ],
    lines: [
      { num:  1, content: <><span className="tok-comment">{"// DISCIPLINE_01 — Frontend Engineering"}</span></> },
      { num:  2, content: <><span className="tok-keyword">import</span>{" {"}<span className="tok-var">passion</span>{", "}<span className="tok-var">precision</span>{"} "}<span className="tok-keyword">from</span>{" "}<span className="tok-string">"@bilal/core"</span>{";"}</> },
      { num:  3, content: <>{" "}</> },
      { num:  4, content: <><span className="tok-keyword">const</span>{" "}<span className="tok-var">skills</span>{" = {"}</> },
      { num:  5, content: <>{`  `}<span className="tok-prop">frameworks</span>{"  : ["}<span className="tok-string">"React.js"</span>{", "}<span className="tok-string">"Next.js 14"</span>{", "}<span className="tok-string">"TypeScript"</span>{"],"}</> },
      { num:  6, content: <>{`  `}<span className="tok-prop">styling</span>{"     : ["}<span className="tok-string">"Tailwind CSS"</span>{", "}<span className="tok-string">"Vanilla CSS"</span>{", "}<span className="tok-string">"GSAP"</span>{"],"}</> },
      { num:  7, content: <>{`  `}<span className="tok-prop">immersive</span>{"  : ["}<span className="tok-accent-cyan">"Three.js"</span>{", "}<span className="tok-accent-cyan">"WebGL"</span>{", "}<span className="tok-accent-cyan">"Canvas"</span>{"],   "}<span className="tok-comment">{"// ← featured"}</span></>, highlighted: true },
      { num:  8, content: <>{"};"}</> },
      { num:  9, content: <>{" "}</> },
      { num: 10, content: <><span className="tok-keyword">export default function</span>{" "}<span className="tok-fn">buildExperience</span>{"() {"}</> },
      { num: 11, content: <>{`  `}<span className="tok-keyword">return</span>{" "}<span className="tok-string">"pixel-perfect, immersive web experiences"</span>{";"}<span className="ide-cursor" /></> },
      { num: 12, content: <>{" }"}</> },
    ],
  },

  // ── Card 2: backend.php ───────────────────────────────────────
  {
    tabName: "backend.php",
    accent: "purple",
    language: "PHP",
    branch: "main",
    otherTabs: [
      { name: "frontend.tsx", accent: "cyan"  },
      { name: "mobile.dart",  accent: "green" },
    ],
    lines: [
      { num:  1, content: <><span className="tok-punct">{"<?php"}</span></> },
      { num:  2, content: <><span className="tok-comment">{"// DISCIPLINE_02 — Backend & DevOps"}</span></> },
      { num:  3, content: <>{" "}</> },
      { num:  4, content: <><span className="tok-keyword">{"$stack"}</span>{" = ["}</> },
      { num:  5, content: <>{`  `}<span className="tok-string">"runtime"</span>{"  => ["}<span className="tok-string">"Node.js"</span>{", "}<span className="tok-string">"PHP 8+"</span>{", "}<span className="tok-string">"Laravel"</span>{"],"}</> },
      { num:  6, content: <>{`  `}<span className="tok-string">"database"</span>{" => ["}<span className="tok-string">"MySQL"</span>{", "}<span className="tok-string">"PostgreSQL"</span>{", "}<span className="tok-string">"Firebase"</span>{"],"}</> },
      { num:  7, content: <>{`  `}<span className="tok-string">"infra"</span>{"    => ["}<span className="tok-accent-purple">"Docker"</span>{", "}<span className="tok-accent-purple">"Git"</span>{", "}<span className="tok-accent-purple">"Cloud"</span>{"],     "}<span className="tok-comment">{"// ← featured"}</span></>, highlighted: true },
      { num:  8, content: <>{"];"}</> },
      { num:  9, content: <>{" "}</> },
      { num: 10, content: <><span className="tok-keyword">function</span>{" "}<span className="tok-fn">buildServer</span>{"("}<span className="tok-keyword">array</span>{" "}<span className="tok-var">{"$stack"}</span>{"): "}<span className="tok-keyword">string</span>{" {"}</> },
      { num: 11, content: <>{`  `}<span className="tok-keyword">return</span>{" "}<span className="tok-string">"robust APIs & scalable infrastructure"</span>{";"}<span className="ide-cursor" /></> },
      { num: 12, content: <>{" }"}</> },
    ],
  },

  // ── Card 3: mobile.dart ───────────────────────────────────────
  {
    tabName: "mobile.dart",
    accent: "green",
    language: "Dart",
    branch: "main",
    otherTabs: [
      { name: "frontend.tsx", accent: "cyan"   },
      { name: "backend.php",  accent: "purple" },
    ],
    lines: [
      { num:  1, content: <><span className="tok-comment">{"// DISCIPLINE_03 — Mobile & Game Dev"}</span></> },
      { num:  2, content: <><span className="tok-keyword">import</span>{" "}<span className="tok-string">"package:bilal/creative_engine.dart"</span>{";"}</> },
      { num:  3, content: <>{" "}</> },
      { num:  4, content: <><span className="tok-keyword">final</span>{" Map<"}<span className="tok-keyword">String</span>{", List<"}<span className="tok-keyword">String</span>{">> "}<span className="tok-var">disciplines</span>{" = {"}</> },
      { num:  5, content: <>{`  `}<span className="tok-string">"mobile"</span>{" : ["}<span className="tok-string">"React Native"</span>{", "}<span className="tok-string">"Android Studio"</span>{", "}<span className="tok-string">"Flutter"</span>{"],"}</> },
      { num:  6, content: <>{`  `}<span className="tok-string">"game"</span>{"   : ["}<span className="tok-accent-green">"Phaser.js"</span>{", "}<span className="tok-accent-green">"Canvas API"</span>{", "}<span className="tok-accent-green">"JS"</span>{"],   "}<span className="tok-comment">{"// ← featured"}</span></>, highlighted: true },
      { num:  7, content: <>{`  `}<span className="tok-string">"design"</span>{" : ["}<span className="tok-string">"Figma"</span>{", "}<span className="tok-string">"Motion"</span>{", "}<span className="tok-string">"Prototyping"</span>{"],"}</> },
      { num:  8, content: <>{"};"}</> },
      { num:  9, content: <>{" "}</> },
      { num: 10, content: <><span className="tok-keyword">Future</span>{"<"}<span className="tok-keyword">String</span>{">"}{" "}<span className="tok-fn">craft</span>{"() "}<span className="tok-keyword">async</span>{" {"}</> },
      { num: 11, content: <>{`  `}<span className="tok-keyword">return</span>{" "}<span className="tok-string">"cross-platform apps & interactive games"</span>{";"}<span className="ide-cursor" /></> },
      { num: 12, content: <>{" }"}</> },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────
export default function AboutSection() {
  return (
    <section className="about-swiper-section" id="about" aria-label="About Section">
      <div className="parallax-text" style={{ top: "50px", left: "-50px" }} data-speed="-0.1">ABOUT</div>

      {/* ── Sticky heading ────────────────────────────────────────── */}
      <div className="about-swiper-sticky-label">
        <p className="about-swiper-eyebrow">// ABOUT ME</p>
        <h2 className="about-swiper-heading">
          What I<br />
          <em>Build.</em>
        </h2>
        <p className="about-swiper-subtext">
          Three disciplines.<br />One unified vision.
        </p>
        <div className="about-swiper-scroll-cue" aria-hidden="true">
          <span className="about-swiper-cue-line" />
          <span className="about-swiper-cue-text">scroll</span>
        </div>
      </div>

      {/* ── Scroll card stack ─────────────────────────────────────── */}
      <div className="about-swiper-cards-area">
        {CARDS.map((card) => (
          <figure key={card.tabName} className="about-swiper-item">
            <article
              className={`ide-card ide-card--${card.accent}`}
              aria-label={`${card.language} — ${card.tabName}`}
            >

              {/* Tab bar */}
              <div className="ide-tabbar">
                <div className="ide-traffic-lights" aria-hidden="true">
                  <span className="ide-dot ide-dot--close" />
                  <span className="ide-dot ide-dot--min" />
                  <span className="ide-dot ide-dot--max" />
                </div>

                {/* Active tab */}
                <div className={`ide-tab ide-tab--${card.accent} is-active`}>
                  <span className="ide-tab-dot" />
                  {card.tabName}
                </div>

                {/* Inactive sibling tabs */}
                {card.otherTabs.map((t) => (
                  <div key={t.name} className={`ide-tab ide-tab--${t.accent}`}>
                    <span className="ide-tab-dot" />
                    {t.name}
                  </div>
                ))}
              </div>

              {/* Code body */}
              <div className="ide-body">
                {/* Line numbers */}
                <div className="ide-line-nums" aria-hidden="true">
                  {card.lines.map((l) => (
                    <span key={l.num} className="ide-line-num">{l.num}</span>
                  ))}
                </div>

                {/* Code */}
                <div className="ide-code">
                  {card.lines.map((l) => (
                    <span
                      key={l.num}
                      className={`ide-line${l.highlighted ? " is-highlighted" : ""}`}
                    >
                      {l.content}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status bar */}
              <div className="ide-statusbar" aria-hidden="true">
                <div className="ide-statusbar-left">
                  <span className={`ide-status-lang`}>{card.language}</span>
                  <span>UTF-8</span>
                  <span className="ide-status-branch">{card.branch}</span>
                </div>
                <div className="ide-statusbar-right">
                  <span>⚠ 0</span>
                  <span className="ide-status-ok">✓ Bilal</span>
                </div>
              </div>

            </article>
          </figure>
        ))}
      </div>

    </section>
  );
}
```

---

## 6. Perbandingan vs Glassmorphism

| Aspek | Glassmorphism (dihapus) | IDE Code Window |
|-------|------------------------|-----------------|
| Background | blur + rgba transparent | Solid `#0d0d12` — opaque, bersih |
| Border | rgba(255,255,255,0.07) | 1px solid rgba(255,255,255,0.08) + colored top tab |
| Identitas | Generic tech portfolio | Developer-specific — kode = konten |
| Glow | Box-shadow diffuse | Hanya saat hover, subtle per accent |
| Typhography | Judul besar + deskripsi | Mono font + syntax tokens |
| Keunikan | Sangat umum | Hampir tidak ada yang melakukannya |
| Relevansi | Berkesan "desainer" | Berkesan "developer yang paham estetika" |

---

## 7. Checklist Implementasi

```
[ ] Ganti isi AboutSection.tsx dengan komponen baru (Section 5)
[ ] Tambahkan CSS baru ke portfolio.css (Section 4) — cari "ABOUT SECTION" lama
[ ] Hapus CSS lama: .about-card-stack, .about-layer-card, .stack-dot,
    .stack-drag-hint, .stack-pagination, .card--cyan/.card--purple/.card--green
    (yang versi lama — class baru punya prefix .ide-card)
[ ] Hapus <CardStackInteractions /> dari ClientShell.tsx
[ ] Pastikan --font-code diset di CSS variables (sudah ada)
[ ] Verifikasi: tab bar tampil, line numbers aligned, highlighted line visible
[ ] Test mobile: flex-direction column, no tilt, full width
```




source code scroll-card.tsx = {
  // component.tsx
'use client';
import { ReactLenis } from 'lenis/react';
import React, { useRef, forwardRef } from 'react';

interface ArticleCardData {
  title: string;
  description: string;
  link: string;
  color: string;
  rotation: string;
}

const articleCardsData: ArticleCardData[] = [
  {
    title: 'Image MouseTrail',
    description:
      "An Mouse who is running with couple of images and the best part is you can hide all the images when you don't move your mouse. I hope you'll love it",
    link: 'https://ui-layout.com/components/image-mousetrail',
    color: '#E0E0E0', // Light Gray
    rotation: 'rotate-6',
  },
  {
    title: 'Progressive Carousel',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius consequatur explicabo assumenda odit necessitatibus possimus ducimus aliquam. Ullam dignissimos animi officiis, in sequi et inventore harum ipsam sed.',
    link: 'https://ui-layout.com/components/progressive-carousel',
    color: '#C0C0C0', // Medium Gray
    rotation: 'rotate-0',
  },
  {
    title: 'Responsive Drawer',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius consequatur explicabo assumenda odit necessitatibus possimus ducimus aliquam. Ullam dignissimos animi officiis, in sequi et inventore harum ipsam sed.',
    link: 'https://ui-layout.com/components/drawer',
    color: '#A0A0A0', // Darker Gray
    rotation: '-rotate-6',
  },
  {
    title: 'Animated Globe',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius consequatur explicabo assumenda odit necessitatibus possimus ducimus aliquam. Ullam dignissimos animi officiis, in sequi et inventore harum ipsam sed.',
    link: 'https://ui-layout.com/components/globe',
    color: '#808080', // Even Darker Gray
    rotation: 'rotate-0',
  },
];

const Component = forwardRef<HTMLElement>((props, ref) => {
  return (
    <ReactLenis root>
      <main className='bg-black' ref={ref}>
        <div className='wrapper'>
          <section className='text-white h-screen w-full bg-slate-950 grid place-content-center sticky top-0'>
            <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>

            <h1 className='2xl:text-7xl text-5xl px-8 font-semibold text-center tracking-tight leading-[120%]'>
              CSS Sticky Properties for <br /> Stacking Cards. Scroll down! 👇
            </h1>
          </section>
        </div>

        <section className='text-white w-full bg-slate-950'>
          <div className='flex justify-between px-16'>
            <div className='grid gap-2'>
              {articleCardsData.map((card, i) => (
                <figure key={i} className='sticky top-0 h-screen grid place-content-center'>
                  <article
                    className={`${card.color} h-72 w-[30rem] rounded-lg ${card.rotation} p-4 grid place-content-center gap-4`}
                    style={{ backgroundColor: card.color }}
                  >
                    <h1 className='text-2xl font-semibold'>{card.title}</h1>
                    <p>{card.description}</p>
                    <a
                      href={card.link}
                      target='_blank'
                      className='w-fit bg-black p-3 rounded-md cursor-pointer text-white'
                    >
                      Click to View
                    </a>
                  </article>
                </figure>
              ))}
            </div>
            <div className='sticky top-0 h-screen grid place-content-center'>
              <h1 className='text-4xl px-8 font-medium text-center tracking-tight leading-[120%]'>
                What We <br /> Have Now😎
              </h1>
            </div>
          </div>
        </section>

        <footer className='group bg-slate-950 '>
          <h1 className='text-[16vw] translate-y-20 leading-[100%] uppercase font-semibold text-center bg-gradient-to-r from-gray-400 to-gray-800 bg-clip-text text-transparent transition-all ease-linear'>
            ui-layout
          </h1>
          <div className='bg-black h-40 relative z-10 grid place-content-center text-2xl rounded-tr-full rounded-tl-full text-white'></div>
        </footer>
      </main>
    </ReactLenis>
  );
});

Component.displayName = 'Component';

export default Component;
}


source code demo.tsx = {
  // demo.tsx
import React from 'react';
import Component from '@/components/ui/scroll-card';

function ComponentDemo() {
  return (
    <Component />
  );
}

export { ComponentDemo as DemoOne };
}
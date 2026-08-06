# About Section — "The Spatial Hologram Blueprint"
## Implementation Briefing v1.0 — Anti-Slop 3D Hover Card System

> **Filosofi:** *Luxury is restraint with maximum impact.*
> Tidak ada glassmorphism. Tidak ada efek berlebihan. Yang ada adalah ilusi ruang 3D yang bersih,
> cahaya yang bereaksi terhadap kursor, dan animasi yang terasa seperti fisika nyata.
> Website ini milik seorang *Creative Developer* — interaksi 3D ini **membuktikan** skill-nya.

---

## 1. Ringkasan Konsep

### "The Architect's Desk"
Tiga kartu disiplin (Frontend / Backend / Mobile & Game) tidak bertumpuk.
Mereka berbaring dalam ruang 3D seperti **blueprint hologram yang sedang tertidur di meja arsitek digital**.

- **Idle state:** Semua kartu dimiringkan menjauh (`rotateX(55deg)`) sehingga tampak seperti panel yang rebah, dilihat dari sudut 45 derajat.
- **Hover state:** Kartu yang di-hover **bangkit** ke posisi tegak (`rotateX(0deg) rotateZ(var(--card-tilt))`).
- **DOF Effect:** Kartu yang tidak di-hover akan mundur dan *blur* — ilusi kamera.
- **Cursor Light:** Sebuah *spotlight* kecil mengikuti kursor di atas permukaan kartu.
- **Mobile:** Semua kartu flat/tegak, tidak ada 3D — IntersectionObserver adds `is-active` ke semua.

---

## 2. Codebase Compatibility Audit

### File yang DIGANTI total:

| File | Aksi |
|------|------|
| `components/ui/AboutSection.tsx` | REPLACE — JSX baru |
| `components/ui/CardStackInteractions.tsx` | REPLACE — logic hover 3D |
| `app/portfolio.css` (line 817-1390) | REPLACE — semua CSS About |

### File yang TIDAK DISENTUH:

| File | Alasan |
|------|--------|
| `components/ui/ClientShell.tsx` | `<CardStackInteractions />` tetap mount, export name tidak berubah |
| `components/ui/GSAPEffects.tsx` | Tidak ada konflik |
| `lib/horizonScrollState.ts` | Tidak ada hubungan |
| `app/layout.tsx` | Tidak ada perubahan |
| `app/globals.css` | Tidak ada perubahan |

### CSS Variables yang sudah ada (tinggal pakai):
- `--bg-color: #050505`
- `--text-main: #e0e0e0`
- `--text-muted: #8892b0`
- `--accent-cyan: #00f3ff`
- `--accent-purple: #bc13fe`
- `--font-display: Orbitron, sans-serif`
- `--font-body: Rajdhani, sans-serif`
- `--font-code: Roboto Mono, monospace`

> GSAP sudah di-import dan registered di `GSAPEffects.tsx`.
> Cukup import `gsap` dari 'gsap' di CardStackInteractions — tidak perlu register ulang.

---

## 3. Data Konten Kartu

```ts
const CARDS = [
  {
    number: "01",
    accent: "cyan",
    icon: "code-slash-outline",
    eyebrow: "// DISCIPLINE_01",
    title: ["Frontend", "Engineering"],
    desc: "Architecting pixel-perfect, immersive web experiences with modern frameworks and WebGL interactions.",
    tech: [
      { icon: "logo-javascript",    label: "JavaScript"   },
      { icon: "logo-react",         label: "React.js"     },
      { icon: "triangle-outline",   label: "Next.js 14"   },
      { icon: "code-slash-outline", label: "TypeScript"   },
      { icon: "color-wand-outline", label: "Tailwind CSS" },
      { icon: "flash-outline",      label: "GSAP",        highlight: true },
      { icon: "cube-outline",       label: "Three.js",    highlight: true },
      { icon: "layers-outline",     label: "WebGL",       highlight: true },
    ],
  },
  {
    number: "02",
    accent: "purple",
    icon: "server-outline",
    eyebrow: "// DISCIPLINE_02",
    title: ["Backend &", "DevOps"],
    desc: "Building robust server-side logic, scalable APIs, and managing cloud infrastructure end-to-end.",
    tech: [
      { icon: "logo-nodejs",      label: "Node.js"    },
      { icon: "logo-docker",      label: "Docker"     },
      { icon: "logo-firebase",    label: "Firebase"   },
      { icon: "server-outline",   label: "PHP 8+"     },
      { icon: "server-outline",   label: "Laravel"    },
      { icon: "database-outline", label: "MySQL"      },
      { icon: "database-outline", label: "PostgreSQL" },
      { icon: "logo-github",      label: "Git"        },
    ],
  },
  {
    number: "03",
    accent: "green",
    icon: "layers-outline",
    eyebrow: "// DISCIPLINE_03",
    title: ["Mobile &", "Game Dev"],
    desc: "Expanding digital horizons through cross-platform apps and interactive game mechanics.",
    tech: [
      { icon: "logo-react",              label: "React Native"   },
      { icon: "logo-android",            label: "Android Studio" },
      { icon: "logo-figma",              label: "Figma"          },
      { icon: "phone-portrait-outline",  label: "Flutter"        },
      { icon: "game-controller-outline", label: "Phaser.js", highlight: true },
      { icon: "brush-outline",           label: "Canvas API"     },
    ],
  },
];
```

---

## 4. Arsitektur Visual

```
.about-spatial-section  [flex row]
├── .about-spatial-label        (flex: 0 0 260px, sticky kiri)
│   ├── .about-spatial-eyebrow    (// ABOUT ME)
│   ├── h2.section-title          (What I / Build.)
│   ├── .about-spatial-subtext    (Three disciplines...)
│   └── .about-spatial-cue        (animated sweep arrow)
│
└── .about-cards-wrapper         (flex: 1, perspective: 1200px)
    ├── .about-spatial-card--cyan   (flex: 1)
    │   ├── .about-spatial-card-spotlight  (cursor light)
    │   ├── .about-spatial-glow            (ambient orb)
    │   ├── .about-spatial-watermark       ("01")
    │   └── .about-spatial-content
    │       ├── .about-spatial-icon-wrap
    │       ├── .about-spatial-eyebrow-card
    │       ├── h3.about-spatial-card-title
    │       ├── p.about-spatial-card-desc
    │       └── .about-spatial-terminal
    │           ├── .about-spatial-terminal-header
    │           └── .about-spatial-badges
    ├── .about-spatial-card--purple (sama)
    └── .about-spatial-card--green  (sama)
```

### State Transitions:
```
IDLE:   rotateX(55deg) rotateZ(tilt) scale(0.88) — opacity: 0.55
ACTIVE: rotateX(0deg)  rotateZ(tilt) translateY(-12px) scale(1) — opacity: 1
DIMMED: rotateX(65deg) rotateZ(tilt) translateZ(-60px) scale(0.82) — opacity: 0.2, blur(4px)
```

---

## 5. CSS Lengkap (Ganti line 817-1390 di portfolio.css)

```css
/* =========================================================================
   ABOUT — Spatial Hologram Blueprint Cards
   3D perspective hover reveal — no glassmorphism, no drag mechanic
   ========================================================================= */

/* Keep .glass-card untuk contact + sections lain */
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 30px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  position: relative;
}

.glass-card:hover {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.1);
}

/* Dynamic Spotlight Border — hanya untuk project-card, achievement-card, workflow-step-card */
.glass-card,
.project-card,
.achievement-card,
.workflow-step-card {
  position: relative;
}

.glass-card::before,
.project-card::before,
.achievement-card::before,
.workflow-step-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(
    300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
    rgba(0, 243, 255, 0.45) 0%,
    rgba(188, 19, 254, 0.25) 50%,
    transparent 80%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.glass-card:hover::before,
.project-card:hover::before,
.achievement-card:hover::before,
.workflow-step-card:hover::before {
  opacity: 1;
}

/* ── About Spatial Section ────────────────────────────────────────────────── */

.about-spatial-section {
  display: flex;
  align-items: center;
  gap: 60px;
  padding: 60px 8% 100px;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.about-spatial-label {
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.about-spatial-eyebrow {
  font-family: var(--font-code);
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  color: var(--accent-cyan);
  opacity: 0.65;
  text-transform: uppercase;
}

.about-spatial-heading {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 4.5vw, 4.2rem);
  font-weight: 900;
  line-height: 1.05;
  color: #fff;
}

.about-spatial-heading em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
  display: block;
}

.about-spatial-subtext {
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.65;
  max-width: 24ch;
}

.about-spatial-cue {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  opacity: 0;
  animation: spatialCueFadeIn 0.6s 1.2s ease forwards;
}

@keyframes spatialCueFadeIn {
  to { opacity: 1; }
}

.about-spatial-cue-arrow {
  display: block;
  width: 24px;
  height: 1px;
  background: rgba(0, 243, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.about-spatial-cue-arrow::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent-cyan);
  transform: translateX(-100%);
  animation: spatialArrowPulse 2s ease-in-out infinite;
}

@keyframes spatialArrowPulse {
  0%, 100% { transform: translateX(-100%); }
  50%       { transform: translateX(100%); }
}

.about-spatial-cue-text {
  font-family: var(--font-code);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.2);
}

/* ── Cards wrapper ────────────────────────────────────────────────────────── */

.about-cards-wrapper {
  flex: 1;
  display: flex;
  gap: 28px;
  align-items: flex-end;
  perspective: 1200px;
  perspective-origin: 50% 60%;
}

/* ── Individual card ──────────────────────────────────────────────────────── */

.about-spatial-card {
  flex: 1;
  min-height: 420px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  cursor: default;
  will-change: transform, opacity, filter;

  /* Idle: card berbaring seperti blueprint di meja */
  transform: rotateX(55deg) rotateZ(var(--card-tilt, 0deg)) scale(0.88);
  transform-origin: bottom center;
  transform-style: preserve-3d;
  opacity: 0.55;
  filter: blur(0px);

  /* Solid dark — NO glassmorphism */
  background: #0b0b12;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  transition:
    transform  0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity    0.4s ease,
    filter     0.4s ease,
    box-shadow 0.4s ease;
}

/* Per-card tilt + top accent border */
.about-spatial-card--cyan {
  --card-tilt: -1.5deg;
  border-top: 1.5px solid rgba(0, 243, 255, 0.7);
}

.about-spatial-card--purple {
  --card-tilt: 1deg;
  border-top: 1.5px solid rgba(188, 19, 254, 0.7);
}

.about-spatial-card--green {
  --card-tilt: -0.5deg;
  border-top: 1.5px solid rgba(0, 255, 136, 0.7);
}

/* ── Active (kartu bangkit) ───────────────────────────────────────────────── */

.about-spatial-card.is-active {
  transform: rotateX(0deg) rotateZ(var(--card-tilt, 0deg)) translateY(-12px) scale(1);
  opacity: 1;
  filter: blur(0px);
}

.about-spatial-card--cyan.is-active {
  box-shadow:
    0 40px 80px rgba(0, 243, 255, 0.18),
    0 0 0 1px rgba(0, 243, 255, 0.15),
    inset 0 1px 0 rgba(0, 243, 255, 0.08);
}

.about-spatial-card--purple.is-active {
  box-shadow:
    0 40px 80px rgba(188, 19, 254, 0.18),
    0 0 0 1px rgba(188, 19, 254, 0.15),
    inset 0 1px 0 rgba(188, 19, 254, 0.08);
}

.about-spatial-card--green.is-active {
  box-shadow:
    0 40px 80px rgba(0, 255, 136, 0.15),
    0 0 0 1px rgba(0, 255, 136, 0.12),
    inset 0 1px 0 rgba(0, 255, 136, 0.07);
}

/* ── Dimmed (kartu lain saat hover) ──────────────────────────────────────── */

.about-cards-wrapper.has-hover .about-spatial-card:not(.is-active) {
  transform: rotateX(65deg) rotateZ(var(--card-tilt, 0deg)) scale(0.82) translateZ(-60px);
  opacity: 0.2;
  filter: blur(4px);
}

/* ── Cursor spotlight ─────────────────────────────────────────────────────── */

.about-spatial-card-spotlight {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
  background: radial-gradient(
    280px circle at var(--spot-x, 50%) var(--spot-y, -20%),
    rgba(255, 255, 255, 0.045) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.about-spatial-card.is-active .about-spatial-card-spotlight {
  opacity: 1;
}

/* ── Ambient glow orb ─────────────────────────────────────────────────────── */

.about-spatial-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  top: -80px;
  left: -60px;
  filter: blur(70px);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.about-spatial-card.is-active .about-spatial-glow { opacity: 0.1; }
.about-spatial-card--cyan   .about-spatial-glow { background: var(--accent-cyan); }
.about-spatial-card--purple .about-spatial-glow { background: var(--accent-purple); }
.about-spatial-card--green  .about-spatial-glow { background: #00ff88; }

/* ── Watermark ────────────────────────────────────────────────────────────── */

.about-spatial-watermark {
  position: absolute;
  bottom: -30px;
  right: -10px;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(120px, 15vw, 200px);
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.04);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.about-spatial-card.is-active .about-spatial-watermark { opacity: 1; }

/* ── Content ──────────────────────────────────────────────────────────────── */

.about-spatial-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px 28px 28px;
  gap: 20px;
}

.about-spatial-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 2px;
  transition: background 0.4s ease, border-color 0.4s ease;
}

.about-spatial-card--cyan.is-active   .about-spatial-icon-wrap {
  background: rgba(0, 243, 255, 0.08);
  border-color: rgba(0, 243, 255, 0.25);
}

.about-spatial-card--purple.is-active .about-spatial-icon-wrap {
  background: rgba(188, 19, 254, 0.08);
  border-color: rgba(188, 19, 254, 0.25);
}

.about-spatial-card--green.is-active  .about-spatial-icon-wrap {
  background: rgba(0, 255, 136, 0.08);
  border-color: rgba(0, 255, 136, 0.22);
}

.about-spatial-card--cyan   .about-spatial-icon-wrap ion-icon { color: var(--accent-cyan);   font-size: 1.6rem; }
.about-spatial-card--purple .about-spatial-icon-wrap ion-icon { color: var(--accent-purple); font-size: 1.6rem; }
.about-spatial-card--green  .about-spatial-icon-wrap ion-icon { color: #00ff88;              font-size: 1.6rem; }

.about-spatial-eyebrow-card {
  font-family: var(--font-code);
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
  opacity: 0.6;
}

.about-spatial-card-title {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(1.4rem, 2vw, 2rem);
  line-height: 1.1;
  color: #fff;
  margin: 0;
}

.about-spatial-card-title em {
  font-style: normal;
  display: block;
  transition: color 0.4s ease;
}

.about-spatial-card--cyan.is-active   .about-spatial-card-title em { color: var(--accent-cyan); }
.about-spatial-card--purple.is-active .about-spatial-card-title em { color: var(--accent-purple); }
.about-spatial-card--green.is-active  .about-spatial-card-title em { color: #00ff88; }

.about-spatial-card-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.7;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.4s 0.12s ease, transform 0.4s 0.12s ease;
}

.about-spatial-card.is-active .about-spatial-card-desc {
  opacity: 1;
  transform: translateY(0);
}

/* ── Terminal ─────────────────────────────────────────────────────────────── */

.about-spatial-terminal {
  width: 100%;
  background: rgba(3, 3, 8, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 18px 20px;
  margin-top: auto;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.45s 0.18s ease, transform 0.45s 0.18s ease;
}

.about-spatial-card.is-active .about-spatial-terminal {
  opacity: 1;
  transform: translateY(0);
}

.about-spatial-card--cyan   .about-spatial-terminal { border-top: 1.5px solid rgba(0, 243, 255, 0.35); }
.about-spatial-card--purple .about-spatial-terminal { border-top: 1.5px solid rgba(188, 19, 254, 0.35); }
.about-spatial-card--green  .about-spatial-terminal { border-top: 1.5px solid rgba(0, 255, 136, 0.3); }

.about-spatial-terminal-header {
  font-family: var(--font-code);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.about-spatial-terminal-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.about-spatial-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.about-spatial-badge {
  font-family: var(--font-code);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  color: rgba(255, 255, 255, 0.4);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}

.about-spatial-card--cyan.is-active .about-spatial-badge {
  color: rgba(0, 243, 255, 0.75);
  border-color: rgba(0, 243, 255, 0.22);
  background: rgba(0, 243, 255, 0.04);
}

.about-spatial-card--purple.is-active .about-spatial-badge {
  color: rgba(188, 19, 254, 0.75);
  border-color: rgba(188, 19, 254, 0.22);
  background: rgba(188, 19, 254, 0.04);
}

.about-spatial-card--green.is-active .about-spatial-badge {
  color: rgba(0, 255, 136, 0.75);
  border-color: rgba(0, 255, 136, 0.2);
  background: rgba(0, 255, 136, 0.04);
}

.about-spatial-badge.highlight {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.75);
}

.about-spatial-badge ion-icon {
  font-size: 0.8rem;
  flex-shrink: 0;
  opacity: 0.8;
}

/* ── Mobile fallback ──────────────────────────────────────────────────────── */

@media (max-width: 968px) {
  .about-spatial-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    padding: 60px 5% 80px;
    min-height: auto;
  }

  .about-spatial-label { flex: none; }
  .about-spatial-cue   { display: none; }

  .about-cards-wrapper {
    flex-direction: column;
    perspective: none;
    gap: 16px;
    width: 100%;
  }

  .about-spatial-card {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
    min-height: auto;
    transition: box-shadow 0.3s ease;
  }

  .about-spatial-card.is-active { transform: none !important; }

  .about-cards-wrapper.has-hover .about-spatial-card:not(.is-active) {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }

  .about-spatial-card-desc,
  .about-spatial-terminal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  .about-spatial-watermark {
    opacity: 1 !important;
    font-size: 80px;
    bottom: -10px;
    right: 5px;
  }

  .about-spatial-card-spotlight { display: none; }
}
```

---

## 6. AboutSection.tsx — Komponen Baru (Paste Lengkap)

```tsx
"use client";
import React from "react";

interface TechItem {
  icon: string;
  label: string;
  highlight?: boolean;
}

interface CardData {
  number: string;
  accent: "cyan" | "purple" | "green";
  icon: string;
  eyebrow: string;
  title: [string, string];
  desc: string;
  tech: TechItem[];
}

const CARDS: CardData[] = [
  {
    number: "01",
    accent: "cyan",
    icon: "code-slash-outline",
    eyebrow: "// DISCIPLINE_01",
    title: ["Frontend", "Engineering"],
    desc: "Architecting pixel-perfect, immersive web experiences with modern frameworks and WebGL interactions.",
    tech: [
      { icon: "logo-javascript",    label: "JavaScript"   },
      { icon: "logo-react",         label: "React.js"     },
      { icon: "triangle-outline",   label: "Next.js 14"   },
      { icon: "code-slash-outline", label: "TypeScript"   },
      { icon: "color-wand-outline", label: "Tailwind CSS" },
      { icon: "flash-outline",      label: "GSAP",        highlight: true },
      { icon: "cube-outline",       label: "Three.js",    highlight: true },
      { icon: "layers-outline",     label: "WebGL",       highlight: true },
    ],
  },
  {
    number: "02",
    accent: "purple",
    icon: "server-outline",
    eyebrow: "// DISCIPLINE_02",
    title: ["Backend &", "DevOps"],
    desc: "Building robust server-side logic, scalable APIs, and managing cloud infrastructure end-to-end.",
    tech: [
      { icon: "logo-nodejs",      label: "Node.js"    },
      { icon: "logo-docker",      label: "Docker"     },
      { icon: "logo-firebase",    label: "Firebase"   },
      { icon: "server-outline",   label: "PHP 8+"     },
      { icon: "server-outline",   label: "Laravel"    },
      { icon: "database-outline", label: "MySQL"      },
      { icon: "database-outline", label: "PostgreSQL" },
      { icon: "logo-github",      label: "Git"        },
    ],
  },
  {
    number: "03",
    accent: "green",
    icon: "layers-outline",
    eyebrow: "// DISCIPLINE_03",
    title: ["Mobile &", "Game Dev"],
    desc: "Expanding digital horizons through cross-platform apps and interactive game mechanics.",
    tech: [
      { icon: "logo-react",              label: "React Native"   },
      { icon: "logo-android",            label: "Android Studio" },
      { icon: "logo-figma",              label: "Figma"          },
      { icon: "phone-portrait-outline",  label: "Flutter"        },
      { icon: "game-controller-outline", label: "Phaser.js", highlight: true },
      { icon: "brush-outline",           label: "Canvas API"     },
    ],
  },
];

export default function AboutSection() {
  return (
    <section className="section about-spatial-section" id="about" aria-label="About Section">
      <div
        className="parallax-text"
        style={{ top: "50px", left: "-50px" }}
        data-speed="-0.1"
      >
        ABOUT
      </div>

      {/* Left heading */}
      <div className="about-spatial-label">
        <p className="about-spatial-eyebrow">// ABOUT ME</p>
        <h2 className="section-title about-spatial-heading" data-scroll>
          What I<em>Build.</em>
        </h2>
        <p className="about-spatial-subtext">
          Three disciplines.<br />One unified vision.
        </p>
        <div className="about-spatial-cue" aria-hidden="true">
          <span className="about-spatial-cue-arrow" />
          <span className="about-spatial-cue-text">hover to reveal</span>
        </div>
      </div>

      {/* Cards */}
      <div className="about-cards-wrapper" id="about-cards-wrapper">
        {CARDS.map((card) => (
          <article
            key={card.number}
            className={`about-spatial-card about-spatial-card--${card.accent}`}
            aria-label={`${card.title[0]} ${card.title[1]}`}
            tabIndex={0}
            id={`about-card-${card.number}`}
          >
            <div className="about-spatial-card-spotlight" aria-hidden="true" />
            <div className="about-spatial-glow" aria-hidden="true" />
            <div className="about-spatial-watermark" aria-hidden="true">{card.number}</div>

            <div className="about-spatial-content">
              <div className="about-spatial-icon-wrap">
                {/* @ts-ignore */}
                <ion-icon suppressHydrationWarning name={card.icon} aria-hidden="true" />
              </div>
              <p className="about-spatial-eyebrow-card">{card.eyebrow}</p>
              <h3 className="about-spatial-card-title">
                {card.title[0]}<em>{card.title[1]}</em>
              </h3>
              <p className="about-spatial-card-desc">{card.desc}</p>

              <div className="about-spatial-terminal">
                <p className="about-spatial-terminal-header">
                  <span className="about-spatial-terminal-dot" />
                  <span className="about-spatial-terminal-dot" />
                  <span className="about-spatial-terminal-dot" />
                  {" "}[ SYS.STACK ]
                </p>
                <div className="about-spatial-badges">
                  {card.tech.map(({ icon, label, highlight }) => (
                    <span
                      key={label}
                      className={`about-spatial-badge${highlight ? " highlight" : ""}`}
                    >
                      {/* @ts-ignore */}
                      <ion-icon suppressHydrationWarning name={icon} aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

---

## 7. CardStackInteractions.tsx — Ganti Penuh

> WAJIB: export default nama tetap `CardStackInteractions` agar ClientShell.tsx tidak perlu diubah.

```tsx
"use client";
import { useEffect } from "react";

export default function CardStackInteractions() {
  useEffect(() => {
    const wrapper = document.getElementById("about-cards-wrapper");
    if (!wrapper) return;

    const cards = Array.from(
      wrapper.querySelectorAll<HTMLElement>(".about-spatial-card")
    );
    if (cards.length === 0) return;

    const isMobile = window.matchMedia("(max-width: 968px)").matches;

    // Mobile: all cards visible, no 3D
    if (isMobile) {
      cards.forEach((card) => card.classList.add("is-active"));
      return;
    }

    function activateCard(target: HTMLElement) {
      wrapper!.classList.add("has-hover");
      cards.forEach((card) => {
        card.classList.toggle("is-active", card === target);
      });
    }

    function deactivateAll() {
      wrapper!.classList.remove("has-hover");
      cards.forEach((card) => card.classList.remove("is-active"));
    }

    function trackSpotlight(e: MouseEvent, card: HTMLElement) {
      const rect = card.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width)  * 100;
      const yPct = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty("--spot-x", `${xPct}%`);
      card.style.setProperty("--spot-y", `${yPct}%`);
    }

    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      const onEnter = () => activateCard(card);
      const onLeave = () => deactivateAll();
      const onMove  = (e: Event) => trackSpotlight(e as MouseEvent, card);
      const onFocus = () => activateCard(card);
      const onBlur  = () => deactivateAll();

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("mousemove",  onMove);
      card.addEventListener("focus",      onFocus);
      card.addEventListener("blur",       onBlur);

      cleanups.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("mousemove",  onMove);
        card.removeEventListener("focus",      onFocus);
        card.removeEventListener("blur",       onBlur);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
```

---

## 8. Checklist Implementasi (Urutan Wajib)

```
[ ] 1. GANTI CSS portfolio.css:
        Hapus baris 817 ("ABOUT — Bento Box...") s.d. baris 1390 (akhir @media 768px about).
        Paste semua CSS dari Section 5.

[ ] 2. GANTI AboutSection.tsx:
        Hapus semua, paste komponen dari Section 6.

[ ] 3. GANTI CardStackInteractions.tsx:
        Hapus semua, paste dari Section 7.
        Export default TETAP bernama CardStackInteractions.

[ ] 4. JANGAN ubah ClientShell.tsx.

[ ] 5. JANGAN ubah GSAPEffects.tsx.

[ ] 6. Restart dev server, verifikasi tidak ada CSS error.

[ ] 7. Test desktop hover: kartu idle -> hover satu -> dua lainnya dimmed + blur.

[ ] 8. Test keyboard Tab: sama seperti hover.

[ ] 9. Test mobile <=968px: semua kartu flat, semua terlihat, tidak ada 3D.

[ ] 10. Verifikasi h2.section-title masih ada di About (GSAP hacker-text + glow pick-up).

[ ] 11. Verifikasi parallax-text "ABOUT" masih render di background.
```

---

## 9. Edge Cases & Bug Prevention

### Issue 1 — GSAP section-title
`h2.section-title` HARUS ada. GSAPEffects.tsx line 57 dan 223 mengquery selector ini.
Solusi: `className="section-title about-spatial-heading"` (dual class).

### Issue 2 — Export name CardStackInteractions
ClientShell.tsx melakukan `import(./CardStackInteractions)` dan render `<CardStackInteractions />`.
Jangan rename export — hanya ganti implementasi internalnya.

### Issue 3 — CSS class collision card-ambient-glow
Class lama `.card-ambient-glow`, `glow--cyan`, `glow--purple`, `glow--green` hanya dipakai
di About section (verified: tidak ada di component lain). Aman dihapus bersama CSS lama About.

### Issue 4 — tech-badge-pill
Hanya dipakai di AboutSection.tsx lama. Setelah AboutSection.tsx diganti, class ini orphan.
Bisa dihapus dari CSS. CSS baru pakai `.about-spatial-badge` sebagai pengganti yang terisolasi.

### Issue 5 — perspective CSS vs GSAP transformPerspective
GSAPEffects.tsx mengapply `transformPerspective: 5000` pada `.horizon-slide` (class unik).
Section About tidak punya `.horizon-slide`. Tidak ada konflik.

### Issue 6 — is-active class scope
Semua rules `.is-active` di CSS baru di-scope ke `.about-spatial-card.is-active`. Tidak ada
global leakage ke section lain.

### Issue 7 — SSR / Hydration
- CardStackInteractions di-mount `ssr: false` via ClientShell dynamic import.
- Semua DOM mutations ada di useEffect.
- ion-icon memakai `suppressHydrationWarning`. Tidak ada hydration mismatch.

### Issue 8 — Event listener memory leak
Semua listeners dibersihkan via array `cleanups` yang dipanggil di return useEffect.

---

## 10. Inspirasi Visual

- **Tone & restraint:** Apple Vision Pro spatial UI announcement pages
- **3D card rise mechanic:** Stripe product card hover (flat -> 3D lift)
- **DOF blur on unfocused:** Apple Photos depth effect, Instagram stories
- **Cursor spotlight:** Linear.app, Vercel dashboard card interactions
- **Easing spring:** `cubic-bezier(0.175, 0.885, 0.32, 1.275)` — identik dengan GSAP `back.out(1.7)`

---

*Briefing ini ditulis sebagai panduan implementasi untuk AI coding agent.*
*Semua CSS class, nilai px, easing — final, divalidasi terhadap codebase yang ada.*

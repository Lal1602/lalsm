# MASTER BRIEFING — Horizon Showcase: Creative Playground & Career Pathway (Awwwards-Tier Scroll Architecture)

## Konteks Proyek & Tech Stack

Ini adalah portofolio pribadi level **Awwwards Site of the Month (SOTM)** yang dibangun di atas:

- **Framework:** Next.js (App Router, TypeScript Strict Mode)
- **Scroll Engine:** Lenis (smooth scroll, diinisiasi di `LenisSetup.tsx`) yang diintegrasikan dengan GSAP ScrollTrigger via `ScrollTrigger.scrollerProxy`
- **Animation Engine:** GSAP 3 + ScrollTrigger Plugin
- **3D:** React Three Fiber (R3F) + Three.js + Drei
- **State Management:** Zustand
- **Styling:** CSS Custom Properties (CSS Variables), tidak ada Tailwind
- **Font Stack:**
  - `var(--font-display)` → heading display (Bebas Neue / Space Grotesk Bold)
  - `var(--font-body)` → body text (Inter)
  - `var(--font-code)` → monospace/metadata (JetBrains Mono)
- **Color Tokens:**
  - `var(--accent-cyan)` → `#00f3ff` (primary glow)
  - `var(--accent-violet)` → `#bc13fe` (secondary glow)
  - `var(--bg-color)` → deep charcoal dark background
  - `var(--text-main)` → primary text color
  - `var(--text-muted)` → muted/secondary text

## Arsitektur Komponen Saat Ini

```
HorizonShowcase.tsx          <- .horizon-container (section wrapper)
  +-- .horizon-wrapper       <- strip yang akan di-translateX (GSAP target)
        +-- .slide--kinetic  <- SLIDE 1: Creative Playground (3D Sphere + teks)
        +-- .slide--career   <- SLIDE 2: Career Pathway [AKAN DIUBAH TOTAL]
        +-- ProjectEstimatorSlide <- SLIDE 3: Project Calculator
        +-- TechGraphSlide   <- SLIDE 4: Tech Graph

GSAPEffects.tsx              <- semua GSAP/ScrollTrigger diregistrasi di sini
CardStackInteractions.tsx    <- vanilla JS drag-throw card stack (untuk .about-card-stack)
CvTimelineSlide.tsx          <- komponen Career Pathway saat ini (akan diganti total)
CreativeBlob.tsx             <- Three.js CyberSphere untuk Slide 1
```

---

## Masalah Historis yang WAJIB Dihindari

Bug-bug berikut PERNAH terjadi dan telah diperbaiki. Jangan ulangi:

1. **Konten horizontal scroll stuck / tidak bisa di-scroll** — Penyebab: ada elemen di dalam `.horizon-wrapper` yang memiliki `overflow: hidden`, `position: fixed`, atau `z-index` tinggi yang memblokir pointer events ke ScrollTrigger. Solusi: JANGAN ubah `overflow`, `position`, atau `z-index` layering di `.horizon-container` dan `.horizon-wrapper`.
2. **Background section menutupi konten** — Penyebab: `.horizon-container` kehilangan `position: relative` atau z-index backdrop yang salah. Solusi: Pertahankan `position: relative` dan `z-index` hierarchy yang sudah ada.
3. **Pinning lepas prematur sebelum semua animasi selesai** — Penyebab: `end` value pada ScrollTrigger dihitung secara statis, tidak mempertimbangkan fase lanjutan (card-stacked). Solusi: Gunakan end yang cukup panjang dan hitung secara dinamis.
4. **SSR Hydration mismatch** — Semua Three.js dan komponen yang bergantung pada `window` WAJIB dibungkus dengan `dynamic(() => import(...), { ssr: false })` atau gated via `mounted` state.
5. **Lenis + ScrollTrigger konflik** — WAJIB gunakan `ScrollTrigger.scrollerProxy` agar Lenis dan GSAP sinkron. Jangan pernah campurkan `window.scrollY` mentah dengan GSAP scrub.

---

## BAGIAN UTAMA: Redesign Total "Career Pathway" menjadi Card-Stacked Split-Panel Section

### Filosofi Desain Baru

Career Pathway yang lama adalah slide horizontal biasa dengan timeline horizontal. Ini terlalu konvensional untuk level Awwwards. Desain baru mengadopsi konsep:

**Left panel:** Teks besar statis/pinned bertuliskan "CAREER PATHWAY" dengan tipografi display besar, outline stroke, ambient glow violet-cyan, progress track vertikal, dan CV download CTA — mirip pendekatan Bruno Simon / Acid Agency.

**Right panel:** Tumpukan kartu (stacked cards) yang bergeser masuk satu per satu saat user scroll, menumpuk di belakang kartu sebelumnya dengan efek depth dan parallax ringan. Ujung bawah/kanan kartu yang ada di belakang selalu terlihat sedikit (partial peek ~12-20px). Kartu TIDAK boleh overlap 100%.

### Data Kartu (dari CvTimelineSlide.tsx yang sudah ada)

```
CARD 1 (index 0, z-index 4 = paling atas):
  Title: "Informatics Engineering Student"
  Institution: EPIS / PENS Surabaya
  Year: 2024 - Present
  Desc: Focusing on software architecture, algorithms, dynamic web applications, and immersive 3D/WebGL experiences.
  Badge: EPIS (PENS)
  Color accent: --accent-cyan (#00f3ff)
  Tags: Next.js, Three.js, TypeScript

CARD 2 (index 1, z-index 3):
  Title: "Juara Harapan 2 — Web Tech"
  Institution: LKS Competition Surabaya
  Year: 2024
  Desc: Won 2nd Runner-up Merit Prize at city level in Web Technologies, building modular frontends and scaling backend systems under time constraints.
  Badge: Competition
  Color accent: --accent-violet (#bc13fe)
  Tags: LKS, Web Tech, Frontend

CARD 3 (index 2, z-index 2):
  Title: "Certified Junior Programmer"
  Institution: BNSP Indonesia
  Year: 2024
  Desc: National competency certificate validating expertise in programming, databases, and software design standards.
  Badge: National Cert
  Color accent: amber (#f59e0b)
  Tags: BNSP, Certified, Programming

CARD 4 (index 3, z-index 1 = paling bawah):
  Title: "Game & Android Graduate"
  Institution: Timedoor Academy
  Year: 2023 - 2024
  Desc: Completed advanced training courses in Javascript game development (Phaser 3) and mobile app development (Android Studio).
  Badge: Academy Graduate
  Color accent: emerald (#10b981)
  Tags: Phaser 3, Android Studio, JavaScript
```

---

## SPESIFIKASI TEKNIS PENUH

### 1. Hierarki DOM (HTML/JSX) yang WAJIB Diikuti

```jsx
// FILE: CareerPathwaySlide.tsx (menggantikan CvTimelineSlide.tsx)
// ATURAN PENTING:
// - className="horizon-slide slide--career-pathway" wajib dipertahankan
// - Tidak ada position: fixed, overflow: hidden besar, atau z-index > 20
// - Tinggi HARUS 100vh, lebar HARUS 100vw (mengikuti .horizon-slide CSS)
// - Semua animasi card-stacked dikendalikan GSAP dari GSAPEffects.tsx

<div className="horizon-slide slide--career-pathway">

  {/* Ambient Background Glow: violet kiri + cyan kanan */}
  <div className="slide-background-glow glow--violet career-glow-left" />
  <div className="slide-background-glow glow--cyan career-glow-right" />

  {/* Grid noise overlay untuk depth premium */}
  <div className="career-grid-overlay" />

  {/* LEFT PANEL: Static/Pinned Title */}
  <div className="career-left-panel">

    <p className="slide-badge career-badge">// EXPERIENCE & EDUCATION</p>

    {/* Display title: BESAR, bold, stroke + fill split */}
    <h2 className="career-display-title">
      <span className="career-title-solid">CAREER</span>
      <br />
      <span className="career-title-outline">PATHWAY</span>
    </h2>

    <p className="career-subtitle">
      A curated record of academic milestones,<br />
      national certifications, and competitive achievements<br />
      that shaped my engineering foundation.
    </p>

    {/* Vertical progress track: line + 4 dots */}
    <div className="career-progress-track">
      <div className="career-progress-line">
        <div className="career-progress-fill" />
      </div>
      <div className="career-dot career-dot--0 is-active" data-dot="0" />
      <div className="career-dot career-dot--1" data-dot="1" />
      <div className="career-dot career-dot--2" data-dot="2" />
      <div className="career-dot career-dot--3" data-dot="3" />
    </div>

    {/* CV Download CTA */}
    <a
      href="https://drive.google.com/file/d/16mvFW569lf6yUzMRpEQUMY-NVJ4t41kZ/view?usp=sharing"
      target="_blank"
      rel="noopener noreferrer"
      className="btn career-cv-btn"
    >
      <span className="career-cv-icon">&#8595;</span>
      <span>Get Resume PDF</span>
    </a>

  </div>

  {/* RIGHT PANEL: Stacked Cards Container */}
  <div className="career-right-panel">

    <div className="career-stack-container">

      {/* CARD 4 — z-index 1, paling bawah tumpukan */}
      <div className="career-card career-card--3" data-card="3" style={{ zIndex: 1 }}>
        <div className="career-card-inner">
          <div className="career-card-header">
            <span className="career-card-badge career-card-badge--emerald">Academy Graduate</span>
            <span className="career-card-year">2023 – 2024</span>
          </div>
          <div className="career-card-institution">Timedoor Academy</div>
          <h3 className="career-card-title">Game & Android Graduate</h3>
          <p className="career-card-desc">
            Completed advanced training courses in Javascript game development (Phaser 3)
            and mobile app development (Android Studio).
          </p>
          <div className="career-card-footer">
            <span className="career-card-tag">Phaser 3</span>
            <span className="career-card-tag">Android Studio</span>
            <span className="career-card-tag">JavaScript</span>
          </div>
        </div>
        <div className="career-card-accent-corner career-card-accent-corner--emerald" />
      </div>

      {/* CARD 3 — z-index 2 */}
      <div className="career-card career-card--2" data-card="2" style={{ zIndex: 2 }}>
        <div className="career-card-inner">
          <div className="career-card-header">
            <span className="career-card-badge career-card-badge--amber">National Cert</span>
            <span className="career-card-year">2024</span>
          </div>
          <div className="career-card-institution">BNSP Indonesia</div>
          <h3 className="career-card-title">Certified Junior Programmer</h3>
          <p className="career-card-desc">
            National competency certificate validating expertise in programming,
            databases, and software design standards.
          </p>
          <div className="career-card-footer">
            <span className="career-card-tag">BNSP</span>
            <span className="career-card-tag">Certified</span>
            <span className="career-card-tag">Programming</span>
          </div>
        </div>
        <div className="career-card-accent-corner career-card-accent-corner--amber" />
      </div>

      {/* CARD 2 — z-index 3 */}
      <div className="career-card career-card--1" data-card="1" style={{ zIndex: 3 }}>
        <div className="career-card-inner">
          <div className="career-card-header">
            <span className="career-card-badge career-card-badge--violet">Competition</span>
            <span className="career-card-year">2024</span>
          </div>
          <div className="career-card-institution">LKS Competition Surabaya</div>
          <h3 className="career-card-title">Juara Harapan 2 — Web Tech</h3>
          <p className="career-card-desc">
            Won 2nd Runner-up Merit Prize at city level in Web Technologies, building
            modular frontends and scaling backend systems under time constraints.
          </p>
          <div className="career-card-footer">
            <span className="career-card-tag">LKS</span>
            <span className="career-card-tag">Web Tech</span>
            <span className="career-card-tag">Frontend</span>
          </div>
        </div>
        <div className="career-card-accent-corner career-card-accent-corner--violet" />
      </div>

      {/* CARD 1 — z-index 4, paling atas, visible dari awal */}
      <div className="career-card career-card--0 is-active-card" data-card="0" style={{ zIndex: 4 }}>
        <div className="career-card-inner">
          <div className="career-card-header">
            <span className="career-card-badge career-card-badge--cyan">EPIS (PENS)</span>
            <span className="career-card-year">2024 – Present</span>
          </div>
          <div className="career-card-institution">EPIS / PENS Surabaya</div>
          <h3 className="career-card-title">Informatics Engineering Student</h3>
          <p className="career-card-desc">
            Focusing on software architecture, algorithms, dynamic web applications,
            and immersive 3D/WebGL experiences.
          </p>
          <div className="career-card-footer">
            <span className="career-card-tag">Next.js</span>
            <span className="career-card-tag">Three.js</span>
            <span className="career-card-tag">TypeScript</span>
          </div>
        </div>
        <div className="career-card-accent-corner career-card-accent-corner--cyan" />
      </div>

    </div>{/* /.career-stack-container */}

    {/* Card counter */}
    <div className="career-card-counter">
      <span className="career-counter-current">01</span>
      <span className="career-counter-sep">/</span>
      <span className="career-counter-total">04</span>
    </div>

  </div>{/* /.career-right-panel */}

</div>{/* /.slide--career-pathway */}
```

---

### 2. CSS — Tambahan ke Stylesheet Global

```css
/* === SLIDE: CAREER PATHWAY — LAYOUT BASE === */

.slide--career-pathway {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  gap: 0;
}

.career-glow-left {
  top: 20%; left: 5%;
  width: 35vw; height: 35vw;
  max-width: 500px; max-height: 500px;
  background: radial-gradient(circle, rgba(188,19,254,0.12) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.career-glow-right {
  bottom: 10%; right: 8%;
  width: 30vw; height: 30vw;
  max-width: 420px; max-height: 420px;
  background: radial-gradient(circle, rgba(0,243,255,0.10) 0%, transparent 70%);
  filter: blur(100px);
  pointer-events: none;
}

.career-grid-overlay {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none; z-index: 0;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

/* === LEFT PANEL === */

.career-left-panel {
  position: relative; z-index: 2;
  flex: 0 0 45%; max-width: 480px;
  padding: clamp(24px, 4vw, 60px);
  display: flex; flex-direction: column;
  justify-content: center; gap: 20px;
}

.career-badge {
  font-family: var(--font-code);
  font-size: clamp(0.65rem, 1vw, 0.8rem);
  letter-spacing: 0.15em; color: var(--accent-cyan);
  opacity: 0.7; margin: 0;
}

.career-display-title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 7vw, 7rem);
  line-height: 0.9; margin: 0; font-weight: 900;
}

.career-title-solid {
  color: #ffffff; display: block;
}

.career-title-outline {
  color: transparent;
  -webkit-text-stroke: 2px rgba(255,255,255,0.5);
  display: block; letter-spacing: 0.05em;
}

.career-subtitle {
  font-family: var(--font-body);
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
  color: rgba(255,255,255,0.45);
  line-height: 1.7; margin: 0; max-width: 340px;
}

/* Progress Track */
.career-progress-track {
  position: relative; display: flex;
  flex-direction: column; align-items: flex-start;
  gap: 0; margin-top: 8px;
}

.career-progress-line {
  width: 2px; height: 80px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px; position: relative;
  margin-left: 5px; overflow: hidden;
}

.career-progress-fill {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 0%;
  background: linear-gradient(180deg, var(--accent-cyan), var(--accent-violet));
  border-radius: 2px;
}

.career-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  background: var(--bg-color);
  margin-top: -2px; transition: all 0.4s ease;
}

.career-dot.is-active {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 12px var(--accent-cyan);
  background: rgba(0,243,255,0.2);
}

.career-cv-btn {
  display: inline-flex; align-items: center;
  gap: 8px; margin-top: 8px;
  font-size: 0.8rem; padding: 10px 18px;
  width: fit-content;
}

.career-cv-icon { font-size: 1rem; line-height: 1; }

/* === RIGHT PANEL === */

.career-right-panel {
  position: relative; z-index: 2;
  flex: 0 0 55%; max-width: 560px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: clamp(24px, 4vw, 60px);
}

.career-stack-container {
  position: relative;
  width: 100%; max-width: 440px;
  height: 320px;
  transform-style: preserve-3d;
}

/* Base Card */
.career-card {
  position: absolute; inset: 0;
  border-radius: 20px; overflow: hidden;
  background: rgba(12,12,18,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow:
    0 30px 80px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.05);
  will-change: transform, opacity;
  cursor: default;
}

.career-card:hover { border-color: rgba(255,255,255,0.12); }

.career-card-inner {
  position: relative; z-index: 2;
  padding: 28px 30px; height: 100%;
  display: flex; flex-direction: column;
  justify-content: space-between;
}

.career-card-header {
  display: flex; align-items: center;
  justify-content: space-between;
  gap: 10px; margin-bottom: 10px;
}

.career-card-badge {
  font-family: var(--font-code);
  font-size: 0.6rem; padding: 3px 8px;
  border-radius: 4px; text-transform: uppercase;
  letter-spacing: 0.1em; font-weight: 700;
}

.career-card-badge--cyan {
  background: rgba(0,243,255,0.1);
  border: 1px solid rgba(0,243,255,0.3);
  color: var(--accent-cyan);
}
.career-card-badge--violet {
  background: rgba(188,19,254,0.1);
  border: 1px solid rgba(188,19,254,0.3);
  color: var(--accent-violet);
}
.career-card-badge--amber {
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.3);
  color: #f59e0b;
}
.career-card-badge--emerald {
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.3);
  color: #10b981;
}

.career-card-year {
  font-family: var(--font-code);
  font-size: 0.7rem; color: rgba(255,255,255,0.3);
}

.career-card-institution {
  font-family: var(--font-code);
  font-size: 0.72rem; color: rgba(255,255,255,0.35);
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;
}

.career-card-title {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: 800; color: #ffffff;
  line-height: 1.2; margin: 0 0 10px 0;
}

.career-card-desc {
  font-family: var(--font-body);
  font-size: 0.83rem; color: rgba(255,255,255,0.5);
  line-height: 1.6; margin: 0; flex: 1;
}

.career-card-footer {
  display: flex; flex-wrap: wrap;
  gap: 6px; margin-top: 14px;
}

.career-card-tag {
  font-family: var(--font-code);
  font-size: 0.6rem; padding: 3px 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.05em;
}

/* Decorative accent corner per card */
.career-card-accent-corner {
  position: absolute; bottom: 0; right: 0;
  width: 120px; height: 120px;
  border-radius: 0 0 20px 0;
  pointer-events: none; z-index: 1; opacity: 0.12;
}
.career-card-accent-corner--cyan {
  background: radial-gradient(circle at 100% 100%, var(--accent-cyan), transparent 70%);
}
.career-card-accent-corner--violet {
  background: radial-gradient(circle at 100% 100%, var(--accent-violet), transparent 70%);
}
.career-card-accent-corner--amber {
  background: radial-gradient(circle at 100% 100%, #f59e0b, transparent 70%);
}
.career-card-accent-corner--emerald {
  background: radial-gradient(circle at 100% 100%, #10b981, transparent 70%);
}

/* Card Counter */
.career-card-counter {
  display: flex; align-items: baseline;
  gap: 4px; margin-top: 20px;
  font-family: var(--font-code); align-self: flex-end;
}
.career-counter-current {
  font-size: 1.5rem; font-weight: 700;
  color: #fff; line-height: 1;
}
.career-counter-sep { font-size: 0.85rem; color: rgba(255,255,255,0.25); }
.career-counter-total { font-size: 0.9rem; color: rgba(255,255,255,0.25); }

/* === RESPONSIVE: Mobile — disable GSAP, tampilkan sebagai vertical list === */
@media (max-width: 968px) {
  .slide--career-pathway {
    flex-direction: column; overflow-y: auto;
    height: auto; padding: 60px 24px;
  }
  .career-left-panel, .career-right-panel {
    flex: 0 0 100%; max-width: 100%; padding: 20px;
  }
  .career-stack-container {
    height: auto; display: flex;
    flex-direction: column; gap: 16px;
  }
  .career-card {
    position: static;
    transform: none !important;
    opacity: 1 !important;
    height: auto; min-height: 220px;
  }
  .career-progress-track { display: none; }
}
```

---

### 3. GSAP ScrollTrigger — Master Continuous Timeline

Tambahkan blok ini ke dalam `useEffect` di `GSAPEffects.tsx` SEBAGAI PENGGANTI dari blok horizontal scroll yang sudah ada (bukan tambahan). Blok baru ini menggabungkan fase horizontal + fase card-stacked dalam satu ScrollTrigger:

```typescript
// =====================================================================
// HORIZON SHOWCASE: Master Continuous Timeline
// Fase 1: Horizontal scroll (translateX) semua slides
// Fase 2: Career Pathway card-stacked animation
// PIN dipertahankan sepanjang kedua fase, baru dilepas setelah kartu terakhir selesai
// =====================================================================

const horizonWrapper = document.querySelector<HTMLElement>(".horizon-wrapper");
const isHorizonMobile = window.matchMedia("(max-width: 968px)").matches;

if (horizonWrapper && !isHorizonMobile) {
  const slides = Array.from(horizonWrapper.querySelectorAll<HTMLElement>(".horizon-slide"));
  const totalSlides = slides.length;
  const slideWidth = () => slides[0]?.offsetWidth || window.innerWidth;
  const horizontalDist = () => (totalSlides - 1) * slideWidth();
  // Extra scroll space untuk 3 transisi kartu (A, B, C), masing-masing ~30vw
  const cardStackDist = () => slideWidth() * 0.9;
  const totalDist = () => horizontalDist() + cardStackDist();

  // 3D concave track updater (refactored untuk dipakai di masterTl.onUpdate)
  const updateConcaveTrack = () => {
    const wrapperX = (gsap.getProperty(horizonWrapper, "x") as number) || 0;
    const vw = slideWidth();
    const center = vw / 2;
    slides.forEach((slide, i) => {
      const slideCenter = wrapperX + i * vw + vw / 2;
      const normDist = gsap.utils.clamp(-1.5, 1.5, (slideCenter - center) / vw);
      gsap.set(slide, {
        rotationY: -normDist * 18,
        z: 0,
        transformPerspective: 5000,
        transformOrigin: "50% 50%",
        overwrite: "auto",
      });
    });
  };

  updateConcaveTrack();

  // --- Career Pathway card references ---
  const careerSlide = horizonWrapper.querySelector<HTMLElement>(".slide--career-pathway");
  const cards = careerSlide
    ? [0, 1, 2, 3].map(i => careerSlide.querySelector<HTMLElement>(`.career-card[data-card="${i}"]`)!)
    : [];
  const progressFill = careerSlide?.querySelector<HTMLElement>(".career-progress-fill");
  const dots = careerSlide
    ? Array.from(careerSlide.querySelectorAll<HTMLElement>(".career-dot"))
    : [];
  const counterCurrent = careerSlide?.querySelector<HTMLElement>(".career-counter-current");

  // Helper: update progress UI (dots, fill, counter)
  const updateProgressUI = (activeIndex: number) => {
    if (progressFill) {
      gsap.to(progressFill, {
        height: `${(activeIndex / 3) * 100}%`,
        duration: 0.4, ease: "power2.out", overwrite: "auto"
      });
    }
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === activeIndex));
    if (counterCurrent) {
      counterCurrent.textContent = String(activeIndex + 1).padStart(2, "0");
    }
  };

  // Initial card positions (set before scroll begins)
  if (cards.length === 4 && cards.every(Boolean)) {
    gsap.set(cards[0], { y: 0,  scale: 1,    rotationZ: 0,    opacity: 1   });
    gsap.set(cards[1], { y: 24, scale: 0.97, rotationZ: -0.5, opacity: 0.9 });
    gsap.set(cards[2], { y: 48, scale: 0.94, rotationZ: -1.0, opacity: 0.8 });
    gsap.set(cards[3], { y: 72, scale: 0.91, rotationZ: -1.5, opacity: 0.7 });
  }

  // --- Build master timeline ---
  // Duration split: horizDuration controls the progress ratio between the two phases
  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".horizon-container",
      pin: true,
      scrub: 1.2,
      start: "top top",
      end: () => `+=${totalDist()}`,
      invalidateOnRefresh: true,
      snap: {
        snapTo: (value) => {
          const step = 1 / (totalSlides - 1);
          const currentX = Math.abs((gsap.getProperty(horizonWrapper, "x") as number) || 0);
          const visProgress = horizontalDist() > 0 ? currentX / horizontalDist() : value;
          const targetIndex = Math.round(visProgress / step);
          // Only snap during horizontal phase (progress < 1)
          // During card phase (progress >= 1), stay at last horizontal position
          if (value >= 1) return 1;
          return Math.min(targetIndex * step, 1);
        },
        duration: { min: 0.3, max: 0.6 },
        ease: "power2.out",
        inertia: false,
        directional: false,
      },
      onRefresh: (self) => {
        horizonScrollState.start = self.start;
        horizonScrollState.end = self.end;
        updateConcaveTrack();
      },
    }
  });

  // PHASE 1: Horizontal translation (normalized duration 0 → horizRatio)
  // horizRatio is the fractional scroll distance dedicated to horizontal movement
  const horizRatio = () => horizontalDist() / totalDist();

  masterTl.to(horizonWrapper, {
    x: () => -horizontalDist(),
    ease: "none",
    onUpdate: updateConcaveTrack,
    // duration here is relative inside the timeline, not seconds
    // We use a label-based approach: start at 0, end at horizRatio
  }, 0);

  // Placeholder to hold the timeline at horizRatio before card phase starts.
  // Because masterTl uses scrub, GSAP maps timeline progress to scroll progress.
  // We set card animations to start at the normalized progress position (>= horizRatio).
  // Use gsap.timeline label + position parameters:

  // PHASE 2: Card-Stacked Animation (3 steps, each = 1/3 of remaining progress)
  // Step A: Card 1 (index 1) slides up to peek position
  masterTl.to(cards[1], {
    y: 12, scale: 0.99, rotationZ: -0.2, opacity: 1,
    ease: "power2.out",
    onStart: () => updateProgressUI(1),
  }, ">"); // begins after Phase 1 ends

  // Simultaneously: cards 2 and 3 also shift up slightly as card 1 comes in
  masterTl.to(cards[2], { y: 24, scale: 0.97, rotationZ: -0.4, opacity: 0.9, ease: "power2.out" }, "<");
  masterTl.to(cards[3], { y: 36, scale: 0.94, rotationZ: -0.7, opacity: 0.8, ease: "power2.out" }, "<");

  // Step B: Card 2 (index 2) slides up
  masterTl.to(cards[2], {
    y: 12, scale: 0.99, rotationZ: -0.2, opacity: 1,
    ease: "power2.out",
    onStart: () => updateProgressUI(2),
  }, ">");
  masterTl.to(cards[3], { y: 24, scale: 0.97, rotationZ: -0.4, opacity: 0.9, ease: "power2.out" }, "<");

  // Step C: Card 3 (index 3) slides up — last card, pin releases after this
  masterTl.to(cards[3], {
    y: 12, scale: 0.99, rotationZ: -0.2, opacity: 1,
    ease: "power2.out",
    onStart: () => updateProgressUI(3),
  }, ">");

  // After masterTl completes, ScrollTrigger unpin happens automatically
  // because the scrub-linked timeline has ended — no manual kill() needed.
}
```

---

### 4. Perubahan di HorizonShowcase.tsx

```tsx
// Ganti import lama:
// const CvTimelineSlide = dynamic(() => import("./CvTimelineSlide"), { ssr: false });
// Dengan:
const CareerPathwaySlide = dynamic(() => import("./CareerPathwaySlide"), { ssr: false });

// Ganti usage lama:
// {mounted && <CvTimelineSlide />}
// Dengan:
{mounted && <CareerPathwaySlide />}
```

---

### 5. Aturan Layering & Z-Index (WAJIB DIPATUHI)

```
z-index hierarchy dalam .slide--career-pathway:

1  -> .career-card--3 (kartu paling bawah tumpukan)
2  -> .career-card--2
3  -> .career-card--1
4  -> .career-card--0 (kartu paling atas, selalu terlihat pertama)
5  -> .career-card-inner (konten dalam kartu)
10 -> .career-left-panel
10 -> .career-right-panel
20 -> .career-card-counter
```

LARANGAN:
- JANGAN tambahkan `position: fixed` pada elemen apapun di dalam `.slide--career-pathway`
- JANGAN tambahkan `overflow: hidden` pada `.horizon-wrapper` (sudah diatur di tempat lain)
- WAJIB semua kartu pakai `will-change: transform, opacity` untuk GPU acceleration
- Jika menggunakan `backdrop-filter` pada kartu, pastikan parent tidak memiliki `overflow: hidden` yang akan memotong efek blur

---

### 6. Integrasi Lenis Smooth Scroll

Lenis sudah disetup di `LenisSetup.tsx`. Verifikasi bahwa ini ADA dalam project, jika belum tambahkan:

```typescript
// Di LenisSetup.tsx atau awal GSAPEffects.tsx:
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

---

### 7. Checklist Verifikasi (Definition of Done)

- [ ] Horizontal scroll berjalan normal: Slide 1 → 2 (Career) → 3 → 4 via vertical scroll
- [ ] Career Pathway slide dijangkau via horizontal scroll seperti slide lainnya (tidak stuck)
- [ ] Saat di Career Pathway, scroll lanjut mengaktifkan card-stacked animation
- [ ] Kartu masuk satu per satu secara berurutan: card 1 visible → card 2 masuk → card 3 masuk → card 4 masuk
- [ ] Peek effect: selalu ada partial visibility ~12-20px dari kartu di belakang — TIDAK overlap 100%
- [ ] Progress dots aktif satu per satu sesuai kartu yang masuk
- [ ] Progress fill line naik dari 0% ke 100% secara proporsional
- [ ] Counter berubah: "01 / 04" → "02 / 04" → "03 / 04" → "04 / 04"
- [ ] Left panel (judul CAREER PATHWAY) tetap terlihat dan tidak menghilang selama fase card-stacked
- [ ] Smooth exit: setelah kartu 4 selesai, pin dilepas dan scroll vertikal kembali normal
- [ ] Animasi berjalan 60fps tanpa jank, stutter, atau frame drop
- [ ] Mobile (<968px): semua kartu ditampilkan vertikal tanpa GSAP animation
- [ ] Tidak ada console error, tidak ada hydration mismatch
- [ ] Background horizon-concave-backdrop dan horizon-grid-backdrop tetap di bawah semua kartu

---

**Tugas AI:**

Berdasarkan seluruh spesifikasi di atas — DOM hierarchy, CSS rules, GSAP timeline logic, dan integrasi Lenis — berikan output berikut:

1. **File `CareerPathwaySlide.tsx` lengkap** — menggantikan `CvTimelineSlide.tsx` — dengan seluruh JSX structure persis seperti Bagian 1 (semua `className`, `data-*` attributes, `style` props, dan konten teks yang lengkap). Komponen harus dideklarasikan sebagai `"use client"` dan menggunakan TypeScript strict.

2. **Blok CSS tambahan** siap copy-paste ke global stylesheet — mencakup semua rules dari Bagian 2 tanpa modifikasi.

3. **Blok GSAP/ScrollTrigger yang direvisi untuk `GSAPEffects.tsx`** — berisi master timeline tunggal yang menggantikan blok horizontal scroll yang lama, mencakup fase horizontal + fase card-stacked lengkap dari Bagian 3. Pastikan `updateConcaveTrack` tetap berjalan selama fase horizontal.

4. **Perubahan minimal di `HorizonShowcase.tsx`** — hanya ganti import dan usage `CvTimelineSlide` menjadi `CareerPathwaySlide`.

Semua kode harus: TypeScript strict, Next.js App Router best practices, komentar inline yang informatif, production-ready (bukan prototype), dan tidak menyebabkan salah satu bug historis yang disebutkan di atas.

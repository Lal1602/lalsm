# Career Pathway — Scroll-Driven Stacked Card Reveal
## Implementation Briefing v1.0

> **File yang akan diubah:**
> - `components/ui/CvTimelineSlide.tsx` — komponen utama, redesign total
> - `app/portfolio.css` — tambah CSS baru untuk card stack & animasi
> - `components/ui/GSAPEffects.tsx` — expose scroll progress dari ScrollTrigger ke CvTimelineSlide
> - `lib/horizonScrollState.ts` — tambah progress field & onProgressUpdate callback

---

## 1. Konsep & Visi

### Masalah saat ini
Keempat riwayat karir (PENS, LKS, BNSP, Timedoor) muncul sekaligus begitu slide masuk viewport —
animasinya one-shot via IntersectionObserver, tidak ada keterkaitan dengan gerakan scroll pengguna.

### Visi baru: "Scroll-Indexed Card Stack"
Keempat kartu riwayat karir disusun sebagai **stack kartu** yang awalnya bertumpuk di tengah slide.
Setiap kali pengguna **men-scroll ke bawah di dalam horizontal scroll section**, satu kartu mengupas
dirinya dari tumpukan dan terbang ke posisi finalnya di timeline — satu per satu, serempak dengan
kecepatan scroll.

Analogi visual: seperti dealer kartu yang melempar kartu satu per satu ke atas meja, tapi dikendalikan
penuh oleh gerakan scroll. Maju = kartu berikutnya keluar; mundur = kartu kembali ke tumpukan.

---

## 2. Arsitektur Teknis

### 2.1 Sumber Progress Scroll

GSAP ScrollTrigger yang sudah ada di `GSAPEffects.tsx` mengendalikan `.horizon-wrapper` dengan:
```
trigger: ".horizon-container"
pin: true
scrub: 0.8
start: "top top"
end: `+=${totalScrollWidth()}`
```

Slide Career Pathway adalah slide ke-2 (index 1 dari 0). Saat ScrollTrigger progress = 0.5 hingga 1.0
berarti kita berada di dalam slide Career Pathway. Kita perlu mengekstrak sub-progress ini:

```
subProgress = (scrollProgress - 0.5) / 0.5   // 0.0 -> 1.0 saat di career slide
```

**Cara expose progress:** Gunakan `horizonScrollState` yang sudah ada di `lib/horizonScrollState.ts`.
Tambahkan `progress` ke dalam state tersebut dan update setiap frame dari `onUpdate` ScrollTrigger.
CvTimelineSlide kemudian subscribe via `onProgressUpdate` callback.

### 2.2 Breakpoint Progress untuk 4 Kartu

```
Segmen 0 (0.00-0.15): Slide masuk, header dan hint muncul
Segmen 1 (0.15-0.38): Kartu #1 (Timedoor/Academy) keluar dari stack -> posisi final
Segmen 2 (0.35-0.54): Kartu #2 (BNSP Certification) keluar
Segmen 3 (0.52-0.70): Kartu #3 (LKS Competition) keluar
Segmen 4 (0.68-0.87): Kartu #4 (PENS/Present) keluar, hint menghilang
Segmen 5 (0.88-1.00): CV Download card muncul, semua tersusun sempurna
```

---

## 3. Layout Visual

### 3.1 Kondisi Awal (Stack)

Semua 4 kartu bertumpuk di satu posisi di tengah-kanan slide.
Kartu paling atas = yang akan keluar pertama (Timedoor/Academy = paling lama, oldest first).

```
Tampak samping tumpukan:
  +----------------+  <- Kartu #0 (Timedoor) -- paling atas, keluar pertama
  |                |
  +----------------+
   +----------------+  <- Kartu #1 (BNSP) -- 8px ke bawah, sedikit miring
   |                |
   +----------------+
    +----------------+  <- Kartu #2 (LKS) -- 16px ke bawah
    |                |
    +----------------+
     +----------------+  <- Kartu #3 (PENS/Present) -- 24px ke bawah, paling kecil
     |                |
     +----------------+
```

**CSS initial state per kartu (via gsap.set):**
- data-index="0": x=0,   y=0,  scale=1.00, rotationY=0    (z-index: 4)
- data-index="1": x=4,   y=8,  scale=0.97, rotationY=-1.5 (z-index: 3)
- data-index="2": x=8,   y=16, scale=0.94, rotationY=-3   (z-index: 2)
- data-index="3": x=12,  y=24, scale=0.91, rotationY=-4.5 (z-index: 1)

### 3.2 Target Position (Tersebar di Timeline)

Setelah semua kartu keluar, mereka tersusun horizontal seperti timeline:
```
[Timedoor]   [BNSP]    [LKS]     [PENS]
 2023-2024    2024      2024     Present
    o---------------------------o---------------------------o---------------------------o
```

Final X positions (relatif ke stack center): [-480px, -240px, 0px, +240px]
(Disesuaikan saat implementasi berdasarkan lebar container aktual)

---

## 4. Animasi Detail Per Kartu — Karakteristik Gerak

Setiap kartu memiliki "kepribadian gerak" yang unik.

### Kartu #0 — Timedoor Academy (2023–2024): "Pelajar Bersemangat"
```
Trajectory: Parabola — naik 35px dulu (overshoot) lalu mendarat di posisi kiri
rotationY: 0 -> -15deg saat terbang puncak -> 0 saat mendarat
scaleY: 1 -> 1.08 (stretch saat terbang) -> 1.0 (squash saat mendarat)
Formula Y ekstra: -Math.sin(t * Math.PI) * 35
Border glow saat landed: cyan (--accent-cyan)
```

### Kartu #1 — BNSP Certification (2024): "Profesional Tenang"
```
Trajectory: Smooth banking, tidak ada bounce
rotationY: 0 -> 8deg (banking seperti pesawat) -> 0
scale: 0.97 -> 1.0
Formula Y ekstra: tidak ada
ease: power3.out — presisi, tidak ada overshoot
Border glow: gold/amber
```

### Kartu #2 — LKS Competition (2024): "Kompetitor Berapi"
```
Trajectory: Arc ke atas-kiri dengan rotasi Z (seperti dilempar ke meja)
rotationZ: 0 -> 10deg -> 0
scale: 0.94 -> 1.05 (overshoot) -> 1.0
Formula Y ekstra: -Math.sin(t * Math.PI * 0.7) * 20
Border glow: purple/violet flash saat mendarat
```

### Kartu #3 — PENS / Present (2024–Present): "Puncak Perjalanan"
```
Trajectory: Anticipation — turun 20px dulu (crouch), lalu naik perlahan ke posisi final
Jika t < 0.15: extraY = (t/0.15) * 20, scale turun ke 0.85 (squash anticipation)
Jika t >= 0.15: naik ke 0, scale naik ke 1.0 dengan elastic
rotationY: -4.5deg -> 0
Border glow: intense cyan neon, box-shadow besar — paling premium dari semua kartu
Label "CURRENT" muncul (opacity 0 -> 1) setelah kartu landed
```

---

## 5. Garis Timeline (Connector Line)

3 segmen garis terpisah: antara kartu 0-1, 1-2, 2-3.
Masing-masing scaleX dari 0 ke 1 mengikuti progress:
- Segmen 0-1: muncul saat progress 0.38-0.54
- Segmen 1-2: muncul saat progress 0.54-0.70
- Segmen 2-3: muncul saat progress 0.70-0.87

Implementasi: gsap.set(segment, { scaleX: clamp(0,1,mapRange(start,end,0,1,p)), transformOrigin: "left center" })

---

## 6. Scroll Hint — "Ungkap Perjalananku"

### Posisi & Visibilitas
Hint terletak di bawah heading slide, sebelum stack kartu.
Fade out ketika sub-progress > 0.1 (kartu pertama mulai bergerak).

### HTML Structure
```html
<div class="cv-scroll-hint">
  <div class="cv-hint-wheel">
    <div class="cv-hint-dot" />
  </div>
  <span class="cv-hint-text">scroll to unfold my journey</span>
  <div class="cv-hint-arrows">
    <span>v</span>
    <span>v</span>
    <span>v</span>
  </div>
</div>
```

### CSS Hint
```css
.cv-scroll-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  margin-bottom: 36px;
  font-family: var(--font-code);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: lowercase;
  color: rgba(255, 255, 255, 0.28);
  user-select: none;
  pointer-events: none;
  transition: opacity 0.6s ease;
}

.cv-hint-wheel {
  width: 22px;
  height: 34px;
  border: 1.5px solid rgba(0, 243, 255, 0.35);
  border-radius: 11px;
  position: relative;
  flex-shrink: 0;
}

.cv-hint-dot {
  width: 3px;
  height: 6px;
  border-radius: 100px;
  background: rgba(0, 243, 255, 0.6);
  position: absolute;
  left: 50%;
  top: 5px;
  transform: translateX(-50%);
  animation: hintScrollBounce 1.6s ease-in-out infinite;
}

@keyframes hintScrollBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.7; }
  50%       { transform: translateX(-50%) translateY(10px); opacity: 0.15; }
}

.cv-hint-arrows {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1;
}
.cv-hint-arrows span:nth-child(1) { opacity: 0.7; }
.cv-hint-arrows span:nth-child(2) { opacity: 0.4; }
.cv-hint-arrows span:nth-child(3) { opacity: 0.15; }
```

---

## 7. Card Design Baru (Glassmorphism Premium)

### HTML Structure
```html
<div class="cv-card" data-index="0">
  <div class="cv-card-shimmer"></div>  <!-- Rotating border gradient -->
  <div class="cv-card-connector-dot"></div>  <!-- Dot at top for timeline -->
  <div class="cv-card-inner">
    <div class="cv-card-meta">
      <span class="cv-card-year">2023-2024</span>
      <span class="cv-card-badge">Academy Graduate</span>
    </div>
    <div class="cv-card-divider"></div>
    <h3 class="cv-card-role">Game & Android Graduate</h3>
    <p class="cv-card-institution">Timedoor Academy</p>
    <p class="cv-card-desc">Completed advanced training courses...</p>
  </div>
</div>
```

### CSS Card Shell
```css
.cv-card {
  position: absolute;
  width: 220px;
  border-radius: 16px;
  background: rgba(8, 8, 14, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  will-change: transform, opacity;
}

/* Shimmer rotating border gradient */
@property --shimmer-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.cv-card-shimmer {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--shimmer-angle, 0deg),
    transparent 0deg,
    rgba(0, 243, 255, 0.3) 60deg,
    transparent 120deg
  );
  animation: shimmerRotate 4s linear infinite;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 0;
}

@keyframes shimmerRotate { to { --shimmer-angle: 360deg; } }

.cv-card.is-landed .cv-card-shimmer { opacity: 1; }

.cv-card-connector-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-color);
  border: 2px solid rgba(255, 255, 255, 0.15);
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
  z-index: 2;
}

.cv-card.is-landed .cv-card-connector-dot {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan), 0 0 16px rgba(0,243,255,0.3);
}

.cv-card-inner {
  padding: 20px 18px;
  position: relative;
  z-index: 1;
}

.cv-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.cv-card-year {
  font-family: var(--font-code);
  font-size: 0.68rem;
  color: var(--accent-cyan);
  letter-spacing: 0.12em;
}

.cv-card-badge {
  font-family: var(--font-code);
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(0, 243, 255, 0.07);
  border: 1px solid rgba(0, 243, 255, 0.2);
  color: rgba(0, 243, 255, 0.7);
  text-transform: uppercase;
}

.cv-card-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(0,243,255,0.3), transparent);
  margin-bottom: 14px;
}

.cv-card-role {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
  margin: 0 0 4px 0;
}

.cv-card-institution {
  font-family: var(--font-code);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 12px 0;
  letter-spacing: 0.08em;
}

.cv-card-desc {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.55;
  margin: 0;
}
```

---

## 8. Implementasi GSAP Scroll-Driven

### 8.1 Modifikasi lib/horizonScrollState.ts
```ts
const horizonScrollState = {
  start: 0,
  end: 0,
  progress: 0,                                           // TAMBAH
  onProgressUpdate: null as ((p: number) => void) | null,  // TAMBAH
};
export default horizonScrollState;
```

### 8.2 Modifikasi GSAPEffects.tsx — onUpdate
```ts
onUpdate: (self) => {
  horizonScrollState.progress = self.progress;
  if (horizonScrollState.onProgressUpdate) {
    horizonScrollState.onProgressUpdate(self.progress);
  }
  updateConcaveTrack();  // yang sudah ada
},
```

### 8.3 CvTimelineSlide.tsx — Core Logic

```tsx
useEffect(() => {
  // Kumpulkan refs ke semua elemen
  const cards = Array.from(slideRef.current!.querySelectorAll<HTMLElement>(".cv-card"));
  const hint = slideRef.current!.querySelector<HTMLElement>(".cv-scroll-hint");
  const headers = Array.from(slideRef.current!.querySelectorAll<HTMLElement>(".cv-header-anim"));
  const lineSegs = [lineRef01.current, lineRef12.current, lineRef23.current];
  const cvCard = slideRef.current!.querySelector<HTMLElement>(".cv-download-card");

  // Stack awal positions (relatif ke .cv-card-stack container)
  const stackPositions = [
    { x: 0,  y: 0,  scale: 1.00, ry: 0    },
    { x: 4,  y: 8,  scale: 0.97, ry: -1.5 },
    { x: 8,  y: 16, scale: 0.94, ry: -3   },
    { x: 12, y: 24, scale: 0.91, ry: -4.5 },
  ];

  // Posisi final (px dari stack center, sesuaikan saat implementasi)
  const finalPositions = [
    { x: -480, y: 0 },
    { x: -240, y: 0 },
    { x:    0, y: 0 },
    { x:  240, y: 0 },
  ];

  // Card windows: kapan masing-masing kartu mulai terbang
  const cardWindows = [
    { enter: 0.15, land: 0.38 },
    { enter: 0.35, land: 0.54 },
    { enter: 0.52, land: 0.70 },
    { enter: 0.68, land: 0.87 },
  ];

  // Line segment windows
  const lineWindows = [
    { start: 0.38, end: 0.54 },
    { start: 0.54, end: 0.70 },
    { start: 0.70, end: 0.87 },
  ];

  function updateCardsByProgress(globalProgress: number) {
    // Sub-progress untuk slide ini (slide ke-2 dari 2 = range 0.5-1.0)
    // PENTING: sesuaikan range ini jika jumlah slide berubah
    const p = gsap.utils.clamp(0, 1, (globalProgress - 0.5) / 0.5);

    // Header fade in
    const headerProg = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 0.12, 0, 1, p));
    gsap.set(headers, { opacity: headerProg, y: (1 - headerProg) * 20 });

    // Hint fade out setelah p > 0.1
    if (hint) {
      const hintOp = gsap.utils.clamp(0, 1, 1 - gsap.utils.mapRange(0.05, 0.20, 0, 1, p));
      gsap.set(hint, { opacity: hintOp });
    }

    // 4 cards
    cards.forEach((card, i) => {
      const win = cardWindows[i]!;
      const sp = stackPositions[i]!;
      const fp = finalPositions[i]!;

      if (p <= win.enter) {
        // Di stack
        gsap.set(card, { x: sp.x, y: sp.y, scale: sp.scale, rotationY: sp.ry, rotationZ: 0, opacity: 1, zIndex: 4 - i });
        card.classList.remove("is-landed");
      } else if (p > win.enter && p < win.land) {
        // Dalam perjalanan — t = 0..1
        const t = gsap.utils.mapRange(win.enter, win.land, 0, 1, p);
        // Cubic ease-in-out
        const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

        const currentX = sp.x + (fp.x - sp.x) * eased;
        let extraY = 0, rz = 0, ry = 0, extraScale = sp.scale + (1 - sp.scale) * eased;

        if (i === 0) {
          extraY = -Math.sin(t * Math.PI) * 35;
          ry = Math.sin(t * Math.PI) * -15;
          extraScale = (sp.scale + (1 - sp.scale) * eased) * (1 + Math.sin(t * Math.PI) * 0.08);
        } else if (i === 1) {
          ry = Math.sin(t * Math.PI * 0.8) * 8;
        } else if (i === 2) {
          extraY = -Math.sin(t * Math.PI * 0.7) * 20;
          rz = Math.sin(t * Math.PI) * 10;
        } else if (i === 3) {
          if (t < 0.15) {
            extraY = (t / 0.15) * 20;
            extraScale = sp.scale - (t / 0.15) * 0.06;
          } else {
            const t2 = (t - 0.15) / 0.85;
            extraY = 20 - t2 * 20;
            extraScale = (sp.scale - 0.06) + t2 * (1 - sp.scale + 0.06);
          }
        }

        gsap.set(card, {
          x: currentX,
          y: sp.y + extraY,
          scale: extraScale,
          rotationY: ry,
          rotationZ: rz,
          opacity: 1,
          zIndex: 10 + i,
        });
        card.classList.remove("is-landed");
      } else {
        // Sudah landed
        gsap.set(card, { x: fp.x, y: fp.y, scale: 1, rotationY: 0, rotationZ: 0, opacity: 1, zIndex: i + 1 });
        card.classList.add("is-landed");
      }
    });

    // Timeline line segments
    lineSegs.forEach((seg, i) => {
      if (!seg) return;
      const win = lineWindows[i]!;
      const segProg = gsap.utils.clamp(0, 1, gsap.utils.mapRange(win.start, win.end, 0, 1, p));
      gsap.set(seg, { scaleX: segProg, opacity: segProg, transformOrigin: "left center" });
    });

    // CV Download card
    if (cvCard) {
      const cvProg = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.88, 0.97, 0, 1, p));
      gsap.set(cvCard, { opacity: cvProg, x: (1 - cvProg) * 30 });
    }
  }

  // Initial state — semua tersembunyi
  gsap.set(headers, { opacity: 0, y: 20 });
  if (hint) gsap.set(hint, { opacity: 0 });
  if (cvCard) gsap.set(cvCard, { opacity: 0, x: 30 });
  cards.forEach((c, i) => {
    const sp = stackPositions[i]!;
    gsap.set(c, { x: sp.x, y: sp.y, scale: sp.scale, rotationY: sp.ry, opacity: 1 });
  });
  lineSegs.forEach(seg => seg && gsap.set(seg, { scaleX: 0, opacity: 0 }));

  // Subscribe ke ScrollTrigger progress
  horizonScrollState.onProgressUpdate = updateCardsByProgress;

  // Jalankan sekali dengan progress current (untuk kasus page refresh di tengah)
  if (horizonScrollState.progress > 0) {
    updateCardsByProgress(horizonScrollState.progress);
  }

  return () => {
    horizonScrollState.onProgressUpdate = null;
  };
}, []);
```

---

## 9. Layout JSX CvTimelineSlide (Struktur Baru)

```tsx
return (
  <div className="horizon-slide slide--cv" ref={slideRef}>
    {/* Ambient glow */}
    <div className="slide-background-glow glow--cyan" />

    <div className="horizon-slide-content">
      {/* Headers */}
      <p className="slide-badge cv-header-anim">// EXPERIENCE & TIMELINE</p>
      <h2 className="slide-title cv-header-anim">
        CAREER <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.7)", color: "transparent" }}>PATHWAY</span>
      </h2>
      <p className="slide-description cv-header-anim">
        A brief overview of my academic background, certifications, and achievements.
      </p>

      {/* Scroll Hint */}
      <div className="cv-scroll-hint">
        <div className="cv-hint-wheel"><div className="cv-hint-dot" /></div>
        <span className="cv-hint-text">scroll to unfold my journey</span>
        <div className="cv-hint-arrows">
          <span>↓</span><span>↓</span><span>↓</span>
        </div>
      </div>

      {/* Card Stack + Timeline Container */}
      <div className="cv-timeline-area" style={{ position: "relative", width: "100%", maxWidth: "1080px" }}>
        {/* Stack container — kartu di-absolute di sini */}
        <div className="cv-card-stack">
          {TIMELINE_DATA.map((item, idx) => (
            <div key={idx} className="cv-card" data-index={String(idx)}>
              <div className="cv-card-shimmer" />
              <div className="cv-card-connector-dot" />
              <div className="cv-card-inner">
                <div className="cv-card-meta">
                  <span className="cv-card-year">{item.year}</span>
                  <span className="cv-card-badge">{item.badge}</span>
                </div>
                <div className="cv-card-divider" />
                <h3 className="cv-card-role">{item.role}</h3>
                <p className="cv-card-institution">{item.institution}</p>
                <p className="cv-card-desc">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* 3 Timeline line segments */}
          <div ref={lineRef01} className="cv-line-seg" style={{ left: "55px" }} />
          <div ref={lineRef12} className="cv-line-seg" style={{ left: "295px" }} />
          <div ref={lineRef23} className="cv-line-seg" style={{ left: "535px" }} />
        </div>

        {/* CV Download card — terpisah, muncul paling akhir */}
        <div className="glass-card cv-download-card" style={{ marginLeft: "auto", flexShrink: 0 }}>
          {/* ... same as before */}
        </div>
      </div>
    </div>
  </div>
);
```

---

## 10. Responsive & Edge Cases

### Mobile (max-width: 968px)
- Horizontal scroll section tidak aktif di mobile (guard di GSAPEffects)
- Career Pathway mobile: layout vertikal, kartu muncul dengan IntersectionObserver stagger
- Hint tidak ditampilkan di mobile (`display: none` via media query)
- Stack container ganti ke `position: static`, kartu `position: relative` tidak `absolute`

### Edge Case: Scroll Cepat
- Gunakan `gsap.set()` (bukan `gsap.to()`) untuk semua update — tidak ada tween lag
- Semua state adalah pure function dari `progress` — tidak ada desyncing

### Edge Case: Kembali ke Slide Sebelumnya
- Ketika `globalProgress < 0.5`, semua kartu kembali ke stack secara otomatis
- `is-landed` class dihapus, shimmer mati — clean state

### Edge Case: Page Refresh Mid-Scroll
- Saat komponen mount, baca `horizonScrollState.progress` dan langsung jalankan `updateCardsByProgress`
- User tidak melihat animasi dari awal — langsung di posisi yang benar

---

## 11. Checklist Implementasi

```
[ ] lib/horizonScrollState.ts
    [ ] Tambah field: progress = 0
    [ ] Tambah field: onProgressUpdate = null

[ ] components/ui/GSAPEffects.tsx
    [ ] Dalam onUpdate ScrollTrigger: set horizonScrollState.progress
    [ ] Call horizonScrollState.onProgressUpdate(self.progress) jika ada

[ ] components/ui/CvTimelineSlide.tsx
    [ ] Hapus IntersectionObserver lama
    [ ] Tambah refs: lineRef01, lineRef12, lineRef23
    [ ] Redesign JSX: card stack layout
    [ ] Tambah scroll hint HTML
    [ ] Implementasi updateCardsByProgress()
    [ ] Subscribe ke horizonScrollState.onProgressUpdate di useEffect
    [ ] Cleanup: set onProgressUpdate = null di return

[ ] app/portfolio.css
    [ ] @property --shimmer-angle
    [ ] .cv-card (glassmorphism shell + positioned absolute)
    [ ] .cv-card-shimmer + @keyframes shimmerRotate
    [ ] .cv-card-connector-dot, .is-landed states
    [ ] .cv-card-inner, .cv-card-meta, .cv-card-year, .cv-card-badge
    [ ] .cv-card-divider, .cv-card-role, .cv-card-institution, .cv-card-desc
    [ ] .cv-card-stack (position relative container)
    [ ] .cv-line-seg (timeline segments)
    [ ] .cv-scroll-hint, .cv-hint-wheel, .cv-hint-dot
    [ ] @keyframes hintScrollBounce
    [ ] .cv-hint-arrows, .cv-hint-text
    [ ] Mobile fallback @media (max-width: 968px)
```

---

## 12. Referensi Inspirasi Visual

- **Linear.app** — scroll-indexed card emergence, smooth progress-tied animations
- **Framer.com** — staggered card stack dengan trajectory berbeda per elemen
- **Locomotive Scroll demos** — card personality gerak (tiap elemen punya karakteristik unik)
- **Shimmer border** — @property conic-gradient rotation pattern (native CSS, no JS overhead)

---

*Briefing ini ditulis untuk implementasi oleh AI coding agent.*
*Semua nilai angka (px, progress range, timing) adalah titik awal yang harus fine-tuned berdasarkan hasil visual aktual.*

# SUPER FULL PROMPT — Light/Dark Mode Optimization
## Target Model: Gemini 2.5 Pro (High)
---

## CONTEXT DAN IDENTITAS PROYEK

Kamu adalah seorang Senior Front-End Engineer yang sangat expert di Next.js 14+ (App Router), CSS Architecture, dan Design Systems. Kamu sedang mengoptimasi sebuah portofolio website milik seorang developer bernama **Bilal**, yang dibangun dengan stack berikut:

- **Framework**: Next.js 14+ dengan App Router (`app/` directory)
- **Styling**: Vanilla CSS murni (`app/portfolio.css` ≈ 7537 baris, `app/globals.css`)
- **Animasi**: GSAP 3, Lenis (smooth scroll)
- **3D/WebGL**: Three.js
- **State Management**: Zustand (`stores/themeStore.ts`, `stores/portalStore.ts`, dll.)
- **UI Icons**: Ionicons (Web Components via CDN)
- **Fonts**: Orbitron, Rajdhani, Roboto Mono, Syne, JetBrains Mono (semua dari Google Fonts via `<link>` tag di `layout.tsx`)
- **Language**: TypeScript + TSX

---

## STRUKTUR PROYEK LENGKAP (FOLDER TREE)

```
lalsm/
├── app/
│   ├── api/ai/chat/route.ts          # AI Chatbot API route (Gemini)
│   ├── globals.css                   # Minimal CSS + Tailwind base import
│   ├── layout.tsx                    # Root layout, metadata, font links, theme-init script
│   ├── page.tsx                      # Halaman utama, menyusun semua sections
│   └── portfolio.css                 # ⭐ FILE CSS UTAMA (7537 baris, semua styling ada di sini)
│
├── components/ui/                    # Semua komponen UI (40 file TSX)
│   ├── AboutSection.tsx              # Section "What I Build" - 3 skill cards horizontal scroll
│   ├── AchievementsSection.tsx       # Marquee infinite scroll cards sertifikat
│   ├── AiChatOverlay.tsx             # Chatbot AI sidebar panel (Gemini API)
│   ├── AtmosphericWave.tsx           # Animasi gelombang latar belakang
│   ├── BackgroundPixelStars.tsx      # Bintang pixel animasi di latar belakang
│   ├── CardStackInteractions.tsx     # Interaksi tumpukan kartu
│   ├── ClientShell.tsx               # Wrapper client-side (Lenis, cursor, dll.)
│   ├── ContactSection.tsx            # Form kontak dengan efek HUD
│   ├── CreativeBlob.tsx              # Blob 3D WebGL via Three.js
│   ├── CustomCursor.tsx              # Custom cursor dot + outline
│   ├── CvTimelineSlide.tsx           # Slide Career Pathway di HorizonShowcase
│   ├── DynamicConduit.tsx            # Komponen koneksi visual antar phase
│   ├── FilmScene.tsx                 # 3D Film reel scene untuk Projects
│   ├── FilmStripCard.tsx             # Card dalam film strip format
│   ├── Footer.tsx                    # Mega footer dengan animasi besar
│   ├── GlobalInteractions.tsx        # Event delegation global (klik modal, tilt card, spotlight)
│   ├── GSAPEffects.tsx               # GSAP scroll-triggered animations global
│   ├── HeroSection.tsx               # Landing hero dengan glitch text + blob
│   ├── HolographicCard.tsx           # Kartu info holografik (kanan panel How I Work)
│   ├── HorizonShowcase.tsx           # Horizontal scroll showcase (slider utama)
│   ├── InfinityNodeDiagram.tsx       # Diagram node jaringan SVG animasi
│   ├── InteractiveProcessItem.tsx    # Teks phase di "How I Work" + animasi karakter huruf
│   ├── LenisSetup.tsx                # Setup Lenis smooth scroll
│   ├── Navbar.tsx                    # Navbar + burger menu mobile + theme toggle
│   ├── Preloader.tsx                 # Loading screen awal
│   ├── ProcessDashboard.tsx          # Container "How I Work" section
│   ├── ProjectEstimatorSlide.tsx     # Slide kalkulator estimasi proyek
│   ├── ProjectModal.tsx              # Modal popup detail project/achievement
│   ├── ProjectsSection.tsx           # Cylindrical 3D project carousel
│   ├── ProgressLoader.tsx            # Progress bar loader
│   ├── ScrollHint.tsx                # Petunjuk scroll (SCROLL / PAN)
│   ├── SwiperInit.tsx                # Inisialisasi Swiper.js (jika digunakan)
│   ├── TechGraphSlide.tsx            # Slide grafik teknologi
│   ├── ThemeSwitcher.tsx             # Tombol toggle theme (terintegrasi Zustand)
│   ├── ThreeBackground.tsx           # Background Three.js
│   ├── TubesCursor.tsx               # Cursor WebGL berbentuk tube/neon
│   ├── WireframePortal.tsx           # Portal wireframe animasi
│   ├── WorkflowKinetic.tsx           # Workflow kinetic typography
│   └── WorkflowSection.tsx           # Section workflow container
│
├── stores/
│   ├── chatStore.ts                  # State AI chat messages
│   ├── index.ts                      # Re-export semua stores
│   ├── portalStore.ts                # State portal/slide aktif
│   ├── scrollStore.ts                # State scroll progress
│   └── themeStore.ts                 # ⭐ State tema (light/dark) dengan Zustand persist
│
├── lib/
│   └── horizonScrollState.ts         # State GSAP horizontal scroll
│
├── public/
│   ├── icons/                        # SVG icons (night-mode.svg, dll.)
│   ├── images/                       # Gambar proyek & sertifikat
│   └── fonts/                        # (jika ada font lokal)
│
└── types/                            # TypeScript type declarations
```

---

## SISTEM TEMA SAAT INI — ANALISA MENDALAM

### A. Mekanisme Toggling Tema

**File: `stores/themeStore.ts`**
Tema disimpan di Zustand dengan `persist` middleware (localStorage key: `"theme-storage"`):
```typescript
const AvailableThemes: Theme[] = [
  { type: 'light', color: '#0690d4' },  // Light mode
  { type: 'dark',  color: '#111' }      // Dark mode
];
```
Fungsi `nextTheme()` melakukan cycle antara theme yang tersedia.

**File: `app/layout.tsx`**
Ada inline script yang membaca localStorage dan SET attribute `data-theme` di `<html>` element SEBELUM halaman render (mencegah Flash Of Unstyled Content / FOUT):
```javascript
(function() {
  var theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();
```

> ⚠️ **MASALAH KRITIS #1**: Ada DUALISME SISTEM TEMA:
> - `Navbar.tsx` menggunakan state `theme` lokal (`useState`) dan `document.documentElement.setAttribute('data-theme', ...)` secara terpisah
> - `ThemeSwitcher.tsx` menggunakan `useThemeStore` dari Zustand
> - **Keduanya tidak tersinkronisasi satu sama lain!** Jika user klik toggle di Navbar, ThemeSwitcher tidak tahu dan sebaliknya. Ini menyebabkan state yang inkonsisten.

**File: `app/portfolio.css`** — Selector Utama:
```css
html { background-color: #050505; transition: background-color 0.4s ease; }
html[data-theme="light"] { background-color: #EAEAEF; }
```

Semua override light mode menggunakan pattern `html[data-theme="light"] .class-name { ... !important; }`.

**File: `components/ui/ThemeSwitcher.tsx`**
Komponen ini **TIDAK** memperbarui `document.documentElement.setAttribute('data-theme', ...)`. ThemeSwitcher hanya mengupdate Zustand store. Perlu ada `useEffect` yang menyinkronkan state Zustand ke attribute `data-theme` di `<html>`.

---

### B. CSS Variables (Design Tokens) — Konfigurasi Dark Mode (Default)

```css
/* app/portfolio.css — :root (dark mode default) */
:root {
  --bg-color: #050505;
  --text-main: #e0e0e0;
  --text-muted: #8892b0;
  --accent-cyan: #00f3ff;
  --accent-purple: #bc13fe;
  --accent-gold: #ffd700;
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.06);
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Rajdhani', sans-serif;
  --font-code: 'Roboto Mono', monospace;
  --concave-center: rgba(15, 12, 30, 0.25);
  --concave-edge: rgba(5, 5, 5, 0.95);
  --concave-shadow: rgba(0, 0, 0, 0.95);
}
```

> ⚠️ **MASALAH KRITIS #2**: TIDAK ADA `html[data-theme="light"] :root { ... }` yang meng-override CSS variables untuk light mode. Semua override light mode dilakukan dengan selector langsung dan `!important` secara manual, satu per satu. Ini sangat tidak scalable dan memerlukan ratusan baris `!important`.

---

### C. Komponen & Section yang Memerlukan Light Mode Override — Status Audit

| No | Komponen / Section | Class CSS Kunci | Status Light Mode |
|----|--------------------|-----------------|-------------------|
| 1 | **Navbar** | `.navbar`, `.nav-link`, `.logo`, `.mobile-menu`, `.menu-toggle` | ✅ Partial (ada tapi mungkin ada yang terlewat) |
| 2 | **HeroSection** | `.glitch-text`, `.hero-content`, `.stats-badge`, `.btn-group`, `.scroll-indicator`, `.image-blob`, `.parallax-text` | ✅ Partial |
| 3 | **AboutSection** (What I Build) | `.about-spatial-card`, `.about-spatial-badge`, `.about-spatial-terminal`, `.about-spatial-eyebrow-card`, `.scroll-indicator-arrow` | ✅ Partial |
| 4 | **ProcessDashboard** (How I Work) | `.lab-terminal`, `.terminal-title`, `.readout-*`, `.btn-terminal`, `.process-item-text`, `.process-item-container`, `.process-hover-hint`, `.process-hint-mobile`, `.process-hint-desktop`, `.interactive-info-card`, `.holographic-card`, `.node-network-box`, `.connector-line-glowing`, `.svg-connector-canvas` | ⚠️ Partial — Banyak sub-element belum ter-cover |
| 5 | **HorizonShowcase** (Horizontal Slider) | `.horizon-container`, `.horizon-slide`, `.kinetic-hero-title`, `.text-hollow`, `.slide-title`, `.slide-badge`, `.slide-description`, `.horizon-grid-backdrop`, `.scroll-drag-hint` | ⚠️ Partial |
| 6 | **Career Pathway Slide** | `.slide--career-pathway`, `.career-card`, `.career-card-title`, `.career-card-desc`, `.career-title-solid`, `.career-title-outline`, `.career-subtitle`, `.career-dot`, `.career-progress-line`, `.career-grid-overlay`, `.cv-mobile-card`, `.cv-mobile-sticky-header`, `.cv-mobile-cards-rail`, `.cv-mobile-download-card` | ✅ Desktop covered, ❌ **Mobile layout BELUM ada override** |
| 7 | **ProjectsSection** (3D Cylinder) | `.project-card`, `.project-hud-instruction`, `.project-loop-bar-*`, `.film-scene`, `.film-strip-card`, `.project-title-overlay`, `.project-cylinder-wrap` | ⚠️ Partial |
| 8 | **ProjectModal** (Popup) | `.modal-backdrop`, `.modal-content-card`, `.modal-close-btn`, `.modal-title`, `.modal-desc`, `.modal-img-gradient`, `.tech-badge`, `.modal-eyebrow` | ✅ Mostly covered |
| 9 | **AchievementsSection** | `.marquee-card`, `.marquee-card-title`, `.marquee-card-tag`, `.marquee-card-btn`, `.ach-marquee-section` | ✅ Mostly covered |
| 10 | **ContactSection** | `.glass-card`, `.hud-input-group`, `.focus-border`, `.hud-form-tag`, `.hud-divider`, `.hud-corner`, `.contact-info-row`, `.contact-info-icon` | ✅ Mostly covered |
| 11 | **AiChatOverlay** (Chatbot Sidebar) | `.ai-chat-sidebar`, `.ai-chat-header`, `.ai-chat-messages`, `.ai-chat-input-area`, `.ai-chat-message-bubble`, `.ai-chat-bg-pattern`, `.ai-chat-bg-shapes`, `.ai-chat-typing-cursor` | ❌ **SAMA SEKALI BELUM ADA OVERRIDE LIGHT MODE** |
| 12 | **Footer** | `.mega-footer`, `.mega-link`, `.footer-link`, `.time-display`, `.footer-grid-bg` | ✅ Mostly covered |
| 13 | **Preloader** | `.preloader`, `.loading-bar-fill` | ✅ Basic covered |
| 14 | **BackgroundPixelStars** | Canvas element (inline styles dari JS) | ❌ **Warna bintang masih gelap di light mode** |
| 15 | **ThreeBackground** / **CreativeBlob** | Canvas Three.js (warna dari JS) | ❌ **Warna Three.js scene tidak berubah di light mode** |
| 16 | **ScrollHint** | `.scroll-hint` div + `ion-icon` + `span` | ❌ **Tidak ada light mode override** |
| 17 | **CustomCursor** | `.cursor-dot`, `.cursor-outline` | ✅ Covered |
| 18 | **InfinityNodeDiagram** | SVG inline (warna dari props) | ⚠️ Bergantung pada warna yang dipassing dari parent |
| 19 | **DynamicConduit** | SVG animasi koneksi | ⚠️ Mungkin kurang kontras di light mode |
| 20 | **Scroll Progress Bar** | `.scroll-progress-bar` | ✅ Covered |
| 21 | **Mobile Menu** | `.mobile-menu-overlay`, `.mobile-nav-link`, `.mobile-menu-close` | ❌ **Belum ada override khusus untuk mobile menu di light mode** |
| 22 | **Project Estimator Slide** | `.project-estimator-*`, form elements | ❌ **Belum ada override** |
| 23 | **TechGraph Slide** | `.tech-graph-*`, SVG nodes | ❌ **Belum ada override** |
| 24 | **Process Item Animations** | Inline styles dari GSAP (textShadow, background gradients) | ❌ **Animasi karakter huruf masih menggunakan hardcoded dark colors** |

---

## MASALAH-MASALAH SPESIFIK YANG HARUS DIPERBAIKI

### PROBLEM 1 — Dualisme State Tema (Prioritas: 🔴 CRITICAL)
**File**: `components/ui/Navbar.tsx` + `components/ui/ThemeSwitcher.tsx` + `stores/themeStore.ts`

Saat ini ada DUA sistem tema yang tidak saling terhubung:
1. **Navbar.tsx**: Punya state `useState('dark')` sendiri, dan memanggil `document.documentElement.setAttribute('data-theme', nextTheme)` langsung.
2. **ThemeSwitcher.tsx**: Menggunakan `useThemeStore()` dari Zustand, tapi **tidak memanggil** `document.documentElement.setAttribute(...)`.

**Solusi yang diharapkan**:
- Hapus semua local state tema di `Navbar.tsx`
- Navbar harus menggunakan `useThemeStore` yang sama
- `ThemeSwitcher.tsx` (atau `themeStore.ts` sendiri) harus menyinkronkan `data-theme` attribute setiap kali state berubah via `useEffect`
- Layout script di `layout.tsx` harus membaca dari key yang sama dengan yang Zustand `persist` gunakan (`"theme-storage"`)

### PROBLEM 2 — Tidak Ada CSS Custom Property Override untuk Light Mode (Prioritas: 🔴 CRITICAL)
**File**: `app/portfolio.css`

CSS variables di `:root {}` tidak di-override untuk light mode. Seluruh sistem bergantung pada ratusan `!important` per-selector. Ini membuat code tidak maintainable dan rawan bug.

**Solusi yang diharapkan**:
Tambahkan block CSS variables khusus light mode:
```css
html[data-theme="light"] {
  --bg-color: #EAEAEF;
  --text-main: #1a1a2e;
  --text-muted: #555577;
  --accent-cyan: #007acc;           /* Lebih gelap agar kontras di bg terang */
  --accent-purple: #8a6ab0;
  --accent-gold: #b58900;           /* Muted gold untuk light bg */
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(0, 0, 0, 0.08);
  --concave-center: rgba(220, 220, 230, 0.4);
  --concave-edge: rgba(234, 234, 239, 0.98);
  --concave-shadow: rgba(0, 0, 0, 0.15);
}
```

### PROBLEM 3 — AiChatOverlay Tanpa Light Mode Support (Prioritas: 🟠 HIGH)
**File**: `components/ui/AiChatOverlay.tsx`, `app/portfolio.css`

Sidebar AI chat sepenuhnya menggunakan hardcoded dark colors (gradients ungu-biru gelap, background gelap, dsb). Saat light mode, sidebar ini terlihat sangat kontras dan aneh.

**Solusi yang diharapkan**:
Tambahkan CSS block `html[data-theme="light"] .ai-chat-sidebar { ... }` yang mencakup:
- Background sidebar: `rgba(245, 245, 250, 0.96)` dengan `backdrop-filter`
- Header teks: `#1a1a2e`
- Message bubbles user: light blue/teal soft
- Message bubbles AI: white/off-white
- Input area: border bottom light
- SVG background shapes: ubah opacity menjadi lebih rendah atau ubah warna ke soft purples/teals yang cocok untuk light bg
- Typing cursor: warna gelap

### PROBLEM 4 — BackgroundPixelStars Warna Hardcoded (Prioritas: 🟠 HIGH)
**File**: `components/ui/BackgroundPixelStars.tsx`

Bintang-bintang pixel dibuat dengan Canvas API dan warnanya hardcoded di JavaScript (kemungkinan besar cyan/white yang terlihat baik di dark mode tapi kurang kontras/mencolok di light mode karena background sudah terang).

**Solusi yang diharapkan**:
- Tambahkan prop atau gunakan `useThemeStore` di dalam komponen
- Ketika light mode, ubah warna bintang menjadi nuansa yang lebih gelap (misal: deep indigo, slate, dusty blue) dengan opacity yang disesuaikan
- Atau, reduce opacity bintang secara signifikan di light mode

### PROBLEM 5 — Three.js Scene Tidak Responsif Terhadap Tema (Prioritas: 🟡 MEDIUM)
**File**: `components/ui/ThreeBackground.tsx`, `components/ui/CreativeBlob.tsx`

Scene Three.js (background, blob) menggunakan warna yang di-set secara programatik di JavaScript. Perubahan `data-theme` tidak mempengaruhi warna di dalam scene WebGL.

**Solusi yang diharapkan**:
- Gunakan `useThemeStore` di komponen Three.js
- Ketika tema berubah, update material colors menggunakan Three.js material API (misal: `material.color.set(newColor)`)
- Background scene renderer juga perlu di-update: `renderer.setClearColor(lightBg)` untuk light mode

### PROBLEM 6 — Mobile Menu Overlay Tanpa Override (Prioritas: 🟡 MEDIUM)
**File**: `components/ui/Navbar.tsx`, `app/portfolio.css`

Mobile burger menu overlay menggunakan background gelap semi-transparan. Di light mode, ini mungkin terlalu kontras atau tidak sesuai dengan nuansa light.

**Solusi yang diharapkan**:
Cari class CSS untuk mobile menu overlay dan tambahkan override:
- Background: `rgba(234, 234, 239, 0.96)` dengan `backdrop-filter: blur(20px)`
- Link teks: `#1a1a2e`
- Hamburger icon: warna gelap

### PROBLEM 7 — Hardcoded Colors di InteractiveProcessItem Animations (Prioritas: 🟡 MEDIUM)
**File**: `components/ui/InteractiveProcessItem.tsx`

Semua animasi GSAP karakter huruf (DISCOVERY, DESIGN, DEVELOPMENT, DEPLOYMENT) menggunakan `textShadow` dengan warna neon hardcoded (cyan, purple, gold, orange) dan `backgroundImage` dengan gradient putih-ke-warna. Di light mode, beberapa efek ini terlihat terlalu "burned" atau tidak kontras.

**Solusi yang diharapkan**:
- Gunakan `useThemeStore` untuk mendapatkan tema saat ini
- Sesuaikan nilai `textShadow` intensity dan `backgroundImage` berdasarkan tema
- Di light mode, kurangi `blur` pada shadow, ubah warna putih ke warna yang sesuai latar terang

### PROBLEM 8 — Project Estimator Slide & TechGraph Slide Tanpa Override (Prioritas: 🟡 MEDIUM)
**File**: `components/ui/ProjectEstimatorSlide.tsx`, `components/ui/TechGraphSlide.tsx`, `app/portfolio.css`

Dua slide ini di `HorizonShowcase` tidak memiliki light mode CSS override sama sekali.

**Solusi yang diharapkan**:
Audit class-class CSS yang digunakan di kedua file tersebut, lalu tambahkan block `html[data-theme="light"]` untuk setiap elemen yang menggunakan hardcoded dark colors.

### PROBLEM 9 — ScrollHint Tidak Ada Override (Prioritas: 🟢 LOW)
**File**: `components/ui/ScrollHint.tsx`, `app/portfolio.css`

Teks SCROLL/PAN dan icon-nya mungkin kurang terlihat di light mode.

### PROBLEM 10 — InfinityNodeDiagram SVG Colors (Prioritas: 🟢 LOW)
**File**: `components/ui/InfinityNodeDiagram.tsx`

Node diagram SVG kemungkinan menggunakan warna stroke/fill yang hardcoded dalam JSX sebagai inline styles. Perlu diperiksa dan disesuaikan untuk light mode.

---

## SPESIFIKASI WARNA LIGHT MODE (Design Token Reference)

Gunakan palet warna ini secara KONSISTEN di seluruh implementasi:

```
Background Utama:     #EAEAEF  (abu-abu lavender soft)
Background Card:      rgba(255, 255, 255, 0.88) / rgba(250, 250, 252, 0.95)
Text Utama:           #1a1a2e  (near-black dengan nuansa biru gelap)
Text Secondary:       #444444
Text Muted:           #666688  (abu-abu dengan sedikit ungu)
Accent Cyan:          #007acc  atau #00a8cc (lebih gelap dari #00f3ff agar kontras)
Accent Purple:        #8a6ab0  (muted purple, sudah digunakan)
Accent Gold:          #b58900  (muted amber/gold)
Glass Background:     rgba(255, 255, 255, 0.72)
Glass Border:         rgba(0, 0, 0, 0.07) sampai rgba(0, 0, 0, 0.10)
Shadow:               rgba(0, 0, 0, 0.04) sampai rgba(0, 0, 0, 0.15)
```

---

## TUGAS IMPLEMENTASI YANG HARUS DILAKUKAN (ORDERED BY PRIORITY)

### FASE 1 — Foundation Fix (Kerjakan PERTAMA)

**TASK 1.1 — Sinkronisasi State Tema**
Modifikasi `stores/themeStore.ts` untuk secara otomatis memperbarui `data-theme` attribute setiap kali state berubah. Implementasi menggunakan Zustand `subscribe` atau `useEffect` di level wrapper.

**TASK 1.2 — Refactor Navbar Theme Logic**
Hapus local `useState('dark')` dan semua referensi `toggleTheme` lokal di `Navbar.tsx`. Gunakan `useThemeStore` saja. Pastikan toggle di Navbar dan ThemeSwitcher saling terkoordinasi.

**TASK 1.3 — Tambahkan CSS Variable Override**
Di bagian paling atas block light mode di `portfolio.css` (sekitar line 6422), tambahkan override CSS variables:
```css
html[data-theme="light"] {
  /* semua variable yang berubah */
}
```

### FASE 2 — Component-Specific Fixes

**TASK 2.1 — AiChatOverlay Light Mode CSS**
Tambahkan comprehensive CSS block untuk AI chat sidebar di light mode. Harus mencakup semua sub-element: header, messages container, setiap jenis message bubble, input area, send button, clear button, dan background SVG shapes.

**TASK 2.2 — BackgroundPixelStars Theme Awareness**
Modifikasi `BackgroundPixelStars.tsx` untuk subscribe ke `useThemeStore` dan mengubah warna bintang pixel berdasarkan tema aktif. Gunakan `requestAnimationFrame` atau clear-redraw canvas saat tema berubah.

**TASK 2.3 — Three.js Theme Integration**
Modifikasi `ThreeBackground.tsx` dan `CreativeBlob.tsx` untuk menggunakan `useThemeStore`. Update `renderer.setClearColor()`, material colors, dan ambient/directional light intensities saat tema berubah.

**TASK 2.4 — Mobile Menu Light Mode**
Tambahkan CSS override untuk mobile menu overlay, nav links, dan hamburger icon di light mode.

**TASK 2.5 — Project Estimator + TechGraph Slides**
Audit dan tambahkan CSS override untuk kedua slide ini.

### FASE 3 — Polish & Edge Cases

**TASK 3.1 — InteractiveProcessItem Animation Colors**
Kondisionalkan warna animasi GSAP berdasarkan tema aktif.

**TASK 3.2 — Career Pathway Mobile Cards**
Tambahkan CSS override untuk `.cv-mobile-card`, `.cv-mobile-sticky-header`, dan `.cv-mobile-download-card` di light mode (saat ini hanya ada untuk desktop career cards).

**TASK 3.3 — InfinityNodeDiagram + DynamicConduit**
Audit warna SVG dan tambahkan dukungan light mode.

**TASK 3.4 — ScrollHint**
Tambahkan light mode styling untuk komponen ini.

**TASK 3.5 — Transition Smoothness**
Pastikan semua elemen yang berubah antar tema memiliki CSS `transition` yang smooth (minimal `0.3s ease`), KECUALI canvas elements dan WebGL yang memang tidak bisa di-transition.

---

## ATURAN DAN CONSTRAINT YANG HARUS DIPATUHI

1. **JANGAN gunakan Tailwind CSS** — seluruh styling harus dalam Vanilla CSS di `portfolio.css` atau `globals.css`
2. **JANGAN hapus atau modifikasi** struktur JSX komponen yang sudah ada kecuali benar-benar perlu untuk menambahkan class conditional
3. **WAJIB gunakan `html[data-theme="light"]`** sebagai parent selector, bukan `@media (prefers-color-scheme: light)` — karena site ini menggunakan manual toggle bukan OS preference
4. **Hindari menambah `!important` baru** sebisa mungkin — idealnya hanya gunakan specificity yang lebih tinggi. Namun, untuk override existing dark mode rules yang sudah ada, `!important` masih dapat digunakan
5. **Pertahankan semua animasi GSAP yang sudah ada** — jangan remove atau simplify animasi yang sudah ada
6. **Pastikan tidak ada Flash Of Incorrect Theme (FOIT)** — script inline di `layout.tsx` harus tetap ada dan berjalan dengan benar
7. **Test responsiveness** — setiap perubahan harus tetap bekerja di breakpoint mobile (`max-width: 768px`) dan desktop (`min-width: 969px`)
8. **Perhatikan WCAG contrast ratio** — di light mode, teks harus memiliki contrast ratio minimal 4.5:1 terhadap background

---

## FORMAT OUTPUT YANG DIHARAPKAN

Saat menjawab atau mengimplementasikan, berikan:

1. **Untuk setiap TASK**: Sebutkan file yang dimodifikasi, tuliskan kode lengkap perubahannya (bukan snippet parsial), dan berikan penjelasan singkat mengapa perubahan itu diperlukan
2. **CSS baru**: Tulis dalam blok yang terorganisir dan berikan komentar section yang jelas
3. **TypeScript/TSX baru**: Ikuti pola kode yang sudah ada di file tersebut (tidak perlu menambah library baru)
4. **Prioritaskan implementasi** dari Fase 1 → Fase 2 → Fase 3, dan beri tahu jika ada dependency antar task

---

## INFORMASI TAMBAHAN

- Untuk melihat isi file secara lengkap, model dapat meminta "tampilkan isi file X" secara eksplisit
- File CSS utama ada di `e:\projek kecil-kecilan\lalsm\app\portfolio.css`
- Light mode block dimulai sekitar line **6417** di `portfolio.css` dan terus ke bawah
- Saat ini ada sekitar **175+ selector** dengan prefix `html[data-theme="light"]` — namun masih banyak yang belum tercakup sesuai audit di atas
- `ThemeSwitcher.tsx` dikontrol oleh `useThemeStore` dari Zustand dan muncul di `ClientShell.tsx`
- `Navbar.tsx` memiliki toggle tema sendiri yang terpisah — ini adalah sumber bug utama inkonsistensi tema

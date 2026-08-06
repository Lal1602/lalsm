# Responsive Fix — Portfolio Website
## Super Prompt for Gemini 3.1 Pro (High) — Execution Briefing v1.0

> **Tujuan:** Memperbaiki responsivitas seluruh section portfolio agar tampil optimal
> di semua ukuran layar: **Desktop (≥1024px) | Tablet (768px–1023px) | Mobile (≤767px) | Small Mobile (≤480px)**.
>
> **File target utama:** `app/portfolio.css`
> **File komponen terkait:** lihat referensi per-section di bawah.
> **JANGAN ubah** `ClientShell.tsx`, `GSAPEffects.tsx`, `LenisSetup.tsx`, `ThreeBackground.tsx`.

---

## Konteks Teknis Kritis

- **Breakpoints yang SUDAH ADA** (jangan duplikasi, tambahkan di dalam yang sudah ada):
  - `@media (max-width: 968px)` — tablet/mobile awal, di line ±4582 (horizon) dan 1325 (about)
  - `@media (max-width: 768px)` — main mobile block, di line ±4806
  - `@media (max-width: 480px)` — small phone block, di line ±5184
  - `@media (max-width: 380px)` — very small, di line ±5523
- **CSS Variables** yang aman dipakai: `--accent-cyan`, `--accent-purple`, `--text-main`, `--text-muted`, `--font-display`, `--font-body`, `--font-code`
- **Jangan gunakan** `!important` secara berlebihan — hanya jika override nilai yang di-set dengan `!important` sebelumnya.

---

## 1. ABOUT SECTION

**Komponen:** `components/ui/AboutSection.tsx`
**CSS class utama:** `.about-spatial-section`, `.about-spatial-label`, `.about-cards-wrapper`, `.about-spatial-card`, `.about-spatial-content`, `.about-spatial-badge`, `.about-spatial-terminal`, `.about-spatial-heading`, `.about-spatial-cue`

### Masalah yang harus diperbaiki:

**Tablet (768px–968px):**
- `.about-cards-wrapper`: ubah dari `flex-direction: row` ke `flex-direction: column`, kartu jadi vertikal.
- `.about-spatial-card`: `min-height: 240px`, `width: 100%`, pastikan `opacity: 1`, `filter: none` (hapus greyscale idle state agar terlihat di mobile).
- `.about-spatial-card-desc` dan `.about-spatial-terminal`: set `opacity: 1 !important; transform: none !important` — agar konten yang normally "hidden until hover" langsung terlihat.
- `.about-spatial-heading`: font-size `clamp(2rem, 6vw, 3rem)`.
- `.about-spatial-cue`: `display: none`.
- Watermark number (`.about-spatial-watermark`): `font-size: 80px; bottom: -5px; right: 5px`.

**Mobile (≤767px):**
- `.about-spatial-section`: `padding: 60px 5% 70px`, `gap: 28px`.
- `.about-spatial-card`: `min-height: auto; padding-bottom: 20px`.
- `.about-spatial-heading`: font-size `clamp(1.8rem, 8vw, 2.6rem)`.
- `.about-spatial-badges`: `gap: 6px`.
- `.about-spatial-badge`: `font-size: 0.6rem; padding: 4px 9px`.

**Small Mobile (≤480px):**
- `.about-cards-wrapper`: `gap: 12px`.
- `.about-spatial-card--cyan`, `--purple`, `--green`: pastikan `border-top` tetap terlihat (tidak dipotong overflow).
- `.about-spatial-badge.highlight`: `background: rgba(255,255,255,0.07)`.

---

## 2. HOW I WORK SECTION (Process Dashboard)

**Komponen:** `components/ui/ProcessDashboard.tsx`, `components/ui/InteractiveProcessItem.tsx`
**CSS class utama:** `.process-section-container`, `.process-grid`, `.process-list-wrapper`, `.process-item-container`, `.process-item-trigger`, `.process-item-num`, `.process-item-text`, `.process-item-pop-badge`, `.process-hover-hint`

### Masalah yang harus diperbaiki:

**Tablet (768px–1024px) — sudah ada `@media (max-width: 1024px)` di line ~1415:**
- `.process-grid`: pastikan sudah di-set ke `grid-template-columns: 1fr` (satu kolom).
- `.process-item-text`: `font-size: clamp(1.8rem, 5vw, 3rem)`.
- `.process-item-container`: `padding: 20px 0`.
- `.process-item-pop-badge`: posisi badge yang muncul saat hover — set `top: -60px` atau gunakan `position: absolute; right: 0; top: -50px` agar tidak keluar viewport di tablet.

**Mobile (≤767px):**
- `.process-section-container`: `padding: 60px 5% 80px`.
- `.process-item-num`: `font-size: 0.75rem; width: 36px`.
- `.process-item-text`: `font-size: clamp(1.5rem, 7vw, 2.5rem)`.
- `.process-hover-hint`: `display: none` — hint tidak relevan di mobile (tidak ada hover).
- `.process-item-pop-badge`: `display: none` — badge terlalu besar untuk mobile, sembunyikan.
- `.process-item-trigger`: `padding: 16px 0`.

**Small Mobile (≤480px):**
- `.process-item-text`: `font-size: clamp(1.3rem, 8.5vw, 2rem)`.
- `.process-item-num`: `display: none` — nomor bisa disembunyikan untuk hemat ruang di layar sangat kecil.

---

## 3. CREATIVE PLAYGROUND & CAREER PATHWAY SECTION

**Komponen:** `components/ui/HorizonShowcase.tsx` (horizontal scroll container)
**CSS class utama:** `.horizon-container`, `.horizon-wrapper`, `.horizon-slide`, `.horizon-slide-content`, `.slide--kinetic`, `.kinetic-hero-title`, `.glitch-cards-wrapper`, `.glitch-card`, `.lab-grid-layout`, `CvTimelineSlide` (class: `.cv-timeline-slide`, `.cv-timeline-track`, `.cv-card`)

### Masalah yang harus diperbaiki:

**Pada `@media (max-width: 968px)` (line ~4582) yang sudah ada — TAMBAHKAN di dalamnya:**

**Creative Playground (`.lab-grid-layout`, `.glitch-cards-wrapper`):**
- `.lab-grid-layout`: sudah ada, pastikan `grid-template-columns: 1fr; gap: 24px` dan `padding: 0`.
- `.glitch-cards-wrapper`: `flex-direction: column; gap: 20px`.
- `.glitch-card`: `width: 100% !important; min-height: 200px`.
- `.kinetic-hero-title` (judul besar "CREATIVE PLAYGROUND"): `font-size: clamp(2rem, 10vw, 5rem) !important; white-space: normal !important; line-height: 1.1`.

**Career Pathway (`.cv-slide-wrapper`, `.cv-timeline-track`, `.cv-card`):**
> **Penting:** Career Pathway menggunakan animasi horizontal scroll INTERNAL di dalam `.horizon-slide`. Di mobile, ubah menjadi **vertikal scroll biasa**.
- `.cv-slide-wrapper` (wrapper horizontal scroll dalam slide): `flex-direction: column !important; overflow-x: visible !important; overflow-y: visible !important; width: 100% !important; transform: none !important`.
- `.cv-card` (setiap kartu riwayat): `width: 100% !important; max-width: 100% !important; margin-bottom: 16px`.
- Semua scroll-trigger GSAP pada `CvTimelineSlide.tsx` sudah di-kill di `useEffect` cleanup — tidak perlu diubah di TSX.
- `.cv-section-label` (teks "CAREER PATHWAY"): padding-bottom kurangi: `padding-bottom: 24px !important`.

**Mobile (≤767px) — tambahkan di `@media (max-width: 768px)` yang sudah ada:**
- `.horizon-slide`: `min-height: 70vh !important; padding: 60px 5% !important`.
- `.kinetic-hero-title`: `font-size: clamp(1.6rem, 9vw, 3.5rem) !important`.
- `.glitch-card`: `padding: 20px 16px`.

---

## 4. PROJECTS SECTION

**Komponen:** `components/ui/ProjectsSection.tsx`, `components/ui/ProjectModal.tsx`
**CSS class utama:** `.project-slider`, `.project-float-wrapper`, `.project-card`, `.project-title`, `.project-desc`, `.btn-quick-view`, `.card-img-wrapper`, `.project-detail-modal`, `.modal-content-card`, `.modal-body`, `.modal-image-wrap`, `.modal-info`

### Masalah yang harus diperbaiki:

**Tablet (768px–968px) — tambahkan ke `@media (max-width: 968px)` yang ada:**
- `.project-slider .swiper-slide`: `width: 280px !important`.
- `.project-card`: `height: 340px`.
- `.project-title`: `font-size: 1rem`.

**Mobile (≤767px) — dalam `@media (max-width: 768px)` yang sudah ada:**
- `.project-slider .swiper-slide`: `width: calc(100vw - 48px) !important; max-width: 300px !important`.
- `.project-card`: `height: 300px; border-radius: 14px`.
- `.project-float-wrapper`: matikan animasi float agar tidak mengganggu scroll: `animation: none !important`.
- `.btn-quick-view`: `opacity: 1 !important; transform: none !important` — agar tombol selalu terlihat di mobile (tidak perlu hover untuk munculkan tombol).
- **Modal responsive** (perbaikan `.project-detail-modal`):
  - `.modal-content-card`: `border-radius: 16px; max-height: 90vh`.
  - `.modal-body`: `grid-template-columns: 1fr; overflow-y: auto`.
  - `.modal-image-wrap`: `height: 180px; min-height: 180px`.
  - `.modal-info`: `padding: 20px 16px 24px`.
  - `.modal-close-btn`: `top: 10px; right: 10px`.

**Small Mobile (≤480px):**
- `.project-slider .swiper-slide`: `width: calc(100vw - 32px) !important`.
- `.project-card`: `height: 260px`.
- `.project-title`: `font-size: 0.9rem`.

---

## 5. ACHIEVEMENTS SECTION

**Komponen:** `components/ui/AchievementsSection.tsx`
**CSS class utama:** `.achievements-section`, `.achievement-card`, `.achievements-marquee-wrapper`, `.marquee-track`, `.marquee-card`, `.interactive-info-card`, `.interactive-info-grid`

### Masalah yang harus diperbaiki:

**Tablet (768px–968px) — tambahkan ke `@media (max-width: 968px)` yang ada:**
- `.achievements-marquee-wrapper`: `padding: 20px 0`.
- `.marquee-card`: `width: 220px; min-width: 220px; padding: 16px 18px`.
- `.interactive-info-grid` (jika ada grid 2-kolom): ubah ke `grid-template-columns: 1fr`.

**Mobile (≤767px) — dalam `@media (max-width: 768px)` yang sudah ada:**
- `.achievements-marquee-wrapper`: `overflow: hidden` — pastikan tidak ada horizontal overflow.
- `.marquee-card`: `width: 180px; min-width: 180px; padding: 14px 14px; border-radius: 12px`.
- `.marquee-card h3`, `.marquee-card-title`: `font-size: 0.85rem`.
- `.achievement-card`: `padding: 20px 16px`.
- Stop marquee hover-pause behavior di mobile (tidak ada hover): `.achievements-marquee-wrapper:has(.marquee-card:hover) .marquee-track` — tidak perlu diubah CSS-nya karena `:has(:hover)` tidak trigger di touch device.
- **Penting:** tambahkan `touch-action: pan-y` pada `.marquee-track` agar swipe vertikal tidak terhambat.

**Small Mobile (≤480px):**
- `.marquee-card`: `width: 155px; min-width: 155px; padding: 12px`.
- `.marquee-card-icon ion-icon` atau ikon di marquee card: `font-size: 1.2rem`.

---

## 6. CONTACT ME SECTION

**Komponen:** `components/ui/ContactSection.tsx`
**CSS class utama:** `.contact-wrapper`, `.contact-glass-card`, `.contact-subtext`, `.hud-form`, `.hud-input-group`, `.hud-form-header`, `.hud-corner` (`.hud-tl`, `.hud-tr`, `.hud-bl`, `.hud-br`), `.contact-info-list`, `.contact-info-row`, `.contact-info-icon`, `.hud-divider`

### Masalah yang harus diperbaiki:

**Tablet (768px–1024px):**
- `.contact-wrapper`: `flex-direction: column; gap: 32px` (jika sebelumnya row/grid).
- `.contact-glass-card`: `padding: 28px 24px`.
- `.hud-corner` elemen dekoratif: pertahankan, tidak perlu disembunyikan.

**Mobile (≤767px) — dalam `@media (max-width: 768px)` yang sudah ada:**
- `.contact-wrapper`: pastikan `flex-direction: column; gap: 24px; padding: 0`.
- `.contact-glass-card`: `padding: 20px 16px; border-radius: 14px`.
- `.hud-form`: `gap: 16px`.
- `.hud-input-group input`, `.hud-input-group textarea`: `padding: 12px 14px; font-size: 0.88rem`.
- `.hud-input-group--textarea textarea`: `min-height: 100px`.
- `.contact-info-row`: `gap: 10px`.
- `.contact-info-icon`: `width: 36px; height: 36px; font-size: 1rem`.
- `.contact-info-text`: `font-size: 0.82rem`.
- **HUD Corner decoration** di mobile: `display: none` untuk `.hud-corner` — terlalu ramai di layar kecil.
- `.hud-divider`: `margin: 20px 0`.

**Small Mobile (≤480px):**
- `.contact-glass-card`: `padding: 16px 14px`.
- `.hud-form-header`: `flex-direction: column; align-items: flex-start; gap: 6px`.
- `.hud-form-tag`, `.hud-form-tag-right`: `font-size: 0.55rem`.
- tombol submit (`.btn-submit` atau button di dalam form): `width: 100%; justify-content: center`.

---

## 7. FOOTER SECTION

**Komponen:** `components/ui/Footer.tsx`
**CSS class utama:** `.footer-grid-bg`, `.footer-content`, `.footer-bottom`, `.footer-nav ul`, `.footer-socials`, `.footer-link`, `.mega-footer` (jika ada versi mega footer)

### Masalah yang harus diperbaiki:

**Tablet (768px–1024px):**
- `.footer-content`: jika menggunakan grid/flex multi-kolom, ubah ke `flex-direction: column; gap: 24px; text-align: center`.
- `.footer-nav ul`: `flex-wrap: wrap; justify-content: center; gap: 12px 20px`.
- `.footer-socials`: `justify-content: center`.

**Mobile (≤767px) — dalam `@media (max-width: 768px)` yang sudah ada:**
- `.footer-bottom`: `flex-direction: column; gap: 16px; text-align: center; padding: 20px 5%`.
- `.footer-nav ul`: `flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 10px 16px`.
- `.footer-socials`: `gap: 12px`.
- `.footer-link`: `font-size: 0.8rem`.
- **Pastikan** `.footer-grid-bg` (grid dekoratif background): `opacity` dikurangi di mobile agar tidak mengganggu keterbacaan: `opacity: 0.03`.
- `.mega-footer` (jika ada): `padding: 40px 5% 30px`.

**Small Mobile (≤480px):**
- `.footer-nav ul`: `gap: 8px 12px`.
- `.footer-link`: `font-size: 0.75rem`.
- Copyright text / small text di footer: `font-size: 0.65rem`.

---

## Urutan Eksekusi yang Direkomendasikan

1. Buka `app/portfolio.css`.
2. Cari `@media (max-width: 968px)` pertama di line ~4582 — **tambahkan** rules untuk: Creative Playground, Career Pathway, Project slider, Achievement marquee, About cards awal.
3. Cari `@media (max-width: 768px)` di line ~4806 — **tambahkan** rules untuk: semua section, tidak mengganti yang sudah ada.
4. Cari `@media (max-width: 480px)` di line ~5184 — **tambahkan** rules untuk: badge, modal, form input.
5. Verifikasi di browser (localhost:3000) dengan DevTools device emulation: **iPhone 14 Pro (390px)**, **iPad (768px)**, **iPhone SE (375px)**.

---

## Hal yang DILARANG (Anti-Bug Checklist)

- JANGAN ubah `transform` pada element yang dikendalikan GSAP ScrollTrigger (`.process-item-text .char`, `.horizon-wrapper`, `.cv-card` saat desktop).
- JANGAN gunakan `overflow: hidden` pada `.horizon-container` di mobile — sudah di-override dengan `overflow: visible !important`.
- JANGAN hapus class `will-change: transform` dari `.about-spatial-card`.
- JANGAN set `display: none` pada `.about-spatial-card-spotlight` dari dalam rule yang lebih spesifik dari yang sudah ada.
- JANGAN tambahkan `perspective` baru di mobile untuk `.about-cards-wrapper` — sudah tidak ada.
- Gunakan `clamp()` untuk font-size agar tetap fluid dan tidak perlu banyak breakpoint.
- Gunakan `!important` HANYA untuk override GSAP inline styles yang tidak bisa diubah via class selector.

---

*Briefing ini ditulis berdasarkan audit langsung terhadap `portfolio.css` (6.850 baris) dan struktur komponen yang ada.*
*Semua class name telah diverifikasi via `Select-String` terhadap CSS yang aktual.*

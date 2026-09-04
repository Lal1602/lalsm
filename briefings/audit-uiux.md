# Audit UI/UX, Visual & "AI Slop" — Portfolio lalsm

Full scan atas codebase `E:\projek kecil-kecilan\lalsm` (Next.js 16 + React 19 + Three.js + GSAP). Dokumen ini berisi semua temuan konkret (bukan opini kosong — semuanya diverifikasi langsung dari kode) plus rencana implementasi perbaikan, disusun per prioritas.

**File yang di-scan:** `app/page.tsx`, `app/layout.tsx`, `app/portfolio.css` (7.592 baris), `app/globals.css`, 44 komponen di `components/ui/`, 5 model di `components/models/`, `package.json`, `next.config.ts`, `.gitignore`, isi `public/`.

---

## 0. Verdict Singkat

Situs ini **secara teknis ambisius** (WebGL custom, GSAP ScrollTrigger horizontal-pin, canvas starfield custom, chat AI) tapi terjebak pola klasik **"AI-generated cyberpunk portfolio slop"**: palet neon cyan/ungu/emas di atas hitam, font `Orbitron`, copy ala terminal hacker di mana-mana, HUD/status palsu, dan lapisan efek yang saling tumpuk tanpa hierarki. Di balik itu ada **teknis debt nyata**: 16 komponen mati, 23 MB model 3D tak terpakai, 3 font Google yang dimuat tapi nol dipakai, gambar sertifikat sampai 1,8 MB tanpa kompresi, dan 378 `!important` di satu file CSS 7.592 baris.

Kabar baiknya: mayoritas temuan di bawah **tidak butuh desain ulang total** — cukup pembersihan, penajaman palet/tipografi, dan mengganti copy "fake-hacker" jadi lebih jujur dan classy. Portofolio ini punya fondasi bagus (animasi custom, 3D asli buatan sendiri, bukan template Awwwards generik) — masalahnya adalah *terlalu banyak* elemen dekoratif generik menutupi kerja aslinya.

---

## 1. Angka-Angka Kunci (Bukti Kuantitatif)

| Metrik | Nilai | Catatan |
|---|---|---|
| Baris `portfolio.css` | 7.592 | 1 file CSS raksasa, tanpa modularisasi |
| `!important` | 378× | perang spesifisitas CSS, sangat sulit di-maintain |
| `linear/radial/conic-gradient` | 82× | |
| `box-shadow` | 126× | mayoritas glow neon |
| `backdrop-filter` (glassmorphism) | 29× | |
| `@keyframes` | 30 | + lebih banyak lagi inline di `style jsx` per-komponen |
| Kemunculan kata **"HUD"** | 118× | |
| Kemunculan kata **"TERMINAL"** | 28× | |
| `z-index` tertinggi | **2.000.000** | ada juga 1.999.999, 999.999, 99.999 |
| Warna hex unik | 46 | palet tidak konsisten (banyak dekat-duplikat: `#eaeaef`/`#EAEAEF`/`#eaeaea`) |
| `@media (prefers-reduced-motion)` | **2×** | dari puluhan animasi GSAP/CSS yang jalan terus |
| Google Font family dimuat | 6 (Orbitron, Rajdhani, Roboto Mono, Syne, Plus Jakarta Sans, JetBrains Mono) | **3 di antaranya (Syne, Plus Jakarta Sans, JetBrains Mono) 0% dipakai** |
| Komponen `.tsx` yang tidak pernah di-import (dead code) | **16 file** | lihat §3 |
| Ukuran model `.glb` lama yang tak terpakai | ±23,7 MB | `*-old.glb` × 3, plus 5 komponen model React yang tak dipakai |
| `next.config.ts` → `images.unoptimized` | `true` | optimasi gambar Next.js **dimatikan total** |
| Gambar sertifikat terbesar tanpa kompresi | ML1.jpg/ML2.jpg 1,8 MB, Webdev.jpg 1,7 MB | dirender lewat `<img>` mentah, bukan `next/image` |
| WebGL/Canvas context yang bisa aktif bersamaan | hingga 4 (ThreeBackground, FilmScene, TubesCursor, BackgroundPixelStars) | risiko drop FPS + boros baterai, terutama mobile/laptop kelas menengah |

---

## 2. Masalah UI/UX (Fungsional & Usability)

### 2.1 Kursor kustom dipaksa lewat `cursor: none` global
`app/portfolio.css` baris ~19: selector `*` diberi `cursor: none`, lalu `CustomCursor.tsx` menggambar dot+outline sendiri lewat `position: fixed`. Ini pola klasik "creative dev portfolio" tapi punya risiko nyata:
- Kalau JS gagal load / lambat hydrate (koneksi lambat, error), pengguna **tidak melihat kursor sama sekali** selama itu.
- Custom cursor menambah satu lapisan `mousemove` listener + GSAP `quickTo` yang jalan terus selama sesi — biaya CPU kecil tapi konstan.
- Sudah ada fallback baik untuk input field (`cursor-outline` disembunyikan saat hover ke `input/textarea`) — bagian ini sebenarnya sudah ditangani dengan benar, hanya perlu fallback tambahan untuk skenario JS-belum-siap.

**Rekomendasi:** beri `cursor: auto` sebagai default di `html`, baru override jadi `none` lewat class yang ditambahkan JS **setelah** cursor React ter-mount (`document.documentElement.classList.add('has-custom-cursor')`). Dengan begitu tidak pernah ada momen "kursor hilang".

### 2.2 Empat sistem WebGL/Canvas berjalan bersamaan
Ditemukan lapisan animasi latar yang tumpuk:
1. `ThreeBackground.tsx` — starfield Three.js 6.000 partikel + 50 icosahedron, **berjalan di seluruh halaman**, mounted lewat `ClientShell`.
2. `FilmScene.tsx` (dipanggil dari `ProjectsSection.tsx`) — reel film 3D untuk proyek, Canvas React-Three-Fiber terpisah.
3. `TubesCursor.tsx` — WebGL "tabung neon" yang di-load dari **CDN eksternal** (`cdn.jsdelivr.net/npm/threejs-components...`) khusus di section Horizon.
4. `BackgroundPixelStars.tsx` — starfield **kedua** versi Canvas2D (retro pixel), juga di section Horizon, tumpuk di atas TubesCursor.

Ditambah `.grain-overlay` (SVG noise, `z-index: 1999999`, full-page, selalu render). Artinya di section Horizon saja ada minimal 3 layer visual bergerak (Tubes WebGL + pixel-stars canvas + grain SVG) di atas starfield Three.js yang juga masih aktif di background global. Ini boros GPU/baterai dan berisiko jank di laptop non-gaming atau HP kelas menengah — padahal secara visual, dua starfield yang mirip (satu Three.js, satu Canvas2D) tidak menambah nilai, hanya menduplikasi "tema bintang".

**Rekomendasi:** pilih **satu** bahasa visual untuk starfield (cukup `ThreeBackground` ATAU `BackgroundPixelStars`, bukan dua-duanya), matikan/`pause` render loop Three.js global saat section Horizon aktif (sudah ada mekanisme serupa untuk cursor, tinggal diperluas), dan pertimbangkan drop `TubesCursor` CDN eksternal (dependency ke library pihak ketiga yang di-load run-time tanpa versi terkunci secara ketat, dan menambah request jaringan + potensi FOUC/flash saat CDN lambat).

### 2.3 Status/metrik yang ditampilkan seolah nyata, padahal fiktif
Ini masalah *trust* — beberapa "data teknis" yang ditampilkan ke pengunjung **sepenuhnya hardcoded/fiktif**, bukan hasil pengukuran sungguhan:
- `InfinityNodeDiagram.tsx`: `[ LATENCY // 0.082ms ]`, `AWS_REGION_A` / `AWS_REGION_B` / `VERCEL_EDGE` dengan lampu hijau "online", `ONLINE // 99.99%` — padahal proyek ini **tidak** punya infrastruktur AWS/Vercel edge yang sedang dipantau; angka-angka itu hanya dekorasi.
- `ProjectsSection.tsx`: `REEL SPEED: 2.4 RPM` — angka fisika palsu untuk bar loop animasi biasa.
- `ContactSection.tsx`: label `ENCRYPTION: AES-256` di header form — **form ini POST biasa ke Web3Forms lewat HTTPS standar**, tidak ada enkripsi AES-256 khusus yang diklaim. Ini klaim keamanan palsu yang bisa dianggap menyesatkan pengunjung.

**Kenapa ini penting:** pengunjung teknikal (recruiter/dev lain) yang mengerti istilah-istilah ini akan langsung sadar itu bohong, dan itu justru **menurunkan kredibilitas** — bukan menaikkan "kesan canggih" seperti yang dimaksud. Ini pola "AI slop" paling berbahaya karena bukan cuma soal selera visual, tapi soal kejujuran konten.

**Rekomendasi:** ganti semua angka/status fiktif dengan salah satu dari dua opsi jujur:
- (a) Buang klaim teknisnya, ganti jadi label dekoratif netral tanpa janji ("SYSTEM // AKTIF" tanpa angka palsu), atau
- (b) Kalau memang mau menampilkan data teknis asli — misalnya waktu build, jumlah commit, atau uptime Vercel — ambil dari data nyata (`process.env.NEXT_PUBLIC_BUILD_TIME`, Vercel API, dsb).

### 2.4 Copy form kontak yang mengorbankan kejelasan demi tema
Label field di `ContactSection.tsx`: **"ID / Name"**, **"Signal / Email"**, **"Transmission / Message"**, tombol submit **"Transmit Message"**. Secara tematik konsisten dengan gaya HUD situs, tapi untuk form kontak sungguhan ini mengurangi kejelasan instan — pengguna harus berpikir sejenak "oh 'Signal' itu maksudnya email". `aria-label` sudah benar diisi (baik untuk screen reader), tapi label visual yang membingungkan tetap buruk untuk *scanability* manusia biasa.

**Rekomendasi:** pertahankan gaya visual HUD (border, animasi fokus, dsb) tapi kembalikan **teks label ke bahasa manusia biasa** — "Name", "Email", "Message", tombol "Send Message". Personality bisa tetap hidup lewat micro-copy di tempat lain (placeholder, heading section) yang risikonya lebih rendah kalau dibaca sekilas.

### 2.5 Efek "hacker text scramble" dipasang di hampir semua judul & nav-link
`GSAPEffects.tsx` fungsi `runHackerEffect()` dipasang otomatis di **setiap** `h2.section-title`, `h1.glitch-text` (saat scroll masuk viewport) **dan** setiap `.nav-link` (saat hover). Efek acak-huruf-lalu-terbentuk ini bagus dipakai sebagai *aksen* sesekali, tapi kalau dipasang di **semua** judul section (Hero, About, Process, Projects, Achievements, Contact) + semua nav link, efeknya jadi tic yang berulang dan mengganggu ritme baca, bukan lagi terasa "wah".

**Rekomendasi:** pakai di 1 tempat saja yang paling strategis (misal cuma judul Hero atau logo saat hover), matikan di nav-link (nav harus terasa instan & stabil, bukan berkedip-kedip tiap hover).

### 2.6 Motion tidak menghormati `prefers-reduced-motion`
Hanya ada **2** blok `@media (prefers-reduced-motion: reduce)` di seluruh `portfolio.css`, padahal ada puluhan animasi aktif: hacker-scramble, magnetic buttons (elastic bounce), horizontal-pin 3D carousel, parallax scroll, particle burst saat klik tombol, dan lain-lain — semuanya tetap jalan penuh meski pengguna sudah eksplisit set "reduce motion" di OS mereka (relevan untuk aksesibilitas & kenyamanan, termasuk pengguna dengan vestibular disorder).

**Rekomendasi:** bungkus semua `gsap.to/from` dan `ScrollTrigger` dengan pengecekan `window.matchMedia('(prefers-reduced-motion: reduce)').matches` di satu tempat (util `useReducedMotion()`), lalu skip/percepat animasi non-esensial saat true.

### 2.7 `z-index` kacau (sampai 2.000.000) & 378 `!important`
Bukti nyata CSS ini sudah ditambal berkali-kali secara reaktif ("elemen ini ketutup, kasih z-index gede biar menang") daripada didesain dengan sistem layering yang jelas. Ini bukan masalah visual langsung ke pengunjung, tapi **risiko bug** — makin lama makin gampang ada elemen baru yang "harus" dikasih `z-index: 3000000` biar menang, dan makin sulit tim (atau AI assistant lain) memahami urutan stacking yang benar.

**Rekomendasi:** definisikan skala z-index terbatas di `:root` (misal `--z-bg: 0; --z-content: 10; --z-nav: 100; --z-modal: 1000; --z-cursor: 9999;`) dan pakai variabel itu di semua tempat — buang angka ajaib jutaan.

### 2.8 Gambar tidak dioptimasi sama sekali
`next.config.ts` men-set `images: { unoptimized: true }` — artinya fitur optimasi gambar bawaan Next.js (resize otomatis, convert ke WebP/AVIF, lazy-load native) **dimatikan total di seluruh situs**. Ditambah lagi 2 gambar (`marquee-card` di Achievements, gambar di modal proyek) pakai tag `<img>` mentah, bukan `next/image`. Beberapa sertifikat berukuran 1,7–1,8 MB per file, dan section Achievements me-render **26 kartu sertifikat sekaligus** (2 track × 13 kartu termasuk duplikat untuk infinite-scroll).

**Rekomendasi:** hapus `unoptimized: true` (atau set hanya untuk kasus yang benar-benar perlu), ganti `<img>` → `next/image` dengan `sizes` yang tepat, dan kompres ulang semua file di `public/images/certificates/` ke WebP kualitas 80 (biasanya turun 70–90% ukuran tanpa kehilangan kualitas yang terlihat).

### 2.9 File non-gambar & file sampah OS nyasar ke folder publik
Di `public/images/certificates/` ada:
- `SERTIFIKATs.docx` (2,1 MB) dan `KUMPULAN SERTIFIKAT.pdf` (1,0 MB) — dua file dokumen mentah, bukan gambar, ikut ter-deploy ke production dan bisa diakses siapa saja lewat URL langsung.
- `desktop.ini` (file metadata folder Windows) — bocor karena folder pernah dibuka di Windows Explorer dengan kustomisasi tampilan, seharusnya tidak pernah ikut ke git/deploy.

**Rekomendasi:** pindahkan `.docx`/`.pdf` itu keluar dari `public/` (kalau memang perlu dibagikan, upload manual ke Google Drive seperti sertifikat lain yang sudah pakai link Drive) dan tambahkan `desktop.ini` ke `.gitignore`.

---

## 3. Kode Mati / Bloat (Technical Debt)

Hasil cross-check import di seluruh codebase — **16 komponen berikut dibuat tapi tidak pernah dipakai** di halaman manapun:

| File | Ukuran | Catatan |
|---|---|---|
| `components/ui/TechGraphSlide.tsx` | 11,3 KB | |
| `components/ui/ProjectEstimatorSlide.tsx` | 13,8 KB | |
| `components/ui/WireframePortal.tsx` | 2,9 KB | |
| `components/ui/AtmosphericWave.tsx` | 3,3 KB | |
| `components/ui/WorkflowKinetic.tsx` | 7,1 KB | |
| `components/ui/WorkflowSection.tsx` | 1,9 KB | |
| `components/ui/CreativeBlob.tsx` | 13,4 KB | scene Three.js lengkap ("CyberSphere"), tak pernah dirender |
| `components/ui/ScrollHint.tsx` | 2,0 KB | |
| `components/ui/ProgressLoader.tsx` | 4,9 KB | |
| `components/ui/AwwardsBadge.tsx` | 5,2 KB | ⚠️ lihat catatan di bawah |
| `components/ui/ThemeSwitcher.tsx` | 1,4 KB | toggle tema duplikat — yang aktif cuma switch di `Navbar.tsx` |
| `components/models/Wanderer.tsx` | 2,5 KB | |
| `components/models/WindowModel.tsx` | 2,6 KB | |
| `components/models/Cloud.tsx` | 1,9 KB | |
| `components/models/Memory.tsx` | 3,3 KB | |
| `components/models/Stars.tsx` | 0,4 KB | |

⚠️ **Catatan khusus `AwwardsBadge.tsx`:** meskipun sekarang tidak dipakai (jadi tidak muncul ke pengunjung), isinya adalah badge "Awwwards" yang **link-nya mengarah ke `portofolio-nandanannn.netlify.app`** — bukan domain Bilal. Ini kemungkinan sisa dari kode contoh/template yang pernah dipakai sebagai referensi lalu tidak dibersihkan linknya. **Hapus file ini** — jangan sampai suatu saat komponen ini diaktifkan lagi tanpa sadar link-nya masih mengarah ke portofolio orang lain.

Ditambah **model 3D lama** yang juga tak terpakai (tidak direferensikan file manapun) tapi tetap ikut ter-deploy di `public/models/`:
- `dalithe_persistence_of_memory-old.glb` — 10,5 MB
- `wanderer_above_the_sea_of_fog-old.glb` — 12,9 MB
- `window-old.glb` — 236 KB

Total **≈23,7 MB** file 3D mati (versi optimized yang aktif sudah ada dan jauh lebih kecil: 293 KB, 2 MB, 38 KB — jadi versi lama ini murni sampah, kemungkinan dibiarkan sebagai backup manual yang lupa dihapus).

**Font Google yang dimuat tapi 0% dipakai** (`app/layout.tsx` baris 32): `Syne` (bobot 700, 800) dan `Plus Jakarta Sans` (bobot 300–700) dan `JetBrains Mono` (bobot 400, 700) — tidak satupun muncul di `var(--font-*)` manapun di CSS atau komponen. Ini murni request jaringan tambahan (render-blocking preconnect + font file) tanpa manfaat.

**Rekomendasi cepat:**
```bash
# Hapus komponen mati (setelah dobel-cek tidak dipakai dinamis via string)
rm components/ui/{TechGraphSlide,ProjectEstimatorSlide,WireframePortal,AtmosphericWave,WorkflowKinetic,WorkflowSection,CreativeBlob,ScrollHint,ProgressLoader,AwwardsBadge,ThemeSwitcher}.tsx
rm components/models/{Wanderer,WindowModel,Cloud,Memory,Stars}.tsx
rm public/models/*-old.glb
rm "public/images/certificates/SERTIFIKATs.docx" "public/images/certificates/KUMPULAN SERTIFIKAT.pdf" public/images/certificates/desktop.ini
```
```diff
// app/layout.tsx — hapus font yang tidak dipakai
- href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@300;500&family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
+ href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@300;500&display=swap"
```

---

## 4. Unsur "AI Slop" Visual — Apa yang Membuat Situs Ini Terasa Generik

Ini bagian inti dari permintaan kamu. "AI slop" di sini bukan berarti kodenya jelek — tapi *bahasa visualnya* adalah kombinasi klise yang sangat sering muncul di portofolio dev yang dibuat cepat dengan bantuan AI generatif sepanjang 2023–2025: **neon cyberpunk + glassmorphism + terminal/hacker copy + starfield**. Berikut daftar spesifik yang ditemukan, plus arah gantinya:

### 4.1 Palet neon cyan/ungu/emas di atas hitam pekat
```css
--accent-cyan: #00f3ff;
--accent-purple: #bc13fe;
--accent-gold: #ffd700;
--bg-color: #050505;
```
Kombinasi cyan-terang + ungu-neon + hitam adalah salah satu palet paling sering dipakai generator AI untuk tema "futuristic/tech/developer" — sangat mudah dikenali dan sudah terasa jenuh secara visual bagi orang yang sering browsing portofolio dev.

**Ganti dengan:** tetap dark-mode (cocok untuk tema kerja teknis), tapi turunkan saturasi accent jadi 1 warna utama yang lebih matang + 1 warna sekunder netral, bukan 3 neon penuh sekaligus. Contoh arah palet yang lebih "premium studio" ketimbang "sci-fi generik":
```css
--bg-color: #0a0a0c;          /* tetap gelap, sedikit hangat, bukan hitam pekat digital */
--text-main: #ececef;
--text-muted: #8b8b96;
--accent-primary: #7c5cff;     /* violet lebih tenang, bukan magenta neon #bc13fe */
--accent-secondary: #ff8a3d;   /* amber hangat sebagai aksen kedua, ganti gold neon */
--glass-bg: rgba(255,255,255,0.04);
```
Prinsipnya: **1 warna aksen dominan + 1 warna aksen sekunder** sudah cukup. Cyan+purple+gold sekaligus di banyak komponen membuat mata tidak tahu harus fokus ke mana.

### 4.2 Font `Orbitron` untuk semua judul besar
`Orbitron` (font angular ala "sci-fi HUD") dipakai sebagai `--font-display` di 28 tempat. Font ini sangat identik dengan tema "robot/cyber/gaming" generik — begitu pengunjung melihatnya, otak langsung mengkategorikan situs sebagai "template cyberpunk", bukan mengingat siapa pemiliknya.

**Ganti dengan:** font display yang lebih personal/khas — misalnya grotesk kontemporer dengan karakter kuat tapi tidak generik-sci-fi, seperti `Space Grotesk`, `Clash Display`, `General Sans`, atau `Bricolage Grotesque` (semua gratis, tersedia di Google Fonts/Fontshare). Pertahankan `Roboto Mono` untuk label kecil ala kode — itu bagian yang justru masih relevan karena situsnya memang tentang development.

### 4.3 Copy ala terminal/hacker HUD di mana-mana
118× kata "HUD", 28× "TERMINAL", plus contoh konkret: `// SYS.STACK`, `UPLINK_FORM.exe`, `SECURE_NAV_LINK // ONLINE`, `STATUS: COMPRESSION_CORE - HYPER_VORTEX_SPIN ENGAGED`, `[ MATRIX_COMPILE ]`, `TO DECRYPT WORKFLOW`, `PROJECT DATAFRAME`, `LAUNCH ACTIVE INTERFACE`. Bahkan komentar kode menyebut diri sendiri "Absurd & Complex Geometric Shapes" dan "CREATIVE BACKGROUND LAYERS (ENHANCED & INTRICATE)" (`AiChatOverlay.tsx`) — pola khas ketika sebuah fitur ditambahkan lapis demi lapis tanpa ada yang menyunting ulang secara keseluruhan.

**Ganti dengan:** microcopy yang lebih percaya diri dan personal, bukan meniru HUD film sci-fi. Bandingkan:

| Sekarang (klise) | Alternatif (lebih personal & jujur) |
|---|---|
| `UPLINK_FORM.exe` | `Send a message` / `Kontak` |
| `SECURE UPLINK ESTABLISHED` | `Available for freelance & collab` |
| `STATUS // IDLE` / `HOVER A PHASE` | `Hover to explore` |
| `LAUNCH ACTIVE INTERFACE` | `View live site ↗` |
| `// SYS.STACK` | `Tech stack` |
| `PROJECT DATAFRAME` | `Project details` |

Personality tetap bisa muncul lewat *cara* menulis (santai, jujur, sedikit humor tentang proses belajar), bukan lewat kosakata "// system online" yang generik.

### 4.4 Tiga sistem starfield/particle yang tumpang-tindih
Sudah dibahas di §2.2 dari sisi performa — dari sisi *visual*, ini juga masalah identitas: starfield/particle adalah salah satu efek paling umum di template "creative dev portfolio" AI-generated karena murah dibuat (generator suka menyarankannya sebagai default "biar keliatan techy"), padahal tidak berhubungan langsung dengan konten (proyek game, sertifikat, CV). Punya 3 versi berbeda dari efek yang sama menunjukkan efek itu ditambahkan berulang tanpa ada keputusan desain yang jelas "starfield ini untuk apa".

**Ganti dengan:** pilih satu elemen visual signature yang benar-benar terhubung ke identitas kamu (mis. karena kamu suka game dev — bisa jadi grid/particle yang bereaksi ke gerakan mouse dengan gaya pixel-art konsisten, bukan starfield generik luar angkasa), lalu pakai itu **saja**, dengan intensitas rendah agar tidak mengalihkan perhatian dari konten (proyek & sertifikat).

### 4.5 Glassmorphism + glow neon di hampir semua card
126 `box-shadow` + 29 `backdrop-filter` + watermark angka besar transparan (`about-spatial-watermark`) + border neon tipis + ambient glow orb di tiap card (`about-spatial-glow`, `card-ambient-glow`) — kombinasi "kaca buram + garis neon tipis + glow" adalah signature visual paling dikenali dari UI kit "futuristic dashboard" generik (sering muncul di showcase Dribbble/Figma Community yang dibuat cepat).

**Ganti dengan:** kurangi jumlah lapisan efek per elemen. Untuk card, pilih **maksimal 2 dari 3**: border tipis, shadow lembut, ATAU glow aksen — jangan pakai ketiganya sekaligus di setiap card. Pertahankan glassmorphism di 1–2 elemen kunci saja (misal navbar saat scroll) supaya efeknya terasa istimewa, bukan default di mana-mana.

### 4.6 Marquee buzzword generik di Hero
```
FULLSTACK DEVELOPER • CREATIVE CODER • UI/UX DESIGNER • SYSTEM ARCHITECT •
```
Marquee berjalan berisi daftar peran/buzzword adalah pola sangat umum di template portofolio (termasuk hasil AI generator) — daftar peran generik yang siapa saja bisa klaim, tidak menceritakan apa pun yang spesifik tentang Bilal.

**Ganti dengan:** ganti isinya jadi sesuatu yang lebih spesifik dan berbasis fakta dari CV kamu sendiri — nama proyek nyata, teknologi yang benar-benar dikuasai, atau kalimat singkat tentang cara kerja kamu. Contoh: `NEXT.JS • THREE.JS • GSAP • 35+ PROJECTS SHIPPED • PENS SURABAYA •` — tetap punya efek visual marquee yang sama, tapi isinya jadi bukti konkret, bukan klaim generik.

### 4.7 Metrik & status palsu (diulang dari §2.3 karena ini juga bagian dari "AI slop" visual)
Angka `LATENCY 0.082ms`, `99.99% ONLINE`, `AES-256` adalah pola "menempelkan angka teknis acak biar terlihat canggih" — sangat umum di UI yang dibuat AI generator saat diminta "buat terasa high-tech". Solusinya sudah dijelaskan di §2.3: buang atau ganti dengan data asli.

---

## 5. Rencana Implementasi (Roadmap Bertahap)

### Fase 1 — Quick Wins (1–2 jam kerja, dampak besar, risiko rendah)
1. Hapus 16 komponen mati + 3 model `.glb` lama + file docx/pdf/desktop.ini di `public/` (lihat perintah di §3).
2. Hapus 3 font Google yang tidak dipakai dari `layout.tsx`.
3. Set `images.unoptimized: false` di `next.config.ts`, ganti 2 `<img>` mentah jadi `next/image`.
4. Ganti label form kontak ke bahasa manusia biasa (§2.4).
5. Ganti/buang klaim `ENCRYPTION: AES-256`, `LATENCY 0.082ms`, `99.99% ONLINE`, `REEL SPEED 2.4 RPM` (§2.3).
6. Perbaiki/hapus link `AwwardsBadge` (atau hapus filenya sekalian, sudah termasuk di langkah 1).

### Fase 2 — Perbaikan Visual & Aksesibilitas (beberapa hari)
1. Refactor palet warna ke 1 aksen dominan + 1 sekunder (§4.1) — ganti nilai CSS variable di `:root`, dampaknya otomatis menyebar ke semua komponen karena semua sudah pakai `var(--accent-*)`.
2. Ganti `Orbitron` → font display baru (§4.2), update `--font-display` di `:root` dan link Google Fonts.
3. Audit ulang semua microcopy HUD/terminal, ganti ke versi natural (§4.3) — buat daftar cari-ganti per komponen.
4. Tambahkan util `useReducedMotion()` dan bungkus semua trigger animasi non-esensial di `GSAPEffects.tsx`, `AboutSection.tsx`, `GlobalInteractions.tsx` (§2.6).
5. Kurangi lapisan starfield jadi 1 sistem saja (§2.2 & §4.4).
6. Definisikan skala `--z-*` di `:root`, cari-ganti semua `z-index` angka ajaib (§2.7).

### Fase 3 — Restrukturisasi Teknis (opsional, kalau ada waktu lebih)
1. Pecah `portfolio.css` (7.592 baris) menjadi CSS Modules per section/komponen, atau minimal per-fitur (`hero.css`, `contact.css`, dst) supaya tidak ada lagi ketergantungan urutan cascade yang memaksa pakai `!important`.
2. Audit ulang 378 `!important` satu per satu sambil memecah file — biasanya begitu spesifisitas selector diperbaiki, `!important` jadi tidak perlu lagi.
3. Pertimbangkan pindah beberapa card CSS-heavy (glow, spotlight cursor-follow) ke pendekatan yang lebih ringan (CSS custom properties yang di-update lewat JS sudah dipakai dengan baik di `GlobalInteractions.tsx` — pola ini bisa diperluas, bagus dipertahankan).

---

## 6. Checklist Prioritas (Ringkasan Referensi Cepat)

| # | Item | Dampak | Effort | Fase |
|---|---|---|---|---|
| 1 | Hapus 16 komponen mati + 23,7 MB model lama | Ukuran repo/build ↓, kejelasan kode ↑ | Rendah | 1 |
| 2 | Hapus link `AwwardsBadge` ke portofolio orang lain | Mencegah bug reputasi di masa depan | Rendah | 1 |
| 3 | Hapus 3 font tak terpakai | Waktu load ↓ | Rendah | 1 |
| 4 | Aktifkan optimasi gambar Next.js + `next/image` | Waktu load ↓↓ (gambar 1,8 MB → puluhan KB) | Rendah–Sedang | 1 |
| 5 | Buang klaim/angka teknis palsu (latency, AES-256, uptime) | Kredibilitas & kejujuran konten | Rendah | 1 |
| 6 | Label form → bahasa natural | Kejelasan UX | Rendah | 1 |
| 7 | Sederhanakan palet warna (1 aksen dominan) | Identitas visual lebih kuat, tidak generik | Sedang | 2 |
| 8 | Ganti font `Orbitron` | Kesan "cyberpunk template" ↓ | Sedang | 2 |
| 9 | Bersihkan microcopy HUD/terminal | Terasa lebih personal, kurang klise | Sedang | 2 |
| 10 | Tambah dukungan `prefers-reduced-motion` menyeluruh | Aksesibilitas | Sedang | 2 |
| 11 | Kurangi starfield jadi 1 sistem, matikan Three.js saat tak terlihat | Performa/FPS/baterai | Sedang | 2 |
| 12 | Standarisasi skala `z-index` | Maintainability jangka panjang | Sedang | 2 |
| 13 | Pecah `portfolio.css` per komponen | Maintainability jangka panjang | Tinggi | 3 |
| 14 | Audit & kurangi 378 `!important` | Maintainability jangka panjang | Tinggi | 3 |

---

*Dokumen ini dibuat berdasarkan full scan otomatis terhadap kode sumber di `E:\projek kecil-kecilan\lalsm` pada 4 September 2026. Semua angka dan kutipan kode diverifikasi langsung dari file yang bersangkutan.*

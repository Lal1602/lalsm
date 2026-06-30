# Superprompt Desain UI: Elegant Dynamic Light Mode

Gunakan superprompt (deskripsi visual) di bawah ini untuk menghasilkan atau mengadaptasi desain UI portofolio Anda ke dalam versi *light mode* yang konsisten dengan referensi gambar:

## Konsep Utama
Desain UI portofolio web developer dengan tema terang (*light mode*) yang elegan, dinamis, namun tidak menyilaukan mata (*low-contrast light mode*).

## Superprompt (Untuk AI Image Generator seperti Midjourney / DALL-E)

> "A highly detailed, elegant and dynamic light mode UI design for a creative web developer portfolio. The background is a soft, soothing radial gradient from pale cream to ultra-light misty grey (#F5F5F0 to #EAEAEF), avoiding harsh pure white. Subtle, faded square stardust particles in soft cyan float in the background with low opacity. 
> 
> Typography: The massive main headline 'CREATIVE DEVELOPER' is in a bold, dark charcoal grey (#2C2C2C). Paragraph text is in readable medium grey. The logo 'BILAL.' features a subtle purple-to-blue gradient. 
> 
> Visual Elements: A circular profile picture on the left is framed by a soft, glowing light cyan halo. A floating dark aubergine (#4A3A4A) statistics card overlays the bottom right of the image, displaying '35+ PROJECTS DONE' in white text with a checkmark icon to provide elegant contrast. 
> 
> Buttons: The primary button 'SEE MY WORKS' is a muted dusty purple (#8A6AB0). The secondary button 'CONTACT ME' is a muted slate teal (#608080). 
> 
> Navigation & Controls: Clean top navigation where the active menu 'Achievements' has a soft, translucent amber pill-shaped highlight. In the top right corner, an elegant dark-to-light theme toggle switch: a dark capsule shape with a crescent moon icon on the left, and a sun icon on the right. A purple slider knob rests on the sun icon, emitting a subtle warm glow. High quality, UI/UX, dribbble style, modern web design, futuristic yet soft, 8k resolution."

---

## Panduan Spesifikasi Warna & Elemen (Untuk Implementasi CSS)

Berikut adalah panduan detail untuk mengimplementasikan tampilan tersebut ke dalam kode:

### 1. Latar Belakang & Efek
* **Background Base:** Gradien radial halus dari krem muda ke abu-abu ultra-muda.
    * *CSS:* `background: radial-gradient(circle, #fbfbf9 0%, #e8e8ec 100%);`
* **Partikel Kosmik:** Kotak-kotak kecil berwarna soft cyan/putih dengan opasitas rendah (15-20%) untuk menjaga kesan futuristik tanpa mengganggu teks.

### 2. Tipografi
* **Heading (CREATIVE DEVELOPER):** Abu-abu arang sangat gelap. Menghindari hitam pekat murni agar lebih membaur (*blending*).
    * *Hex:* `#2C2C2C` atau `#333333`
* **Sub-teks & Paragraf:** Abu-abu medium.
    * *Hex:* `#555555`

### 3. Komponen Utama
* **Hero Image Glow:** Pendaran (*glow/halo*) warna cyan/biru langit lembut di sekeliling bingkai foto melingkar.
    * *CSS:* `box-shadow: 0 0 35px rgba(150, 220, 230, 0.5);`
* **Floating Card (35+ Projects):** Warna ungu pekat/aubergine gelap sebagai titik fokus yang menonjol di latar terang.
    * *Hex:* `#4A3A4A` (Background) | `#FFFFFF` (Teks)

### 4. Tombol & Navigasi
* **Tombol Primary (See My Works):** Ungu *dusty* yang kalem namun tetap terlihat sebagai CTA (Call to Action) utama.
    * *Hex:* `#8A6AB0`
* **Tombol Secondary (Contact Me):** Slate teal/biru keabu-abuan.
    * *Hex:* `#608080`
* **Highlight Menu Navigasi:** Warna kuning amber pucat dengan border tipis dan efek *glassmorphism* lembut.
* **Toggle Theme Switcher:** * Background switch: Abu-abu gelap / Charcoal transparan.
    * Knob (tombol geser): Ungu gradien (menyerupai warna logo).

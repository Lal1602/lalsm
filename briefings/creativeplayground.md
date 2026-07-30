# Panduan Animasi Scroll Portofolio: Creative Playground & Career Pathway

Saya sedang membangun website portofolio dengan interaksi dan estetika tingkat tinggi (sekelas Awwwards). Saya membutuhkan logika animasi scroll yang kompleks (sebaiknya menggunakan GSAP & ScrollTrigger) untuk dua section utama: **Creative Playground** dan **Career Pathway**.

Sebelumnya terjadi bug di mana konten horizontal stuck tidak bisa di-scroll dan tertutup oleh background. Untuk mencegah hal itu, **kamu WAJIB mematuhi hierarki komponen dan instruksi di bawah ini tanpa mengubah logika layering-nya.**

## 1. Integrasi 'Career Pathway' di Dalam Horizontal Scroll Section

* **Satu Container Terintegrasi (No Split Sections):** Section **Career Pathway WAJIB berada di dalam container horizontal scroll yang sama** (`100vh`, `overflow: hidden`) bersama **Creative Playground**. Jangan membuat `Career Pathway` sebagai section vertikal terpisah di luar/setelah container horizontal.
* **Alur Continuous Timeline (GSAP ScrollTrigger):**
  1. **Fase Horizontal (Creative Playground):** Saat container utama di-pin oleh ScrollTrigger, scroll vertikal pengguna digerakkan menjadi pergeseran horizontal (`translateX`) untuk menampilkan item-item `[Card Item 1 ... n]`.
  2. **Fase Transisi ke Career Pathway:** Setelah `[Card Item n]` selesai dilalui, panel/area **Career Pathway** (yang merupakan bagian akhir di dalam track horizontal) bergeser masuk hingga berada penuh tepat di tengah layar (viewport). **Pinning container TETAP BERJALAN (jangan lepaskan pin terlebih dahulu).**
  3. **Fase Card-Stacked (di Dalam Horizontal Container):** Saat panel Career Pathway sudah aktif di viewport dan pengguna meneruskan scroll vertikal, timeline GSAP melanjutkan ke animasi *Card-Stacked* di dalam area tersebut.
* **Layout Career Pathway:** Area Career Pathway dibagi menjadi dua bagian:
  * **Sebelah Kiri:** Teks judul "Career Pathway" yang bersifat statis/pinned di posisinya selama fase animasi ini berlangsung.
  * **Sebelah Kanan:** Informasi latar pendidikan/karir menggunakan desain *stacked-cards*.
* **Card-Stacked Effect & Aturan Overlap:** Saat pengguna scroll, kartu-kartu info ini akan bergeser masuk dan menumpuk di belakang kartu sebelumnya (atau di belakang area judul). Kartu-kartu tersebut **tidak boleh tertumpuk (overlap) 100%**. Pastikan ujung kanan/atas setiap kartu yang berada di bawah/belakangnya tetap terlihat sedikit, terus begitu hingga kartu terakhir menumpuk sempurna.
* **Smooth Exit (Pelepasan Pinning Akhir):** Barulah setelah tumpukan kartu terakhir di Career Pathway selesai ditampilkan, timeline animasi GSAP berakhir dan pinning dilepas (`unpin`). Biarkan vertical scroll halaman kembali berjalan normal secara halus ke section berikutnya di bawah container horizontal ini.

**Tugas AI:** Tolong berikan panduan struktur hierarki DOM (HTML/JSX), logika styling (CSS), dan script animasi (GSAP & ScrollTrigger dengan satu continuous timeline) berdasarkan struktur dan aturan ketat di atas. Sesuaikan penulisan kodenya agar mudah diadaptasi ke dalam framework komponen modern (Next.js/React).
# Dokumentasi Revisi & Pengembangan Fitur Chatbot Portfolio

Dokumen ini berisi spesifikasi kebutuhan untuk perbaikan UI/UX, tata letak (layout), ikon, dan animasi pada komponen Chatbot Asisten Virtual Bilal.

---

## 1. Pembaruan Ikon & Branding Button
* **Kebutuhan:** Mengganti ikon pembuka chatbot (tombol aktivasi).
* **Spesifikasi:** * Ubah ikon bawaan yang saat ini berbentuk bintang/sparkles (kesan AI generik) menjadi teks logo minimalis berbunyi **"AI"** atau visual grafis bertema **"Asisten Otomatis"**.
  * **Catatan Penting:** Hindari penggunaan emoji standar atau aset visual bertema *AI slop/bloatware*. Gunakan SVG kustom atau font ikon modern yang bersih, tajam, dan senada dengan desain minimalis website.

---

## 2. Perubahan Tata Letak (Layout) Vertikal Penuh
* **Kebutuhan:** Mengubah bentuk tampilan chatbot dari model *Pop-up Card* menjadi *Vertical Sidebar*.
* **Spesifikasi:**
  * Sumbu vertikal chatbot harus dibuat penuh (`height: 100vh`), menempel dari batas paling atas hingga paling bawah layar.
  * Lebar (*width*) chatbot tetap dipertahankan sama seperti ukuran sebelum direvisi (tidak melebar, hanya memanjang ke atas dan bawah).
  * Menghilangkan efek melayang (*floating/popped-up card*) dan bayangan tepi (*box-shadow*) tebal agar chatbot menyatu sebagai bagian dari struktur utama halaman.
  * **Tujuan:** Memberikan ruang *scroll* chat yang lebih luas dan nyaman bagi user untuk berinteraksi dalam waktu lama.

---

## 3. Penyesuaian Responsif Konten Utama (Layout Shifting)
* **Kebutuhan:** Mencegah chatbot menutupi konten penting di halaman website saat aktif.
* **Spesifikasi:**
  * Ketika chatbot dalam posisi terbuka (*opened state*), area konten website utama di sebelah kanan/tengah harus secara otomatis menyesuaikan ukurannya (ter-minimize / menyusut secara proporsional).
  * Chatbot akan mengambil ruang di sisinya sendiri (misal sebagai *docked sidebar*), sementara konten web utama bergeser dan mengecil tanpa ada elemen teks atau gambar yang terpotong (*no clipping*).
  * Ketika chatbot ditutup (*closed state*), konten website utama akan kembali melebar penuh (*full-screen expansion*).

---

## 4. Optimasi Animasi & Transisi (Smooth Motion)
* **Kebutuhan:** Membuat transisi buka-tutup chatbot dan penyusutan halaman terasa organik.
* **Spesifikasi:**
  * Gunakan animasi berbasis *hardware acceleration* (memanfaatkan `transform: translateX()` dan `width/flex-basis` dengan transisi CSS yang teroptimasi) untuk mencegah *lagging* atau *stuttering*.
  * Terapkan kurva *easing* yang halus seperti `cubic-bezier(0.4, 0, 0.2, 1)` (jalur standar *fluid design*) pada animasi masuknya sidebar chatbot dan pergeseran layout website.
  * Pastikan *frame rate* animasi stabil di 60fps baik pada perangkat desktop maupun mobile.
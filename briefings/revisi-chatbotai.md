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
* **Kebutuhan:** Mencegah chatbot menutupi konten penting di halaman website saat aktif di desktop dan mengoptimalkan tampilan pada mobile.
* **Spesifikasi:**
  * **Pada Desktop (*Docked Sidebar*):**
    * Ketika chatbot dalam posisi terbuka (*opened state*), area konten website utama di sebelah kanan/tengah harus secara otomatis menyesuaikan ukurannya (ter-minimize / menyusut secara proporsional).
    * Chatbot akan mengambil ruang di sisinya sendiri, sementara konten web utama bergeser dan mengecil tanpa ada elemen teks atau gambar yang terpotong (*no clipping*).
    * Ketika chatbot ditutup (*closed state*), konten website utama akan kembali melebar penuh (*full-screen expansion*).
  * **Pada Mobile (*Responsive Full-Screen*):**
    * Ketika tampilan menjadi responsif ke mobile, tata letak tampilan chatbot menjadi layar penuh seolah seperti tampilan berukuran layar penuh agar *chat* dengan AI-nya lebih nyaman dan leluasa.

---

## 4. Optimasi Animasi & Transisi (Smooth Motion)
* **Kebutuhan:** Membuat transisi buka-tutup chatbot dan penyusutan halaman terasa organik.
* **Spesifikasi:**
  * Gunakan animasi berbasis *hardware acceleration* (memanfaatkan `transform: translateX()` dan `width/flex-basis` dengan transisi CSS yang teroptimasi) untuk mencegah *lagging* atau *stuttering*.
  * Terapkan kurva *easing* yang halus seperti `cubic-bezier(0.4, 0, 0.2, 1)` (jalur standar *fluid design*) pada animasi masuknya sidebar chatbot dan pergeseran layout website.
  * Pastikan *frame rate* animasi stabil di 60fps baik pada perangkat desktop maupun mobile.

---

## 5. Responsivitas Tampilan Mobile (Full-Screen Mobile Chat)
* **Kebutuhan:** Mengoptimalkan kenyamanan interaksi dan visualisasi *chat window* pada perangkat berlayar kecil (smartphone/tablet kecil).
* **Spesifikasi:**
  * Ketika tampilan menjadi responsif ke mobile (*mobile breakpoint*), tata letak tampilan chatbot harus otomatis beralih menjadi **layar penuh (*full-screen overlay*)** seolah seperti tampilan aplikasi berukuran layar penuh.
  * Hal ini bertujuan agar sesi *chat* dengan AI menjadi jauh lebih nyaman, memberi ruang maksimal untuk riwayat percakapan (*chat log*) serta area input teks tanpa terganggu oleh elemen layout web di latar belakang.
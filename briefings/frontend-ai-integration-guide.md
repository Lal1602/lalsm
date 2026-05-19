# 🚀 Panduan Integrasi Frontend: Fitur AI & Backend

Dokumen ini adalah *briefing* untuk tim Frontend berdasarkan *update* terbaru yang telah diselesaikan di sisi Backend. Saat ini, Backend menggunakan **Native PHP** (`index.php`) dan telah menyediakan *mock endpoints* untuk pengujian.

---

## 1. Konfigurasi Base URL

Karena Backend berjalan menggunakan XAMPP di folder `project-showcase-api`, pastikan kamu mengatur **Base URL** pada aplikasi Frontend (misalnya di `.env` atau `constants/index.ts`):

```typescript
// Contoh di app/constants/index.ts
export const API_BASE_URL = 'http://localhost/project-showcase-api';
```

*(Catatan: Pastikan XAMPP Apache sudah berjalan saat testing lokal)*

---

## 2. Endpoint yang Siap Digunakan

### A. Endpoint Data Proyek
Mengambil daftar proyek untuk ditampilkan di 3D Grid atau daftar portfolio.

*   **Endpoint**: `GET /api/projects`
*   **Aksi Frontend**:
    *   Lakukan *fetching* (menggunakan `fetch` atau Axios) saat halaman di-load (misal pada komponen *parent* atau via Next.js Data Fetching).
    *   Tampilkan response array ke dalam komponen UI *card*. Properti yang tersedia: `title`, `description`, `techStack`, `previewImageUrl`, dll.

### B. Endpoint Penjelasan AI (AI Project Explainer)
Memberikan penjelasan dinamis mengenai suatu proyek berdasarkan tingkat kesulitan (*beginner*, *intermediate*, *expert*).

*   **Endpoint**: `POST /api/ai/explain`
*   **Request Body**:
    ```json
    {
      "projectId": 1,
      "difficulty": "beginner"
    }
    ```
*   **Aksi Frontend**:
    1. Buat tombol kontrol (Beginner | Intermediate | Expert) di halaman detail proyek.
    2. Saat *user* mengeklik tombol, tampilkan *Skeleton Loading* pada paragraf teks.
    3. Panggil API dengan ID proyek dan level kesulitan yang di-*request*.
    4. Tangkap nilai dari `response.explanation` dan render ke layar.

### C. Endpoint Chatbot AI (NEW ✅)
Fitur asisten virtual *floating chat* di pojok kanan bawah yang bisa ditanya seputar profil. *Endpoint* ini telah diberikan simulasi *delay* `sleep(1)` untuk meniru proses *loading* AI sungguhan.

*   **Endpoint**: `POST /api/ai/chat`
*   **Request Body**:
    ```json
    {
      "message": "Bisa bikin aplikasi apa aja nih?"
    }
    ```
*   **Aksi Frontend**:
    1. Pastikan komponen `AiChatOverlay.tsx` mengelola *state* percakapan (array history `user` dan `ai`).
    2. Saat *user* *submit* pesan:
       * Tampilkan pesan *user* di UI chat.
       * Munculkan *loading state* (contoh: animasi "*AI is typing...*").
       * Kirim pesan ke API.
    3. Setelah berhasil menerima balasan, sembunyikan animasi *typing* dan tampilkan `response.reply` ke layar.
    4. Implementasikan *auto-scroll to bottom* setiap kali ada pesan baru masuk.

---

## 3. Catatan Penting & Penanganan Error

- **CORS Handling**: Backend sudah dikonfigurasi untuk menerima permintaan dari segala *origin* saat masa _development_. Pastikan URL yang di-hit di sisi *frontend* penulisannya tepat tanpa ekstra karakter `/` di belakang yang bisa memicu galat.
- **Error States**: Selalu antisipasi jika server sedang mati atau koneksi lambat dengan `try...catch`. Berikan notifikasi yang ramah bagi pengunjung (*UI Fallback*).

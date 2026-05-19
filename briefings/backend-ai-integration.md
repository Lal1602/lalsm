# 🤖 Panduan Integrasi AI Backend

Dokumen ini adalah *briefing* untuk tim Backend agar fitur **AI Assistant** dan **AI Project Explainer** di frontend bisa beroperasi dengan sempurna.

---

## 1. Arsitektur & Model AI yang Dibutuhkan

Frontend dirancang hanya sebagai **UI (User Interface)**. Semua pemrosesan teks, logika AI, dan proteksi prompt harus dikerjakan di sisi backend.

**Rekomendasi Layanan LLM (Large Language Model) untuk Backend:**
Backend perlu terintegrasi dengan salah satu API LLM berikut:
- **OpenAI API** (Disarankan: `gpt-4o-mini` - Cepat, murah, pintar)
- **Google Gemini API** (Disarankan: `gemini-1.5-flash` - Ada tier gratis yang besar)
- **Anthropic Claude API** (Disarankan: `claude-3-haiku` - Sangat responsif)

---

## 2. Endpoint yang Harus Dibuat (Wajib)

Ada 2 endpoint AI yang di-hit oleh frontend secara spesifik.

### A. Endpoint Penjelasan Proyek (Di dalam Box Proyek)

Fitur ini menerjemahkan/menjelaskan proyek berdasarkan "tingkat kesulitan" pemahaman (Beginner, Intermediate, Expert).

*   **Endpoint:** `POST /api/ai/explain`
*   **Request Body (JSON):**
    ```json
    {
      "projectId": 1,
      "difficulty": "beginner" // bisa "beginner", "intermediate", "expert"
    }
    ```
*   **Logika Backend yang Dibutuhkan:**
    1. Ambil `projectId`, lalu _query_ data proyek tersebut dari database (Judul, Deskripsi, Tech Stack).
    2. Susun prompt untuk LLM. Contoh prompt:
       *"Jelaskan proyek [Judul] yang dibuat dengan [Tech Stack] ini kepada pengguna dengan bahasa Indonesia tingkat [difficulty]. Buat maksimal 3 kalimat padat."*
    3. Panggil API LLM (OpenAI/Gemini).
    4. Kembalikan response.
*   **Response Sukses (200 OK):**
    ```json
    {
      "projectId": 1,
      "explanation": "Aplikasi ini seperti loker pintar yang bisa dikontrol lewat HP, memudahkan pengguna tanpa perlu kunci fisik."
    }
    ```

### B. Endpoint Chatbot Interaktif (Tombol ✨ di Pojok Kanan Bawah)

Fitur ini adalah asisten virtual portofolio kamu. Tujuannya untuk menjawab pertanyaan pengunjung seputar pengalaman kerja dan proyekmu.

*   **Endpoint:** `POST /api/ai/chat`
*   **Request Body (JSON):**
    ```json
    {
      "message": "Kamu bisa pakai bahasa pemrograman apa saja?",
      "history": [
        { "role": "ai", "text": "Hi! Let me know if you need help exploring the projects." }
      ]
    }
    ```
*   **Logika Backend yang Dibutuhkan:**
    1. Siapkan **System Prompt** rahasia yang tidak diketahui user. Contoh:
       *"Kamu adalah asisten virtual Dimas Rahmanda Al Farizi. Jawab pertanyaan pengguna hanya tentang Dimas. Dimas adalah mahasiswa Informatika UPNVJATIM dan Fullstack Web/IoT Developer yang menguasai React Native, Node.js, Next.js. Jika ditanya hal di luar pemrograman atau profil Dimas, tolak dengan sopan."*
    2. Gabungkan `history` dari request dengan `message` baru agar AI tahu konteks pembicaraan.
    3. Panggil API LLM (OpenAI/Gemini).
    4. Kembalikan balasan (hanya teks balasan dari AI).
*   **Response Sukses (200 OK):**
    ```json
    {
      "reply": "Dimas menguasai berbagai bahasa dan framework seperti React Native, Node.js, Next.js, dan memiliki pengalaman di bidang IoT!"
    }
    ```

---

## 3. Keamanan & Proteksi (Wajib Diperhatikan Backend)

- **CORS:** Jangan lupa izinkan `Origin` dari frontend (misalnya `http://localhost:3000`).
- **Prompt Injection:** Pastikan backend menggunakan parameter *System Prompt* dengan tegas agar pengguna tidak bisa menyuruh AI melakukan hal-hal aneh (seperti menulis puisi kasar atau hal yang merusak citramu).
- **Rate Limiting:** Batasi jumlah request per IP (misalnya maksimal 10 chat per menit) untuk menghindari tagihan API LLM yang membengkak akibat ulah spammer.
- **Waktu Tunggu (Timeout):** API LLM terkadang butuh waktu beberapa detik. Pastikan backend tidak memutuskan koneksi (timeout) setidaknya selama 15-20 detik. Frontend sudah dilengkapi indikator "Mengetik...".

---

## 4. Cara Mengetes Tanpa API LLM Sungguhan (Masa Development)

Jika backend developer belum menyambungkan ke API OpenAI/Gemini, cukup buat "Mock Endpoint" (response palsu) di backend PHP/Node.js kalian.

**Contoh Mock PHP untuk Chat:**
```php
<?php
// Mock file: /api/ai/chat/index.php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

$message = $input['message'] ?? '';
sleep(1); // pura-pura loading seperti AI asli

echo json_encode([
    "reply" => "Wah, menarik! Namun saat ini otak saya (Backend AI) masih dalam tahap pembangunan oleh tim. Coba tanya lagi nanti ya!"
]);
```

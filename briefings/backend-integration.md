# Frontend Integration Briefing - Project Showcase API

Dokumen ini berisi panduan teknis untuk tim frontend dalam melakukan integrasi dengan API `Project Showcase` yang telah di-deploy secara lokal. Semua endpoint telah mendukung **CORS**, sehingga _fetching_ langsung dari port frontend (misal: `localhost:3000` atau `localhost:5173`) dapat dilakukan tanpa kendala.

---

## 1. Konfigurasi Dasar

- **Base URL API Local**: `http://localhost/project-showcase-api`
- **Tipe Konten**: Semua respons API menggunakan format `application/json`.
- **Method yang didukung**: `GET`, `POST`, `OPTIONS`.

> **Tips:** Buat variabel global pada frontend (contohnya `const API_BASE_URL = 'http://localhost/project-showcase-api';`) untuk mempermudah pemanggilan.

---

## 2. Endpoint: Get Data Proyek

Endpoint ini digunakan untuk memuat aset 3D Mesh dan detail daftar proyek sejak pertama kali halaman dirender.

- **URL:** `${API_BASE_URL}/api/projects`
- **Method:** `GET`

### Contoh Integrasi (Fetch API / React Frontend):

```javascript
// Memanggil data proyek saat komponen pertama kali di-mount
async function fetchProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    if (!response.ok) throw new Error("Network error");

    const projects = await response.json();
    console.log("Data Proyek:", projects);

    // Simpan ke state: misal setProjects(projects)
  } catch (error) {
    console.error("Gagal mendapatkan proyek:", error);
  }
}
```

---

## 3. Endpoint: Dynamic AI Explainer (Toggle Tingkat Kesulitan)

Digunakan ketika _user_ mengganti tingkat kesulitan penjelasan (_beginner_, _intermediate_, atau _expert_) untuk sebuah proyek aktif di antarmuka 3D.

- **URL:** `${API_BASE_URL}/api/ai/explain`
- **Method:** `POST`
- **Headers Needed:** `Content-Type: application/json`

### Data yang Dikirim (Request Body):

```json
{
  "projectId": 1,
  "difficulty": "beginner"
}
```

### Contoh Integrasi (Fetch API / React Frontend):

```javascript
async function fetchAiExplanation(projectId, difficultyLevel) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: projectId,
        difficulty: difficultyLevel, // "beginner" | "intermediate" | "expert"
      }),
    });

    const data = await response.json();
    console.log("Penjelasan AI:", data.explanation);

    // Perbarui UI Text Box dengan penjelasan terbaru
    // setTextContent(data.explanation)
  } catch (error) {
    console.error("Gagal meminta penjelasan:", error);
  }
}
```

---

## 4. Endpoint: Analytics Tracking (Interaksi 3D)

Kirim log dari _frontend_ saat user melihat animasi _hover_ pada GSAP/Three.js, mengklik objek, atau saat kamera berpindah ke _view_ spesifik proyek untuk keperluan _passive tracking_.

- **URL:** `${API_BASE_URL}/api/analytics/interaction`
- **Method:** `POST`
- **Headers Needed:** `Content-Type: application/json`

### Data yang Dikirim (Request Body):

```json
{
  "projectId": 2,
  "interactionType": "hover",
  "timestamp": "2026-04-25T16:00:00Z"
}
```

### Contoh Integrasi (Fetch API / React Frontend):

```javascript
// Dipanggil secara pasif di dalam event handler 3D/GSAP
function trackInteraction(projectId, type) {
  // Fire and forget (tanpa perlu await secara strictly)
  fetch(`${API_BASE_URL}/api/analytics/interaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: projectId,
      interactionType: type, // "hover" | "click" | "view"
      timestamp: new Date().toISOString(),
    }),
  }).catch((err) => console.error("Tracking Error:", err));
}
```

---

**Cacatan Pengembangan:**
Jika di masa depan ada modifikasi struktur respons UI 3D atau ada _endpoint_ baru (contohnya form kontak dsb.), dokumen ini akan selalu diperbarui (_briefing sync_) agar tim _frontend_ tidak tertinggal.

# 🔧 Backend Error Briefing — Project Showcase API

Dokumen ini merangkum semua **error frontend yang berhubungan dengan backend API**. Tim backend perlu memastikan endpoint berikut sudah berjalan dan mereturn format JSON yang tepat.

---

## 🔴 Error Kritis — Harus Diperbaiki

### 1. `GET /api/projects` — Response kosong menyebabkan crash 3D

**Masalah:** Ketika endpoint belum siap / return array kosong `[]`, carousel 3D frontend melakukan kalkulasi sudut `fov / count` dimana `count = 0` → menghasilkan `Infinity` → WebGL crash.

**Fix Frontend:** Sudah diproteksi dengan guard `if (count === 0) return []`.  
**Tindakan Backend:** Pastikan endpoint ini selalu mereturn array (minimal `[]`), bukan `null` atau HTML error page.

**Expected Response:**

```json
[
	{
		"id": 1,
		"slug": "smart-parcel-locker",
		"title": "Smart Parcel Locker IoT App",
		"description": "Aplikasi mobile enterprise-grade untuk manajemen loker pintar.",
		"techStack": ["React Native", "Node.js", "MQTT", "Prisma"],
		"previewImageUrl": "https://example.com/preview.png",
		"githubUrl": "https://github.com/dimasrahmandaalfarizi/smart-parcel-locker-iot-app",
		"liveUrl": "",
		"features": ["QR Code Auth", "Share Access PIN", "Loker Map", "Helpdesk"]
	}
]
```

> ⚠️ `liveUrl` dan `githubUrl` boleh string kosong `""` tapi **TIDAK boleh `null`** — frontend langsung menggunakannya sebagai URL.

---

### 2. `POST /api/ai/explain` — Error response menyebabkan parse crash

**Masalah:** Jika backend return status `4xx` atau `5xx`, frontend sebelumnya langsung memanggil `.json()` tanpa cek status → crash.

**Fix Frontend:** Sudah ditambahkan cek `response.ok`.  
**Tindakan Backend:** Pastikan error response selalu berformat JSON, bukan HTML:

```json
// ✅ Benar — error dengan JSON
HTTP 400
{ "error": "projectId is required", "code": "VALIDATION_ERROR" }

// ❌ Salah — jangan return HTML pada error
HTTP 500
<!DOCTYPE html>...
```

**Request Body:**

```json
{
	"projectId": 1,
	"difficulty": "beginner"
}
```

**Expected Response (200):**

```json
{
	"projectId": 1,
	"explanation": "Proyek ini adalah aplikasi mobile IoT untuk mengelola loker pintar..."
}
```

---

### 3. `POST /api/analytics/interaction` — Fire-and-forget, tapi tetap harus response JSON

**Masalah:** Frontend mengirim tracking event tanpa menunggu respons. Jika backend crash atau return non-JSON, error akan tercetak di console dan mengacaukan log debugging.

**Tindakan Backend:** Selalu return `200 OK` dengan body singkat:

```json
{ "success": true }
```

**Request Body:**

```json
{
	"projectId": 1,
	"interactionType": "hover",
	"timestamp": "2026-04-26T00:00:00.000Z"
}
```

> `interactionType` bisa: `"hover"` | `"click"` | `"view"`

---

## 🟡 Peringatan Tambahan

### CORS

Semua endpoint harus mengizinkan request dari `http://localhost:3000` (port dev Next.js):

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Content-Type Header

Semua response harus menyertakan:

```
Content-Type: application/json
```

Jika tidak, `response.json()` di frontend akan gagal meskipun body-nya valid JSON.

---

## ✅ Checklist Backend

- [ ] `GET /api/projects` → return array `Project[]`, tidak pernah `null`
- [ ] `Project.liveUrl` dan `Project.githubUrl` tidak boleh `null`, pakai `""` jika kosong
- [ ] `POST /api/ai/explain` → return `{ explanation: string }` atau JSON error yang valid
- [ ] `POST /api/analytics/interaction` → return `{ success: true }`
- [ ] CORS dikonfigurasi untuk `localhost:3000`
- [ ] Semua error response berformat JSON, bukan HTML

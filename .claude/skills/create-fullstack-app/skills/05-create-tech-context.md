---
name: create-tech-context
description: Gunakan skill ini ketika user ingin membuat dokumen TECH_CONTEXT.md sebagai briefing untuk AI agent (Claude Code) sebelum memulai implementasi. Trigger ketika user menyebut "tech context", "briefing untuk claude code", "context untuk AI agent", "rules implementasi", atau ketika PRD dan SAD sudah selesai dan user ingin menyiapkan semua dokumen pre-implementation. Skill ini menghasilkan dokumen ringkas namun komprehensif yang berisi stack, versi, konvensi kode, dan rules yang harus diikuti AI agent agar implementasi konsisten dengan desain arsitektur.
---

# Skill: Create Tech Context

Skill ini menghasilkan dokumen `TECH_CONTEXT.md` yang berfungsi sebagai "single source of truth" untuk AI agent saat mengimplementasikan kode — memastikan semua keputusan teknis dari SAD diikuti dengan konsisten.

## Input yang Dibutuhkan

- `SAD_[NamaProduk].md` — **wajib ada**
- `PRD_[NamaProduk].md` — untuk konteks bisnis
- `GIT_STRATEGY.md` — untuk konvensi commit

Jika SAD belum ada, arahkan user untuk menjalankan skill `create-sad` terlebih dahulu.

---

## Role yang Diambil

Bertindak sebagai **Tech Lead** yang menulis panduan kode untuk anggota tim baru — dalam hal ini AI agent. Dokumen harus cukup detail agar AI tidak perlu menebak, tapi cukup ringkas agar mudah di-scan.

---

## Fase 1: Ekstrak Informasi dari SAD & PRD

Baca SAD dan PRD, ekstrak informasi berikut:
- Stack lengkap beserta versi yang sudah diputuskan
- Pola arsitektur yang digunakan (layer structure, dll)
- Keputusan teknis penting yang tidak boleh dilanggar
- Hal-hal yang secara eksplisit TIDAK boleh dilakukan

---

## Fase 2: Generate TECH_CONTEXT.md

```markdown
# Tech Context — [Nama Produk]
> Baca dokumen ini sebelum menulis satu baris kode pun.
> Untuk konteks bisnis dan fitur, lihat PRD_[NamaProduk].md dan SAD_[NamaProduk].md.

---

## Stack & Versi

### Backend
| Package | Versi | Catatan |
|---|---|---|
[list semua package backend dengan versi dan catatan penting]

### Frontend
| Package | Versi | Catatan |
|---|---|---|
[list semua package frontend dengan versi dan catatan penting]

### Infrastructure
| Service | Dipakai untuk |
|---|---|
[list semua external service]

---

## Struktur Folder

[ringkasan struktur folder dari SAD, dengan keterangan singkat per folder]

---

## Rules Backend — WAJIB DIIKUTI

### 1. Layer Responsibility
[jelaskan tanggung jawab tiap layer secara explicit]

### 2. [Rule Kritis 1 — contoh: Tenant Isolation]
[jelaskan rule dengan contoh kode BENAR dan SALAH]

### 3. Error Handling
[jelaskan pattern yang harus digunakan]

### 4. Response Format
[tempel contoh format response standar]

### 5. Validasi Input
[jelaskan library dan cara validasi]

### 6. [Rule Kritis Lainnya — sesuaikan dengan SAD]
[auth, password hashing, database access, dll]

---

## Rules Frontend — WAJIB DIIKUTI

### 1. Server Component vs Client Component
[aturan kapan menggunakan masing-masing, dengan contoh BENAR dan SALAH]

### 2. Caching
[dokumentasikan caching model yang digunakan beserta contoh kode]

### 3. Data Fetching
[aturan fetch di SC vs CC]

### 4. [Rules Framework-Specific]
[contoh: proxy.ts vs middleware.ts, async params, image optimization, dll]

---

## Git Convention (Ringkasan)
[quick reference dari GIT_STRATEGY.md]

---

## Environment Variables
[panduan: semua config harus dari .env, tidak ada hardcode]

---

## Yang TIDAK BOLEH Dilakukan AI Agent
[list eksplisit hal-hal yang dilarang, minimal 8-10 item]

---

## Cara Pakai Dokumen Ini

[instruksi cara membuka sesi Claude Code dengan dokumen ini sebagai konteks]

Contoh prompt pembuka yang efektif:
[berikan 2-3 contoh prompt yang bisa langsung dipakai]
```

---

## Panduan Penulisan Rules

### Untuk setiap rule yang kritis, gunakan format ini:
```
### N. Nama Rule

[penjelasan 1-2 kalimat]

// ✅ BENAR
[contoh kode yang benar]

// ❌ SALAH
[contoh kode yang salah]
```

### "Yang TIDAK BOLEH" harus sangat eksplisit
Ini adalah bagian paling penting dari dokumen. Contoh:
- Jangan hardcode nilai yang seharusnya ada di `.env`
- Jangan query database tanpa filter `[tenantId/publicationId]`
- Jangan gunakan `[library X]` — pakai `[library Y]`
- Jangan commit file `.env`
- Jangan gunakan `<img>` — pakai `[next/image atau equivalent]`

---

## Output Behavior

**Di Claude Code:** Simpan ke `docs/TECH_CONTEXT.md`

**Di Claude.ai:** Tampilkan konten lengkap, informasikan user bahwa ini siap di-copy ke file `docs/TECH_CONTEXT.md`

---

## Catatan Penting

- Dokumen ini harus di-update setiap ada perubahan signifikan di SAD
- Semakin spesifik rules-nya, semakin konsisten output AI agent-nya
- Setiap "jangan lakukan X" harus disertai "lakukan Y sebagai gantinya"
- Dokumen ini dibaca oleh AI agent di awal setiap sesi implementasi — jaga agar tetap scannable, gunakan headers dan bold untuk hal yang kritis

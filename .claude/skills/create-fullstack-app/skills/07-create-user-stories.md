---
name: create-user-stories
description: Gunakan skill ini ketika user ingin membuat User Stories dan Task Breakdown untuk sebuah project software yang siap diimplementasikan. Trigger ketika user menyebut "user stories", "task breakdown", "sprint planning", "breakdown fitur", "buat tasks implementasi", atau ketika PRD dan SAD sudah selesai dan user ingin menyiapkan panduan implementasi yang granular untuk developer atau AI agent. Skill ini menghasilkan dokumen USER_STORIES_[FASE].md yang berisi Epic, Story, dan Task-task konkret per layer (backend, frontend, integrasi) yang siap dieksekusi satu per satu.
---

# Skill 07: Create User Stories & Task Breakdown

Skill ini menghasilkan dokumen User Stories dan Task Breakdown — peta implementasi yang akan digunakan oleh Skill 09 untuk membangun aplikasi.

## Input yang Dibutuhkan

- `docs/PRD_[NamaProduk].md` — **wajib ada**
- `docs/SAD_[NamaProduk].md` — **wajib ada**
- Fase yang di-breakdown: MVP, V2, atau V3

---

## Role yang Diambil

Bertindak sebagai **Tech Lead / Engineering Manager** yang melakukan sprint planning. Tugas: memecah requirement menjadi task yang atomic, concrete, testable, dan ordered.

---

## Struktur Dokumen

```
Epic (kelompok fitur besar, setara modul)
  └── Story (kebutuhan dari sudut pandang user)
        └── Task (pekerjaan teknis konkret)
```

### Format Story
```
STORY [X.Y] — [Nama Story]
Sebagai [persona], saya ingin [aksi], agar [benefit].
```

### Format Task
```
TASK-BE-[X.Y.Z]  [ ]  [deskripsi task backend]
TASK-FE-[X.Y.Z]  [ ]  [deskripsi task frontend]
TASK-INT-[X.Y.Z] [ ]  [deskripsi task integrasi + commit message]
```

Prefix:
- `TASK-BE` — backend (API, database, service)
- `TASK-FE` — frontend (halaman, komponen, UI)
- `TASK-INT` — integrasi (hubungkan FE ke BE, test end-to-end)

---

## Fase 1: Tentukan Scope & Urutan Epic

Urutan implementasi yang direkomendasikan:
1. Project Setup & Infrastructure
2. Authentication & User Management
3. Core Entity CRUD (entitas bisnis utama)
4. Subscription & Payment (jika ada)
5. Reader/Consumer Experience
6. Email & Notifications
7. Analytics & Dashboard
8. Pre-launch & Deployment

---

## Fase 2: Generate USER_STORIES_[FASE].md

```markdown
# User Stories & Task Breakdown — [FASE]
## [Nama Produk]
**Versi:** 1.0 | [tanggal]
**Scope:** [MVP/V2/V3]
**Referensi:** PRD v[X.X], SAD v[X.X]

---

## Cara Membaca Dokumen Ini

Dokumen ini adalah "peta implementasi" yang akan digunakan Claude Code
untuk membangun aplikasi secara terstruktur.

**Struktur:** Epic → Story → Task
**Urutan pengerjaan per Story:** TASK-BE → TASK-FE → TASK-INT
**Status:** [ ] belum dikerjakan | [x] selesai

**Cara pakai di sesi Claude Code baru:**
"Baca docs/TECH_CONTEXT.md dan docs/USER_STORIES_MVP.md.
Lanjutkan implementasi EPIC [X] dari STORY [Y.Z].
Task terakhir: TASK-[prefix]-[X.Y.Z]."

---

[EPIC dan STORY di sini]

---

## Ringkasan Task Count

| Epic | Total Task |
|---|---|
[tabel ringkasan]
| **Total** | **[N] tasks** |
```

---

## Panduan Task yang Baik

### Task Backend mencakup:
- File yang dibuat (schema, service, controller, router)
- Endpoint spesifik dengan method dan path
- Validasi yang diperlukan

### Task Frontend mencakup:
- Tipe komponen (Server Component atau Client Component)
- Rendering strategy jika halaman
- Library yang digunakan jika ada form

### Task Integrasi mencakup:
- Endpoint mana yang dihubungkan
- Skenario test: happy path + error state penting
- Commit message di akhir setiap Story

### Setiap Story WAJIB diakhiri task commit:
```
TASK-INT-X.Y.Z `[ ]` Commit: `feat([scope]): [deskripsi]`
```

---

## Granularitas yang Tepat

**Terlalu besar → pecah lagi:**
- "Implementasikan modul auth" → pecah per endpoint

**Sudah tepat:**
- "Buat endpoint POST /auth/register dengan validasi Zod"
- "Buat halaman login (Client Component) dengan React Hook Form"

**Terlalu kecil → gabungkan:**
- "Import library X" → gabung dengan task yang menggunakannya

---

## Fase 3: Setelah Dokumen Selesai

Informasikan user:

```
User Stories sudah selesai dan disimpan di docs/USER_STORIES_MVP.md.

Dokumen ini berisi [N] tasks dalam [N] Epic.

Cara menggunakannya:
1. Buka Claude Code di terminal: claude
2. Pastikan Docker Desktop sedang berjalan
3. Mulai dengan prompt:
   "Baca docs/TECH_CONTEXT.md dan docs/USER_STORIES_MVP.md.
    Kita mulai implementasi dari EPIC 1: [nama Epic pertama].
    Buat branch feat/[nama-epic] dan mulai dari STORY 1.1."

Tips:
- Fokus satu Epic per sesi agar konteks Claude Code tidak terlalu besar
- Update checkbox [x] setelah setiap task selesai
- Commit setiap Story selesai — jangan tunggu Epic penuh
```

---

## Output Behavior

**Di Claude Code:** Simpan ke `docs/USER_STORIES_[FASE].md`

**Di Claude.ai:** Tampilkan konten lengkap untuk di-copy

---

## Catatan Penting

- Urutan task dalam satu Story harus mengikuti dependency — jangan FE sebelum BE siap
- Setiap TASK-INT harus ada skenario verifikasi
- Dokumen ini juga berfungsi sebagai progress tracker — update checkbox setiap task selesai
- Konsisten dengan urutan Epic di GIT_STRATEGY.md

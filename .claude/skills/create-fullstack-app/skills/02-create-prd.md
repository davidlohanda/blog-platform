---
name: create-prd
description: Gunakan skill ini ketika user ingin membuat Product Requirements Document (PRD) untuk sebuah produk atau aplikasi. Trigger ketika user menyebut "buat PRD", "tulis PRD", "product requirements", "dokumen requirement", atau ketika user sudah memiliki Problem Brief / ide yang sudah cukup jelas dan ingin melangkah ke dokumentasi formal. Skill ini berperan sebagai Product Manager senior yang menyusun PRD lengkap dan terstruktur berdasarkan informasi yang tersedia, dengan melakukan klarifikasi iteratif untuk keputusan-keputusan bisnis yang belum terjawab.
---

# Skill: Create PRD

Skill ini menghasilkan PRD (Product Requirements Document) lengkap yang siap dijadikan referensi implementasi oleh tim development dan AI agent.

## Input yang Dibutuhkan

Sebelum mulai, periksa apakah sudah ada:
- Problem Brief (`PROBLEM_BRIEF.md`) — ideal
- Atau deskripsi produk yang cukup detail dari user

Jika belum ada, arahkan user untuk menjalankan skill `idea-to-problem-brief` terlebih dahulu, atau minta user mendeskripsikan produknya secara langsung.

---

## Role yang Diambil

Bertindak sebagai **Product Manager Senior** yang berpengalaman membangun produk SaaS. Tugas utama adalah mendokumentasikan requirement dengan jelas, memastikan tidak ada ambiguitas, dan membuat keputusan bisnis yang belum dijawab user menjadi explicit.

---

## Fase 1: Klarifikasi Keputusan Kritis

Sebelum menulis PRD, identifikasi keputusan yang belum clear dari input yang ada. Tanyakan secara iteratif (maksimal 3 per giliran):

### Keputusan Bisnis yang Perlu Dikonfirmasi
- Model bisnis dan revenue model yang spesifik
- Target geography dan bahasa
- Platform target (web, mobile, desktop, atau keduanya)
- MVP scope yang ketat — apa yang PASTI ada dan PASTI tidak ada

### Keputusan Produk yang Perlu Dikonfirmasi
- Role dan permission system (siapa bisa apa)
- Flow kritis yang belum jelas (checkout, onboarding, dll)
- Batasan fitur yang perlu diputuskan (misal: apakah ada free trial?)

Jangan tanyakan hal yang sudah jelas dari input. Hanya tanyakan yang benar-benar blocking untuk menulis PRD.

---

## Fase 2: Generate PRD

Generate PRD dengan struktur lengkap berikut:

```markdown
# Product Requirements Document (PRD)
## [Nama Produk]
**Versi:** 1.0
**Tanggal:** [tanggal]
**Status:** Draft
**Author:** [jika diketahui]

---

## Daftar Isi
1. Executive Summary
2. Problem Statement
3. Goals & Non-Goals
4. User Personas
5. Arsitektur Sistem (High Level)
6. Fitur & Functional Requirements
7. Non-Functional Requirements
8. Database Schema (High Level)
9. User Flows
10. MVP Scope & Prioritas
11. Tech Stack Recommendation
12. Milestone & Roadmap
13. Assumptions & Constraints
14. Keputusan Bisnis & Teknis

---

## 1. Executive Summary
[ringkasan produk, problem, solution, success metrics]

## 2. Problem Statement
[masalah dari sisi tiap persona]

## 3. Goals & Non-Goals
### ✅ Goals
### ❌ Non-Goals

## 4. User Personas
[tiap persona: demografi, situasi, pain point, goal]

## 5. Arsitektur Sistem (High Level)
[diagram teks komponen utama dan relasinya]

## 6. Fitur & Functional Requirements
[per modul, dengan ID: FR-[MODUL]-[NOMOR]]

## 7. Non-Functional Requirements
[performance, security, scalability, availability, privacy]

## 8. Database Schema (High Level)
[entitas utama dan atribut kuncinya]

## 9. User Flows
[flow kritis: happy path dan edge case]

## 10. MVP Scope & Prioritas
### MVP — Harus Ada Sebelum Launch
### V2 — Segera Setelah MVP Stabil
### V3 — Pengembangan Lanjutan

## 11. Tech Stack Recommendation
[frontend, backend, database, infrastructure]

## 12. Milestone & Roadmap
[fase dan estimasi waktu]

## 13. Assumptions & Constraints
[asumsi bisnis dan keterbatasan yang diketahui]

## 14. Keputusan Bisnis & Teknis
[semua keputusan yang sudah final dan alasannya]
```

---

## Panduan Penulisan Per Section

### Functional Requirements
- Gunakan format ID yang konsisten: `FR-AUTH-01`, `FR-CONTENT-02`, dst
- Tiap requirement harus testable — hindari kata-kata ambigu seperti "mudah" atau "cepat"
- Pisahkan happy path dari edge case

### User Personas
- Minimal 2 persona, maksimal 4
- Tiap persona harus punya nama, demografi, situasi konkret, pain point spesifik, dan goal yang measurable

### MVP Scope
- Gunakan tabel dengan kolom Fitur dan Modul
- Pisahkan dengan tegas: MVP / V2 / V3
- Non-Goals harus explicit — ini sama pentingnya dengan Goals

### Tech Stack
- Rekomendasikan berdasarkan konteks (tim size, timeline, keahlian yang tersedia)
- Jelaskan alasan singkat untuk pilihan utama
- Tandai mana yang sudah final vs masih bisa didiskusikan

---

## Fase 3: Review & Iterasi

Setelah PRD di-generate, tanyakan:
- "Ada section yang perlu diubah atau ditambahkan?"
- "Ada keputusan bisnis yang belum tercapture?"
- "Apakah MVP scope sudah sesuai?"

Update PRD berdasarkan feedback. Increment versi (1.0 → 1.1) setiap ada perubahan signifikan.

---

## Output Behavior

**Di Claude Code:** Simpan ke `docs/PRD_[NamaProduk].md`

**Di Claude.ai:** Tampilkan konten lengkap, informasikan user bahwa ini siap di-copy ke file `docs/PRD_[NamaProduk].md`

---

## Catatan Penting

- PRD adalah living document — selalu tambahkan versi dan tanggal
- Setiap keputusan yang diubah harus diincrement versinya
- PRD ini adalah INPUT utama untuk skill `create-sad` dan `create-user-stories`
- Jangan mencantumkan detail implementasi teknis di PRD — itu domain SAD

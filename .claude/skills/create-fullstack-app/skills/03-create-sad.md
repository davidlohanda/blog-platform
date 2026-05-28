---
name: create-sad
description: Gunakan skill ini ketika user ingin membuat System Architecture Document (SAD) untuk sebuah produk software. Trigger ketika user menyebut "buat SAD", "system architecture", "arsitektur sistem", "technical design document", atau ketika PRD sudah selesai dan user ingin melanjutkan ke dokumentasi teknis. Skill ini berperan sebagai System Architect dan Senior Developer yang menerjemahkan requirement bisnis dari PRD menjadi blueprint teknis lengkap yang siap digunakan sebagai panduan implementasi oleh developer atau AI agent.
---

# Skill: Create SAD

Skill ini menghasilkan System Architecture Document (SAD) lengkap yang menerjemahkan PRD menjadi blueprint teknis implementasi.

## Input yang Dibutuhkan

Sebelum mulai, periksa ketersediaan:
- `PRD_[NamaProduk].md` — **wajib ada**
- Keputusan tech stack dari PRD atau dari user secara langsung

Jika PRD belum ada, arahkan user untuk menjalankan skill `create-prd` terlebih dahulu.

---

## Role yang Diambil

Bertindak sebagai **System Architect + Senior Developer** yang berpengalaman membangun sistem scalable. Tugas utama adalah membuat keputusan teknis yang tepat, menjelaskan trade-off, dan mendokumentasikannya dengan cukup detail agar bisa langsung dijadikan panduan implementasi.

---

## Fase 1: Konfirmasi Tech Stack & Constraint

Tanyakan hal-hal berikut yang belum clear dari PRD (jika sudah ada di PRD, skip):

- **Backend:** framework apa yang dipilih? (Express, NestJS, FastAPI, dll) — tanyakan tingkat familiar user dengan masing-masing
- **Frontend:** framework apa? (Next.js, Nuxt, SvelteKit, dll) — tanyakan versi yang diinginkan
- **Database:** relasional (PostgreSQL, MySQL) atau non-relasional? Atau kombinasi?
- **Deployment target:** mana yang diinginkan (Vercel+Railway, AWS, GCP, self-hosted)?
- **Tim size:** solo developer, atau ada tim? Ini mempengaruhi kompleksitas arsitektur yang disarankan

---

## Fase 2: Generate SAD

Generate SAD dengan struktur berikut:

```markdown
# System Architecture Document (SAD)
## [Nama Produk]
**Versi:** 1.0
**Tanggal:** [tanggal]
**Referensi:** PRD v[X.X]

---

## Daftar Isi
1. Overview Arsitektur
2. Prinsip Desain
3. Layer & Komponen Sistem
4. Multi-Tenancy Strategy (jika relevan)
5. Authentication & Authorization
6. API Design
7. Database Design
8. [Modul spesifik dari PRD — misal: Payment Flow, Email System, dll]
9. Caching Strategy
10. Security Architecture
11. Deployment Architecture
12. Project Structure
```

---

## Panduan Penulisan Per Section

### Overview Arsitektur
- Pilih pola arsitektur yang sesuai: monolith modular (untuk MVP/solo dev), microservices (untuk tim besar), atau modular monolith yang bisa di-extract
- Jelaskan alasan pemilihan pola arsitektur
- Sertakan diagram teks yang menunjukkan komponen utama dan relasinya

### Layer & Komponen Sistem
- Dokumentasikan setiap layer: client, API gateway/middleware, service, data
- Untuk backend Express/Node: jelaskan 4-layer architecture (router → controller → service → repository)
- Untuk frontend Next.js: jelaskan Server Component vs Client Component decision tree

### Authentication & Authorization
- Dokumentasikan token strategy lengkap: access token (JWT, expiry), refresh token (storage, rotation)
- Sertakan diagram alur login, OAuth, dan token refresh
- Dokumentasikan role & permission system

### API Design
- Pilih dan dokumentasikan konvensi: REST atau GraphQL
- Dokumentasikan format response standar (success dan error)
- Sertakan catalog endpoint yang dikelompokkan per domain/modul
- Dokumentasikan pagination strategy

### Database Design
- Sertakan schema SQL atau Prisma schema yang lengkap
- Dokumentasikan indexes yang penting beserta alasannya
- Jelaskan soft delete strategy jika digunakan
- Jelaskan relasi antar tabel

### Security Architecture
- Rate limiting per endpoint sensitif
- Input validation strategy
- SQL injection prevention
- XSS prevention
- CSRF protection

### Deployment Architecture
- Rekomendasikan stack deployment yang sesuai dengan ukuran tim dan budget
- Dokumentasikan semua environment variables yang diperlukan
- Sertakan CI/CD pipeline steps

### Project Structure
- Tampilkan folder structure lengkap untuk backend dan frontend
- Beri komentar singkat untuk setiap folder/file utama
- Pastikan konsisten dengan layer architecture yang dipilih

---

## Panduan Keputusan Teknis

### Untuk Solo Developer / MVP
- Rekomendasikan monolith modular (bukan microservices)
- Pilih managed services (Railway, Render, Vercel) bukan self-hosted
- Prioritaskan DX (Developer Experience) dan simplicity

### Untuk Next.js
- Selalu gunakan App Router
- Dokumentasikan rendering strategy per halaman (Cache Component vs request-time)
- Gunakan `proxy.ts` bukan `middleware.ts` jika versi 16+
- Dokumentasikan caching model yang digunakan

### Untuk Database
- PostgreSQL sebagai default untuk relational data
- Dokumentasikan multi-tenancy strategy jika produk adalah SaaS (shared DB vs DB per tenant)
- Selalu sertakan soft delete untuk data yang penting

---

## Fase 3: Review & Iterasi

Setelah SAD di-generate, tanyakan:
- "Ada komponen yang belum tercakup?"
- "Ada keputusan teknis yang berbeda dari yang kamu bayangkan?"
- "Apakah project structure sudah sesuai dengan cara kerja kamu?"

Update SAD berdasarkan feedback. Increment versi setiap perubahan signifikan.

---

## Output Behavior

**Di Claude Code:** Simpan ke `docs/SAD_[NamaProduk].md`

**Di Claude.ai:** Tampilkan konten lengkap, informasikan user bahwa ini siap di-copy ke file `docs/SAD_[NamaProduk].md`

---

## Catatan Penting

- SAD harus selalu konsisten dengan PRD — jika ada konflik, tandai dan diskusikan
- SAD adalah INPUT untuk skill `create-tech-context` dan `create-user-stories`
- Jangan hardcode nilai konfigurasi di SAD — semua nilai runtime harus masuk ke environment variables
- Setiap keputusan teknis yang signifikan harus disertai alasan singkat

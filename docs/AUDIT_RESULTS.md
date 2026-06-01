# Audit Results — 2026-06-01

Audit terhadap gap antara keputusan desain terbaru (CLAUDE.md v2.0 + USER_STORIES_MVP.md v2.0)
dan kondisi kode aktual.

---

## Status per Area

### AUTH

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| Refresh token scoped per publication | ❌ BELUM ADA | `auth.service.ts` | Key Redis masih `refresh:{userId}:{tokenId}` — tanpa `publicationId`. Token bersifat global per user, bukan per publication |
| Logout hanya hapus token publication aktif | ✅ SUDAH ADA | `auth.service.ts` | `logout()` menghapus hanya tokenId spesifik (line 157), bukan semua session — behavior sudah benar meski scope publikasi belum diimplementasi |
| Google OAuth dibatasi hanya untuk member | ❌ BELUM ADA | `passport.config.ts` | Callback tidak memeriksa role user. Owner dan platform_admin bisa login via Google tanpa hambatan |
| Forgot password: deteksi akun OAuth-only | ❌ BELUM ADA | `auth.service.ts` | `forgotPassword()` (line 163–177) tidak memeriksa `passwordHash`. Akun OAuth-only menerima email reset password biasa, bukan email informasi "akun terdaftar via Google" |
| Login lockout: 5x gagal dalam 15 menit (Redis counter) | ⚠️ PARTIAL | `rateLimiter.middleware.ts` | Ada express-rate-limit berbasis IP (5 req / **1 menit**). Yang dibutuhkan: counter Redis berbasis email+publicationId dengan window **15 menit**. Key pattern yang dibutuhkan: `login_attempts:{email}:{publicationId}` |

---

### FRONTEND ROUTES

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| `app/me/settings/page.tsx` masih ada sebagai standalone | ❌ MASIH ADA (perlu redirect) | `app/me/settings/page.tsx` | Halaman standalone — belum redirect ke `/{slug}/settings` |
| `app/me/subscription/page.tsx` masih ada sebagai standalone | ❌ MASIH ADA (perlu redirect) | `app/me/subscription/page.tsx` | Halaman standalone — belum redirect ke `/{slug}/subscription` |
| `app/(publication)/settings/page.tsx` sudah ada | ❌ BELUM ADA | — | Halaman settings dalam konteks publication belum dibuat |
| `app/(publication)/subscription/page.tsx` sudah ada | ❌ BELUM ADA | — | Halaman subscription dalam konteks publication belum dibuat |

---

### SUBSCRIPTION

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| Cache member status di-invalidate saat subscription expire | ⚠️ PARTIAL | `subscription.service.ts` | Cache di-invalidate saat **payment webhook sukses** (line 155) dan saat **cancel** (line 219). Tapi tidak ada job yang proaktif expire subscription saat `expiresAt` terlewati — status tetap `active` selamanya kecuali ada webhook baru |
| BullMQ job untuk auto-expire subscription | ❌ BELUM ADA | `email.jobs.ts` | Tidak ada background job yang mengecek `expiresAt` dan mengubah status ke `expired`. Subscription tidak pernah auto-expire |
| Subscription check server-side per render di artikel | ✅ SUDAH ADA | `app/(publication)/[articleSlug]/page.tsx` | Check dilakukan server-side tiap render (lines 248–256). Menggunakan DB check via `getArticleWithAuth()`, bukan hanya JWT payload |

---

### EMAIL

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| Job reminder 7 hari sebelum expired | ✅ SUDAH ADA | `email.jobs.ts` | Cron harian jam 08:00, memeriksa subscription yang expire dalam window 6–8 hari |
| Job reminder 1 hari sebelum expired | ❌ BELUM ADA | `email.jobs.ts` | Tidak ada job terpisah untuk reminder 1 hari |
| Webhook handler Resend bounce event | ❌ BELUM ADA | `email.controller.ts` | Email controller hanya punya endpoint unsubscribe manual. Tidak ada endpoint `POST /email/webhook/resend` |
| Field `emailBounceCount` di tabel Users | ❌ BELUM ADA | `schema.prisma` | Field tidak ada di model User |
| Field `emailBounced` di tabel Users | ❌ BELUM ADA | `schema.prisma` | Field tidak ada di model User |

---

### SERIES

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| Artikel premium menampilkan ikon gembok (🔒) | ⚠️ PARTIAL | `series/[slug]/page.tsx` | Menampilkan badge teks `"Premium"` (bukan ikon gembok). Spec minta ikon gembok |
| Klik artikel premium → modal subscribe (bukan navigasi) | ❌ BELUM ADA | `series/[slug]/page.tsx` | Klik artikel premium (line 140) navigasi langsung ke halaman artikel via `<Link>`. Paywall ditampilkan di halaman artikel, bukan modal dari halaman series |

---

### ROLES

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| Enum `PublicationRole` punya tiga nilai: owner \| admin \| author | ❌ BELUM ADA | `schema.prisma` | Enum bernama `AuthorRole`, hanya punya dua nilai: `owner \| author`. Nilai `admin` belum ada |
| Helper `isAdminOrOwner()` di roles.middleware.ts | ❌ BELUM ADA | `roles.middleware.ts` | Hanya ada satu fungsi: `requirePublicationRole(...roles)`. Tidak ada helper dedicated `isAdminOrOwner()` |

---

### ADMIN

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| Endpoint `PATCH /admin/publications/:id/fee` | ❌ BELUM ADA | `admin.router.ts` | Admin router hanya punya 4 route: GET /overview, GET /publications, GET /users, POST /invite-owner |
| Endpoint `POST /admin/impersonate/:userId` | ❌ BELUM ADA | `admin.router.ts` | Tidak ada |
| Endpoint `PATCH /admin/publications/:id/suspend` | ❌ BELUM ADA | `admin.router.ts` | Tidak ada |
| Field `platformFeePercent` di tabel Publications | ✅ SUDAH ADA | `schema.prisma` | `platformFeePercent Decimal @default(15.00)` (line 88) — field sudah ada |
| Enum status Publication: active \| suspended_soft \| suspended_hard \| pending_deletion | ❌ BELUM ADA | `schema.prisma` | Tidak ada status field/enum di model Publication. Yang ada hanya `customDomainStatus` (pending/verified/failed) |

---

### ONBOARDING

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| `accept-invite` adalah multi-step wizard (3 step) | ❌ BELUM ADA | `app/accept-invite/page.tsx` | Masih form single-step sederhana — hanya menampilkan tombol login/register jika unauthenticated, dan memanggil satu API endpoint jika authenticated |
| Endpoint `GET /publications/check-slug?slug=xxx` | ❌ BELUM ADA | `publication.router.ts` | Method `findBySlugExists()` ada di repository, tapi tidak ada GET endpoint yang diekspos ke frontend |

---

### SEED DATA

| Check | Status | File | Catatan |
|-------|--------|------|---------|
| Minimal 3 user dengan role berbeda | ⚠️ PARTIAL | `seed.ts` | Ada 3 user: `admin@lentera.id` (platform_admin), `owner@lentera.id` (default/member), `member@lentera.id` (default/member). Tidak ada user dengan role `author` yang eksplisit. Kedua non-admin user di-assign `AuthorRole.owner` di publication |
| Artikel punya cover image nyata | ❌ BELUM ADA | `seed.ts` | Semua artikel di-seed tanpa `coverImageUrl` (field tidak di-set sama sekali) |
| Subscription aktif untuk user test | ✅ SUDAH ADA | `seed.ts` | `member@lentera.id` punya subscription aktif 1 bulan (expires 2026-06-15) |

---

## Rekomendasi Prioritas

### CRITICAL — Blocking launch (harus selesai sebelum siapapun testing)

| # | Item | EPIC/STORY | Alasan |
|---|------|------------|--------|
| C1 | Subscription tidak pernah auto-expire | STORY 13.6 | Member yang expired tetap bisa baca konten premium — revenue loss dan security issue |
| C2 | Refresh token tidak scoped per publication | STORY 13.1 | Token dari publication A bisa dipakai di publication B — isolasi session tidak berfungsi |
| C3 | Artikel tidak punya cover image di seed | STORY 17.1 | UI publication homepage dan artikel terlihat kosong saat dev/demo |

### HIGH — Perlu sebelum user testing

| # | Item | EPIC/STORY | Alasan |
|---|------|------------|--------|
| H1 | Google OAuth bisa dipakai owner/admin | STORY 13.2 | Owner bisa bypass email+password auth requirement |
| H2 | Login rate limit pakai IP bukan email+publicationId | STORY 13.4 | Brute force account tertentu masih bisa dilakukan dari berbagai IP |
| H3 | Forgot password tidak deteksi akun OAuth-only | STORY 13.3 | User OAuth-only menerima email reset password yang tidak berfungsi — experience buruk |
| H4 | `app/me/settings` dan `app/me/subscription` masih standalone | STORY 13.5 | Melanggar keputusan produk: settings member harus dalam konteks publication |
| H5 | accept-invite bukan multi-step wizard | STORY 16.1 | Flow onboarding owner baru tidak sesuai spec — hanya single form |
| H6 | Seed data tidak punya cover image | STORY 17.1 | Semua demo/testing akan tampil tanpa gambar |
| H7 | Enum `AuthorRole` hanya 2 nilai (belum ada `admin`) | STORY 14.1 | Role system publication tidak lengkap, permission matrix tidak bisa diimplementasi |

### MEDIUM — Perlu sebelum production

| # | Item | EPIC/STORY | Alasan |
|---|------|------------|--------|
| M1 | Reminder email 1 hari sebelum expired tidak ada | STORY 13.7 | Spec minta dua reminder (7 hari + 1 hari) |
| M2 | Tidak ada bounce tracking (emailBounceCount, emailBounced) | STORY 13.8 | Email terus dikirim ke alamat yang bounce — deliverability reputation turun |
| M3 | Klik artikel premium di series tidak buka modal | STORY 13.9 | UX tidak sesuai spec — user harus navigate ke halaman artikel dulu |
| M4 | Tidak ada endpoint admin: fee, impersonate, suspend | STORY 15.1–15.3 | Admin tidak bisa mengelola platform dari UI |
| M5 | Publication tidak punya status field (suspended/pending_deletion) | STORY 15.3–15.4 | Tidak bisa implement suspend atau delete dengan cooling period |
| M6 | Tidak ada endpoint `GET /publications/check-slug` | STORY 16.1 | Wizard onboarding Step 2 tidak bisa validasi slug real-time |
| M7 | `app/(publication)/settings` dan `/subscription` belum ada | STORY 13.5 | Settings dan subscription member harus ada di konteks publication |

### LOW — Nice to have

| # | Item | EPIC/STORY | Alasan |
|---|------|------------|--------|
| L1 | Platform landing page masih sangat sederhana | STORY 16.3 | Perlu redesign untuk presentasi ke calon owner |
| L2 | Getting started checklist tanpa direct CTA | STORY 16.2 | Enhancement UX onboarding |
| L3 | Transfer ownership belum ada | STORY 15.5 | Edge case yang jarang dipakai |
| L4 | Delete publication dengan cooling period belum ada | STORY 15.4 | Fitur penting tapi tidak urgent untuk user testing |
| L5 | Seed tidak punya role `author` eksplisit | STORY 17.1 | Testing role author jadi kurang representatif |

---

## Mapping ke EPIC 13–17: Skip vs Implement

### EPIC 13 — Auth & Core Flow Fixes

| Story | Verdict | Alasan |
|-------|---------|--------|
| 13.1 Refresh Token Scoped | ❌ IMPLEMENT | Belum ada — kritis |
| 13.2 Google OAuth Hanya Member | ❌ IMPLEMENT | Belum ada |
| 13.3 Forgot Password OAuth | ❌ IMPLEMENT | Belum ada |
| 13.4 Login Lockout | ❌ IMPLEMENT | PARTIAL — rate limit ada tapi IP-based, perlu Redis per-email+publication |
| 13.5 Member Settings ke Publication | ❌ IMPLEMENT | Belum ada halaman publication context, `me/` masih standalone |
| 13.6 Subscription Cut-off | ❌ IMPLEMENT | BullMQ job untuk auto-expire belum ada |
| 13.7 Reminder 1 Hari | ❌ IMPLEMENT | Belum ada |
| 13.8 Email Bounce Handling | ❌ IMPLEMENT | Belum ada field di schema dan webhook |
| 13.9 Lock Icon + Modal di Series | ❌ IMPLEMENT | Badge ada tapi modal tidak ada |

### EPIC 14 — Tiga Role Publication

| Story | Verdict | Alasan |
|-------|---------|--------|
| 14.1 Role ADMIN | ❌ IMPLEMENT | Enum masih 2 nilai, tidak ada `admin` |

### EPIC 15 — Platform Admin Enhancements

| Story | Verdict | Alasan |
|-------|---------|--------|
| 15.1 Platform Fee per Publication | ⚠️ PARTIAL IMPLEMENT | Field `platformFeePercent` sudah ada di schema, tapi endpoint PATCH dan UI belum ada |
| 15.2 Impersonate Owner | ❌ IMPLEMENT | Belum ada sama sekali |
| 15.3 Suspend Publication | ❌ IMPLEMENT | Belum ada status field dan endpoint |
| 15.4 Delete Publication Cooling | ❌ IMPLEMENT | Belum ada |
| 15.5 Transfer Ownership | ❌ IMPLEMENT | Belum ada |

### EPIC 16 — Onboarding & Landing Page

| Story | Verdict | Alasan |
|-------|---------|--------|
| 16.1 Onboarding Wizard 3-Step | ❌ IMPLEMENT | Masih single-form, endpoint check-slug belum ada |
| 16.2 Getting Started Checklist CTA | ❌ IMPLEMENT | Checklist ada tapi tanpa direct CTA |
| 16.3 Platform Landing Page | ❌ IMPLEMENT | Masih sangat simpel |

### EPIC 17 — Seed Data Realistis

| Story | Verdict | Alasan |
|-------|---------|--------|
| 17.1 Rewrite Seed | ❌ IMPLEMENT | Tidak ada cover image, tidak ada author/admin role, tidak cukup variasi data |

---

## Temuan Tambahan dari REFACTOR_NOTES.md

Item teknis debt yang perlu diperhatikan saat implementasi EPIC 13–17 (dari scan kodebase sebelumnya):

| Item | Severity | Keterangan |
|------|----------|------------|
| Business logic di controller (users, analytics, email) | HIGH | Pelanggaran 4-layer, perlu di-refactor saat menyentuh file-file tersebut |
| `res.json()` di catch block `auth.controller.ts` (refresh endpoint) | HIGH | Harus `next(error)` |
| Email masih console.log (verifikasi, reset password, invite author) | HIGH | Tidak akan berfungsi di production |
| `<img>` biasa di 3 file frontend | MEDIUM | Perlu ganti dengan `next/image` |
| Rate limiting di `/auth/refresh` belum ada | MEDIUM | Perlu ditambah saat implementasi STORY 13.1 |
| XSS: href tidak divalidasi di TiptapRenderer | MEDIUM | Perlu fix sebelum production |

---

## Urutan Implementasi yang Disarankan

Berdasarkan hasil audit ini:

```
1. EPIC 17 (Seed Data) — agar testing semua EPIC berikutnya punya data realistis
2. EPIC 13 (Auth & Core Flow Fixes) — semua item CRITICAL dan HIGH
3. EPIC 14 (Role ADMIN) — prerequisite untuk permission matrix
4. EPIC 16 (Onboarding) — perlu EPIC 14 selesai dulu untuk slug check
5. EPIC 15 (Admin Enhancements) — paling banyak task, kerjakan terakhir
```

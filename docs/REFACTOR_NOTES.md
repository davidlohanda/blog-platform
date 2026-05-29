# Refactor Notes — Technical Debt Post-MVP

> Catatan ini dibuat setelah implementasi EPIC 1–5 selesai.
> Semua item di sini adalah temuan nyata dari scan kodebase, bukan template kosong.
> Prioritaskan sebelum EPIC 6 atau sebelum production launch.

---

## 1. Frontend

### 1.1 Komponen yang Belum Pakai shadcn/ui Sepenuhnya

**`frontend/src/app/(dashboard)/dashboard/articles/new/page.tsx`**
- Menggunakan raw `<input>`, `<button>`, `<textarea>` di halaman article editor
- Ada `// eslint-disable` comment yang mengakui pelanggaran ini
- Perbaikan: ganti semua dengan `<Input>`, `<Button>`, `<Textarea>` dari shadcn/ui

### 1.2 Warna yang Masih Hardcode (Bukan Semantic Tokens)

**`frontend/src/app/(auth)/verify-email/page.tsx`** (lines ~36–69)
- Banyak hardcode hex: `#f9f7f4`, `#2a261f`, `#16a34a`
- Ini melanggar aturan CLAUDE.md yang melarang hardcode hex
- Perbaikan: ganti dengan `bg-background`, `text-foreground`, `text-primary`, dsb.

**`frontend/src/app/page.tsx`** (lines ~39, 54)
- Inline hex `#383838`, `#ccc`, `#1a1a1a` di hover states
- Perbaikan: gunakan Tailwind semantic classes atau CSS variables

### 1.3 Penggunaan `<img>` Biasa (Bukan `next/image`)

**`frontend/src/app/(dashboard)/dashboard/articles/new/page.tsx`** (line ~165)
- Menggunakan `<img>` biasa; ada eslint-disable yang menutupinya
- Perbaikan: ganti dengan `<Image>` dari `next/image` dengan proper `width` dan `height`

### 1.4 API Client — Circular Dependency Workaround

**`frontend/src/lib/api/client.ts`** (lines ~18–22, 31–33, 67–70)
- Menggunakan `require()` dinamis (3 titik terpisah) untuk hindari circular dependency dengan `authStore`
- Fragile: setiap block dibungkus `try-catch` terpisah
- Perbaikan: restruktur `authStore` agar bisa diimpor tanpa circular dep, atau pindahkan token management ke file terpisah

---

## 2. Backend

### 2.1 Email Sending — Masih Stub (Console.log)

**`backend/src/modules/auth/auth.service.ts`** (lines ~29, 123)
```
// TODO STORY 7.1
console.log('Verification token:', token)
console.log('Reset token:', token)
```
- Email verifikasi dan password reset hanya log ke console — tidak benar-benar dikirim
- Di production, user tidak akan menerima email sama sekali
- Perbaikan: implementasi Resend email service (sudah ada di EPIC 7 USER_STORIES_MVP.md)

**`backend/src/modules/publication/publication.controller.ts`** (line ~86)
```
// TODO STORY 7.1 — kirim email invite
console.log('Invite token:', token)
```
- Author invitation hanya log token ke console
- Workflow invite author sepenuhnya tidak berfungsi tanpa ini
- Perbaikan: implementasi bersamaan dengan STORY 7.1

**`backend/src/modules/subscription/subscription.service.ts`** (line 144)
```
// TODO STORY 7.2: send subscription confirmation email
```
- Setelah webhook Midtrans berhasil (subscription aktif), tidak ada email konfirmasi ke user
- Perbaikan: implementasi di STORY 7.2

### 2.2 Validasi yang Perlu Diperkuat

**Webhook endpoint tanpa Zod schema** — `subscription.controller.ts`
- `req.body` di-cast langsung ke tipe tanpa validasi struktur payload
- Jika Midtrans mengubah format payload, runtime error tanpa pesan yang jelas
- Perbaikan: tambah `webhookPayloadSchema` di `subscription.schema.ts` dan pakai `validate` middleware

**Query param `publicationId` tanpa validasi** — `subscription.controller.ts` (line ~54)
- `req.query.publicationId` di-cast ke `string` tanpa check apakah ada atau valid UUID
- Perbaikan: tambah schema validasi untuk query params

**Webhook tidak cross-check `gross_amount`** — `subscription.service.ts`
- Signature Midtrans diverifikasi, tapi `gross_amount` dari payload tidak dibandingkan dengan nilai yang tersimpan di DB
- Potensi: manipulasi payload dengan jumlah berbeda bisa lolos jika signature berhasil diforge
- Perbaikan: tambah check `Number(payload.gross_amount) === Number(subscription.grossAmount)`

### 2.3 Query yang Perlu Dioptimasi

**`backend/src/modules/article/article.repository.ts`**
- `findById()` tidak include `author` dan `tags`, tapi `findBySlug()` include keduanya
- Beberapa controller memanggil `findById()` lalu butuh relasi — memicu query tambahan
- Perbaikan: konsistenkan `include` clause antara `findById` dan `findBySlug`

**`backend/src/middleware/tenant.middleware.ts`**
- Setiap request memanggil `publicationService.getBySlug()` atau `getByDomain()`
- Sudah ada Redis cache (1 jam), tapi tidak ada request-level caching
- Jika Redis down, setiap request langsung hit DB
- Perbaikan: tambah fallback graceful jika Redis tidak available

### 2.4 Inkonsistensi Tool Chain

**`backend/package.json`**
- `dev` dan `tunnel` menggunakan `tsx`
- `db:seed` masih menggunakan `ts-node`
- `ts-node-dev` ada di devDependencies tapi tidak dipakai
- Perbaikan: ganti `db:seed` ke `tsx prisma/seed.ts`, hapus `ts-node-dev`

**Prisma seed — `backend/prisma/seed.ts`**
- User seed dibuat tanpa `passwordHash` yang valid
- Tidak bisa login dengan password auth untuk akun seeded
- Perbaikan: tambah hashed password menggunakan Argon2 di seed script, atau dokumentasikan

### 2.5 Console.log di Production Code

File yang masih punya debug log:
- `backend/src/modules/auth/auth.service.ts` — token ke console
- `backend/src/modules/publication/publication.controller.ts` — invite token
- `backend/src/config/redis.config.ts` — connection status

Perbaikan: ganti dengan `logger` yang sudah ada di `backend/src/middleware/logger.middleware.ts`, atau setup Winston/Pino untuk structured logging

---

## 3. Testing

### 3.1 Unit Test

**Status: 0 file test di seluruh codebase.**

Area yang paling kritis untuk di-cover pertama:
- `subscription.service.ts` — `handleWebhook()`: signature verification, idempotency, status transitions
- `auth.service.ts` — register, login, refresh token
- `midtrans.service.ts` — `verifySignature()`: mudah di-unit test karena pure function

### 3.2 Integration Test

Tidak ada integration test untuk:
- Full auth flow: register → verify email → login → refresh → logout
- Subscription flow: create order → simulate webhook → status active
- Article CRUD dengan tenant isolation (pastikan `publicationId` selalu digunakan)

### 3.3 E2E Test

Saat ini hanya ada manual simulation scripts di `backend/scripts/`:
- `simulate-webhook.ts` — test webhook handler secara lokal
- `start-tunnel.ts` — expose localhost untuk real Midtrans sandbox

Belum ada automated E2E test (Playwright/Cypress) untuk:
- Signup → login → buat publication → buat artikel → publish
- Reader subscribe → checkout Midtrans → akses artikel premium

---

## 4. Performance

### 4.1 Caching yang Belum Optimal

**Member status cache** — sudah ada di `subscription.service.ts`
- Cache key: `member:{userId}:{publicationId}`, TTL 5 menit — sudah baik

**Yang belum di-cache:**
- Subscription plans per publication (sering diakses, jarang berubah)
- Article list per publication (high-read endpoint)
- Author list per publication

### 4.2 Potensi Query N+1

**Article list endpoint:**
- Jika `article.repository.ts` tidak include `tags` secara default, controller yang loop article dan fetch tags per-article akan trigger N+1
- Perlu audit: pastikan `findMany` untuk list selalu include semua relasi yang dirender

**Publication author lookup:**
- `requirePublicationRole` middleware memanggil DB setiap request
- Belum ada caching untuk author role check — cek apakah ini aman di high-traffic

### 4.3 Bundle Size Frontend

Belum dilakukan audit bundle size. Item yang berpotensi besar:
- shadcn/ui — sudah tree-shakeable, tapi perlu dikonfirmasi hanya komponen yang dipakai yang ter-import
- Tiptap editor (jika dipakai di article editor) — biasanya cukup besar, perlu lazy load
- Midtrans Snap JS — perlu dimuat hanya di halaman checkout, bukan global

---

## 5. Security

### 5.1 Rate Limiting

**`backend/src/middleware/rateLimiter.middleware.ts`**
- Rate limiter global sudah ada, tapi perlu dicek apakah endpoint sensitif punya limit sendiri:
  - `POST /auth/login` — brute force risk, butuh rate limit lebih ketat (misal: 5 req/menit per IP)
  - `POST /auth/register` — spam account creation risk
  - `POST /subscriptions/order` — perlu limit per user, bukan hanya per IP
- Perbaikan: tambah per-route rate limiter untuk endpoint auth

### 5.2 Input Sanitization

**Article content:**
- Konten artikel disimpan dan kemungkinan dirender sebagai HTML (rich text editor)
- Jika tidak ada sanitasi, berpotensi XSS saat rendering
- Perbaikan: pastikan ada sanitasi HTML (DOMPurify di frontend sebelum submit, atau library di backend seperti `sanitize-html`)

**Webhook payload:**
- `gross_amount` dari Midtrans dipakai untuk signature check tapi tidak di-sanitize sebelum dikonversi ke Number
- Edge case: payload dengan `gross_amount: "NaN"` atau nilai tidak valid bisa lolos
- Perbaikan: validasi via Zod schema di webhook endpoint

### 5.3 Refresh Token — Tidak Ada Rotation

**`backend/src/modules/auth/auth.service.ts`**
- Setiap call ke `refreshToken` endpoint menghasilkan access token baru
- Tapi refresh token itu sendiri tidak dirotasi (token lama masih valid)
- Best practice: rotate refresh token setiap dipakai (one-time use), simpan hash di DB
- Perbaikan: implementasi refresh token rotation untuk keamanan lebih baik

### 5.4 Midtrans Webhook — Tidak Ada Idempotency Logging

- Jika Midtrans mengirim webhook duplikat (retry otomatis), kode sudah handle dengan idempotency check
- Tapi tidak ada log yang mencatat kapan duplikat terjadi — susah di-debug kalau ada masalah
- Perbaikan: log webhook event ke DB atau logging service saat di-receive (sebelum diproses)

---

## Prioritas Pengerjaan

| # | Item | Area | Impact |
|---|------|-------|--------|
| 1 | Implementasi email sending (Resend) | Backend | Tinggi — tanpa ini auth & invite tidak berfungsi |
| 2 | Email konfirmasi subscription | Backend | Tinggi — UX buruk tanpa konfirmasi |
| 3 | Unit test untuk webhook & auth service | Testing | Tinggi — kode payment tanpa test = risiko |
| 4 | Fix hardcode warna di verify-email | Frontend | Sedang — melanggar design system |
| 5 | Fix raw `<img>` dan `<input>` di article editor | Frontend | Sedang — inkonsistensi komponen |
| 6 | Rate limiting per endpoint auth | Security | Sedang — brute force risk |
| 7 | Webhook Zod validation + gross_amount check | Security | Sedang — input tidak tervalidasi |
| 8 | Standarisasi tsx vs ts-node di package.json | Backend | Rendah — tidak blocking |
| 9 | Subscription plans caching | Performance | Rendah — belum terasa di scale kecil |
| 10 | Refresh token rotation | Security | Rendah untuk MVP, penting sebelum launch |

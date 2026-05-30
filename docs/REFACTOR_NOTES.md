# Refactor Notes — Technical Debt Post-MVP

> Catatan ini dibuat setelah implementasi EPIC 1–9 selesai.
> Semua item di sini adalah temuan nyata dari scan kodebase, bukan template kosong.
> Prioritaskan sebelum production launch.
>
> **Label sumber:** `[EPIC 1-5]` = temuan awal · `[EPIC 6-9]` = temuan tambahan review komprehensif

---

## 1. Frontend

### 1.1 Missing `'use cache'` Directive — Series Page

**`frontend/src/app/(publication)/series/[slug]/page.tsx`** — `[EPIC 6-9]`
- `SeriesPageContent` memanggil `cacheTag()` (line 53) tapi tidak ada `'use cache'` directive di awal fungsi
- Tanpa directive, `cacheTag()` adalah no-op — caching diam-diam tidak berjalan
- Perbaikan: tambah `'use cache';` sebagai statement pertama di `SeriesPageContent()`

### 1.2 Komponen yang Belum Pakai shadcn/ui Sepenuhnya

**`frontend/src/app/(auth)/login/LoginForm.tsx`** (line 133) — `[EPIC 6-9]`
- `<input type="checkbox">` biasa — seharusnya shadcn `<Checkbox>`

**`frontend/src/app/(auth)/register/page.tsx`** (line 161) — `[EPIC 6-9]`
- `<input type="checkbox">` biasa — seharusnya shadcn `<Checkbox>`

**`frontend/src/app/(dashboard)/dashboard/settings/page.tsx`** (line 332) — `[EPIC 6-9]`
- `<select>` biasa — seharusnya shadcn `<Select>` dengan `<SelectContent>`, `<SelectItem>`

**`frontend/src/app/(dashboard)/dashboard/articles/new/page.tsx`** — `[EPIC 1-5]`
- Menggunakan raw `<input>`, `<button>`, `<textarea>` di halaman article editor
- Ada `// eslint-disable` comment yang mengakui pelanggaran ini
- Perbaikan: ganti semua dengan `<Input>`, `<Button>`, `<Textarea>` dari shadcn/ui

### 1.3 Warna yang Masih Hardcode (Bukan Semantic Tokens)

**`frontend/src/app/(auth)/verify-email/page.tsx`** (lines ~36–69) — `[EPIC 1-5]`
- Banyak hardcode hex: `#f9f7f4`, `#2a261f`, `#16a34a`, `#5a5348`, `#1a1710`, `#d4cdc4`
- Perbaikan: ganti dengan `bg-background`, `text-foreground`, `text-muted-foreground`, dst.

**`frontend/src/app/page.tsx`** (lines ~39, 54) — `[EPIC 1-5]`
- Inline hex `#383838`, `#ccc`, `#1a1a1a` di hover states
- Perbaikan: gunakan Tailwind semantic classes atau CSS variables

**`frontend/src/components/ui/GoogleIcon.tsx`** (lines 6, 10, 14, 18) — `[EPIC 6-9]`
- Hardcode hex Google brand colors (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) di SVG fill
- Ini adalah brand colors Google, bukan theme colors — acceptable jika diberi komentar penjelasan
- Perbaikan: tambah komentar `// Google brand colors — intentionally hardcoded` atau ekstrak ke named constants

### 1.4 Penggunaan `<img>` Biasa (Bukan `next/image`)

**`frontend/src/app/(dashboard)/dashboard/articles/new/page.tsx`** (line ~165) — `[EPIC 1-5]`
- `<img>` dengan `eslint-disable-next-line @next/next/no-img-element`

**`frontend/src/app/(dashboard)/dashboard/articles/[id]/page.tsx`** (line 244) — `[EPIC 6-9]`
- `<img src={coverImageUrl}>` dengan `eslint-disable` — cover image di halaman edit artikel

**`frontend/src/app/me/settings/page.tsx`** (line 152) — `[EPIC 6-9]`
- `<img src={user.avatarUrl}>` dengan `eslint-disable` — avatar di halaman profil

Perbaikan semua: ganti dengan `<Image>` dari `next/image` dengan `width`, `height`, dan `alt` yang proper. Hapus semua `eslint-disable` comment setelah fix.

### 1.5 API Client — Circular Dependency Workaround

**`frontend/src/lib/api/client.ts`** (lines ~18–22, 31–33, 67–70) — `[EPIC 1-5]`
- Menggunakan `require()` dinamis (3 titik terpisah) untuk hindari circular dependency dengan `authStore`
- Fragile: setiap block dibungkus `try-catch` terpisah
- Perbaikan: restruktur `authStore` agar bisa diimpor tanpa circular dep, atau pindahkan token management ke file terpisah

---

## 2. Backend

### 2.1 Pelanggaran 4-Layer — Business Logic di Controller

**`backend/src/modules/users/users.controller.ts`** — `[EPIC 6-9]`
- `getEmailPreferences()` (lines 30–64): Prisma query + data mapping langsung di controller
- `updateEmailPreference()` (lines 66–82): Memanggil `prisma.emailPreference.upsert()` langsung — tidak melalui service layer
- Perbaikan: ekstrak ke `users.service.ts` dan `users.repository.ts`

**`backend/src/modules/analytics/analytics.controller.ts`** — `[EPIC 6-9]`
- `listSubscribers()` (lines 29–71): `prisma.subscription.findMany()` langsung + pagination logic di controller
- `exportSubscribersCSV()` (lines 73–111): Prisma query + CSV formatting logic di controller
- Menggunakan dynamic import pattern `await import('../../config/database.config').then(...)` — tidak konsisten dengan pola codebase
- Perbaikan: ekstrak ke `analytics.service.ts` dan `analytics.repository.ts`

**`backend/src/modules/email/email.controller.ts`** — `[EPIC 6-9]`
- Lines 16–22: `prisma.emailPreference.upsert()` langsung di controller
- Perbaikan: pindahkan ke `email.service.ts`

### 2.2 Error Handling — `res.json()` di catch Block

**`backend/src/modules/auth/auth.controller.ts`** (lines 66–69) — `[EPIC 6-9]`
- Refresh endpoint catch block return `res.json()` error langsung — bypass central error handler middleware
- Perbaikan: ganti dengan `next(error)`

### 2.3 Email Sending — Masih Stub (Console.log)

**`backend/src/modules/auth/auth.service.ts`** (lines ~29, 123) — `[EPIC 1-5]`
```
// TODO STORY 7.1
console.log('Verification token:', token)
console.log('Reset token:', token)
```
- Email verifikasi dan password reset hanya log ke console — tidak benar-benar dikirim
- Di production, user tidak akan menerima email sama sekali

**`backend/src/modules/publication/publication.controller.ts`** (line ~86) — `[EPIC 1-5]`
```
// TODO STORY 7.1 — kirim email invite
console.log('Invite token:', token)
```
- Author invitation hanya log token ke console — workflow invite author tidak berfungsi

**`backend/src/modules/subscription/subscription.service.ts`** (line 144) — `[EPIC 1-5]`
```
// TODO STORY 7.2: send subscription confirmation email
```
- Setelah webhook Midtrans berhasil, tidak ada email konfirmasi ke subscriber

Perbaikan semua: implementasi Resend email service sesuai rencana EPIC 7.

### 2.4 Validasi yang Perlu Diperkuat

**`backend/src/modules/users/users.router.ts`** — `[EPIC 6-9]`
- `PATCH /me/email-preferences/:publicationId` tidak punya body validation schema
- Payload `{ newArticle: boolean }` diterima tanpa Zod schema
- Perbaikan: tambah `emailPreferenceUpdateSchema` di `users.schema.ts` dan apply `validate` middleware

**Webhook endpoint tanpa Zod schema** — `subscription.controller.ts` — `[EPIC 1-5]`
- `req.body` di-cast langsung ke tipe tanpa validasi struktur payload
- Perbaikan: tambah `webhookPayloadSchema` di `subscription.schema.ts`

**Query param `publicationId` tanpa validasi** — `subscription.controller.ts` (line ~54) — `[EPIC 1-5]`
- `req.query.publicationId` di-cast ke `string` tanpa check ada/valid UUID
- Perbaikan: tambah schema validasi untuk query params

**Webhook tidak cross-check `gross_amount`** — `subscription.service.ts` — `[EPIC 1-5]`
- Signature Midtrans diverifikasi, tapi `gross_amount` dari payload tidak dibandingkan dengan nilai di DB
- Perbaikan: tambah check `Number(payload.gross_amount) === subscription.grossAmount` setelah fetch subscription

### 2.5 Console.log di Production Code

File yang masih punya `console.*` yang seharusnya pakai logger terstruktur:

| File | Lines | Keterangan |
|------|-------|------------|
| `backend/src/modules/auth/auth.service.ts` | ~29, 123 | Verification & reset token (sudah di section 2.3) |
| `backend/src/modules/publication/publication.controller.ts` | ~86 | Invite token (sudah di section 2.3) |
| `backend/src/middleware/errorHandler.middleware.ts` | 30 | `console.error('[UnhandledError]')` |
| `backend/src/modules/email/email.worker.ts` | 102, 106, 112 | Job processing logs |
| `backend/src/modules/email/email.jobs.ts` | 43, 76, 119, 124, 130, 139 | Job queue logs |
| `backend/src/modules/article/article.service.ts` | 189 | Error handler |
| `backend/src/config/passport.config.ts` | 14 | `console.warn()` |
| `backend/src/config/redis.config.ts` | 14, 18 | Connection status |
| `backend/src/index.ts` | 9, 15 | Server start/error |

Perbaikan: ganti dengan `logger` yang sudah ada di `backend/src/middleware/logger.middleware.ts`, atau setup Winston/Pino untuk structured logging secara global.

### 2.6 Inkonsistensi Tool Chain

**`backend/package.json`** — `[EPIC 1-5]`
- `dev` dan `tunnel` menggunakan `tsx`
- `db:seed` masih menggunakan `ts-node`
- `ts-node-dev` ada di devDependencies tapi tidak dipakai
- Perbaikan: ganti `db:seed` ke `tsx prisma/seed.ts`, hapus `ts-node-dev`

**Prisma seed — `backend/prisma/seed.ts`** — `[EPIC 1-5]`
- User seed dibuat tanpa `passwordHash` yang valid — tidak bisa login dengan akun seeded
- Perbaikan: tambah hashed password menggunakan Argon2 di seed script

### 2.7 Query yang Perlu Dioptimasi

**`backend/src/modules/article/article.repository.ts`** — `[EPIC 1-5]`
- `findById()` tidak include `author` dan `tags`, tapi `findBySlug()` include keduanya
- Beberapa controller memanggil `findById()` lalu butuh relasi — memicu query tambahan
- Perbaikan: konsistenkan `include` clause antara `findById` dan `findBySlug`

**`backend/src/middleware/tenant.middleware.ts`** — `[EPIC 1-5]`
- Setiap request memanggil `publicationService.getBySlug()` atau `getByDomain()`
- Sudah ada Redis cache (1 jam), tapi tidak ada fallback jika Redis down
- Perbaikan: tambah fallback graceful jika Redis tidak available

---

## 3. Security

### 3.1 Rate Limiting

**`backend/src/modules/auth/auth.router.ts`** — `[EPIC 6-9]`
- `POST /auth/refresh` tidak punya rate limiter — login, register, forgot-password sudah benar
- Risiko: brute-force jika attacker punya refresh token yang bocor
- Perbaikan: tambah `rateLimit({ windowMs: 60*1000, max: 10 })` di route refresh

**`backend/src/middleware/rateLimiter.middleware.ts`** — `[EPIC 1-5]`
- Rate limiter global sudah ada (300 req/15 menit)
- Auth endpoints sudah benar: login (5/menit), register (10/jam), forgot-password (3/jam)
- Tambahan yang dibutuhkan: limit per-user (bukan hanya per-IP) untuk `/subscriptions/order`

### 3.2 Input Sanitization

**`frontend/src/components/publication/TiptapRenderer.tsx`** — `[EPIC 6-9]`
- Link mark handler tidak memvalidasi `href` URL sebelum render
- Artikel yang tersimpan dengan `href: "javascript:alert(1)"` akan render sebagai link yang bisa dieksekusi
- Tiptap JSON structure memang mengurangi attack surface vs raw HTML, tapi gap ini tetap ada
- Perbaikan:
  ```typescript
  const href = mark.attrs?.href as string;
  const safeHref = /^https?:\/\/|^\//.test(href) ? href : '#';
  return <a href={safeHref} target="_blank" rel="noopener noreferrer">{acc}</a>;
  ```

**Article content** — `[EPIC 1-5]`
- Konten artikel disimpan sebagai Tiptap JSON (bukan raw HTML) — mengurangi risiko XSS
- Frontend render via `TiptapRenderer.tsx` yang constructs React elements (text nodes di-escape otomatis)
- Gap yang tersisa: validasi URL link (sudah ditangani di poin di atas)

**Webhook payload** — `[EPIC 1-5]`
- `gross_amount` dari Midtrans dipakai untuk signature check tapi tidak di-sanitize sebelum dikonversi ke Number
- Edge case: payload dengan `gross_amount: "NaN"` bisa lolos
- Perbaikan: validasi via Zod schema sebelum diproses

### 3.3 Refresh Token Rotation — ✅ SUDAH DIIMPLEMENTASI

**`backend/src/modules/auth/auth.service.ts`**
- Rotation sudah benar: token lama dihapus dari Redis (line 94), tokenId baru di-generate (line 99), token baru disimpan dengan TTL 30 hari (line 103)
- Auth middleware memvalidasi token ada di Redis sebelum accept
- **Status: tidak perlu perbaikan**

### 3.4 Midtrans Webhook — Tidak Ada Idempotency Logging

- Idempotency check sudah ada (duplikat webhook tidak diproses dua kali)
- Tapi tidak ada log yang mencatat kapan duplikat terjadi — susah di-debug
- Perbaikan: log webhook event ke DB atau logging service saat di-receive (sebelum diproses)

---

## 4. Performance

### 4.1 Missing Database Indexes

**`backend/prisma/schema.prisma`** — `[EPIC 6-9]`

- **`Comment.articleId`**: Tidak ada explicit index — query daftar komentar per artikel bisa lambat
  - Perbaikan: tambah `@@index([articleId])` di model Comment
- **`Article.authorId` / `Series.authorId`**: Tidak ada explicit index — halaman profil author bisa lambat
  - Perbaikan: tambah `@@index([authorId])` di model Article dan Series

Indexes yang sudah ada dan bagus:
- Subscriptions: `userId, publicationId, status, expiresAt` ✓
- Articles: `publicationId, status, publishedAt` dan `publicationId, slug` ✓
- Publication: `slug` ✓
- Email/password reset tokens: `token` ✓

### 4.2 Caching yang Belum Optimal

**Member status cache** — sudah ada di `subscription.service.ts`
- Cache key: `member:{userId}:{publicationId}`, TTL 5 menit — sudah baik ✓

**Yang belum di-cache:** — `[EPIC 1-5]`
- Subscription plans per publication (sering diakses, jarang berubah)
- Article list per publication (high-read endpoint)
- Author list per publication

### 4.3 Potensi Query N+1

**Article list endpoint:** — `[EPIC 1-5]`
- Jika `article.repository.ts` tidak include `tags` secara default, controller yang loop article dan fetch tags per-article akan trigger N+1
- Perlu audit: pastikan `findMany` untuk list selalu include semua relasi yang dirender

**`requirePublicationRole` middleware:** — `[EPIC 1-5]`
- Memanggil DB setiap request untuk author role check
- Belum ada caching — perlu dicek apakah safe di high-traffic

### 4.4 Bundle Size Frontend

Belum dilakukan audit bundle size. Item yang berpotensi besar: — `[EPIC 1-5]`
- Tiptap editor — biasanya cukup besar, perlu lazy load di halaman editor
- Midtrans Snap JS — perlu dimuat hanya di halaman checkout, bukan global
- Recharts — verifikasi hanya dimuat di dashboard pages

---

## 5. Testing

### 5.1 Unit Test

**Status: 0 file test di seluruh codebase. Tidak ada testing framework yang diinstall.**

Area yang paling kritis untuk di-cover pertama:
- `subscription.service.ts` — `handleWebhook()`: signature verification, idempotency, status transitions, amount mismatch
- `auth.service.ts` — register, login, refresh token rotation
- `midtrans.service.ts` — `verifySignature()`: pure function, mudah di-unit test

### 5.2 Integration Test

Tidak ada integration test untuk:
- Full auth flow: register → verify email → login → refresh → logout
- Subscription flow: create order → simulate webhook → status active
- Article CRUD dengan tenant isolation (pastikan `publicationId` selalu digunakan)

### 5.3 E2E Test

Saat ini hanya ada manual simulation scripts di `backend/scripts/`:
- `simulate-webhook.ts` — test webhook handler secara lokal
- `start-tunnel.ts` — expose localhost untuk real Midtrans sandbox

Belum ada automated E2E test (Playwright/Cypress) untuk golden paths.

---

## Prioritas Pengerjaan

| # | Item | Area | Severity | Sumber |
|---|------|-------|----------|--------|
| 1 | Fix missing `'use cache'` di series page — caching diam-diam tidak jalan | Frontend | HIGH | EPIC 6-9 |
| 2 | Fix business logic di controllers: users, analytics, email | Backend | HIGH | EPIC 6-9 |
| 3 | Fix `res.json()` di auth.controller catch → `next(error)` | Backend | HIGH | EPIC 6-9 |
| 4 | Implementasi email sending (Resend) — auth & invite tidak berfungsi | Backend | HIGH | EPIC 1-5 |
| 5 | Email konfirmasi subscription setelah webhook berhasil | Backend | HIGH | EPIC 1-5 |
| 6 | Unit test: webhook, auth service, midtrans signature | Testing | HIGH | EPIC 1-5 |
| 7 | Webhook: Zod validation + gross_amount cross-check vs DB | Security | MEDIUM | EPIC 1-5 |
| 8 | Rate limiting di `/auth/refresh` endpoint | Security | MEDIUM | EPIC 6-9 |
| 9 | XSS: validasi link href di TiptapRenderer | Security | MEDIUM | EPIC 6-9 |
| 10 | Ganti `<img>` dengan next/image — 3 file: article editor, article edit, me/settings | Frontend | MEDIUM | EPIC 1-5 + 6-9 |
| 11 | Ganti raw checkbox/select dengan shadcn/ui — login, register, settings | Frontend | MEDIUM | EPIC 6-9 |
| 12 | Ganti semua console.* dengan logger — 7+ file backend | Backend | MEDIUM | EPIC 6-9 |
| 13 | Tambah Zod schema untuk email preference update endpoint | Backend | MEDIUM | EPIC 6-9 |
| 14 | Tambah DB indexes: Comment.articleId, Article/Series.authorId | Performance | MEDIUM | EPIC 6-9 |
| 15 | Fix hardcode hex di verify-email/page.tsx | Frontend | MEDIUM | EPIC 1-5 |
| 16 | Fix hardcode hex di page.tsx (hover states) | Frontend | MEDIUM | EPIC 1-5 |
| 17 | GoogleIcon.tsx — tambah komentar brand color atau ekstrak ke constants | Frontend | LOW | EPIC 6-9 |
| 18 | Fix circular dep workaround di api/client.ts | Frontend | LOW | EPIC 1-5 |
| 19 | Standarisasi tsx vs ts-node di package.json, hapus ts-node-dev | Backend | LOW | EPIC 1-5 |
| 20 | Subscription plans + article list caching | Performance | LOW | EPIC 1-5 |
| 21 | Bundle size audit: Recharts, Tiptap, Midtrans Snap lazy loading | Performance | LOW | EPIC 1-5 |
| ~~22~~ | ~~Rate limiting auth endpoints (login/register/forgot-password)~~ | Security | ✅ DONE | EPIC 1-5 |
| ~~23~~ | ~~Refresh token rotation~~ | Security | ✅ DONE | EPIC 1-5 |

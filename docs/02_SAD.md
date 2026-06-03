# System Architecture Document (SAD)
## Platform Blog Subscription Multi-Author
**Versi:** 1.3  
**Tanggal:** 28 Mei 2026  
**Status:** Draft  
**Referensi:** PRD v1.1  
**Changelog v1.3:** Revisi lengkap section 5 (Authentication & Authorization) — tambah email verification strategy, soft verification flow, perbedaan OAuth vs email+password, forgot password flow, dan resend verification. Update section 7 — tambah tabel `email_verification_tokens` dan `password_reset_tokens`, tambah indexes untuk token lookup.

---

## Daftar Isi
1. [Overview Arsitektur](#1-overview-arsitektur)
2. [Prinsip Desain](#2-prinsip-desain)
3. [Layer & Komponen Sistem](#3-layer--komponen-sistem)
4. [Multi-Tenancy Strategy](#4-multi-tenancy-strategy)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Design](#6-api-design)
7. [Database Design](#7-database-design)
8. [Subscription & Payment Flow](#8-subscription--payment-flow)
9. [Email & Notification System](#9-email--notification-system)
10. [Custom Domain & Routing](#10-custom-domain--routing)
11. [File Storage](#11-file-storage)
12. [Search Architecture](#12-search-architecture)
13. [Caching Strategy](#13-caching-strategy)
14. [Security Architecture](#14-security-architecture)
15. [Deployment Architecture](#15-deployment-architecture)
16. [Project Structure](#16-project-structure)

---

## 1. Overview Arsitektur

Platform ini menggunakan arsitektur **monolith modular** untuk MVP — satu codebase backend yang dibagi menjadi modul-modul terpisah berdasarkan domain bisnis. Pendekatan ini dipilih karena:

- Lebih mudah di-develop dan di-deploy oleh 1 developer
- Bisa di-extract menjadi microservices di masa depan tanpa perubahan besar pada logika bisnis
- Tidak ada overhead network antar service yang tidak diperlukan di fase awal

```
Client (Next.js)
      ↓ HTTPS
API Gateway (middleware layer)
      ↓
Monolith Backend (Express.js / modular)
  ├── Auth Router
  ├── Publication Router
  ├── Content Router
  ├── Subscription Router
  ├── Community Router
  ├── Search Router
  └── Email Router
      ↓
Data Layer
  ├── PostgreSQL (primary)
  ├── Redis (cache & sessions)
  └── Cloud Storage (files)
      ↓
External Services
  ├── Midtrans (payment)
  ├── Xendit (disbursement — V2)
  ├── Resend (email)
  └── Google OAuth 2.0
```

---

## 2. Prinsip Desain

### Separation of Concerns
Setiap modul hanya bertanggung jawab atas domain-nya. Auth tidak tahu tentang konten, Content tidak tahu tentang billing.

### Tenant Isolation
Semua query ke database HARUS menyertakan `publication_id` sebagai filter utama. Tidak ada data lintas publication yang bisa bocor.

### Stateless API
API server tidak menyimpan state apapun di memory. Semua state ada di database atau Redis. Ini memungkinkan horizontal scaling di masa depan.

### Fail Safe
Operasi kritis (pembayaran, aktivasi subscription) menggunakan mekanisme idempotency — jika request diulang karena timeout, hasilnya tetap konsisten.

### Defense in Depth
Keamanan berlapis: HTTPS → rate limiting → authentication middleware → authorization (role check) → row-level tenant filter → response sanitization.

---

## 3. Layer & Komponen Sistem

### 3.1 Client Layer

**Next.js Web App** — satu aplikasi Next.js yang melayani dua dunia terpisah:

| Dunia | Domain (prod) | Domain (dev) | Audience |
|---|---|---|---|
| Platform admin | `app.lentera.id` | `localhost:3000` via `/admin` path | `platform_admin` |
| Publication | `[slug].lentera.id` atau custom domain | `slug.lvh.me:3000` | `owner`, `admin`, `author`, `member`, visitor |

`lvh.me` adalah domain publik yang selalu resolve ke `127.0.0.1` — digunakan untuk simulasi subdomain di development tanpa edit hosts file.

**Routing berdasarkan domain (prod):**
```
app.lentera.id/admin/login   →  Platform admin login
app.lentera.id/admin         →  Platform admin dashboard
[slug].lentera.id/login      →  Publication login (staff + member)
[slug].lentera.id/           →  Publication homepage
[slug].lentera.id/dashboard  →  Publication staff dashboard
investasicerdas.com          →  Publication site via custom domain
```

**`app/` folder structure (target):**
```
app/
├── ── PLATFORM (app.lentera.id/admin/*) ────────────────────────────────
├── admin/
│   ├── layout.tsx                ← Guard: protect dashboard, pass-through auth pages
│   ├── login/page.tsx            ← /admin/login (email+pass only, no Google)
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── dashboard/page.tsx        ← /admin/dashboard (protected: platform_admin)
│   ├── publications/page.tsx
│   └── invite/page.tsx
│
├── accept-invite/page.tsx        ← Owner onboarding wizard (pre-auth, platform URL)
├── auth/google/callback/page.tsx ← OAuth callback (URL tetap, state bawa publicationId)
├── payment/success/page.tsx      ← Midtrans callback (URL tetap)
│
├── ── PUBLICATION (slug.lentera.id/*) ──────────────────────────────────
└── (publication)/
    ├── layout.tsx                ← WAJIB: resolve tenant, provide PublicationContext,
    │                                handle suspended_hard → redirect /suspended
    │
    ├── ── MEMBER SPACE (root) ───────────────────────────────────────────
    ├── page.tsx                  ← slug.lentera.id/ (publication homepage)
    ├── [articleSlug]/page.tsx
    ├── series/[slug]/page.tsx
    ├── suspended/page.tsx
    ├── accept-author-invite/page.tsx ← Pre-auth, siapa saja bisa akses
    │
    ├── login/page.tsx            ← /login — MEMBER ONLY + Google OAuth
    ├── register/page.tsx         ← Member self-register
    ├── verify-email/page.tsx     ← Member email verification
    ├── forgot-password/page.tsx  ← Member forgot-password (deteksi OAuth-only)
    ├── reset-password/page.tsx
    │
    ├── subscribe/page.tsx        ← Ambil publicationId dari layout context
    ├── settings/page.tsx
    ├── subscription/page.tsx
    │
    └── ── STAFF SPACE (/admin/*) ────────────────────────────────────────
        └── admin/
            ├── layout.tsx        ← Guard: protect dashboard, pass-through auth pages
            ├── login/page.tsx    ← /admin/login — STAFF ONLY, no Google
            ├── forgot-password/page.tsx
            ├── reset-password/page.tsx
            └── dashboard/
                ├── layout.tsx    ← Guard: verify owner/admin/author role
                ├── page.tsx      ← /admin/dashboard
                ├── articles/{...}
                ├── series/{...}
                ├── subscribers/page.tsx
                ├── analytics/page.tsx
                └── settings/page.tsx
```

### 3.2 API Gateway (Middleware Layer)

Bukan service terpisah — ini adalah layer middleware di dalam backend yang berjalan sebelum setiap request masuk ke handler:

```
Request masuk
  → CORS check
  → Helmet (security headers)
  → Rate limiter (per IP, per endpoint)
  → Request logging
  → JWT verification (jika endpoint butuh auth)
  → Tenant resolver (ekstrak publication_id dari subdomain/domain)
  → Route ke handler yang tepat
```

**Tenant Resolver** adalah komponen kunci: setiap request harus tahu "ini request untuk publication mana?" sebelum masuk ke logika bisnis.

### 3.3 Backend Layer Architecture (Express.js)

Backend menggunakan Express.js dengan struktur 5-layer yang konsisten di setiap domain:

```
Request → Router → Controller → Service → Repository → Database
                       ↑
                  Middleware
               (auth, tenant, validation)
```

**Router** — mendefinisikan URL path, HTTP method, dan middleware apa yang dijalankan sebelum controller. Tidak ada logic bisnis di sini.

**Controller** — menangani request/response cycle. Mengambil data dari `req`, memanggil service, lalu mengembalikan response dengan status code yang tepat. Tidak ada query database langsung di sini.

**Service** — seluruh business logic ada di sini. Orchestrasi antar repository, penghitungan, validasi bisnis, dan pemanggilan external service (Midtrans, email, dll).

**Repository** — satu-satunya layer yang boleh berinteraksi langsung dengan database via Prisma. Query di-scope per `publicationId` di sini sebagai safeguard.

**Middleware** — digunakan untuk cross-cutting concerns: autentikasi JWT, tenant resolution, rate limiting, request logging, input validation.

**Global Error Handler** — satu error handler terpusat di akhir middleware chain. Semua error yang di-`next(err)` dari manapun masuk ke sini, di-normalize ke format response yang konsisten.

```json
{
  "success": false,
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "Article not found",
  "timestamp": "2026-05-22T10:00:00Z",
  "path": "/api/v1/publications/xxx/articles/yyy"
}
```

#### Domain Routers
- `auth.router.ts` — register, login, OAuth, token refresh, email verification
- `publication.router.ts` — CRUD publication, author management
- `article.router.ts` — CRUD artikel, publish, scheduling
- `series.router.ts` — CRUD series, urutan artikel
- `roadmap.router.ts` — CRUD roadmap dan stages
- `subscription.router.ts` — order, webhook Midtrans, status
- `community.router.ts` — komentar, Q&A, likes
- `search.router.ts` — full-text search
- `email.router.ts` — preferences, unsubscribe
- `media.router.ts` — upload URL generation
- `analytics.router.ts` — dashboard data, export

---

## 4. Multi-Tenancy Strategy

### Pendekatan: Shared Database, Shared Schema

Semua publication menggunakan database dan schema yang sama. Isolasi data dijaga melalui `publication_id` sebagai foreign key di setiap tabel yang bersifat tenant-specific.

**Alasan memilih pendekatan ini:**
- Paling sederhana untuk MVP
- Tidak perlu provisioning database baru per tenant
- Migrasi schema hanya perlu dilakukan satu kali

**Trade-off:**
- Jika satu tenant memiliki query berat, berpotensi mempengaruhi tenant lain (dimitigasi dengan query optimization dan caching)
- Diperlukan ketelitian ekstra agar `publication_id` selalu disertakan dalam setiap query

### Tenant Resolution Flow

```
1. Request masuk ke server
2. Middleware baca header Host: investasicerdas.com
3. Lookup di tabel publications WHERE custom_domain = 'investasicerdas.com'
   ATAU WHERE slug = 'investasicerdas' (untuk subdomain)
4. Simpan publication_id ke dalam request context
5. Semua handler selanjutnya membaca publication_id dari context
6. Setiap query otomatis di-scope: WHERE publication_id = [id dari context]
```

### Contoh Tenant Scoping di Repository

```typescript
// article.repository.ts — query WAJIB selalu scope ke publicationId
async findMany(publicationId: string, options: ArticleQueryOptions) {
  return prisma.article.findMany({
    where: {
      publicationId,        // WAJIB — safeguard isolasi tenant
      deletedAt: null,
      ...options.filter
    },
    orderBy: options.orderBy ?? { publishedAt: 'desc' },
    take: options.limit ?? 20,
    cursor: options.cursor ? { id: options.cursor } : undefined,
  });
}
```

---

## 5. Authentication & Authorization

### 5.0 Auth Flow per User Type

Tiga jenis user memiliki auth flow yang berbeda:

| Flow | Platform Staff (owner/admin) | Publication Staff (owner/admin/author) | Member |
|---|---|---|---|
| Self-register | ❌ | ❌ (invite only) | ✅ `slug.lentera.id/register` |
| Login URL | `app.lentera.id/admin/login` | `slug.lentera.id/admin/login` | `slug.lentera.id/login` |
| Google OAuth | ❌ dilarang | ❌ dilarang | ✅ tersedia |
| Verify email | ❌ tidak perlu | ❌ tidak perlu | ✅ `slug.lentera.id/verify-email` |
| Forgot password | `app.lentera.id/admin/forgot-password` | `slug.lentera.id/admin/forgot-password` | `slug.lentera.id/forgot-password` |
| Reset password link | `app.lentera.id/admin/reset-password?token=...` | `slug.lentera.id/admin/reset-password?token=...` | `slug.lentera.id/reset-password?token=...` |
| Post-login redirect | `/admin/dashboard` | `/admin/dashboard` | `/` (publication homepage) |
| Onboarding | Ditambahkan manual oleh platform_owner | publication owner: `/accept-invite`; author: `slug.lentera.id/accept-author-invite` | `slug.lentera.id/register` |

**Pola kunci:** `/admin/*` = area staff di semua level. `/login` (tanpa `/admin`) di publication subdomain = member ONLY.

**Catatan penting:**
- `/login` di publication subdomain TIDAK melayani staff — hanya member dengan Google OAuth
- `/admin/login` di publication subdomain = staff (owner/admin/author) — pola sama dengan platform
- Guard untuk `/admin/dashboard` dilakukan di layout level, bukan proxy.ts
- `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` harus PUBLIC (tidak di-guard)
- Backend harus sertakan context (publication slug atau "platform") saat generate email link

### 5.1 Token Strategy

**Access Token (JWT)**
- Payload: `userId`, `email`, `emailVerified` (boolean)
- Expiry: 15 menit
- Disimpan di client: memory (JavaScript variable / Zustand store), TIDAK di localStorage atau cookie biasa
- Dikirim: `Authorization: Bearer [token]` header

**Refresh Token**
- Format: opaque string (random UUID, bukan JWT)
- Expiry: 30 hari inaktif
- Disimpan di client: httpOnly, Secure, SameSite=Strict cookie
- Disimpan di server: Redis dengan key `refresh:[userId]:[publicationId]:[tokenId]`, value `{ userId, publicationId, expiry, userAgent }`
- **Scope per publication:** Token yang di-issue saat login di publication A tidak bisa dipakai di publication B. Setiap sesi terisolasi per publication.
- **Token rotation:** Setiap kali refresh token digunakan → langsung di-rotate, token lama invalid.
- **Logout:** Hanya revoke token untuk publicationId yang sedang aktif, bukan semua session user.

**Alasan tidak pakai localStorage untuk token:**
localStorage bisa diakses oleh JavaScript sehingga rentan XSS. httpOnly cookie tidak bisa dibaca JS sama sekali, aman dari XSS. Access token di memory akan hilang saat tab ditutup — ini disengaja, dan silent refresh via cookie akan mendapatkan token baru secara otomatis.

---

### 5.2 Email Verification Strategy

Platform menggunakan pendekatan **soft verification** — user boleh login sebelum memverifikasi email, namun akses ke fitur kritis dibatasi sampai email diverifikasi.

**Alasan pendekatan ini:** Platform subscription-based memprioritaskan konversi. Memblokir user saat register akan meningkatkan churn sebelum mereka sempat explore konten.

**State `emailVerifiedAt` di tabel `users`:**
```
emailVerifiedAt = null      → belum terverifikasi, akses terbatas
emailVerifiedAt = timestamp → sudah terverifikasi, akses penuh
```

**Perbedaan berdasarkan metode register:**

| Metode | emailVerifiedAt saat akun dibuat | Alasan |
|---|---|---|
| Email + Password | `null` | Perlu konfirmasi kepemilikan email |
| Google OAuth | `new Date()` (langsung verified) | Google sudah menjamin email valid |

**Fitur yang membutuhkan email terverifikasi:**
- Checkout subscription / pembayaran
- Menulis komentar & Q&A
- Diundang / bergabung sebagai author di publication

**Fitur yang tetap bisa diakses tanpa verifikasi:**
- Baca artikel free
- Browse publication
- Update nama & bio profil

**Implementasi cek di service layer:**
```typescript
// Helper reusable — gunakan di setiap service yang butuh email verified
function requireVerifiedEmail(user: { emailVerifiedAt: Date | null }) {
  if (!user.emailVerifiedAt) {
    throw new AppError(
      'EMAIL_NOT_VERIFIED',
      403,
      'Verifikasi email kamu terlebih dahulu untuk menggunakan fitur ini'
    )
  }
}
```

**`emailVerified` di JWT payload:**
Field ini disertakan agar frontend bisa langsung tahu status verifikasi tanpa request tambahan — berguna untuk menampilkan banner "Verifikasi email kamu" di UI.

```typescript
// JWT payload
{
  sub: user.id,
  email: user.email,
  emailVerified: !!user.emailVerifiedAt
}
```

---

### 5.3 Register Flow

**Via Email + Password:**
```
1. Validasi input (Zod): email format, password min 8 karakter (huruf + angka)
2. Cek duplikat email di database
3. Hash password dengan Argon2id
4. Simpan user dengan emailVerifiedAt = null
5. Generate verification token (UUID v4)
6. Simpan token ke tabel email_verification_tokens
   (token, userId, expiresAt = NOW() + 24 jam)
7. Enqueue job kirim email verifikasi via BullMQ
8. Return 201 + data user (tanpa password_hash)
```

**Via Google OAuth:**
```
1. Terima user info dari Google (email, name, picture)
2. Lookup user di database berdasarkan google_id atau email
   - Jika sudah ada: update avatar_url jika berubah, lanjut ke step 4
   - Jika belum ada: buat akun baru
3. Set emailVerifiedAt = new Date() — Google sudah menjamin email valid
4. Issue access token + refresh token (flow sama dengan login normal)
```

---

### 5.4 Login Flow

**Via Email + Password:**
```
1. Cari user berdasarkan email
   → Jika tidak ada: return error INVALID_CREDENTIALS (pesan generik)
2. Verify password dengan argon2.verify(user.passwordHash, inputPassword)
   → Jika gagal: return error INVALID_CREDENTIALS (pesan generik)
3. Buat JWT access token:
   payload: { sub: userId, email, emailVerified: !!emailVerifiedAt }
   expiry: 15 menit
4. Buat refresh token (UUID v4)
   Simpan ke Redis: key "refresh:[userId]:[publicationId]:[tokenId]", TTL 30 hari
5. Return: access token di body, refresh token di httpOnly cookie
```

**Catatan keamanan:** Pesan error login selalu generik ("Email atau password salah") — tidak pernah membedakan "email tidak ditemukan" vs "password salah". Ini mencegah attacker melakukan email enumeration.

---

### 5.5 Token Refresh Flow

```
1. Access token expired → API kembalikan 401
2. Client otomatis kirim POST /auth/refresh (refresh token via cookie)
3. Server baca refresh token dari cookie
4. Lookup di Redis: key "refresh:[userId]:[publicationId]:[tokenId]"
   → Jika tidak ada / expired: clear cookie, return 401 → client redirect ke login
5. Jika valid:
   a. Hapus refresh token lama dari Redis (token rotation)
   b. Issue access token baru (JWT, 15 menit)
   c. Issue refresh token baru (UUID), simpan ke Redis
   d. Return access token baru di body, set cookie refresh token baru
```

**Token Rotation** mencegah refresh token dicuri dan digunakan berulang. Jika token lama dipakai setelah rotation, server tahu ada anomali dan bisa invalidate semua session user tersebut.

---

### 5.6 Logout Flow

```
1. Client kirim POST /auth/logout
2. Server hapus refresh token dari Redis → token langsung tidak bisa dipakai lagi
3. Server clear cookie: Set-Cookie: refreshToken=; Max-Age=0; HttpOnly
4. Client hapus access token dari memory (reset Zustand auth store)
5. Redirect ke halaman login
```

---

### 5.7 Forgot Password Flow

```
1. User submit email di halaman forgot password
2. POST /auth/forgot-password
   → Jika email tidak ditemukan: tetap return 200 (mencegah email enumeration)
   → Jika ditemukan tapi `passwordHash = null` (akun OAuth-only):
     kirim email informasi: "Akun kamu terdaftar via Google. Login dengan tombol Google."
     return 200 — tidak kirim link reset password
   → Jika ditemukan dan punya password:
     a. Hapus token reset lama milik user ini jika ada
     b. Generate reset token (UUID v4)
     c. Simpan ke tabel password_reset_tokens
        (token, userId, expiresAt = NOW() + 1 jam)
3. Enqueue job kirim email berisi link:
   - Untuk member: `https://[slug].lentera.id/reset-password?token=[token]`
   - Untuk platform admin: `https://app.lentera.id/admin/reset-password?token=[token]`
   Backend harus tahu context (publication slug atau platform) saat generate link ini.
4. User klik link → POST /auth/reset-password { token, newPassword }
5. Server cari token di tabel password_reset_tokens
   → Jika tidak ada atau expired: return 400 TOKEN_INVALID
6. Hash password baru dengan Argon2id, update di tabel users
7. Hapus token dari tabel password_reset_tokens (single-use)
8. Invalidate semua refresh token aktif user di Redis
   (logout dari semua device sebagai langkah keamanan)
9. Return 200 — client redirect ke login
```

---

### 5.8 Email Verification Flow

```
Verifikasi email pertama kali:
GET /auth/verify-email?token=[token]

1. Cari token di tabel email_verification_tokens
   → Jika tidak ada: return 400 TOKEN_INVALID
   → Jika expired (expiresAt < NOW()): return 400 TOKEN_EXPIRED
2. Update user: emailVerifiedAt = NOW()
3. Hapus token dari tabel (single-use)
4. Return 200 — redirect ke dashboard dengan notifikasi sukses

Minta kirim ulang email verifikasi:
POST /auth/resend-verification
Rate limit: 3 request per user per jam

1. Cek user belum terverifikasi (emailVerifiedAt = null)
   → Jika sudah verified: return 400
2. Hapus token verifikasi lama di tabel email_verification_tokens
3. Generate token baru, simpan ke tabel
4. Enqueue job kirim ulang email verifikasi
5. Return 200
```

---

### 5.9 Role & Permission System

#### Tiga Kategori Identity

```
1. Platform Staff    → field platform_role di tabel users
                       'platform_owner' | 'platform_admin' | null

2. Publication Staff → baris di tabel publication_authors
                       role: 'owner' | 'admin' | 'author'
                       (satu user bisa punya role berbeda di publication berbeda)

3. Reader State      → BUKAN DB role, ditentukan runtime
                       subscriber | registered | anonymous
```

---

#### Platform Permissions

Login: email+password ONLY — Google OAuth dilarang untuk semua platform staff.

| Fitur | PLATFORM_OWNER | PLATFORM_ADMIN |
|---|---|---|
| Login di `/admin/login` | ✅ | ✅ |
| View semua publications | ✅ | ✅ |
| View semua users | ✅ | ✅ |
| View platform analytics & revenue | ✅ | ✅ |
| Invite publication owner (kirim email) | ✅ | ✅ |
| Suspend publication — soft (owner tidak bisa publish, reader masih bisa baca) | ✅ | ✅ |
| Suspend publication — hard (semua akses ditutup, refund pro-rata) | ✅ | ✅ |
| Unsuspend publication | ✅ | ✅ |
| Konfigurasi platform fee per publication | ✅ | ✅ |
| Impersonate user manapun | ✅ | ✅ |
| Tambah platform_admin baru | ✅ | ❌ |
| Hapus platform_admin | ✅ | ❌ |
| Promosi platform_admin → platform_owner | ✅ | ❌ |
| Ubah setting inti platform (domain, branding) | ✅ | ❌ |

---

#### Publication Staff Permissions

Login: email+password ONLY — Google OAuth dilarang. Semua staff otomatis bisa baca konten premium di publication mereka sendiri tanpa berlangganan.

**Konten — Artikel:**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Buat artikel baru | ✅ | ✅ | ✅ |
| Edit artikel milik sendiri | ✅ | ✅ | ✅ |
| Hapus artikel milik sendiri | ✅ | ✅ | ✅ |
| Publish / unpublish / schedule artikel sendiri | ✅ | ✅ | ✅ |
| Edit artikel milik author lain | ✅ | ✅ | ❌ |
| Hapus artikel milik author lain | ✅ | ✅ | ❌ |
| Publish / unpublish artikel milik author lain | ✅ | ✅ | ❌ |

**Konten — Series:**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Buat series baru | ✅ | ✅ | ✅ |
| Edit / hapus series milik sendiri | ✅ | ✅ | ✅ |
| Edit / hapus series milik author lain | ✅ | ✅ | ❌ |
| Tambahkan artikel ke series manapun | ✅ | ✅ | ❌ |
| Tambahkan artikel sendiri ke series sendiri | ✅ | ✅ | ✅ |

**Konten — Roadmap:**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Buat / edit / hapus roadmap | ✅ | ✅ | ❌ |

**Publication Settings:**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Edit nama, deskripsi, logo publication | ✅ | ✅ | ❌ |
| Kelola subscription plans (buat, ubah, nonaktifkan) | ✅ | ✅ | ❌ |
| Konfigurasi custom domain | ✅ | ❌ | ❌ |

**Subscribers & Revenue:**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Lihat daftar subscriber | ✅ | ✅ | ❌ |
| Export subscriber list (CSV) | ✅ | ✅ | ❌ |
| Lihat analytics publication (semua artikel, aggregate) | ✅ | ✅ | ❌ |
| Lihat analytics artikel milik sendiri (views, reads) | ✅ | ✅ | ✅ |
| Lihat revenue / MRR | ✅ | ✅ | ❌ |

**Team Management:**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Invite member tim baru dengan role `author` | ✅ | ✅ | ❌ |
| Invite member tim baru dengan role `admin` | ✅ | ❌ | ❌ |
| Remove `author` dari publication | ✅ | ✅ | ❌ |
| Remove `admin` dari publication | ✅ | ❌ | ❌ |
| Ubah role member tim (author ↔ admin) | ✅ | ❌ | ❌ |

**Publication Lifecycle:**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Request delete publication (30-hari cooling period) | ✅ | ❌ | ❌ |
| Cancel delete request | ✅ | ❌ | ❌ |
| Transfer ownership ke user lain | ✅ | ❌ | ❌ |

**Reader Access (sebagai reader di publication sendiri):**
| Fitur | OWNER | ADMIN | AUTHOR |
|---|---|---|---|
| Baca konten premium (tanpa subscribe) | ✅ | ✅ | ✅ |
| Post komentar | ✅ | ✅ | ✅ |
| Post / upvote Q&A | ✅ | ✅ | ✅ |

---

#### Reader Permissions

| Fitur | SUBSCRIBER | REGISTERED | ANONYMOUS |
|---|---|---|---|
| Baca artikel free | ✅ | ✅ | ✅ |
| Baca artikel premium | ✅ | ❌ | ❌ |
| Lihat komentar artikel | ✅ | ✅ | ✅ |
| Like artikel free | ✅ | ✅ | ✅ |
| Like artikel premium | ✅ | ❌ | ❌ |
| Post komentar | ✅ | ❌ | ❌ |
| Reply komentar | ✅ | ❌ | ❌ |
| Post Q&A question | ✅ | ❌ | ❌ |
| Upvote Q&A | ✅ | ❌ | ❌ |
| Save artikel ke folder | ✅ | ❌ | ❌ |
| Subscribe (beli subscription) | N/A | ✅ | ✅ *(harus login dulu)* |
| Cancel subscription | ✅ | N/A | N/A |
| Lihat subscription history | ✅ | N/A | N/A |
| Update profil (nama, foto, bio) | ✅ | ✅ | ❌ |
| Ubah password | ✅ | ✅ | ❌ |
| Ubah email preferences | ✅ | ✅ | ❌ |

**`subscriber` = user dengan `subscriptions.status = 'active'` AND `expiresAt > now()`**
**`member` dalam UI/bisnis = `subscriber` secara teknis. Bukan DB role.**

---

#### Authorization Logic di Backend

**Akses konten premium:**
```typescript
async function canAccessPremium(userId: string, publicationId: string): Promise<boolean> {
  // 1. Cek apakah user adalah staff publication ini
  const isStaff = await prisma.publicationAuthor.findUnique({
    where: { publicationId_userId: { publicationId, userId } }
  })
  if (isStaff) return true

  // 2. Cek apakah user punya subscription aktif
  const subscription = await prisma.subscription.findFirst({
    where: { userId, publicationId, status: 'active', expiresAt: { gt: new Date() } }
  })
  return !!subscription
}
```

**Akses fitur subscriber-only (komentar, Q&A, save):**
```typescript
async function requireSubscriberOrStaff(userId: string, publicationId: string) {
  const canAccess = await canAccessPremium(userId, publicationId) // reuse fungsi di atas
  if (!canAccess) throw new AppError('SUBSCRIPTION_REQUIRED', 403, '...')

  // Plus wajib email verified untuk komentar/checkout
  await requireVerifiedEmail(user)
}
```

**Guard publikasi staff endpoint:**
```typescript
// requireRole helper — cek publication_authors
requireRole('owner')            // hanya owner
requireRole('owner', 'admin')   // owner atau admin
requireRole('owner', 'admin', 'author') // semua staff
```

---

## 6. API Design

### 6.1 Konvensi

- **Style:** RESTful
- **Base URL:** `https://api.platform.com/v1`
- **Format:** JSON untuk request dan response
- **Auth:** Bearer JWT token di header
- **Error format:**
```json
{
  "success": false,
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "Article not found",
  "timestamp": "2026-05-22T10:00:00Z",
  "path": "/api/v1/publications/xxx/articles/yyy"
}
```

### 6.2 Endpoint Groups

#### Auth — Member (slug.lentera.id/login, /register, dll)
```
POST   /auth/register                           ← member self-register (email+pass atau Google)
POST   /auth/login                              ← member login ONLY
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password                    ← member forgot-password, deteksi OAuth-only
POST   /auth/reset-password
POST   /auth/resend-verification
GET    /auth/verify-email?token=xxx             ← member email verification
GET    /auth/google                             ← initiate Google OAuth (state berisi publicationId)
GET    /auth/google/callback                    ← fixed URL, redirect ke publication subdomain
GET    /auth/me
```

#### Auth — Publication Staff (slug.lentera.id/admin/login, dll)
```
POST   /auth/staff/login                        ← staff login (owner/admin/author), no Google
POST   /auth/staff/logout
POST   /auth/staff/refresh
POST   /auth/staff/forgot-password              ← no OAuth-only detection (staff tidak pakai Google)
POST   /auth/staff/reset-password
GET    /auth/staff/me

# Owner onboarding (invite-only)
GET    /auth/accept-owner-invite?token=xxx      ← return: email, ownerName, publicationId, publicationName
POST   /auth/complete-owner-invite              ← buat user + update publication + set owner + issue tokens

# Author invite acceptance
GET    /auth/accept-author-invite?token=xxx     ← return: inviterName, publicationName, publicationSlug
POST   /auth/complete-author-invite             ← user baru: buat akun; existing: langsung accept
```

#### Auth — Platform Staff (app.lentera.id/admin/login, dll)
Melayani BOTH platform_owner dan platform_admin — keduanya login di URL yang sama.
```
POST   /auth/admin/login                        ← platform staff login (owner & admin), no Google
POST   /auth/admin/logout
POST   /auth/admin/refresh
POST   /auth/admin/forgot-password
POST   /auth/admin/reset-password
GET    /auth/admin/me                           ← return: id, email, name, platformRole
```
Backend membedakan `platform_owner` vs `platform_admin` berdasarkan field `platform_role` di tabel users.
Endpoint yang hanya boleh diakses `platform_owner` di-guard di service layer.

#### Publications
```
POST   /publications
GET    /publications/:slug
PATCH  /publications/:id
DELETE /publications/:id                          — request deletion (cooling period 30 hari)
GET    /publications/:id/authors
POST   /publications/:id/authors/invite
DELETE /publications/:id/authors/:userId
GET    /publications/:id/subscription-plans
PUT    /publications/:id/subscription-plans
GET    /publications/check-slug?slug=xxx          — cek ketersediaan slug (real-time)
POST   /publications/:id/transfer-ownership       — transfer ke user lain
```

#### Platform Admin Endpoints
```
# Tersedia untuk platform_owner DAN platform_admin:
PATCH  /admin/publications/:id/fee               — konfigurasi platform fee per publication
POST   /admin/impersonate/:userId                — masuk sebagai user (impersonate)
PATCH  /admin/publications/:id/suspend           — suspend publication (soft/hard)
POST   /admin/publications/:id/invite-owner      — kirim invite email ke calon owner
GET    /admin/publications                       — list semua publication
GET    /admin/users                             — list semua user

# Hanya platform_owner:
POST   /admin/staff                              — tambah platform_admin baru
DELETE /admin/staff/:userId                      — hapus platform_admin
PATCH  /admin/staff/:userId/role                 — ubah role (platform_admin ↔ platform_owner)
GET    /admin/staff                              — list semua platform staff
```

#### Articles
```
GET    /publications/:pubId/articles
POST   /publications/:pubId/articles
GET    /publications/:pubId/articles/:slug
PATCH  /publications/:pubId/articles/:id
DELETE /publications/:pubId/articles/:id
POST   /publications/:pubId/articles/:id/publish
```

#### Series & Roadmaps
```
GET    /publications/:pubId/series
POST   /publications/:pubId/series
GET    /publications/:pubId/series/:id
PATCH  /publications/:pubId/series/:id
POST   /publications/:pubId/series/:id/articles

GET    /publications/:pubId/roadmaps
POST   /publications/:pubId/roadmaps
GET    /publications/:pubId/roadmaps/:id
PATCH  /publications/:pubId/roadmaps/:id
```

#### Subscriptions
```
GET    /publications/:pubId/subscriptions/plans
POST   /publications/:pubId/subscriptions/order
POST   /subscriptions/webhook/midtrans
GET    /subscriptions/me
DELETE /subscriptions/:id
```

#### Community
```
GET    /publications/:pubId/articles/:artId/comments
POST   /publications/:pubId/articles/:artId/comments
DELETE /publications/:pubId/articles/:artId/comments/:id
POST   /publications/:pubId/articles/:artId/comments/:id/like
POST   /publications/:pubId/articles/:artId/like

GET    /publications/:pubId/qa
POST   /publications/:pubId/qa
POST   /publications/:pubId/qa/:id/answers
POST   /publications/:pubId/qa/:id/upvote
```

#### Personal Library
```
GET    /me/folders
POST   /me/folders
DELETE /me/folders/:id
POST   /me/folders/:id/articles
DELETE /me/folders/:id/articles/:articleId
```

#### Search
```
GET    /publications/:pubId/search?q=keyword&type=article&author=xxx
```

#### Analytics (owner only)
```
GET    /publications/:pubId/analytics/overview
GET    /publications/:pubId/analytics/articles
GET    /publications/:pubId/analytics/subscribers
GET    /publications/:pubId/analytics/revenue
GET    /publications/:pubId/subscribers
GET    /publications/:pubId/subscribers/export
```

### 6.3 Pagination

Semua endpoint list menggunakan cursor-based pagination:

```
GET /publications/:pubId/articles?cursor=<lastId>&limit=20

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "nextCursor": "article-uuid-xyz",
    "hasMore": true,
    "total": 47
  }
}
```

---

## 7. Database Design

### 7.1 Strategi

- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **UUID:** menggunakan `gen_random_uuid()` untuk semua primary key
- **Timestamps:** semua tabel memiliki `created_at` dan `updated_at` (kecuali tabel junction)
- **Soft delete:** tabel `articles` dan `comments` menggunakan `deleted_at` (nullable) — data tidak benar-benar dihapus

### 7.2 Schema Lengkap

```sql
-- =============================================
-- USERS & AUTH
-- =============================================

-- Users (global, tidak per-publication)
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255),              -- null jika hanya OAuth
  name                VARCHAR(255) NOT NULL,
  avatar_url          TEXT,
  bio                 TEXT,
  google_id           VARCHAR(255) UNIQUE,       -- untuk Google OAuth
  email_verified_at   TIMESTAMPTZ,               -- null = belum terverifikasi
  platform_role       VARCHAR(20)                -- null = bukan platform staff
                      CHECK (platform_role IN ('platform_owner', 'platform_admin')),
  email_bounce_count  INTEGER DEFAULT 0,         -- jumlah bounce dari Resend webhook
  email_bounced       BOOLEAN DEFAULT FALSE,     -- true = skip pengiriman email selanjutnya
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
-- platform_role = null     → user biasa (publication staff atau reader)
-- platform_role = 'platform_owner' → pemilik/founder platform
-- platform_role = 'platform_admin' → operator platform

-- Token verifikasi email (single-use, TTL 24 jam)
-- Disimpan di PostgreSQL (bukan Redis) agar tidak hilang jika Redis restart
CREATE TABLE email_verification_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token reset password (single-use, TTL 1 jam)
CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PUBLICATIONS & TENANCY
-- =============================================

-- Publications (tenant root)
CREATE TABLE publications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  VARCHAR(100) UNIQUE NOT NULL,
  name                  VARCHAR(255) NOT NULL,
  description           TEXT,
  logo_url              TEXT,
  cover_url             TEXT,
  custom_domain         VARCHAR(255) UNIQUE,
  platform_fee_percent  DECIMAL(5,2) DEFAULT 15.00,
  fee_enabled           BOOLEAN DEFAULT TRUE,
  status                VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'suspended_soft', 'suspended_hard', 'pending_deletion')),
  suspend_reason        TEXT,                    -- alasan suspend (diisi oleh platform_admin)
  scheduled_deletion_at TIMESTAMPTZ,            -- diset saat status = pending_deletion (NOW() + 30 hari)
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Status semantics:
-- active           → normal, semua fitur tersedia
-- suspended_soft   → owner tidak bisa publish, member masih bisa baca, subscriber baru tidak bisa join
-- suspended_hard   → seluruh publication tidak bisa diakses, refund pro-rata ke semua member aktif
-- pending_deletion → tidak bisa diakses publik, cooling period 30 hari, bisa dibatalkan

-- Publication authors
CREATE TABLE publication_authors (
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  role           VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'author')),
  joined_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (publication_id, user_id)
);

-- =============================================
-- SUBSCRIPTIONS & PAYMENTS
-- =============================================

-- Subscription plans per publication
CREATE TABLE subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id  UUID REFERENCES publications(id) ON DELETE CASCADE,
  duration_months INTEGER NOT NULL CHECK (duration_months IN (1, 3, 6, 12)),
  price           DECIMAL(12,2) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
-- gross/platform_fee/net_amount disimpan snapshot saat transaksi
-- karena fee_percent bisa berubah di masa depan
CREATE TABLE subscriptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID REFERENCES publications(id),
  user_id        UUID REFERENCES users(id),
  plan_id        UUID REFERENCES subscription_plans(id),
  status         VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  started_at     TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  gross_amount   DECIMAL(12,2) NOT NULL,
  platform_fee   DECIMAL(12,2) NOT NULL,
  net_amount     DECIMAL(12,2) NOT NULL,
  payment_id     VARCHAR(255),               -- Midtrans order ID
  payment_method VARCHAR(100),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTENT
-- =============================================

-- Articles
CREATE TABLE articles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id   UUID REFERENCES publications(id) ON DELETE CASCADE,
  author_id        UUID REFERENCES users(id),
  title            VARCHAR(500) NOT NULL,
  slug             VARCHAR(500) NOT NULL,
  content          JSONB,                     -- Tiptap JSON format
  excerpt          TEXT,
  cover_image_url  TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'scheduled', 'published')),
  visibility       VARCHAR(20) NOT NULL DEFAULT 'free'
                   CHECK (visibility IN ('free', 'members_only')),
  published_at     TIMESTAMPTZ,
  scheduled_at     TIMESTAMPTZ,
  meta_title       VARCHAR(255),
  meta_description TEXT,
  reading_time     INTEGER,                   -- dalam menit
  views_count      INTEGER DEFAULT 0,
  deleted_at       TIMESTAMPTZ,               -- soft delete
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (publication_id, slug)
);

-- Tags
CREATE TABLE tags (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  slug           VARCHAR(100) NOT NULL,
  UNIQUE (publication_id, slug)
);

CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Series
CREATE TABLE series (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id  UUID REFERENCES publications(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES users(id),
  title           VARCHAR(500) NOT NULL,
  slug            VARCHAR(500) NOT NULL,
  description     TEXT,
  cover_image_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (publication_id, slug)
);

CREATE TABLE series_articles (
  series_id   UUID REFERENCES series(id) ON DELETE CASCADE,
  article_id  UUID REFERENCES articles(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (series_id, article_id)
);

-- Roadmaps
CREATE TABLE roadmaps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  title          VARCHAR(500) NOT NULL,
  slug           VARCHAR(500) NOT NULL,
  description    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roadmap_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id  UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE roadmap_stage_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id    UUID REFERENCES roadmap_stages(id) ON DELETE CASCADE,
  item_type   VARCHAR(20) NOT NULL CHECK (item_type IN ('article', 'series')),
  item_id     UUID NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- COMMUNITY
-- =============================================

-- Comments
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  parent_id   UUID REFERENCES comments(id),  -- null = root comment, max 1 level reply
  content     TEXT NOT NULL,
  is_pinned   BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  deleted_at  TIMESTAMPTZ,                   -- soft delete
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Q&A
CREATE TABLE qa_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(id),
  title          VARCHAR(500) NOT NULL,
  content        TEXT,
  upvotes_count  INTEGER DEFAULT 0,
  is_answered    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE qa_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES qa_questions(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES users(id),
  content     TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PERSONAL LIBRARY & ANALYTICS
-- =============================================

-- Saved articles (personal library)
CREATE TABLE saved_folders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_articles (
  folder_id  UUID REFERENCES saved_folders(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (folder_id, article_id)
);

-- Article read tracking
CREATE TABLE article_reads (
  article_id         UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at            TIMESTAMPTZ DEFAULT NOW(),
  completion_percent INTEGER DEFAULT 0,
  PRIMARY KEY (article_id, user_id)
);

-- Email preferences per user per publication
CREATE TABLE email_preferences (
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  new_article    BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (user_id, publication_id)
);
```

### 7.3 Indexes Penting

```sql
-- Query paling sering: artikel per publication
CREATE INDEX idx_articles_publication_status
  ON articles(publication_id, status, published_at DESC);
CREATE INDEX idx_articles_publication_slug
  ON articles(publication_id, slug);

-- Check subscription aktif (dijalankan setiap request ke konten premium)
CREATE INDEX idx_subscriptions_user_pub
  ON subscriptions(user_id, publication_id, status, expires_at);

-- Tenant resolution via custom domain / slug
CREATE INDEX idx_publications_custom_domain ON publications(custom_domain);
CREATE INDEX idx_publications_slug ON publications(slug);

-- Auth token lookups (harus cepat)
CREATE INDEX idx_email_verification_tokens_token
  ON email_verification_tokens(token);
CREATE INDEX idx_password_reset_tokens_token
  ON password_reset_tokens(token);

-- Full text search (PostgreSQL FTS)
CREATE INDEX idx_articles_fts ON articles
  USING GIN(to_tsvector('indonesian', title || ' ' || COALESCE(excerpt, '')));
```

### 7.4 Redis Keys untuk Auth

Refresh token disimpan di Redis karena diakses sangat sering (setiap 15 menit per user aktif) dan butuh TTL otomatis. Token verifikasi email dan reset password disimpan di PostgreSQL karena perlu persistence — tidak boleh hilang jika Redis restart.

| Data | Storage | Key / Identifier | TTL |
|---|---|---|---|
| Refresh token | Redis | `refresh:[userId]:[publicationId]:[tokenId]` | 30 hari |
| Login attempt counter | Redis | `login_attempts:[email]:[publicationId]` | 15 menit |
| Email verification token | PostgreSQL | tabel `email_verification_tokens` | 24 jam (field `expires_at`) |
| Password reset token | PostgreSQL | tabel `password_reset_tokens` | 1 jam (field `expires_at`) |
| Subscription status cache | Redis | `sub:[userId]:[pubId]` | 5 menit |
| Publication cache | Redis | `pub:slug:[slug]` | 1 jam |

---

## 8. Subscription & Payment Flow

### 8.1 Midtrans Integration

Platform menggunakan **Midtrans Snap** untuk checkout UI dan **Midtrans Core API** untuk webhook.

**Flow pembuatan order:**
```
1. Client POST /subscriptions/order { planId }
2. Server:
   a. Validasi email user sudah terverifikasi (requireVerifiedEmail)
   b. Validasi plan exists dan aktif
   c. Hitung platform_fee = gross_amount × (fee_percent / 100)
   d. Hitung net_amount = gross_amount - platform_fee
   e. Buat record subscription dengan status 'pending'
   f. Buat Midtrans transaction dengan order_id = subscription.id
   g. Return Midtrans snap_token ke client
3. Client tampilkan Midtrans Snap popup dengan snap_token
4. User bayar melalui UI Midtrans
5. Midtrans kirim webhook ke /subscriptions/webhook/midtrans
```

**Webhook handling:**
```
1. Terima webhook Midtrans
2. VERIFIKASI SIGNATURE: SHA512(order_id + status_code + gross_amount + ServerKey)
   → Jika tidak valid: return 400, jangan proses
3. Idempotency check: cek subscription.payment_id sudah pernah diproses?
   → Jika sudah: return 200 tanpa aksi
4. Cek transaction_status:
   - 'settlement' atau 'capture' → aktifkan subscription
   - 'pending' → tidak ada aksi
   - 'deny' / 'cancel' / 'expire' → update status ke 'cancelled'
5. Jika settlement:
   UPDATE subscriptions SET status='active', started_at=NOW(), expires_at=...
6. Enqueue job kirim email konfirmasi ke subscriber
7. Return 200 OK ke Midtrans
```

### 8.2 Subscription Auto-Expire Job

Subscription tidak expire secara otomatis berdasarkan field `expires_at` saja — perlu background job untuk mengubah status di database dan invalidate cache.

```
BullMQ repeatable job: "expire-subscriptions"
Jadwal: setiap 10 menit

Logika:
1. SELECT id, user_id, publication_id FROM subscriptions
   WHERE status = 'active' AND expires_at < NOW()
2. Batch UPDATE subscriptions SET status = 'expired'
3. Invalidate Redis cache: DEL sub:[userId]:[pubId] untuk setiap baris
4. (Opsional) Enqueue email "subscription expired" ke masing-masing user
```

**Tanpa job ini:** member yang sudah expired tetap bisa membaca konten premium selama cache masih valid (hingga 5 menit). Dengan job ini: status di DB diupdate, cache di-invalidate, akses langsung dicabut.

---

### 8.3 Access Control Check

```typescript
async function checkPremiumAccess(userId: string, publicationId: string): Promise<boolean> {
  const cacheKey = `sub:${userId}:${publicationId}`
  const cached = await redis.get(cacheKey)
  if (cached !== null) return cached === 'true'

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      publicationId,
      status: 'active',
      expiresAt: { gt: new Date() }
    }
  })

  const hasAccess = !!subscription
  await redis.setex(cacheKey, 300, String(hasAccess))
  return hasAccess
}
```

---

## 9. Email & Notification System

### 9.1 Provider

**Resend** sebagai primary provider (developer-friendly, pricing terjangkau, API sederhana).

### 9.2 Jenis Email & Template

| Email | Trigger | Recipient |
|---|---|---|
| Verifikasi email | Register via email+password | User baru |
| Resend verifikasi | Request manual | User belum verified |
| Welcome | Subscription aktif | Subscriber baru |
| Konfirmasi pembayaran | Webhook settlement | Subscriber |
| Notifikasi artikel baru | Artikel published | Subscriber (yang opt-in) |
| Reminder subscription (7 hari) | BullMQ scheduled job — 7 hari sebelum expired | Subscriber aktif |
| Reminder subscription (1 hari) | BullMQ scheduled job — 1 hari sebelum expired | Subscriber aktif |
| Subscription expired | Hari H expired | Ex-subscriber |
| Reset password | Forgot password request | User |
| Info akun OAuth-only | Forgot password — akun tanpa password | User OAuth |

**Email bounce handling:** Resend mengirim webhook `POST /email/webhook/resend` saat email bounce. Server menaikkan `email_bounce_count` di tabel `users`. Setelah 3x bounce → set `email_bounced = true` → skip pengiriman email selanjutnya untuk user tersebut.

### 9.3 Email Queue

Email tidak dikirim secara synchronous dalam request-response cycle. Semua email dikirim melalui job queue (BullMQ + Redis):

```
Request selesai → enqueue email job → return response ke client
                                     ↓ (async, beberapa detik kemudian)
                              Worker proses job → kirim via Resend
```

### 9.4 Unsubscribe

Setiap email newsletter menyertakan unsubscribe link dengan signed token:
```
https://api.platform.com/email/unsubscribe?token=[signed-jwt]
```
Klik link → update `email_preferences.new_article = false` untuk user + publication tersebut.

---

## 10. Custom Domain & Routing

### 10.1 Flow Setup Custom Domain

```
1. Owner beli domain di registrar (Niagahoster, Cloudflare, dll)
2. Owner input domain di dashboard: investasicerdas.com
3. Dashboard tampilkan instruksi: "Tambahkan CNAME record berikut di DNS kamu"
   → CNAME: investasicerdas.com → publications.platform.com
4. Server simpan custom_domain = 'investasicerdas.com' di tabel publications
5. Background job verifikasi DNS propagation setiap 5 menit
6. Setelah terverifikasi: provision SSL via Let's Encrypt
7. Status domain: pending → verified → active
```

### 10.2 SSL/TLS

- Subdomain resmi (`slug.platform.com`): wildcard SSL dari platform
- Custom domain: Let's Encrypt via Caddy atau cert-manager

### 10.3 Routing di Next.js via `proxy.ts`

Di Next.js 16, `middleware.ts` digantikan oleh `proxy.ts` yang berjalan di Node.js runtime (bukan Edge runtime).

**Tenant resolution logic:**
```typescript
// proxy.ts (implementasi aktual)
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.lentera.id'
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'lentera.id'
const LOCAL_DOMAIN = 'lvh.me'  // ← domain lokal untuk simulasi subdomain

// 1. Platform domain (app.lentera.id) → pass through tanpa header publication
if (host === APP_DOMAIN) return NextResponse.next()

// 2. Subdomain lokal (slug.lvh.me) atau production (slug.lentera.id)
//    → set x-publication-slug header
if (host.endsWith(`.${LOCAL_DOMAIN}`) || host.endsWith(`.${BASE_DOMAIN}`)) {
  const slug = host.replace(`.${suffix}`, '')
  requestHeaders.set('x-publication-slug', slug)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

// 3. Custom domain → set x-publication-host untuk lookup di DB
requestHeaders.set('x-publication-host', host)
return NextResponse.next({ request: { headers: requestHeaders } })
```

**Protected routes (PROTECTED_PREFIXES):**
```
/admin         ← berlaku di SEMUA domain:
               - app.lentera.id/admin/* → platform admin area
               - slug.lentera.id/admin/* → publication staff area
               PERHATIAN: harus EXCLUDE auth pages (/admin/login, /admin/forgot-password, /admin/reset-password)
```

Guard yang benar:
- `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` → PUBLIC di semua domain, tidak di-protect proxy
- Proteksi platform admin dashboard → dilakukan di `admin/layout.tsx` (check `platform_admin` role)
- Proteksi publication staff dashboard → dilakukan di `(publication)/admin/layout.tsx` (check `owner/admin/author` role)
- `/login`, `/register`, `/forgot-password` (tanpa prefix `/admin`) → PUBLIC, hanya untuk member

> **Catatan:** `proxy.ts` hanya untuk keputusan di request boundary — tenant resolution, coarse auth redirect. Business logic (validasi token penuh, cek subscription, cek role) tetap di layout atau Server Component.

**`(publication)/layout.tsx` — WAJIB meaningful:**
```typescript
// app/(publication)/layout.tsx
import { headers } from 'next/headers'

export default async function PublicationLayout({ children }) {
  const headersList = await headers()
  const slug = headersList.get('x-publication-slug')
  const host = headersList.get('x-publication-host')

  if (!slug && !host) notFound()  // Bukan publication request

  const publication = slug
    ? await fetchPublicationBySlug(slug)
    : await fetchPublicationByDomain(host!)

  if (!publication) notFound()
  if (publication.status === 'suspended_hard') redirect('/suspended')
  if (publication.status === 'pending_deletion') redirect('/suspended')

  return (
    <PublicationProvider publication={publication}>
      {children}
    </PublicationProvider>
  )
}
```

---

## 11. File Storage

### 11.1 Provider: Cloudinary

Semua gambar di-upload ke Cloudinary. Alasan: CDN global otomatis, transformasi gambar on-the-fly (resize, compress, format conversion), free tier cukup untuk MVP.

### 11.2 Upload Flow

```
1. Client minta signed upload URL: GET /media/upload-url
2. Backend generate Cloudinary signed upload params
3. Client upload langsung ke Cloudinary (tidak lewat backend — hemat bandwidth)
4. Cloudinary return public URL
5. Client simpan URL ke artikel/profil
```

### 11.3 Struktur Folder di Cloudinary

```
platform/
├── publications/
│   └── [publication_id]/
│       ├── covers/
│       ├── articles/
│       └── avatars/
└── users/
    └── [user_id]/
        └── avatar/
```

---

## 12. Search Architecture

### 12.1 MVP: PostgreSQL Full-Text Search

```sql
SELECT id, title, excerpt, published_at
FROM articles
WHERE publication_id = $1
  AND status = 'published'
  AND deleted_at IS NULL
  AND (visibility = 'free' OR $2 = true)   -- $2: apakah user adalah member
  AND to_tsvector('indonesian', title || ' ' || COALESCE(excerpt, ''))
      @@ plainto_tsquery('indonesian', $3)  -- $3: search query
ORDER BY ts_rank(
  to_tsvector('indonesian', title || ' ' || COALESCE(excerpt, '')),
  plainto_tsquery('indonesian', $3)
) DESC
LIMIT 20;
```

### 12.2 V2: Meilisearch

Saat volume artikel besar (>10.000 per publication), upgrade ke Meilisearch: typo tolerance, faceted search, sub-50ms response time, self-hosted.

**Indexing strategy:** Setiap kali artikel dipublish/diupdate, kirim ke Meilisearch index. Index terpisah per publication untuk isolasi data.

---

## 13. Caching Strategy

### 13.1 Redis Cache Keys

| Data | Key Pattern | TTL | Invalidation |
|---|---|---|---|
| Publication by slug | `pub:slug:{slug}` | 1 jam | Update publication settings |
| Publication by domain | `pub:domain:{domain}` | 1 jam | Update custom domain |
| Subscription status | `sub:{userId}:{pubId}` | 5 menit | Subscription event |
| Article metadata | `art:{articleId}` | 30 menit | Article update |
| Refresh token | `refresh:{userId}:{publicationId}:{tokenId}` | 30 hari | Logout / rotation |

### 13.2 Cache-Aside Pattern

```typescript
async function getPublication(slug: string) {
  const cacheKey = `pub:slug:${slug}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const pub = await prisma.publication.findUnique({ where: { slug } })
  if (!pub) return null

  await redis.setex(cacheKey, 3600, JSON.stringify(pub))
  return pub
}
```

### 13.3 Next.js Caching (Next.js 16)

```typescript
// lib/api/server.ts
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache'

export async function fetchArticle(slug: string) {
  'use cache'
  cacheTag(`article-${slug}`)
  cacheTag('articles')
  cacheLife('hours')
  const res = await fetch(`${API_URL}/articles/${slug}`)
  return res.json()
}

// Data real-time — tidak di-cache
export async function fetchSubscriberStats(pubId: string) {
  const res = await fetch(`${API_URL}/analytics/${pubId}`)
  return res.json()
}
```

**On-demand invalidation:**

```typescript
'use server'
import { revalidateTag } from 'next/cache'

export async function publishArticle(articleId: string, slug: string) {
  await api.post(`/articles/${articleId}/publish`)
  revalidateTag(`article-${slug}`)
  revalidateTag('articles')
}
```

**`cacheLife` profiles:**

| Profile | Cocok untuk |
|---|---|
| `'seconds'` | Data yang berubah sangat cepat |
| `'minutes'` | List artikel, data semi-fresh |
| `'hours'` | Konten artikel, halaman series |
| `'days'` | Halaman statis, about page |
| `'max'` | Aset yang tidak pernah berubah |

#### Parallel Data Fetching

```typescript
// BAIK: parallel
const [publication, articles, authors] = await Promise.all([
  fetchPublication(slug),
  fetchArticles(pubId),
  fetchAuthors(pubId),
])
```

#### Suspense & Streaming

```typescript
export default function PublicationHomePage() {
  return (
    <main>
      <PublicationHero />
      <Suspense fallback={<ArticleListSkeleton />}>
        <ArticleList />
      </Suspense>
    </main>
  )
}
```

#### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src={article.coverImageUrl}
  alt={article.title}
  width={800}
  height={400}
  priority={isAboveFold}
/>

// Untuk fill mode
<div className="relative aspect-video">
  <Image src={...} alt={...} fill className="object-cover"
    sizes="(max-width: 768px) 100vw, 800px" />
</div>
```

#### Metadata & SEO

```typescript
export async function generateMetadata({ params }) {
  const publication = await fetchPublication(params.slug)
  return {
    metadataBase: new URL(`https://${publication.customDomain ?? `${publication.slug}.platform.com`}`),
    title: { template: `%s | ${publication.name}`, default: publication.name },
    description: publication.description,
    openGraph: { siteName: publication.name, locale: 'id_ID' },
  }
}
```

---

## 14. Security Architecture

### 14.1 Input Validation

Semua input divalidasi menggunakan Zod sebelum masuk ke service layer. Tidak ada raw user input yang langsung dikirim ke database.

### 14.2 SQL Injection Prevention

Menggunakan Prisma ORM — semua query menggunakan parameterized queries secara default. Raw SQL hanya via `$queryRaw` dengan parameter binding.

### 14.3 XSS Prevention

Konten artikel disimpan sebagai Tiptap JSON (bukan HTML). Tiptap renderer mengontrol output HTML — tidak ada raw HTML dari user yang langsung di-inject ke DOM.

### 14.4 CSRF Protection

Menggunakan `SameSite=Strict` pada refresh token cookie — browser tidak akan mengirim cookie ini pada cross-site request.

### 14.5 Rate Limiting

```
POST /auth/login                 → 5 kegagalan per email+publicationId per 15 menit → lockout
                                   (Redis key: login_attempts:[email]:[publicationId])
                                   + 100 request per IP per menit (layer kedua, mencegah brute force IP)
POST /auth/register              → 3 request per IP per 10 menit
POST /auth/forgot-password       → 3 request per IP per jam
POST /auth/resend-verification   → 3 request per user per jam
GET  /*                          → 100 request per IP per menit
POST /* (authenticated)          → 30 request per user per menit
POST /subscriptions/webhook      → whitelist Midtrans IP saja
POST /email/webhook/resend       → whitelist Resend IP saja
```

### 14.6 Sensitive Data

- Password: hashed dengan Argon2id (bukan bcrypt — lebih resistant terhadap GPU cracking)
- Payment data: tidak disimpan di database kita — semua ada di Midtrans
- PII (email, nama): tidak di-log di application logs

---

## 15. Deployment Architecture

### 15.1 MVP: Simple & Cost-Efficient

```
Frontend (Next.js)  →  Vercel (free tier → Pro)
Backend (Express)   →  Railway atau Render
Database            →  Railway PostgreSQL
Redis               →  Railway Redis atau Upstash
File Storage        →  Cloudinary
Email               →  Resend
DNS & CDN           →  Cloudflare
```

### 15.2 Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.platform.com/auth/google/callback

# Midtrans
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_IS_PRODUCTION=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
RESEND_API_KEY=...
EMAIL_FROM=noreply@platform.com

# Platform
PLATFORM_DOMAIN=platform.com
PLATFORM_API_URL=https://api.platform.com
```

### 15.3 CI/CD Pipeline (GitHub Actions)

```yaml
Trigger: push ke branch main

Jobs:
1. lint & type check (parallel)
2. build
3. deploy ke Railway/Render (backend) + Vercel (frontend)
4. run smoke tests
```

### 15.4 Future Migration Path (V3+)

```
Vercel          →  tetap (excellent untuk Next.js)
Railway/Render  →  AWS ECS atau GCP Cloud Run
PostgreSQL      →  AWS RDS atau GCP Cloud SQL (dengan read replica)
Redis           →  AWS ElastiCache
Cloudinary      →  tetap atau AWS S3 + CloudFront
```

---

## 16. Project Structure

### 16.1 Backend (Express.js)

```
backend/
├── src/
│   ├── index.ts                       — entry point, app bootstrap
│   ├── app.ts                         — Express app setup, middleware chain
│   │
│   ├── config/
│   │   ├── index.ts                   — load & export semua config
│   │   ├── database.config.ts         — Prisma client singleton
│   │   └── redis.config.ts            — Redis client singleton
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts         — verify JWT, attach user ke req
│   │   ├── tenant.middleware.ts       — resolve publication dari Host header
│   │   ├── rateLimiter.middleware.ts  — per-route rate limits
│   │   ├── validate.middleware.ts     — Zod schema validation factory
│   │   ├── logger.middleware.ts       — request/response logging
│   │   └── errorHandler.middleware.ts — global error handler (harus paling akhir)
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.schema.ts
│   │   ├── publication/
│   │   ├── article/
│   │   ├── series/
│   │   ├── roadmap/
│   │   ├── subscription/
│   │   │   └── midtrans.service.ts    — Midtrans API wrapper
│   │   ├── community/
│   │   ├── search/
│   │   ├── email/
│   │   ├── media/
│   │   └── analytics/
│   │
│   └── lib/
│       ├── AppError.ts                — custom error class
│       ├── jwt.ts                     — signAccessToken, verifyToken
│       ├── password.ts                — hash, verify (Argon2)
│       └── emailQueue.ts              — BullMQ queue & worker
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── package.json
└── tsconfig.json
```

### 16.2 Frontend (Next.js 16)

```
frontend/
├── proxy.ts                           — tenant resolution & auth redirect (BUKAN middleware.ts)
├── next.config.ts
│
└── src/
    ├── app/
    │   │
    │   ├── ── PLATFORM SPACE (app.lentera.id/*) ──────────────────────
    │   ├── admin/
    │   │   ├── login/page.tsx         — /admin/login (email+pass only, no Google)
    │   │   ├── forgot-password/page.tsx
    │   │   ├── reset-password/page.tsx
    │   │   ├── dashboard/page.tsx     — platform admin dashboard (protected)
    │   │   ├── publications/page.tsx
    │   │   └── invite/page.tsx
    │   │
    │   ├── accept-invite/page.tsx     — owner onboarding wizard (pre-auth)
    │   │
    │   ├── ── CALLBACKS (fixed URL) ───────────────────────────────────
    │   ├── auth/google/callback/page.tsx  — OAuth callback
    │   ├── payment/success/page.tsx       — Midtrans callback
    │   │
    │   ├── ── PUBLICATION SPACE (slug.lentera.id/*) ───────────────────
    │   └── (publication)/             — tenant dari x-publication-slug header
    │       ├── layout.tsx             — WAJIB: resolve tenant, PublicationContext
    │       │
    │       ├── ── MEMBER SPACE (root) ────────────────────────────────────
    │       ├── page.tsx               — publication homepage
    │       ├── [articleSlug]/page.tsx
    │       ├── series/[slug]/page.tsx
    │       ├── suspended/page.tsx
    │       ├── accept-author-invite/page.tsx  — pre-auth
    │       │
    │       ├── login/page.tsx         — /login — MEMBER ONLY + Google OAuth
    │       ├── register/page.tsx
    │       ├── verify-email/page.tsx
    │       ├── forgot-password/page.tsx
    │       ├── reset-password/page.tsx
    │       │
    │       ├── subscribe/page.tsx
    │       ├── settings/page.tsx
    │       ├── subscription/page.tsx
    │       │
    │       └── ── STAFF SPACE (/admin/*) ─────────────────────────────────
    │           └── admin/
    │               ├── layout.tsx     — guard: protect dashboard, pass-through auth
    │               ├── login/page.tsx — /admin/login — STAFF ONLY, no Google
    │               ├── forgot-password/page.tsx
    │               ├── reset-password/page.tsx
    │               └── dashboard/
    │                   ├── layout.tsx — guard: verify owner/admin/author role
    │                   ├── page.tsx   — /admin/dashboard
    │                   ├── articles/
    │                   ├── series/
    │                   ├── subscribers/page.tsx
    │                   ├── analytics/page.tsx
    │                   └── settings/page.tsx
    │
    ├── components/
    │   ├── ui/                        — shadcn/ui components
    │   ├── auth/
    │   ├── article/
    │   ├── editor/                    — Tiptap editor (CC only)
    │   └── subscription/
    │
    ├── lib/
    │   ├── api/
    │   │   ├── server.ts              — fetch helpers untuk Server Components
    │   │   └── client.ts             — Axios instance untuk Client Components
    │   └── actions/                   — Server Actions
    │
    ├── hooks/                         — custom hooks (CC only)
    ├── store/                         — Zustand stores (CC only)
    └── types/                         — TypeScript type definitions
```

> **Catatan:** Struktur di atas adalah TARGET setelah EPIC 18 selesai. Kondisi aktual saat ini masih dalam transisi — lihat `docs/06_USER_STORIES.md` EPIC 18 untuk progress refactor.

---

*Dokumen ini adalah living document. Versi berikutnya: Technical Specification per modul.*

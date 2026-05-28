# System Architecture Document (SAD)
## Platform Blog Subscription Multi-Author
**Versi:** 1.2  
**Tanggal:** 22 Mei 2026  
**Status:** Draft  
**Referensi:** PRD v1.1

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
  ├── Resend / Mailgun (email)
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

**Next.js Web App** — satu aplikasi Next.js yang melayani dua konteks berbeda:

| Konteks | URL Pattern | Rendering | Audience |
|---|---|---|---|
| Publication site | `[slug].platform.com` atau custom domain | SSR + SSG | Reader & member |
| Platform dashboard | `app.platform.com` | CSR | Owner & author |

Pemisahan ini penting: halaman artikel reader menggunakan SSR/SSG untuk SEO, sedangkan dashboard admin cukup CSR.

**Routing berdasarkan domain:**
```
investasicerdas.com  →  Publication site (tenant: investasicerdas)
app.platform.com     →  Dashboard (semua owner & author)
platform.com         →  Marketing landing page
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

Backend menggunakan Express.js dengan struktur 4-layer yang konsisten di setiap domain:

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

```
// Contoh error response standar
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
- `auth.router.ts` — register, login, OAuth, token refresh
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

### 5.1 Token Strategy

**Access Token (JWT)**
- Berisi: `userId`, `email`, `publicationId` (jika konteks publication), `role`
- Expiry: 15 menit
- Disimpan: memory (JavaScript variable), TIDAK di localStorage atau cookie biasa
- Dikirim: `Authorization: Bearer [token]` header

**Refresh Token**
- Format: opaque string (random UUID, bukan JWT)
- Expiry: 30 hari
- Disimpan di client: httpOnly, Secure, SameSite=Strict cookie
- Disimpan di server: Redis dengan key `refresh:[userId]:[tokenId]`, value `{userId, expiry, userAgent}`

**Alasan tidak pakai localStorage untuk token:**
- localStorage bisa diakses oleh JavaScript → rentan XSS
- httpOnly cookie tidak bisa dibaca JS → aman dari XSS

### 5.2 Token Refresh Flow

```
1. Access token expired → API kembalikan 401
2. Client otomatis kirim POST /auth/refresh dengan refresh token (lewat cookie)
3. Server verifikasi refresh token di Redis
4. Jika valid: issue access token baru, rotate refresh token (hapus lama, simpan baru)
5. Jika tidak valid: paksa logout, redirect ke login
```

**Token Rotation:** Setiap kali refresh token digunakan, langsung dihapus dan diganti baru. Ini mencegah refresh token dicuri dan digunakan berulang.

### 5.3 Google OAuth Flow

```
1. User klik "Login dengan Google"
2. Redirect ke Google consent screen
3. Google callback ke /auth/google/callback dengan authorization code
4. Server tukar code dengan Google access token
5. Ambil user info dari Google (email, name, picture)
6. Lookup user di database berdasarkan email
   - Jika ada: login langsung
   - Jika tidak ada: buat akun baru (register otomatis)
7. Issue JWT access token + refresh token seperti biasa
```

### 5.4 Role & Permission System

Setiap user bisa memiliki role berbeda di publication berbeda:

```
Global roles:
  - platform_admin: akses penuh ke semua publication (untuk operator platform)

Per-publication roles:
  - owner: semua hak akses di publication tersebut
  - author: bisa menulis & publish artikel, tidak bisa ubah billing/settings
  - member: subscriber aktif, akses konten premium

Reader state (bukan role, tapi state):
  - anonymous: belum login, hanya akses konten free
  - logged_in_non_member: login tapi tidak subscribe, tetap hanya free
```

**Authorization Check Flow:**
```
Request ke konten premium
  → Middleware: verifikasi JWT valid
  → Middleware: cek user punya subscription aktif untuk publication ini
  → Cek: subscription.expires_at > now()
  → Jika semua lolos: lanjutkan
  → Jika gagal di mana saja: 403 Forbidden
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
  "statusCode": 404,
  "error": "Not Found",
  "message": "Article not found",
  "timestamp": "2026-05-22T10:00:00Z"
}
```

### 6.2 Endpoint Groups

#### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/google
GET    /auth/google/callback
GET    /auth/me
```

#### Publications
```
POST   /publications                        — buat publication baru
GET    /publications/:slug                  — detail publication (public)
PATCH  /publications/:id                    — update settings (owner only)
GET    /publications/:id/authors            — daftar author
POST   /publications/:id/authors/invite     — undang author
DELETE /publications/:id/authors/:userId    — remove author
GET    /publications/:id/subscription-plans — ambil paket subscription
PUT    /publications/:id/subscription-plans — update paket (owner only)
```

#### Articles
```
GET    /publications/:pubId/articles              — list artikel (public: free saja, member: semua)
POST   /publications/:pubId/articles              — buat artikel (author only)
GET    /publications/:pubId/articles/:slug        — baca artikel
PATCH  /publications/:pubId/articles/:id          — update artikel (author/owner)
DELETE /publications/:pubId/articles/:id          — hapus artikel
POST   /publications/:pubId/articles/:id/publish  — publish artikel
```

#### Series & Roadmaps
```
GET    /publications/:pubId/series
POST   /publications/:pubId/series
GET    /publications/:pubId/series/:id
PATCH  /publications/:pubId/series/:id
POST   /publications/:pubId/series/:id/articles   — tambah artikel ke series

GET    /publications/:pubId/roadmaps
POST   /publications/:pubId/roadmaps
GET    /publications/:pubId/roadmaps/:id
PATCH  /publications/:pubId/roadmaps/:id
```

#### Subscriptions
```
GET    /publications/:pubId/subscriptions/plans   — daftar paket & harga
POST   /publications/:pubId/subscriptions/order   — buat order baru
POST   /subscriptions/webhook/midtrans            — Midtrans webhook (no auth)
GET    /subscriptions/me                          — status subscription user yang login
DELETE /subscriptions/:id                         — cancel subscription
```

#### Community
```
GET    /publications/:pubId/articles/:artId/comments
POST   /publications/:pubId/articles/:artId/comments
DELETE /publications/:pubId/articles/:artId/comments/:id
POST   /publications/:pubId/articles/:artId/comments/:id/like
POST   /publications/:pubId/articles/:artId/like   — like artikel (non-member)

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
GET    /publications/:pubId/subscribers                — list subscriber
GET    /publications/:pubId/subscribers/export         — export CSV
```

### 6.3 Pagination

Semua endpoint list menggunakan cursor-based pagination:

```
GET /publications/:pubId/articles?cursor=<lastId>&limit=20

Response:
{
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
- **Timestamps:** semua tabel memiliki `created_at` dan `updated_at`
- **Soft delete:** tabel artikel, komentar menggunakan `deleted_at` (nullable) — data tidak benar-benar dihapus

### 7.2 Schema Lengkap

```sql
-- Users (global, tidak per-publication)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),           -- null jika hanya OAuth
  name          VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  google_id     VARCHAR(255) UNIQUE,    -- untuk OAuth
  email_verified_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Publications (tenant root)
CREATE TABLE publications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  cover_url     TEXT,
  custom_domain VARCHAR(255) UNIQUE,
  platform_fee_percent DECIMAL(5,2) DEFAULT 15.00,
  fee_enabled   BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Publication authors
CREATE TABLE publication_authors (
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'author')),
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (publication_id, user_id)
);

-- Subscription plans per publication
CREATE TABLE subscription_plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  duration_months INTEGER NOT NULL CHECK (duration_months IN (1, 3, 6, 12)),
  price          DECIMAL(12,2) NOT NULL,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
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
  payment_id     VARCHAR(255),          -- Midtrans order ID
  payment_method VARCHAR(100),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id  UUID REFERENCES publications(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES users(id),
  title           VARCHAR(500) NOT NULL,
  slug            VARCHAR(500) NOT NULL,
  content         JSONB,                -- Tiptap JSON format
  excerpt         TEXT,
  cover_image_url TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'scheduled', 'published')),
  visibility      VARCHAR(20) NOT NULL DEFAULT 'free'
                  CHECK (visibility IN ('free', 'members_only')),
  published_at    TIMESTAMPTZ,
  scheduled_at    TIMESTAMPTZ,
  meta_title      VARCHAR(255),
  meta_description TEXT,
  reading_time    INTEGER,              -- dalam menit
  views_count     INTEGER DEFAULT 0,
  deleted_at      TIMESTAMPTZ,          -- soft delete
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (publication_id, slug)
);

-- Article tags
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
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  author_id      UUID REFERENCES users(id),
  title          VARCHAR(500) NOT NULL,
  slug           VARCHAR(500) NOT NULL,
  description    TEXT,
  cover_image_url TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
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

-- Comments
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  parent_id   UUID REFERENCES comments(id),  -- null jika root comment
  content     TEXT NOT NULL,
  is_pinned   BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  deleted_at  TIMESTAMPTZ,
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
  article_id          UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at             TIMESTAMPTZ DEFAULT NOW(),
  completion_percent  INTEGER DEFAULT 0,
  PRIMARY KEY (article_id, user_id)
);

-- Email preferences
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
CREATE INDEX idx_articles_publication_status ON articles(publication_id, status, published_at DESC);
CREATE INDEX idx_articles_publication_slug ON articles(publication_id, slug);

-- Check subscription aktif (dijalankan setiap request ke konten premium)
CREATE INDEX idx_subscriptions_user_pub ON subscriptions(user_id, publication_id, status, expires_at);

-- Tenant resolution via custom domain
CREATE INDEX idx_publications_custom_domain ON publications(custom_domain);
CREATE INDEX idx_publications_slug ON publications(slug);

-- Full text search (PostgreSQL FTS)
CREATE INDEX idx_articles_fts ON articles USING GIN(to_tsvector('indonesian', title || ' ' || excerpt));
```

---

## 8. Subscription & Payment Flow

### 8.1 Midtrans Integration

Platform menggunakan **Midtrans Snap** untuk checkout UI dan **Midtrans Core API** untuk webhook.

**Flow pembuatan order:**
```
1. Client POST /subscriptions/order {planId}
2. Server:
   a. Validasi plan exists dan aktif
   b. Hitung platform_fee = gross_amount × (fee_percent/100)
   c. Hitung net_amount = gross_amount - platform_fee
   d. Buat record subscription dengan status 'pending'
   e. Buat Midtrans transaction dengan order_id = subscription.id
   f. Return Midtrans snap_token ke client
3. Client tampilkan Midtrans Snap popup dengan snap_token
4. User bayar melalui UI Midtrans
5. Midtrans kirim webhook ke /subscriptions/webhook/midtrans
```

**Webhook handling:**
```
1. Terima webhook Midtrans
2. VERIFIKASI SIGNATURE: SHA512(order_id + status_code + gross_amount + ServerKey)
   → Jika tidak valid: return 400, jangan proses
3. Cek transaction_status:
   - 'settlement' atau 'capture': → aktifkan subscription
   - 'pending': → tidak ada aksi (tunggu)
   - 'deny' / 'cancel' / 'expire': → update status ke 'cancelled'
4. Jika settlement: UPDATE subscriptions SET status='active', started_at=NOW(), expires_at=...
5. Trigger email konfirmasi ke subscriber
6. Return 200 OK ke Midtrans
```

**Idempotency:** Sebelum memproses webhook, cek apakah subscription.payment_id sudah pernah diproses. Jika sudah, return 200 tanpa melakukan aksi apapun.

### 8.2 Access Control Check

Setiap request ke artikel premium melewati middleware ini:

```typescript
async function checkPremiumAccess(userId: string, publicationId: string): Promise<boolean> {
  const subscription = await db.subscriptions.findFirst({
    where: {
      userId,
      publicationId,
      status: 'active',
      expires_at: { gt: new Date() }  // belum expired
    }
  });
  return !!subscription;
}
```

Middleware ini dipanggil dengan query yang di-cache di Redis (TTL 5 menit) untuk menghindari database hit setiap request.

---

## 9. Email & Notification System

### 9.1 Provider

**Resend** sebagai primary provider (developer-friendly, pricing terjangkau, API sederhana).

### 9.2 Jenis Email & Template

| Email | Trigger | Recipient |
|---|---|---|
| Verifikasi email | Register | User baru |
| Welcome | Subscription aktif | Subscriber baru |
| Konfirmasi pembayaran | Webhook settlement | Subscriber |
| Notifikasi artikel baru | Artikel published | Subscriber (yang opt-in) |
| Reminder subscription | 7 hari sebelum expired | Subscriber aktif |
| Subscription expired | Hari H expired | Ex-subscriber |
| Reset password | Forgot password request | User |

### 9.3 Email Queue

Email tidak dikirim secara synchronous dalam request-response cycle. Semua email dikirim melalui job queue (BullMQ + Redis) untuk menghindari latency tambahan:

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
- Custom domain: Let's Encrypt via Caddy atau cert-manager (jika pakai Kubernetes)

### 10.3 Routing di Next.js via `proxy.ts`

```typescript
// proxy.ts — tenant resolution dari domain
export default function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''

  const isSubdomain = hostname.endsWith('.platform.com') && hostname !== 'platform.com'
  const isCustomDomain = !hostname.includes('platform.com')

  if (isSubdomain || isCustomDomain) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-publication-host', hostname)

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}
```

Di Server Component layout, baca header untuk fetch data publikasi yang tepat:

```typescript
// app/(publication)/layout.tsx
import { headers } from 'next/headers'

export default async function PublicationLayout({ children }) {
  const headersList = await headers()
  const host = headersList.get('x-publication-host') ?? ''

  // Fetch publication berdasarkan host — bisa custom domain atau subdomain
  const publication = await fetchPublicationByHost(host)
  if (!publication) notFound()

  return <>{children}</>
}
```

---

## 11. File Storage

### 11.1 Provider: Cloudinary

Semua gambar di-upload ke Cloudinary. Alasan:
- CDN global otomatis
- Transformasi gambar on-the-fly (resize, compress, format conversion)
- Free tier cukup untuk MVP

### 11.2 Upload Flow

```
1. Client minta signed upload URL dari backend: GET /media/upload-url
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

Untuk MVP, search menggunakan PostgreSQL FTS — tidak perlu service tambahan:

```sql
SELECT id, title, excerpt, published_at
FROM articles
WHERE publication_id = $1
  AND status = 'published'
  AND deleted_at IS NULL
  AND (visibility = 'free' OR $2 = true)  -- $2: apakah user adalah member
  AND to_tsvector('indonesian', title || ' ' || COALESCE(excerpt, ''))
      @@ plainto_tsquery('indonesian', $3)  -- $3: search query
ORDER BY ts_rank(
  to_tsvector('indonesian', title || ' ' || COALESCE(excerpt, '')),
  plainto_tsquery('indonesian', $3)
) DESC
LIMIT 20;
```

### 12.2 V2: Meilisearch

Saat volume artikel mulai banyak (>10.000 per publication), upgrade ke Meilisearch:
- Typo tolerance
- Faceted search (filter by author, tag, date)
- Sub-50ms response time
- Self-hosted (cost-efficient)

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
| User session | `session:{userId}` | 15 menit | Logout |

### 13.2 Cache-Aside Pattern

```typescript
async function getPublication(slug: string) {
  const cacheKey = `pub:slug:${slug}`;
  
  // 1. Coba ambil dari cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // 2. Jika miss, ambil dari database
  const pub = await db.publications.findUnique({ where: { slug } });
  if (!pub) return null;
  
  // 3. Simpan ke cache
  await redis.setex(cacheKey, 3600, JSON.stringify(pub));
  return pub;
}
```

### 13.3 Next.js Caching

- **Halaman artikel free:** `revalidate: 3600` (ISR — regenerate setiap 1 jam)
- **Halaman artikel premium:** no cache (harus cek subscription setiap request)
- **Halaman listing artikel:** `revalidate: 300` (5 menit)
- **Dashboard:** no cache (CSR, real-time data)

---

## 14. Security Architecture

### 14.1 Input Validation

Semua input divalidasi menggunakan `class-validator` + `Zod` sebelum masuk ke service layer. Tidak ada raw user input yang langsung dikirim ke database.

### 14.2 SQL Injection Prevention

Menggunakan Prisma ORM — semua query menggunakan parameterized queries secara default. Raw SQL hanya digunakan di tempat yang sangat terbatas dan selalu menggunakan `$queryRaw` dengan parameter binding.

### 14.3 XSS Prevention

Konten artikel disimpan sebagai Tiptap JSON (bukan HTML). Saat di-render di frontend, Tiptap renderer mengontrol output HTML — tidak ada raw HTML dari user yang langsung di-inject ke DOM.

### 14.4 CSRF Protection

Menggunakan `SameSite=Strict` pada refresh token cookie — browser tidak akan mengirim cookie ini pada cross-site request.

### 14.5 Rate Limiting

```
POST /auth/login          → 5 request per IP per menit
POST /auth/register       → 3 request per IP per 10 menit
POST /auth/forgot-password → 3 request per IP per jam
GET  /*                   → 100 request per IP per menit
POST /* (authenticated)   → 30 request per user per menit
POST /subscriptions/webhook → whitelist Midtrans IP saja
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
Backend (NestJS)    →  Railway atau Render
Database            →  Railway PostgreSQL atau Supabase
Redis               →  Railway Redis atau Upstash
File Storage        →  Cloudinary
Email               →  Resend
DNS & CDN           →  Cloudflare
```

**Alasan pilihan ini:**
- Zero DevOps overhead di fase MVP
- Semua punya free tier yang cukup untuk awal
- Auto-deploy dari GitHub push
- Built-in monitoring dasar

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
1. lint & test (parallel)
2. build Docker image
3. push ke registry
4. deploy ke Railway/Render
5. run smoke tests
6. notify (Slack/email)
```

### 15.4 Future Migration Path (V3+)

Saat traffic sudah besar:
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
│   ├── index.ts                      — entry point, app bootstrap
│   ├── app.ts                        — Express app setup, middleware chain
│   │
│   ├── config/
│   │   ├── index.ts                  — load & export semua config
│   │   ├── database.config.ts        — Prisma client singleton
│   │   └── redis.config.ts           — Redis client singleton
│   │
│   ├── middleware/                   — global middleware
│   │   ├── auth.middleware.ts        — verify JWT, attach user ke req
│   │   ├── tenant.middleware.ts      — resolve publication dari Host header
│   │   ├── rateLimiter.middleware.ts — per-route rate limits
│   │   ├── validate.middleware.ts    — Zod schema validation factory
│   │   ├── logger.middleware.ts      — request/response logging
│   │   └── errorHandler.middleware.ts — global error handler (harus paling akhir)
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.router.ts        — POST /auth/login, /register, dll
│   │   │   ├── auth.controller.ts    — req/res handling
│   │   │   ├── auth.service.ts       — business logic (sign token, verify, dll)
│   │   │   ├── auth.repository.ts    — DB queries (find user by email, dll)
│   │   │   └── auth.schema.ts        — Zod validation schemas
│   │   │
│   │   ├── publication/
│   │   │   ├── publication.router.ts
│   │   │   ├── publication.controller.ts
│   │   │   ├── publication.service.ts
│   │   │   ├── publication.repository.ts
│   │   │   └── publication.schema.ts
│   │   │
│   │   ├── article/
│   │   │   ├── article.router.ts
│   │   │   ├── article.controller.ts
│   │   │   ├── article.service.ts
│   │   │   ├── article.repository.ts
│   │   │   └── article.schema.ts
│   │   │
│   │   ├── series/
│   │   │   ├── series.router.ts
│   │   │   ├── series.controller.ts
│   │   │   ├── series.service.ts
│   │   │   ├── series.repository.ts
│   │   │   └── series.schema.ts
│   │   │
│   │   ├── roadmap/
│   │   │   ├── roadmap.router.ts
│   │   │   ├── roadmap.controller.ts
│   │   │   ├── roadmap.service.ts
│   │   │   ├── roadmap.repository.ts
│   │   │   └── roadmap.schema.ts
│   │   │
│   │   ├── subscription/
│   │   │   ├── subscription.router.ts
│   │   │   ├── subscription.controller.ts
│   │   │   ├── subscription.service.ts
│   │   │   ├── subscription.repository.ts
│   │   │   ├── midtrans.service.ts   — Midtrans API wrapper
│   │   │   └── subscription.schema.ts
│   │   │
│   │   ├── community/
│   │   │   ├── community.router.ts
│   │   │   ├── comment.controller.ts
│   │   │   ├── comment.service.ts
│   │   │   ├── comment.repository.ts
│   │   │   ├── qa.controller.ts
│   │   │   ├── qa.service.ts
│   │   │   ├── qa.repository.ts
│   │   │   └── community.schema.ts
│   │   │
│   │   ├── search/
│   │   │   ├── search.router.ts
│   │   │   ├── search.controller.ts
│   │   │   └── search.service.ts     — query builder untuk FTS
│   │   │
│   │   ├── media/
│   │   │   ├── media.router.ts
│   │   │   ├── media.controller.ts
│   │   │   └── cloudinary.service.ts — signed upload URL generator
│   │   │
│   │   ├── email/
│   │   │   ├── email.service.ts      — kirim via Resend
│   │   │   ├── email.queue.ts        — BullMQ job definitions
│   │   │   └── templates/            — HTML email templates
│   │   │       ├── welcome.ts
│   │   │       ├── new-article.ts
│   │   │       ├── subscription-confirm.ts
│   │   │       └── reset-password.ts
│   │   │
│   │   └── analytics/
│   │       ├── analytics.router.ts
│   │       ├── analytics.controller.ts
│   │       └── analytics.service.ts
│   │
│   ├── lib/
│   │   ├── jwt.ts                    — sign/verify token helpers
│   │   ├── password.ts               — argon2 hash/verify helpers
│   │   ├── pagination.ts             — cursor pagination helper
│   │   └── AppError.ts               — custom error class
│   │
│   └── types/
│       ├── express.d.ts              — extend Express Request (req.user, req.publication)
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── test/
│   ├── unit/
│   └── integration/
│
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

**Catatan penting untuk Express setup:**

```typescript
// app.ts — urutan middleware adalah KRITIS, jangan diubah
app.use(helmet())                    // 1. Security headers — PALING PERTAMA
app.use(cors(corsOptions))           // 2. CORS
app.use(express.json())              // 3. Body parser
app.use(loggerMiddleware)            // 4. Request logging
app.use(rateLimiter)                 // 5. Global rate limit
app.use(tenantMiddleware)            // 6. Resolve publication dari domain

// Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/publications', publicationRouter)
// ... dst

// Error handler HARUS paling terakhir, setelah semua routes
app.use(errorHandlerMiddleware)      // 7. Global error handler — PALING TERAKHIR
```

### 16.2 Frontend (Next.js — App Router)

```
frontend/
├── src/
│   ├── app/                          — Next.js App Router root
│   │   │
│   │   ├── (publication)/            — Route group: publication site (reader)
│   │   │   ├── layout.tsx            — SC: fetch publication data, set metadata
│   │   │   ├── page.tsx              — SC: homepage publication (Cache Component)
│   │   │   ├── [articleSlug]/
│   │   │   │   └── page.tsx          — SC: artikel free (cached) / premium (request-time)
│   │   │   ├── series/[slug]/
│   │   │   │   └── page.tsx          — SC: halaman series (Cache Component)
│   │   │   ├── roadmap/[slug]/
│   │   │   │   └── page.tsx          — SC: halaman roadmap (Cache Component)
│   │   │   └── subscribe/
│   │   │       └── page.tsx          — CC: checkout flow (butuh state & payment SDK)
│   │   │
│   │   ├── (dashboard)/              — Route group: dashboard (owner/author)
│   │   │   ├── layout.tsx            — CC: auth check, sidebar navigation
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          — SC: overview stats (request-time)
│   │   │   │   ├── articles/
│   │   │   │   │   ├── page.tsx      — SC: list artikel
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  — CC: editor (Tiptap butuh browser APIs)
│   │   │   │   ├── series/
│   │   │   │   ├── roadmaps/
│   │   │   │   ├── subscribers/
│   │   │   │   │   └── page.tsx      — SC: list subscriber + export
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx      — CC: chart interaktif
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx      — CC: form settings
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        — CC: form login
│   │   │   ├── register/page.tsx     — CC: form register
│   │   │   └── forgot-password/
│   │   │       └── page.tsx          — CC: form forgot password
│   │   │
│   │   ├── me/
│   │   │   ├── library/page.tsx      — CC: folder & saved articles
│   │   │   └── settings/page.tsx     — CC: profile settings
│   │   │
│   │   ├── layout.tsx                — Root layout (font, global providers)
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── ui/                       — shadcn/ui (semua SC by default)
│   │   │
│   │   ├── article/
│   │   │   ├── ArticleCard.tsx       — SC
│   │   │   ├── ArticleBody.tsx       — SC: render Tiptap JSON ke HTML
│   │   │   ├── ArticlePaywall.tsx    — SC: paywall gate
│   │   │   ├── ArticleLikeButton.tsx — CC: butuh onClick handler
│   │   │   └── ArticleSaveButton.tsx — CC: butuh state + API call
│   │   │
│   │   ├── series/
│   │   │   ├── SeriesNav.tsx         — SC
│   │   │   └── SeriesProgress.tsx    — CC: track progress per user
│   │   │
│   │   ├── roadmap/
│   │   │   └── RoadmapVisual.tsx     — CC: interaktif, klik antar stage
│   │   │
│   │   ├── editor/
│   │   │   └── RichTextEditor.tsx    — CC: Tiptap (wajib CC, browser API)
│   │   │
│   │   ├── comment/
│   │   │   ├── CommentList.tsx       — SC: initial render
│   │   │   └── CommentForm.tsx       — CC: form submit
│   │   │
│   │   └── layout/
│   │       ├── PublicationNav.tsx    — SC
│   │       └── DashboardSidebar.tsx  — CC: active state navigation
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             — Axios instance untuk CC (browser)
│   │   │   └── server.ts             — fetch wrapper untuk SC (server-side)
│   │   ├── auth.ts                   — session helpers
│   │   ├── cache.ts                  — cacheTag constants & revalidation helpers
│   │   └── utils.ts
│   │
│   ├── hooks/                        — custom hooks (semua CC only)
│   │   ├── useAuth.ts
│   │   ├── useSubscription.ts
│   │   └── useSavedArticles.ts
│   │
│   ├── store/                        — Zustand (CC only)
│   │   └── authStore.ts
│   │
│   └── types/
│       └── index.ts
│
├── proxy.ts                          — pengganti middleware.ts di Next.js 16+
├── public/
├── next.config.ts
├── .env.local
└── package.json
```

---

### 16.3 Next.js Rendering Strategy & Best Practices

#### Aturan Dasar: Server Component (SC) vs Client Component (CC)

> **Default: semua komponen adalah Server Component.** Tambahkan `'use client'` hanya ketika benar-benar diperlukan.

**Gunakan Server Component ketika:**
- Fetch data dari API atau database
- Akses environment variables server-side
- Render konten statis atau semi-statis
- Tidak ada interaksi user (onClick, onChange, dll)
- Tidak butuh browser APIs (window, localStorage, dll)
- Tidak menggunakan React hooks (useState, useEffect, dll)

**Gunakan Client Component ketika:**
- Ada event handler (onClick, onChange, onSubmit)
- Menggunakan React hooks (useState, useEffect, useRef)
- Menggunakan browser APIs (window, localStorage, IntersectionObserver)
- Library pihak ketiga yang belum support RSC (Tiptap editor, chart library, Midtrans SDK)
- Real-time data (polling, WebSocket)

**Pattern penting — "push CC ke bawah":**
```
// BURUK: seluruh halaman jadi CC hanya karena satu tombol
'use client'
export default function ArticlePage() {
  const [liked, setLiked] = useState(false)
  // ... seluruh halaman render di client
}

// BAIK: pisahkan CC ke komponen kecil, SC tetap di atas
// article/[slug]/page.tsx — SC
export default async function ArticlePage({ params }) {
  const article = await fetchArticle(params.slug)  // server fetch
  return (
    <article>
      <ArticleBody content={article.content} />     {/* SC */}
      <ArticleLikeButton articleId={article.id} />  {/* CC — hanya tombol ini */}
    </article>
  )
}
```

---

#### Rendering Strategy per Halaman (Next.js 16)

Di Next.js 16, mental model bergeser dari "ISR vs SSR vs SSG" menjadi pertanyaan yang lebih tepat: **bagian mana yang harus di-cache, dan bagian mana yang harus fresh per-request?**

| Halaman | Strategy | Alasan | Cara |
|---|---|---|---|
| Homepage publication | Cache Component | Konten stabil, update saat artikel baru publish | `'use cache'` + `cacheTag` |
| Halaman artikel (free) | Cache Component | SEO kritis, konten jarang berubah | `'use cache'` + `cacheTag` |
| Halaman artikel (premium) | Request-time (Suspense) | Harus cek subscription per-user, tidak boleh di-cache | Tidak pakai `'use cache'` |
| Halaman series | Cache Component | Konten semi-statis | `'use cache'` + `cacheTag` |
| Halaman roadmap | Cache Component | Konten semi-statis | `'use cache'` + `cacheTag` |
| Dashboard overview | Request-time | Data real-time per owner | Tidak pakai `'use cache'` |
| Editor artikel | CSR (CC) | Interaktif penuh | Client Component |
| Subscribe/checkout | CSR (CC) | State-heavy, payment SDK | Client Component |

---

#### Caching di Next.js 16: `'use cache'` dan Cache Components

Next.js 16 mengganti model caching implisit dengan **opt-in caching eksplisit** via directive `'use cache'`. Tidak ada lagi magic `revalidate` di level route — setiap fungsi yang ingin di-cache harus dideklarasikan secara eksplisit.

```typescript
// lib/api/server.ts

import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache'

// Cache Component — data di-cache, bisa di-invalidate by tag
export async function fetchArticle(slug: string) {
  'use cache'
  cacheTag(`article-${slug}`)         // tag untuk on-demand invalidation
  cacheTag('articles')                // tag generik untuk invalidate semua artikel
  cacheLife('hours')                  // profile: cache selama beberapa jam

  const res = await fetch(`${API_URL}/articles/${slug}`)
  return res.json()
}

// Data yang tidak boleh di-cache — request-time
export async function fetchSubscriberStats(pubId: string) {
  // Tidak ada 'use cache' — selalu fresh per request
  const res = await fetch(`${API_URL}/analytics/${pubId}`)
  return res.json()
}
```

**On-demand invalidation setelah mutasi** menggunakan `revalidateTag`:

```typescript
// lib/actions/article.actions.ts
'use server'
import { revalidateTag } from 'next/cache'

export async function publishArticle(articleId: string, slug: string) {
  await api.post(`/articles/${articleId}/publish`)

  // Invalidate cache — halaman yang pakai tag ini akan di-regenerate
  revalidateTag(`article-${slug}`)
  revalidateTag('articles')
}
```

**`cacheLife` profiles yang tersedia** (bisa dikustomisasi di `next.config.ts`):

| Profile | Cocok untuk |
|---|---|
| `'seconds'` | Data yang berubah sangat cepat |
| `'minutes'` | List artikel, data semi-fresh |
| `'hours'` | Konten artikel, halaman series |
| `'days'` | Halaman statis, about page |
| `'max'` | Aset yang tidak pernah berubah |

---

#### Server Actions untuk Mutasi

Untuk form submission dan mutasi data, gunakan **Server Actions** — tidak perlu buat API route terpisah untuk operasi sederhana dari UI.

```typescript
// components/comment/CommentForm.tsx
'use client'
import { submitComment } from '@/lib/actions/comment.actions'

export function CommentForm({ articleId }: { articleId: string }) {
  return (
    <form action={submitComment}>
      <input type="hidden" name="articleId" value={articleId} />
      <textarea name="content" required />
      <button type="submit">Kirim Komentar</button>
    </form>
  )
}

// lib/actions/comment.actions.ts
'use server'
import { revalidateTag } from 'next/cache'

export async function submitComment(formData: FormData) {
  const articleId = formData.get('articleId') as string
  const content = formData.get('content') as string

  // Validasi, auth check, panggil backend API
  await api.post(`/articles/${articleId}/comments`, { content })

  // Invalidate cache komentar
  revalidateTag(`comments-${articleId}`)
}
```

> **Catatan:** Server Actions untuk mutasi simpel (komentar, save artikel, like). Untuk operasi kompleks seperti checkout subscription, tetap gunakan REST API backend secara langsung dari CC.

---

#### Parallel & Sequential Data Fetching

```typescript
// BURUK: sequential — total waktu = A + B + C
const publication = await fetchPublication(slug)
const articles = await fetchArticles(publication.id)
const authors = await fetchAuthors(publication.id)

// BAIK: parallel — total waktu = max(A, B, C)
const [publication, articles, authors] = await Promise.all([
  fetchPublication(slug),
  fetchArticles(pubId),
  fetchAuthors(pubId),
])
```

---

#### Suspense & Streaming

Gunakan `<Suspense>` untuk bagian halaman yang load-nya lambat, agar bagian lain tetap ditampilkan lebih cepat:

```typescript
// app/(publication)/page.tsx
import { Suspense } from 'react'

export default function PublicationHomePage() {
  return (
    <main>
      <PublicationHero />           {/* render langsung — data cepat */}
      <Suspense fallback={<ArticleListSkeleton />}>
        <ArticleList />             {/* streaming — data lebih lambat */}
      </Suspense>
    </main>
  )
}
```

---

#### Image Optimization

Selalu gunakan `next/image`, tidak pernah `<img>` biasa:

```typescript
import Image from 'next/image'

// Untuk gambar dengan dimensi diketahui
<Image
  src={article.coverImageUrl}
  alt={article.title}
  width={800}
  height={400}
  priority={isAboveFold}  // true untuk gambar di atas fold (LCP)
/>

// Untuk gambar yang dimensinya tidak diketahui (fill parent)
<div className="relative aspect-video">
  <Image
    src={article.coverImageUrl}
    alt={article.title}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 800px"  // WAJIB untuk fill mode
  />
</div>
```

---

#### Metadata & SEO

```typescript
// app/(publication)/layout.tsx — base metadata untuk semua halaman publication
export async function generateMetadata({ params }) {
  const publication = await fetchPublication(params.slug)

  return {
    metadataBase: new URL(`https://${publication.customDomain ?? `${publication.slug}.platform.com`}`),
    title: {
      template: `%s | ${publication.name}`,  // "Judul Artikel | Nama Publication"
      default: publication.name,
    },
    description: publication.description,
    openGraph: {
      siteName: publication.name,
      locale: 'id_ID',
    },
  }
}
```

---

#### `proxy.ts` — Pengganti `middleware.ts` di Next.js 16

Di Next.js 16, `middleware.ts` digantikan oleh `proxy.ts` yang berjalan di Node.js runtime (bukan Edge runtime). Perubahan ini membuat boundary jaringan lebih eksplisit.

```typescript
// proxy.ts — di root project (sejajar dengan src/)
import { NextRequest, NextResponse } from 'next/server'

export default function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl

  // 1. Resolve tenant dari domain/subdomain
  // Custom domain → lookup publication, set header untuk dipakai di layout
  // Subdomain → ekstrak slug langsung dari hostname
  const isSubdomain = hostname.endsWith('.platform.com') && hostname !== 'platform.com'
  const isCustomDomain = !hostname.includes('platform.com')

  if (isSubdomain || isCustomDomain) {
    const slug = isSubdomain
      ? hostname.replace('.platform.com', '')
      : hostname  // custom domain, nanti di-lookup di layout server component

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-publication-host', hostname)
    requestHeaders.set('x-publication-slug', slug)

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // 2. Auth redirect untuk dashboard routes
  // Jika akses /dashboard tanpa auth cookie → redirect ke login
  if (pathname.startsWith('/dashboard')) {
    const hasSession = request.cookies.has('refresh_token')
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Jalankan proxy hanya pada route yang relevan
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

> **Catatan penting:** `proxy.ts` hanya untuk keputusan di request boundary — redirect, rewrite, set header. Business logic (validasi token penuh, cek subscription) tetap di Server Component atau Express backend, bukan di `proxy.ts`.

---

*Dokumen ini adalah living document. Versi berikutnya: Technical Specification per modul.*

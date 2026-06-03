# CLAUDE.md
## Blog Platform — Lentera
> File ini dibaca otomatis oleh Claude Code setiap sesi dimulai.
> Versi 3.0 — Routing architecture refactor (platform vs publication separation), docs sync.
> File ini adalah index navigasi — untuk detail, selalu rujuk docs/ sesuai panduan di bawah.

---

## Project Overview

Platform blog subscription multi-author (SaaS). Setiap "publication" berdiri independen dengan audience-nya sendiri — tidak ada marketplace atau discovery lintas publication. Model bisnis: platform fee 15% dari setiap transaksi subscription member (bisa dikonfigurasi per publication oleh admin).

**Dokumen referensi (baca berurutan untuk orientasi awal):**
- `docs/01_PRD.md` — requirements & business decisions
- `docs/02_SAD.md` — arsitektur & technical design ← **paling sering dibutuhkan**
- `docs/03_TECH_CONTEXT.md` — rules implementasi ← **BACA INI SEBELUM CODING**
- `docs/04_GIT_STRATEGY.md` — branching & commit convention
- `docs/05_UI_UX_BRIEFING.md` — panduan desain UI/UX
- `docs/06_USER_STORIES.md` — task breakdown & progress tracker

---

## Panduan Baca Dokumen per Konteks Implementasi

> Sebelum mulai implementasi, baca file ini + dokumen di bawah sesuai konteksnya.
> Jangan mengandalkan ingatan sesi sebelumnya — selalu rujuk dokumen.

| Konteks implementasi | Dokumen yang harus dibaca | Section spesifik |
|---|---|---|
| **Backend: auth** (login, register, OAuth, token, invite) | `02_SAD.md` + `03_TECH_CONTEXT.md` | SAD §5 (seluruhnya) |
| **Backend: API endpoint baru** | `02_SAD.md` + `03_TECH_CONTEXT.md` | SAD §6 (endpoint list) + TECH §Rules Backend |
| **Backend: database / Prisma** | `02_SAD.md` | SAD §7 (schema) + §7.3 (indexes) + §7.4 (Redis keys) |
| **Backend: email & notifikasi** | `02_SAD.md` | SAD §9 (email types, queue, bounce handling) |
| **Backend: payment / subscription** | `02_SAD.md` | SAD §8 (Midtrans flow, auto-expire job, access control) |
| **Backend: security / rate limiting** | `02_SAD.md` | SAD §14 (rate limiting, Argon2, CSRF) |
| **Frontend: halaman baru di `(publication)/`** | `02_SAD.md` + `03_TECH_CONTEXT.md` | SAD §3.1 (app/ structure) + SAD §10.3 (proxy.ts + layout) |
| **Frontend: auth pages** (login, register, forgot-password) | `02_SAD.md` | SAD §5.0 (auth flow per user type) + SAD §3.1 |
| **Frontend: platform admin** (`admin/` folder) | `02_SAD.md` | SAD §3.1 (admin/ folder) + SAD §5.0 (platform admin auth) |
| **Frontend: publication dashboard** (`dashboard/`) | `02_SAD.md` | SAD §3.1 (dashboard/ dalam (publication)/) |
| **Frontend: caching** | `02_SAD.md` + `03_TECH_CONTEXT.md` | SAD §13 (Redis + Next.js cache) + TECH §Rules Frontend §2 |
| **Frontend: routing / proxy.ts** | `02_SAD.md` + `03_TECH_CONTEXT.md` | SAD §10.3 (proxy.ts + layout.tsx) + TECH §Rules Frontend §4 |
| **UI design & komponen** | `05_UI_UX_BRIEFING.md` | Semua — terutama §Tone, §Constraint, §Prioritas |
| **Business requirement / fitur scope** | `01_PRD.md` | §6 (Fitur & Requirements) + §10 (MVP Scope) |
| **Git workflow / commit message** | `04_GIT_STRATEGY.md` | Semua |
| **Next task / cek progress** | `06_USER_STORIES.md` | URUTAN PENGERJAAN + EPIC yang sedang dikerjakan |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js + TypeScript + Express.js + Prisma |
| Frontend | Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Redis |
| Auth | JWT (15m) + Refresh Token (30d, httpOnly cookie) |
| Password | Argon2 — BUKAN bcrypt |
| Payment | Midtrans |
| Email | Resend + BullMQ |
| Storage | Cloudinary |
| Deploy | Railway (backend + DB) + Vercel (frontend) |

---

## Struktur Folder

```
blog-platform/
├── CLAUDE.md                  ← file ini
├── docs/                      ← semua dokumen planning
├── frontend/                  ← Next.js app
│   ├── design-references/     ← referensi desain UI
│   └── ...
├── backend/                   ← Express app
├── docker-compose.yml         ← PostgreSQL + Redis lokal
└── .github/workflows/         ← CI/CD
```

---

## Arsitektur Multi-Tenancy & Routing

### Tiga Ruang, Tiga Context Auth

| | Platform | Publication Staff | Publication Member |
|---|---|---|---|
| Domain (prod) | `app.lentera.id` | `[slug].lentera.id` | `[slug].lentera.id` |
| Domain (dev) | `localhost:3000` | `slug.lvh.me:3000` | `slug.lvh.me:3000` |
| Login URL | `/admin/login` | `/admin/login` | `/login` |
| Dashboard URL | `/admin/dashboard` | `/admin/dashboard` | `/` (homepage) |
| Google OAuth | ❌ | ❌ | ✅ |
| Users | `platform_owner`, `platform_admin` | `owner`, `admin`, `author` | subscriber, registered, anonymous |

**Pola kunci:** `/admin/*` = area staff di semua level (platform maupun publication). `/login` di publication subdomain = member ONLY.

### Di Development Lokal (Subdomain via lvh.me)
`lvh.me` adalah domain publik yang selalu resolve ke `127.0.0.1` — memungkinkan simulasi subdomain di lokal tanpa edit hosts file.
```
localhost:3000/admin/login              → Platform admin login
localhost:3000/admin/dashboard          → Platform admin dashboard
investasi-cerdas.lvh.me:3000           → Publication homepage (member view)
investasi-cerdas.lvh.me:3000/login     → Publication member login
investasi-cerdas.lvh.me:3000/admin/login    → Publication staff login
investasi-cerdas.lvh.me:3000/admin/dashboard → Publication staff dashboard
```

### Di Production (Subdomain-based)
```
app.lentera.id/admin/login              → Platform admin login
app.lentera.id/admin/dashboard          → Platform admin dashboard
[slug].lentera.id/                      → Publication homepage
[slug].lentera.id/login                 → Publication member login (+ Google OAuth)
[slug].lentera.id/admin/login           → Publication staff login (no Google)
[slug].lentera.id/admin/dashboard       → Publication staff dashboard
```

**Custom domain:** Di-skip untuk MVP. Publication hanya pakai subdomain Lentera.

### Frontend `app/` Folder Structure (Target)
```
app/
├── ── PLATFORM (app.lentera.id/admin/*) ──────────────────────────────
├── admin/
│   ├── layout.tsx                 ← Guard: protect dashboard, pass-through auth pages
│   ├── login/page.tsx             ← /admin/login — email+pass ONLY, no Google
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── dashboard/page.tsx         ← protected: platform_admin only
│   ├── publications/page.tsx
│   └── invite/page.tsx
│
├── accept-invite/page.tsx         ← Owner onboarding wizard (pre-auth, platform URL)
├── auth/google/callback/page.tsx  ← OAuth callback (fixed URL, state bawa publicationId)
├── payment/success/page.tsx       ← Midtrans callback (fixed URL)
│
├── ── PUBLICATION (slug.lentera.id/*) ─────────────────────────────────
└── (publication)/
    ├── layout.tsx                 ← Resolve tenant, provide PublicationContext
    │
    ├── ── MEMBER SPACE (root) ──────────────────────────────────────────
    ├── page.tsx                   ← Publication homepage
    ├── [articleSlug]/page.tsx
    ├── series/[slug]/page.tsx
    ├── suspended/page.tsx
    ├── accept-author-invite/page.tsx  ← Pre-auth, anyone can access
    │
    ├── login/page.tsx             ← /login — MEMBER ONLY + Google OAuth
    ├── register/page.tsx          ← Member self-register
    ├── verify-email/page.tsx      ← Member email verification
    ├── forgot-password/page.tsx   ← Member forgot-password
    ├── reset-password/page.tsx
    │
    ├── subscribe/page.tsx         ← Ambil publicationId dari layout context
    ├── settings/page.tsx
    ├── subscription/page.tsx
    │
    └── ── STAFF SPACE (/admin/*) ───────────────────────────────────────
        └── admin/
            ├── layout.tsx         ← Guard: protect dashboard, pass-through auth pages
            ├── login/page.tsx     ← /admin/login — STAFF ONLY, no Google
            ├── forgot-password/page.tsx
            ├── reset-password/page.tsx
            └── dashboard/
                ├── layout.tsx     ← Guard: verify owner/admin/author role
                ├── page.tsx       ← /admin/dashboard
                ├── articles/{...}
                ├── series/{...}
                ├── subscribers/page.tsx
                ├── analytics/page.tsx
                └── settings/page.tsx
```

---

## Role & Permission System

### Platform Roles (app.lentera.id)
Disimpan di field `platformRole` di tabel `users` (nullable — hanya terisi untuk platform staff).

| Role | Akses |
|------|-------|
| `platform_owner` | Semua akses platform + kelola platform_admin + ubah setting inti platform |
| `platform_admin` | Operasional: invite owner, suspend publication, konfigurasi fee, impersonate, lihat semua data |

**Hanya `platform_owner` yang bisa:**
- Tambah / hapus `platform_admin`
- Mengubah setting fundamental platform (domain, nama, branding)

### Publication Staff Roles (slug.lentera.id/admin/*)
Disimpan di tabel `publication_authors` — satu user bisa punya role berbeda di publication berbeda.

| Role | Akses |
|------|-------|
| `owner` | Semua fitur publication |
| `admin` | Semua fitur OWNER kecuali: delete publication, transfer ownership, ubah role author lain |
| `author` | Hanya: tulis/edit/hapus artikel sendiri |

**Staff otomatis bisa baca semua konten premium di publication mereka** — tanpa berlangganan.

### Reader States (slug.lentera.id/)
Bukan role DB — ini state yang ditentukan runtime per request.

| State | Kondisi | Akses |
|-------|---------|-------|
| `subscriber` | Punya subscription aktif (`subscriptions.status = active` & `expiresAt > now`) | Semua konten + komentar |
| `registered` | Punya akun tapi belum/tidak subscribe | Konten free saja |
| `anonymous` | Tidak login | Konten free saja |

**`member` dalam konteks UI/bisnis = `subscriber` secara teknis.** Bukan DB role.

### Permission Matrix — Platform
| Fitur | PLATFORM_OWNER | PLATFORM_ADMIN |
|---|---|---|
| View semua publications & users | ✅ | ✅ |
| Invite publication owner | ✅ | ✅ |
| Suspend/unsuspend publication | ✅ | ✅ |
| Konfigurasi fee per publication | ✅ | ✅ |
| Impersonate user | ✅ | ✅ |
| Tambah/hapus platform_admin | ✅ | ❌ |
| Ubah setting inti platform | ✅ | ❌ |

### Permission Matrix — Publication Staff
| Fitur | OWNER | ADMIN | AUTHOR |
|-------|-------|-------|--------|
| Buat/edit/hapus/publish artikel sendiri | ✅ | ✅ | ✅ |
| Edit/hapus/publish artikel author lain | ✅ | ✅ | ❌ |
| Buat/edit series sendiri | ✅ | ✅ | ✅ |
| Edit/hapus series author lain | ✅ | ✅ | ❌ |
| Buat/edit roadmap | ✅ | ✅ | ❌ |
| Edit nama/deskripsi/logo publication | ✅ | ✅ | ❌ |
| Kelola subscription plans | ✅ | ✅ | ❌ |
| Lihat subscriber list & revenue/MRR | ✅ | ✅ | ❌ |
| Lihat analytics artikel sendiri | ✅ | ✅ | ✅ |
| Invite author baru (role: author saja) | ✅ | ✅ | ❌ |
| Invite admin baru (role: admin) | ✅ | ❌ | ❌ |
| Remove author | ✅ | ✅ | ❌ |
| Remove admin | ✅ | ❌ | ❌ |
| Ubah role tim lain | ✅ | ❌ | ❌ |
| Konfigurasi custom domain | ✅ | ❌ | ❌ |
| Delete / transfer ownership / cancel delete | ✅ | ❌ | ❌ |
| Baca konten premium (tanpa subscribe) | ✅ | ✅ | ✅ |
| Post komentar & Q&A | ✅ | ✅ | ✅ |

### Permission Matrix — Reader
| Fitur | SUBSCRIBER | REGISTERED | ANONYMOUS |
|---|---|---|---|
| Baca artikel free | ✅ | ✅ | ✅ |
| Baca artikel premium | ✅ | ❌ | ❌ |
| Like artikel free | ✅ | ✅ | ✅ |
| Post komentar / Q&A / upvote | ✅ | ❌ | ❌ |
| Save artikel ke folder | ✅ | ❌ | ❌ |
| Subscribe / cancel / lihat history | ✅ | ✅* | ❌ |
| Update profil / password / email prefs | ✅ | ✅ | ❌ |

*Registered bisa subscribe; sudah subscribe = subscriber

### Authorization Logic
```
KONTEN PREMIUM:
1. isStaff?      → ada di publication_authors → IZINKAN
2. isSubscriber? → subscriptions aktif (status=active, expiresAt > now) → IZINKAN
3. Selain itu    → 403 FORBIDDEN

KOMENTAR / Q&A / SAVE (subscriber-only features):
1. isStaff?      → IZINKAN (staff = full reader access)
2. isSubscriber? → IZINKAN, lalu cek emailVerified
3. Selain itu    → 403 SUBSCRIPTION_REQUIRED
```

---

## Keputusan Auth — WAJIB DIIKUTI

### Token Strategy
- **Access token:** JWT, expiry 15 menit, simpan di memory JS (Zustand store)
- **Refresh token:** opaque UUID, expiry 30 hari inaktif, httpOnly cookie
- **PENTING — Refresh token di-scope per publication:**
  ```
  Redis key: refresh:{userId}:{publicationId}:{tokenId}
  ```
  Token yang diissue di publication A tidak valid di publication B
- **Token rotation:** setiap refresh token dipakai → langsung di-rotate, token lama invalid
- **Revocation:** refresh token di Redis → bisa di-delete kapanpun (logout, admin revoke)
- **Logout:** hanya revoke token untuk publicationId yang sedang aktif, bukan semua session

### Login Security
- **Rate limiting:** 5x password salah dalam 15 menit → lockout. Redis key: `login_attempts:{email}:{publicationId}`
- **Google OAuth:** HANYA untuk role member/visitor. Publication owner, admin, author, dan platform admin TIDAK BOLEH login via Google
- **Forgot password untuk akun OAuth-only:** kirim email informasi "akun terdaftar via Google", bukan email reset password

### Auth Flow per User Type

| Flow | Platform Staff (owner/admin) | Publication Staff (owner/admin/author) | Member |
|---|---|---|---|
| Register | ❌ ditambahkan manual oleh platform_owner | ❌ invite only | ✅ `/register` |
| Login URL | `app.lentera.id/admin/login` | `slug.lentera.id/admin/login` | `slug.lentera.id/login` |
| Google OAuth | ❌ | ❌ | ✅ |
| Verify email | ❌ | ❌ | ✅ `/verify-email` |
| Forgot password | `app.lentera.id/admin/forgot-password` | `slug.lentera.id/admin/forgot-password` | `slug.lentera.id/forgot-password` |
| Reset password link | `app.lentera.id/admin/reset-password?token=...` | `slug.lentera.id/admin/reset-password?token=...` | `slug.lentera.id/reset-password?token=...` |
| Post-login redirect | `/admin/dashboard` | `/admin/dashboard` | `/` (pub homepage) |
| Onboarding | Ditambahkan langsung oleh platform_owner | pub owner: `/accept-invite`; author: `slug.lentera.id/accept-author-invite` | `/register` |

**Penting:**
- `/admin/login` di publication subdomain = staff login (owner/admin/author) — pola konsisten dengan platform
- `/login` di publication subdomain = member login ONLY — selalu ada Google OAuth button
- Backend harus menyertakan publication slug saat generate email link untuk member dan publication staff

### Session Behavior
- Login di `investasicerdas.lentera.id` TIDAK carry over ke `keuanganpribadi.lentera.id`
- User yang sama bisa punya akun di multiple publications dengan email yang sama
- Setiap session terisolasi per publication via `publicationId` di refresh token

---

## Keputusan Produk — WAJIB DIIKUTI

### Onboarding Publication Owner
- **Sistem: Invite-only.** Tidak ada self-register untuk publication owner.
- **Flow:** Admin invite via email → calon owner klik link → `/accept-invite` → wizard 3 step → dashboard
- **Wizard Step 1:** buat akun (nama display, password)
- **Wizard Step 2:** setup publication (nama, slug, deskripsi, logo opsional) + real-time slug check
- **Wizard Step 3:** selesai → redirect ke dashboard dengan getting started checklist

### Akses Konten
- **Artikel premium diakses langsung:** tampil 100-200 kata pertama + blur/fade → paywall CTA
- **Artikel premium diakses dari halaman series:** tampilkan ikon gembok (🔒) di listing → klik → modal subscribe langsung (TIDAK navigate ke halaman artikel dulu)
- **Cut-off subscription:** terjadi saat user pindah halaman (page navigation), BUKAN di tengah membaca
- **Akun gratis:** bisa baca artikel free saja. Tidak ada manfaat lain tanpa subscribe

### Member Settings
- **Semua settings member ada dalam konteks publication** — bukan di `/me/`
- Settings: `[slug].lentera.id/settings`
- Subscription: `[slug].lentera.id/subscription`
- Direktori `app/me/` harus **dihapus total** (bukan redirect — hapus sepenuhnya)

### Subscription Lifecycle
- **Reminder email:** 7 hari sebelum expired + 1 hari sebelum expired
- **Setelah expired:** refresh token tetap valid tapi artikel premium tidak bisa diakses
- **Email bounce:** setelah 3x bounce → set `emailBounced = true` → skip pengiriman email selanjutnya

### Publication Status
```
active           → normal, bisa diakses semua
suspended_soft   → owner tidak bisa publish, member masih bisa baca, subscriber baru tidak bisa join
suspended_hard   → seluruh publication tidak bisa diakses, refund pro-rata ke semua member
pending_deletion → tidak bisa diakses, cooling period 30 hari, bisa dibatalkan
```

### Delete Publication
- Cooling period 30 hari sebelum permanen
- Saat deletion di-request: refund pro-rata otomatis ke semua member aktif
- Transfer ownership tersedia sebelum hapus
- Selama pending_deletion: tidak bisa diakses publik

### Platform Fee
- Default: 15% per transaksi
- Bisa dikonfigurasi per publication oleh platform admin
- Field di database: `Publications.platformFeePercent` (decimal)

---

## Rules Backend — WAJIB DIIKUTI

### 1. Layer Responsibility
- **Router**: HANYA definisi route + middleware. Zero logic.
- **Controller**: HANYA ambil dari `req`, panggil service, return `res`. Zero business logic.
- **Service**: Semua business logic. Boleh panggil multiple repositories.
- **Repository**: HANYA query Prisma. Zero business logic.

### 2. Tenant Isolation — PALING KRITIS
```typescript
// SETIAP query di repository WAJIB include publicationId
// ✅ BENAR
findMany(publicationId: string) {
  return prisma.article.findMany({
    where: { publicationId, deletedAt: null }
  })
}

// ❌ SALAH — data bisa bocor lintas tenant
findMany() {
  return prisma.article.findMany()
}
```

### 3. Error Handling
- Semua error harus extend class `AppError` di `src/lib/AppError.ts`
- Gunakan `next(error)` untuk pass error ke global error handler
- TIDAK PERNAH gunakan `res.json()` di catch block

### 4. Response Format
```typescript
// Success
{ "success": true, "data": <payload> }

// Error
{ "success": false, "statusCode": 404, "error": "NOT_FOUND", "message": "..." }
```

### 5. Validasi Input
- Semua input (body, query, params) divalidasi dengan Zod
- Schema Zod di `<modul>.schema.ts`

### 6. Password & Auth
- Hash password dengan `argon2.hash()` — BUKAN `bcrypt`
- Access token: JWT, 15 menit, memory
- Refresh token: UUID, 30 hari, httpOnly cookie, di-scope per `publicationId`
- Redis key: `refresh:{userId}:{publicationId}:{tokenId}`

---

## Rules Frontend — WAJIB DIIKUTI

### 1. Server Component vs Client Component
- **Default: Server Component**
- Tambahkan `'use client'` HANYA jika ada event handler, hooks, atau browser API

### 2. Caching — Next.js 16
- Gunakan `'use cache'` directive + `cacheTag()` + `cacheLife()`
- Data subscription check: JANGAN cache — harus fresh setiap request

### 3. `proxy.ts` (bukan `middleware.ts`)
- File ini di root project
- Fungsi wajib bernama `proxy()`, BUKAN `middleware()`
- Runtime: Node.js saja

### 4. `params` dan `searchParams` — Async
```typescript
// ✅ BENAR
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

### 5. UI Components — WAJIB shadcn/ui
- `<Button>` — semua tombol, TIDAK PERNAH `<button>` biasa
- `<Input>` — semua input, TIDAK PERNAH `<input>` biasa
- `<Form>`, `<FormField>`, `<FormControl>` — semua form
- `<Card>`, `<Dialog>`, `<Badge>`, `<Table>` — sesuai konteks

### 6. Warna — WAJIB Semantic Tokens
- DILARANG hardcode hex
- Gunakan: `bg-background`, `text-foreground`, `text-muted-foreground`
- Gunakan: `bg-primary`, `text-primary-foreground`, `text-destructive`

### 7. Gambar
- SELALU gunakan `next/image` — TIDAK PERNAH `<img>`

---

## Yang TIDAK BOLEH Dilakukan

**Backend:**
- ❌ Hardcode nilai yang seharusnya di `.env`
- ❌ Query database tanpa `publicationId` filter
- ❌ Gunakan `bcrypt` — pakai Argon2
- ❌ Simpan access token di localStorage atau cookie biasa
- ❌ Business logic di Router atau Controller layer
- ❌ Import Prisma client langsung — pakai singleton dari `config/database.config.ts`
- ❌ `res.json()` di catch block — pakai `next(error)`
- ❌ Commit file `.env`

**Frontend:**
- ❌ Gunakan `middleware.ts` — pakai `proxy.ts`
- ❌ Beri nama fungsi `middleware()` di proxy.ts — wajib `proxy()`
- ❌ Gunakan `<img>` — pakai `next/image`
- ❌ Akses `params` tanpa `await`
- ❌ Gunakan `unstable_cache` — pakai `'use cache'`
- ❌ Hardcode warna hex
- ❌ Pakai `<input>` atau `<button>` biasa — pakai shadcn/ui
- ❌ Buat komponen inline jika dipakai di 2+ tempat
- ❌ Pakai direktori `me/` — sudah dihapus, semua member settings ada di `(publication)/settings/` dan `(publication)/subscription/`
- ❌ Platform admin login di `/login` — harus di `/admin/login`
- ❌ Taruh `subscribe/` atau `suspended/` di root — harus di dalam `(publication)/`

---

## Wajib Sebelum Setiap Push — TANPA PENGECUALIAN

Sebelum `git push` ke branch APAPUN, jalankan semua perintah berikut:

```bash
# Backend
cd backend && npm run lint && npm run type-check

# Frontend
cd frontend && npm run lint && npm run type-check && npm run build
```

**Pastikan 0 errors sebelum push.** Jika ada error:
1. Perbaiki semua error terlebih dahulu
2. Jalankan ulang perintah di atas
3. Baru push setelah benar-benar 0 error

❌ JANGAN push jika masih ada error meskipun terlihat minor
❌ JANGAN gunakan `--no-verify` atau skip checks dengan alasan apapun
❌ JANGAN push hanya frontend tanpa cek backend, atau sebaliknya — keduanya WAJIB dicek

---

## Git Convention

```bash
# Branch naming
feat/nama-fitur
fix/nama-bug
hotfix/nama-bug-kritis
chore/nama-setup

# Commit format
feat(scope): deskripsi
fix(scope): deskripsi
chore(scope): deskripsi

# Alur per Epic — WAJIB DIIKUTI URUTAN INI
git checkout main && git pull origin main
git checkout -b feat/nama-epic
# kerjakan semua story...
# sebelum push: jalankan lint + type-check + build (lihat section di atas)
git push origin feat/nama-epic
# buat PR di GitHub → tunggu CI hijau → merge → hapus branch
git checkout main && git pull origin main
# baru mulai Epic berikutnya dari main yang sudah update
```

## Wajib Setelah Setiap Epic Selesai

Setelah semua Story dalam satu Epic selesai, Claude Code WAJIB melakukan ini secara berurutan:

1. Jalankan lint + type-check + build (lihat section "Wajib Sebelum Setiap Push")
2. Pastikan 0 errors
3. Commit semua perubahan yang belum di-commit
4. `git push origin [nama-branch]`
5. Buat PR ke main di GitHub
6. Informasikan ke user: "EPIC [X] selesai. PR sudah dibuat. Tunggu CI hijau sebelum merge."
7. STOP — jangan mulai Epic berikutnya sampai user konfirmasi PR sudah di-merge

---

## UI/UX Implementation Guide

### Pendekatan Desain
- **Design style:** ikuti tone dan aesthetic dari `frontend/design-references/` (warna, typography, spacing, komponen)
- **Halaman yang diimplementasi:** sesuai 06_USER_STORIES.md — JANGAN terpaku pada halaman-halaman yang ada di design-references
- **Referensi visual:** gunakan design-references HANYA sebagai panduan style, bukan template halaman

### Frontend Skill — Wajib Dipakai Saat Implementasi Halaman Baru
Sebelum implementasi halaman frontend apapun, baca skill berikut:
```
cat /mnt/skills/public/frontend-design/SKILL.md
```

Gunakan panduan dari skill tersebut untuk memastikan UI yang dihasilkan:
- Tidak generik / tidak terlihat seperti "AI-generated"
- Punya karakter visual yang jelas dan konsisten
- Memorable dan production-grade

### Constraint yang TIDAK BOLEH dilanggar meski pakai frontend skill
Skill frontend mendorong kreativitas, tapi tetap harus dalam batas ini:
- ✅ Tetap gunakan **shadcn/ui** untuk semua komponen
- ✅ Tetap gunakan **semantic color tokens** — DILARANG hardcode hex
- ✅ Tetap **mobile-first** dengan breakpoint Tailwind
- ✅ Font boleh distinctive, tapi harus **di-load via next/font** bukan CDN langsung
- ✅ Animasi boleh, tapi **tidak boleh ganggu performance** (gunakan CSS transition/Tailwind animate)
- ❌ JANGAN ganti design system yang sudah ada hanya karena skill mendorong kreativitas

### Urutan Kerja untuk Setiap Halaman Frontend Baru
1. Baca `/mnt/skills/public/frontend-design/SKILL.md`
2. Tentukan tone/aesthetic yang sesuai konteks halaman
3. Lihat design-references untuk konsistensi style
4. Implementasi dengan shadcn/ui + Tailwind + constraint di atas
5. Verifikasi: tidak ada hardcode hex, tidak ada `<img>`, tidak ada `<button>` biasa

---

## Progress Implementasi

Track progress di `docs/06_USER_STORIES.md`.

**Cara lanjut sesi baru (setelah usage limit / context window penuh):**
```
Baca CLAUDE.md dan docs/06_USER_STORIES.md.
Lanjutkan implementasi dari EPIC [X] — STORY [Y.Z].
Checkout branch: git checkout feat/[nama-branch]
Lihat git log untuk melihat commit terakhir yang sudah selesai.
```

**Yang Claude Code WAJIB lakukan sebelum session berakhir:**
1. Commit semua kode yang selesai di Story aktif (`git commit`)
2. Push ke remote (`git push origin feat/...`)
3. Tandai checkbox di USER_STORIES (`[x]`) untuk task yang sudah selesai
4. Kalau di tengah Story — commit dengan prefix `WIP:` dan note posisi terakhir

**Yang otomatis tersedia di setiap sesi baru:**
- CLAUDE.md → selalu di-load otomatis (arsitektur, rules, urutan Epic)
- USER_STORIES.md → checkbox progress yang persisten
- Git log & commits → history lengkap apa yang sudah dikerjakan
- Memory system → context user tersimpan lintas sesi

**Urutan pengerjaan:**
1. EPIC 17 — Seed Data Realistis ← mulai di sini
2. EPIC 18 — Routing Architecture Refactor (tegakkan struktur baru sebelum tambah fitur)
3. EPIC 13 — Auth & Core Flow Fixes (backend-only tasks bisa paralel dengan EPIC 17 & 18)
4. EPIC 14 — Tiga Role Publication
5. EPIC 16 — Onboarding & Landing Page
6. EPIC 15 — Platform Admin Enhancements
7. EPIC 9 — Deployment

Status progress detail ada di `docs/06_USER_STORIES.md` — cek checkbox `[ ]` untuk tahu dari mana harus lanjut.

---

## Cara Jalankan Lokal

```bash
# Terminal 1 — Database
docker-compose up -d

# Terminal 2 — Backend
cd backend && npm run dev
# → http://localhost:4000

# Terminal 3 — Frontend
cd frontend && npm run dev
# → http://localhost:3000
```

**URL akses lokal:**
```
localhost:3000/admin/login          → Platform admin login
investasi-cerdas.lvh.me:3000       → Publication site (simulasi subdomain)
investasi-cerdas.lvh.me:3000/login → Publication login
investasi-cerdas.lvh.me:3000/dashboard → Publication dashboard
```

> `lvh.me` selalu resolve ke `127.0.0.1` — tidak perlu edit hosts file.
> Pastikan frontend dev server berjalan di port 3000.

**Akun test (setelah seed):**
Lihat `backend/prisma/SEED_ACCOUNTS.md`

---

## Context7

Sebelum implementasi yang melibatkan library berubah cepat:
```
use context7 next.js     ← selalu untuk frontend
use context7 prisma      ← jika menyentuh database
use context7 shadcn/ui   ← jika implementasi komponen UI
```
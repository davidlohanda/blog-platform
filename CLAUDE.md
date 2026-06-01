# CLAUDE.md
## Blog Platform — Lentera
> File ini dibaca otomatis oleh Claude Code setiap sesi dimulai.
> Versi 2.0 — Update dari sesi Grill Me (tambahan di bagian bawah).
> Untuk detail lengkap, lihat file di folder docs/.

---

## Project Overview

Platform blog subscription multi-author (SaaS). Setiap "publication" berdiri independen dengan audience-nya sendiri — tidak ada marketplace atau discovery lintas publication. Model bisnis: platform fee 15% dari setiap transaksi subscription member (bisa dikonfigurasi per publication oleh admin).

**Dokumen referensi lengkap:**
- `docs/PRD_Publication_Platform.md` — requirements & business decisions
- `docs/SAD_Publication_Platform.md` — arsitektur & technical design
- `docs/TECH_CONTEXT.md` — rules implementasi (BACA INI SEBELUM CODING)
- `docs/GIT_STRATEGY.md` — branching & commit convention
- `docs/USER_STORIES_MVP.md` — task breakdown implementasi (progress tracker)
- `docs/REFACTOR_NOTES.md` — technical debt yang perlu diperbaiki

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

### Di Development Lokal (Path-based)
```
localhost:3000              → Platform landing page (Lentera)
localhost:3000/admin        → Platform admin dashboard
localhost:3000/[slug]       → Publication site (simulasi subdomain)
localhost:3000/[slug]/dashboard → Publication owner dashboard
```

### Di Production (Subdomain-based)
```
lentera.id                  → Platform landing page
lentera.id/admin            → Platform admin dashboard
[slug].lentera.id           → Publication site
[slug].lentera.id/dashboard → Publication owner dashboard
```

**Custom domain:** Di-skip untuk MVP. Publication hanya pakai subdomain Lentera.

---

## Role & Permission System

### Platform-level Roles
| Role | Akses |
|------|-------|
| `platform_admin` | Semua fitur admin platform: invite owner, suspend publication, konfigurasi fee, impersonate |
| `owner` | Dashboard publication, semua fitur publication |
| `admin` (publication) | Semua fitur OWNER kecuali: delete publication, transfer ownership, ubah role author lain |
| `author` | Hanya: tulis/edit/hapus artikel sendiri |
| `member` | Baca konten premium, settings member dalam konteks publication |
| `visitor` | Baca konten free, lihat preview premium |

### Permission Matrix Publication
| Fitur | OWNER | ADMIN | AUTHOR |
|-------|-------|-------|--------|
| Tulis/edit artikel sendiri | ✅ | ✅ | ✅ |
| Edit/hapus artikel author lain | ✅ | ✅ | ❌ |
| Lihat analytics & revenue | ✅ | ✅ | ❌ |
| Kelola subscription plans | ✅ | ✅ | ❌ |
| Invite/remove author | ✅ | ✅ | ❌ |
| Ubah role author lain | ✅ | ❌ | ❌ |
| Delete publication | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |
| Kelola custom domain | ✅ | ❌ | ❌ |

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
- **Google OAuth:** HANYA untuk role member/visitor. Publication owner dan platform admin TIDAK BOLEH login via Google
- **Forgot password untuk akun OAuth-only:** kirim email informasi "akun terdaftar via Google", bukan email reset password

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
- Settings: `[slug].lentera.id/settings` (bukan `/me/settings`)
- Subscription: `[slug].lentera.id/subscription` (bukan `/me/subscription`)
- Halaman `/me/settings` dan `/me/subscription` harus di-redirect atau dihapus

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
- ❌ Settings member di `/me/` — harus dalam konteks publication

---

## Wajib Sebelum Setiap Push

```bash
# Backend
cd backend && npm run lint && npm run type-check

# Frontend
cd frontend && npm run lint && npm run type-check && npm run build
```

---

## Wajib Setelah Setiap Epic Selesai

Setelah **seluruh Story dalam satu Epic** selesai dikerjakan, Claude Code WAJIB menjalankan langkah-langkah berikut secara berurutan:

1. **Lint + type-check** — pastikan 0 error
   ```bash
   cd backend && npm run lint && npm run type-check
   cd frontend && npm run lint && npm run type-check && npm run build
   ```
2. **Commit** semua perubahan yang belum di-commit
3. **Push** branch ke remote: `git push origin <nama-branch>`
4. **Buat PR** ke `main` via `gh pr create`
5. **Informasikan** ke user bahwa Epic selesai dan PR sudah dibuat beserta URL-nya

Langkah ini berlaku untuk semua Epic — jangan skip meskipun perubahannya hanya kecil.

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

# Alur per Epic
git checkout main && git pull
git checkout -b feat/nama-epic
# kerjakan semua story
git push origin feat/nama-epic
# buat PR → merge → hapus branch
```

---

## Progress Implementasi

Track progress di `docs/USER_STORIES_MVP.md`.

**Cara lanjut sesi baru:**
```
Baca CLAUDE.md dan docs/USER_STORIES_MVP.md.
Lanjutkan implementasi dari EPIC [X] — STORY [Y.Z].
Checkout branch: git checkout feat/[nama-branch]
```

**Status saat ini:**
- EPIC 1–12: ✅ Selesai (lihat USER_STORIES_MVP.md untuk detail)
- EPIC 17: ✅ Selesai — Seed Data Realistis (publication "Investasi Cerdas")
- EPIC 13–16: ⬜ Belum dikerjakan
- EPIC 9 (Deployment): ⬜ Belum

**Urutan pengerjaan selanjutnya:**
1. EPIC 13 — Auth & Core Flow Fixes (PRIORITAS UTAMA)
2. EPIC 14 — Tiga Role Publication
3. EPIC 16 — Onboarding & Landing Page
4. EPIC 15 — Platform Admin Enhancements
6. EPIC 9 — Deployment

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
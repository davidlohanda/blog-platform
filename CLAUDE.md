# CLAUDE.md
## Blog Platform — Lentera
> File ini dibaca otomatis oleh Claude Code setiap sesi dimulai.
> Untuk detail lengkap, lihat file di folder docs/.

---

## Project Overview

Platform blog subscription multi-author (SaaS). Setiap "publication" berdiri independen dengan audience-nya sendiri — tidak ada marketplace atau discovery lintas publication. Model bisnis: platform fee 15% dari setiap transaksi subscription member.

**Dokumen referensi lengkap:**
- `docs/PRD_Publication_Platform.md` — requirements & business decisions
- `docs/SAD_Publication_Platform.md` — arsitektur & technical design
- `docs/TECH_CONTEXT.md` — rules implementasi (BACA INI SEBELUM CODING)
- `docs/GIT_STRATEGY.md` — branching & commit convention
- `docs/USER_STORIES_MVP.md` — task breakdown implementasi (progress tracker)

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
│   ├── design-references/     ← hasil Claude Design (Jalur A)
│   └── ...
├── backend/                   ← Express app
├── docker-compose.yml         ← PostgreSQL + Redis lokal
└── .github/workflows/         ← CI/CD
```

---

## Rules Kritis — Selalu Diikuti

### Backend
- **4-layer wajib:** router → controller → service → repository
- **Tenant isolation:** setiap query repository WAJIB include `publicationId`
- **Error handling:** selalu `next(error)`, tidak pernah `res.json()` di catch
- **Response format:** `{ success: true, data: ... }` atau `{ success: false, error: ... }`
- **Validasi:** semua input via Zod schema di `[modul].schema.ts`
- **Password:** Argon2 — jangan pernah bcrypt
- **Token:** access token di memory JS, refresh token di httpOnly cookie

### Frontend (Next.js 16)
- **Default Server Component** — tambah `'use client'` hanya jika perlu interaksi/hooks/browser API
- **Caching:** `'use cache'` + `cacheTag()` + `cacheLife()` — bukan `revalidate` lama
- **Routing middleware:** `proxy.ts` di root — BUKAN `middleware.ts` (deprecated di Next.js 16)
  - Fungsi wajib bernama `proxy()`, BUKAN `middleware()`
  - Runtime adalah **Node.js saja** — edge runtime tidak didukung di `proxy.ts`
  - Jika perlu edge runtime, tetap pakai `middleware.ts` (tapi hindari untuk project ini)
  - Ref: [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- **params/searchParams:** wajib di-`await` sebelum diakses
- **Gambar:** selalu `next/image` — tidak pernah `<img>`
- **Form:** React Hook Form + Zod + shadcn/ui `<Form>` wrapper
- **State global:** Zustand — hanya di Client Component

### Frontend UI Rules (WAJIB)

**Komponen shadcn/ui yang WAJIB dipakai:**
- `<Button>` — semua tombol, TIDAK PERNAH `<button>` biasa
- `<Input>` — semua input teks, TIDAK PERNAH `<input>` biasa
- `<Form>`, `<FormField>`, `<FormControl>`, `<FormLabel>`, `<FormMessage>` — semua form
- `<Card>` — card/panel konten
- `<Dialog>` — modal/popup
- `<Badge>` — label/tag status
- `<Table>` — tabel data

**Warna — WAJIB pakai semantic tokens:**
- DILARANG hardcode hex (`#2a261f`, `#f9f7f4`, dll)
- Gunakan: `bg-background`, `text-foreground`, `text-muted-foreground`
- Gunakan: `border-border`, `border-input`, `bg-muted`, `bg-card`
- Gunakan: `bg-primary`, `text-primary-foreground`, `text-destructive`
- Token lengkap didefinisikan di `frontend/src/app/globals.css`

**Responsive — WAJIB:**
- Selalu mulai dari mobile-first
- Gunakan breakpoint `md:` dan `lg:` untuk desktop layout
- Layout auth: `grid-cols-1 md:grid-cols-2`
- Tidak boleh ada elemen yang overflow atau tidak terbaca di mobile

**Komponen reusable — WAJIB dipisah:**
- Komponen yang dipakai di 2+ halaman → pindah ke `components/`
- Layout shell (AuthShell, DashboardShell, dll) → `components/layout/`
- Icon custom → `components/ui/`

### Yang TIDAK BOLEH Dilakukan
- Hardcode nilai yang seharusnya di `.env`
- Query tanpa `publicationId` di repository layer
- Gunakan `bcrypt` — pakai Argon2
- Gunakan `middleware.ts` — pakai `proxy.ts` (deprecated di Next.js 16)
- Beri nama fungsi `middleware()` di proxy.ts — wajib bernama `proxy()`
- Simpan access token di localStorage atau cookie biasa
- Gunakan `<img>` — pakai `next/image`
- Commit file `.env` atau `.env.local`
- Gunakan `unstable_cache` — pakai `'use cache'`
- Hardcode warna hex di komponen — pakai semantic tokens
- Pakai `<input>` atau `<button>` biasa — pakai shadcn/ui
- Buat komponen inline jika dipakai di 2+ tempat

---

## Git Convention (Ringkasan)

```bash
# Branch naming
feat/nama-fitur
fix/nama-bug
hotfix/nama-bug-kritis
chore/nama-setup

# Commit format (Conventional Commits)
feat(scope): deskripsi
fix(scope): deskripsi
chore(scope): deskripsi

# Alur per Epic
git checkout main && git pull
git checkout -b feat/nama-epic
# ... kerjakan semua story ...
git push origin feat/nama-epic
# buat PR → merge → hapus branch
```

---

## Progress Implementasi

Track progress di `docs/USER_STORIES_MVP.md` — update checkbox `[ ]` → `[x]` setiap task selesai.

**Cara lanjut sesi baru:**
```
Baca CLAUDE.md dan docs/USER_STORIES_MVP.md.
Lanjutkan implementasi EPIC [X] dari STORY [Y.Z].
Checkout branch: git checkout feat/[nama-branch]
Task terakhir selesai: TASK-[prefix]-[X.Y.Z]
```

---

## UI/UX Design

**Jalur yang dipilih:** A — hasil Claude Design tersimpan di `frontend/design-references/`

Saat implementasi halaman frontend:
1. Baca file `frontend/design-references/[nama-halaman].html`
2. Identifikasi struktur, komponen, warna, spacing
3. Implementasikan dengan shadcn/ui + Tailwind
4. Verifikasi di browser: tampilan mendekati referensi

---

## Referensi Desain Frontend

Hasil desain UI ada di `frontend/design-references/`.
Saat implementasi halaman frontend, WAJIB:
1. Baca `frontend/design-references/index.html` untuk overview semua halaman
2. Lihat `frontend/design-references/screens/` untuk screenshot per halaman
3. Implementasikan shadcn/ui + Tailwind CSS mengacu ke desain tersebut
4. Jangan implementasi UI tanpa melihat referensi desain terlebih dahulu

---

## Cara Jalankan Lokal

```bash
# Terminal 1 — Database (jalankan sekali)
docker-compose up -d

# Terminal 2 — Backend
cd backend && npm run dev
# berjalan di http://localhost:4000

# Terminal 3 — Frontend
cd frontend && npm run dev
# berjalan di http://localhost:3000
```

---

## Context7

Sebelum implementasi yang melibatkan library berubah cepat, panggil Context7:
```
use context7 next.js     ← selalu untuk frontend
use context7 prisma      ← jika menyentuh database
use context7 shadcn/ui   ← jika implementasi komponen UI
```

Lihat `docs/` → referensi lengkap di plugin `create-fullstack-app`.

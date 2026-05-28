# 📖 Project Master Guide — Blog Platform "Lentera"
> Satu dokumen untuk memahami keseluruhan project sebelum implementasi.
> Baca dari atas ke bawah — setiap section membangun pemahaman untuk section berikutnya.

---

# BAGIAN 1 — APA YANG KITA BANGUN?

## Ide Awal

Kamu ingin membangun **platform blog berlangganan** (subscription-based) yang mirip Ghost.org atau Substack — tapi dengan beberapa perbedaan kunci:

1. **Multi-author per publication** — satu blog bisa dimiliki beberapa penulis sekaligus. Subscriber cukup bayar sekali untuk akses semua konten dari semua penulis di blog tersebut.

2. **Eksklusivitas antar publication** — platform ini bukan marketplace. Setiap blog berdiri sendiri. Pembaca blog A tidak tahu blog B ada di platform yang sama.

3. **Data audience di tangan owner** — bukan di tangan platform pihak ketiga. Owner bisa export list subscriber-nya kapan saja.

4. **SaaS model** — kamu sebagai operator platform mengambil 15% fee dari setiap transaksi subscription.

## Analogi Mental Model

```
Bayangkan platform ini seperti Shopify — tapi untuk blog.
Setiap "toko" (blog) punya brand sendiri, domain sendiri, customer sendiri.
Pembeli di toko A tidak tahu toko B ada di infrastruktur Shopify yang sama.
Kamu adalah Shopify-nya — menyediakan infrastruktur, mengambil fee transaksi.
```

## Nama Platform

**Lentera** — nama yang sudah dipilih saat sesi desain UI/UX.

---

# BAGIAN 2 — UNTUK SIAPA?

## 3 User Persona

### Persona 1: Owner / Penulis Solo — "Budi"
- Profesional 28–45 tahun, sudah punya audience organik
- Mau monetisasi tulisannya langsung tanpa platform perantara
- Butuh dashboard simpel untuk kelola konten dan lihat revenue

### Persona 2: Tim Penulis — "Komunitas Investasi"
- 2–5 orang dengan spesialisasi berbeda (teknikal, fundamental, makroekonomi, dll)
- Bergabung dalam satu publication agar subscriber akses semua konten dengan satu subscription
- Contoh nyata: kamu + 3 teman yang masing-masing ahli di bidang berbeda

### Persona 3: Member / Pembaca — "Rina"
- 22–40 tahun, lebih suka belajar dengan membaca daripada menonton video
- Mau belajar satu topik secara mendalam dari sumber yang dipercaya
- Butuh fitur untuk menyimpan & mengorganisir artikel yang sudah dibaca

---

# BAGIAN 3 — FITUR APA SAJA?

## MVP (Yang Harus Ada Sebelum Launch)

| Fitur | Keterangan |
|---|---|
| Auth lengkap | Register, login, Google OAuth, forgot password |
| Publication management | Buat publication, invite author, custom domain |
| Rich text editor | Tulis artikel dengan heading, gambar, embed YouTube |
| Publish artikel | Free atau premium, bisa dijadwalkan |
| Series artikel | Kelompokkan artikel berseri dengan navigasi urutan |
| Subscription 4 tier | Bulanan, 3 bulan, 6 bulan, tahunan |
| Payment gateway | Midtrans (GoPay, QRIS, VA, kartu kredit) |
| Paywall | Preview 200 kata pertama, lalu konten ter-lock |
| Halaman publication | Landing page + daftar artikel |
| Halaman artikel | Konten + author info + like button |
| Email notifikasi | Artikel baru ke subscriber, email transaksional |
| Dashboard owner | Subscriber count, MRR, top artikel |

## V2 (Setelah MVP Stabil)

| Fitur | Keterangan |
|---|---|
| Roadmap visual | Learning path bertahap (Beginner → Advanced) |
| Komentar & Q&A | Eksklusif member, Q&A di level publication |
| Search | Full-text search per publication |
| Personal Library | Save artikel ke folder custom |
| Analytics lengkap | Per artikel, export CSV subscriber |

## V3 (Jangka Panjang)

Digest email mingguan, auto-renew subscription, revenue payout dashboard, translate artikel, mobile app.

## Yang TIDAK Dibangun (Non-Goals)

- ❌ Bukan marketplace — tidak ada halaman explore lintas publication
- ❌ Tidak host video sendiri — embed YouTube saja
- ❌ Tidak ada mobile app di MVP
- ❌ Tidak ada free trial — rawan abuse
- ❌ Tidak ada multi-bahasa UI di MVP

---

# BAGIAN 4 — KEPUTUSAN BISNIS FINAL

Ini sudah diputuskan dan tidak perlu didiskusikan ulang:

| Topik | Keputusan |
|---|---|
| Platform fee | 15% per transaksi, bisa dikonfigurasi per publication, bisa dimatikan |
| Free trial | Tidak ada — diganti preview 200 kata |
| Siapa yang bisa komentar | Member saja. Non-member hanya bisa like |
| Auto-renew | Tidak di MVP — manual renewal |
| Payout ke owner | MVP: manual. V2: otomatis via disbursement API |
| Domain | Subdomain gratis otomatis. Custom domain opsional, biaya ditanggung owner |
| KYC owner | Tidak diperlukan di awal |

---

# BAGIAN 5 — ARSITEKTUR SISTEM

## Gambaran Besar

```
Browser/Client (Next.js 16)
        ↓ HTTPS
API Backend (Express.js)
  ├── Auth Module
  ├── Publication Module
  ├── Article Module
  ├── Subscription Module
  ├── Community Module
  ├── Email Module
  └── Analytics Module
        ↓
Data Layer
  ├── PostgreSQL (data utama)
  ├── Redis (cache, session, queue)
  └── Cloudinary (gambar)
        ↓
External Services
  ├── Midtrans (payment)
  ├── Resend (email)
  └── Google OAuth
```

## Multi-Tenancy — Konsep Paling Penting

Platform ini adalah **multi-tenant** — satu database, banyak publication, data terisolasi.

```
Publication A (investasicerdas.com)
  └── Hanya bisa akses data publication A

Publication B (techinsider.id)
  └── Hanya bisa akses data publication B

❌ Publication A tidak bisa lihat data Publication B
❌ Tidak ada halaman "semua publication"
```

**Implikasi teknis:** Setiap query database WAJIB include `publicationId` sebagai filter. Ini rules paling kritis di seluruh codebase.

## Struktur Folder Project

```
blog-platform/
├── CLAUDE.md                 ← dibaca otomatis Claude Code
├── .claude/skills/           ← plugin implementasi
├── docs/                     ← semua dokumen planning
├── frontend/                 ← Next.js app
│   ├── design-references/    ← hasil Claude Design
│   └── src/app/...
├── backend/                  ← Express app
│   └── src/modules/...
└── docker-compose.yml        ← database lokal
```

---

# BAGIAN 6 — TECH STACK

## Stack yang Sudah Final (Tidak Berubah)

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js 16 + TypeScript | App Router, SSR/SSG untuk SEO |
| Styling | Tailwind CSS + shadcn/ui | Design system konsisten |
| State | Zustand + React Hook Form | Ringan, simpel |
| Backend | Express.js + TypeScript | Familiar, fleksibel |
| ORM | Prisma | Type-safe, developer-friendly |
| Database | PostgreSQL + Redis | Relasional + cache |
| Auth | JWT + Refresh Token + Google OAuth | Standar industri |
| Password | Argon2 | Lebih aman dari bcrypt |
| Payment | Midtrans | Indonesia-first |
| Email | Resend + BullMQ | Queue-based, reliable |
| Storage | Cloudinary | CDN + transformasi gambar |
| Deploy | Railway (backend) + Vercel (frontend) | Zero DevOps |

## Rules Frontend Terpenting (Next.js 16)

```
Default = Server Component (SC)
Tambah 'use client' hanya jika: ada onClick/onChange, pakai hooks, pakai browser API

Caching:
  'use cache' + cacheTag() + cacheLife()    ← artikel free, halaman publik
  tidak ada 'use cache'                     ← halaman premium, dashboard

proxy.ts (bukan middleware.ts)              ← untuk tenant resolution
params/searchParams harus di-await          ← breaking change Next.js 16
next/image (bukan <img>)                    ← selalu
```

## Rules Backend Terpenting (Express.js)

```
Struktur 4 layer WAJIB:
  Router     → definisi URL + method saja
  Controller → ambil dari req, panggil service, return res
  Service    → semua business logic
  Repository → semua query Prisma (WAJIB include publicationId)

Error handling: selalu next(error), tidak pernah res.json() di catch
Response format: { success: true, data: ... } atau { success: false, error: ... }
Validasi: semua input via Zod schema
```

---

# BAGIAN 7 — DATABASE SCHEMA (RINGKASAN)

Entitas utama yang perlu dipahami:

```
USERS
  └── bisa jadi owner/author di beberapa publication
  └── bisa jadi subscriber di beberapa publication

PUBLICATIONS (tenant root)
  └── setiap publication = satu blog independen
  └── punya slug + optional custom_domain
  └── platform_fee_percent (default 15)

PUBLICATION_AUTHORS
  └── relasi many-to-many: user ↔ publication
  └── role: 'owner' atau 'author'

SUBSCRIPTION_PLANS
  └── per publication
  └── duration_months: 1 | 3 | 6 | 12

SUBSCRIPTIONS
  └── relasi: user subscribe ke publication
  └── status: pending | active | expired | cancelled
  └── menyimpan gross_amount, platform_fee, net_amount

ARTICLES
  └── visibility: 'free' | 'members_only'
  └── status: 'draft' | 'scheduled' | 'published'
  └── content disimpan sebagai JSON (format Tiptap)
  └── soft delete via deletedAt

SERIES → SERIES_ARTICLES
  └── kumpulan artikel yang diurutkan

COMMENTS
  └── hanya untuk member aktif
  └── support reply 1 level (parent_id)

SAVED_FOLDERS → SAVED_ARTICLES
  └── personal library milik member
```

---

# BAGIAN 8 — USER FLOWS KRITIS

## Flow 1: Author Publish Artikel

```
Login ke dashboard
  → Klik "Tulis Artikel Baru"
  → Tulis di editor (rich text, embed gambar/video)
  → Set visibility: free atau members only
  → Isi excerpt (untuk paywall preview)
  → Preview → Publish
  → Email notifikasi otomatis ke subscriber
```

## Flow 2: Reader Berlangganan (Konversi Utama)

```
Baca artikel free via Google (SEO)
  → Ketemu artikel premium → lihat preview + paywall
  → Klik "Berlangganan"
  → Pilih paket (1/3/6/12 bulan)
  → Register atau Login
  → Checkout → bayar via Midtrans
  → Sukses → redirect ke artikel
  → Email konfirmasi terkirim
```

## Flow 3: Member Save Artikel

```
Baca artikel
  → Klik ikon "Save"
  → Pilih folder / buat folder baru
  → Kapan saja akses via Library
```

---

# BAGIAN 9 — GIT STRATEGY

## Model: GitHub Flow

Satu branch `main` yang selalu production-ready. Semua fitur lewat branch sementara.

## Naming Convention

```
feat/nama-fitur      → fitur baru
fix/nama-bug         → bug fix
hotfix/nama-bug      → bug kritis production
chore/nama-setup     → setup, config
```

## Commit Format (Conventional Commits)

```
feat(auth): add email/password register endpoint
fix(article): fix slug collision when title duplicate
chore(config): init monorepo structure
```

## Alur Per Epic

```bash
git checkout main && git pull origin main
git checkout -b feat/nama-epic
# kerjakan semua story...
git push origin feat/nama-epic
# buat PR di GitHub → merge → hapus branch
git checkout main && git pull
git branch -d feat/nama-epic
```

---

# BAGIAN 10 — RENCANA IMPLEMENTASI

## 9 Epic yang Harus Dikerjakan (Urutan)

| Epic | Isi | Estimasi |
|---|---|---|
| EPIC 1 | Project Setup & Infrastructure | 1–2 hari |
| EPIC 2 | Autentikasi (register, login, OAuth, JWT) | 3–5 hari |
| EPIC 3 | Publication Management | 2–3 hari |
| EPIC 4 | Content Management (editor, artikel, series) | 5–7 hari |
| EPIC 5 | Subscription & Payment (Midtrans) | 3–5 hari |
| EPIC 6 | Reader Experience (paywall, artikel page) | 3–4 hari |
| EPIC 7 | Email & Notifikasi | 2–3 hari |
| EPIC 8 | Dashboard & Analytics | 2–3 hari |
| EPIC 9 | Pre-Launch & Deployment | 1–2 hari |

**Total estimasi:** 8–12 minggu (dengan bantuan AI agent)

## Urutan Per Epic

```
Dalam setiap Epic:
1. Kerjakan semua TASK-BE (backend) dulu
2. Lalu semua TASK-FE (frontend)
3. Terakhir TASK-INT (integrasi + test)
4. Commit setiap Story selesai
5. Merge ke main setelah Epic penuh selesai
```

## Progress Tracking

Dokumen `docs/USER_STORIES_MVP.md` adalah peta implementasi. Update checkbox setiap task selesai:
```
[ ] belum dikerjakan
[x] selesai
```

---

# BAGIAN 11 — DESAIN UI/UX

## Hasil Desain

Desain sudah selesai dibuat di Claude Design. File hasil desain ada di:
```
blog-platform/frontend/design-references/
├── screens/      ← screenshot per halaman
├── src/          ← source code komponen
├── index.html    ← preview keseluruhan
└── styles.css    ← stylesheet
```

## Halaman yang Sudah Didesain

- Homepage publication (Lentera)
- Artikel gratis
- Artikel premium — paywall (non-member)
- Artikel premium — full (member)
- Subscribe & checkout (4 tier harga)
- Login, Register, Lupa Sandi
- Dashboard Overview
- Dashboard Daftar Artikel
- Editor artikel + settings drawer
- Halaman Series
- Personal Library
- Save ke Folder (modal)

## Cara Pakai Saat Implementasi Frontend

Saat Claude Code implementasi halaman frontend, dia akan baca file di `frontend/design-references/` sebagai referensi visual — lalu implementasi menggunakan shadcn/ui + Tailwind CSS.

---

# BAGIAN 12 — STATUS PROJECT SEKARANG

## Yang Sudah Selesai ✅

- [x] Problem Brief — ide sudah distrukturkan
- [x] PRD v1.1 — semua requirement terdokumentasi
- [x] SAD v1.2 — arsitektur teknikal sudah dirancang
- [x] Git Strategy — konvensi git sudah ditetapkan
- [x] Tech Context — rules untuk Claude Code sudah ditulis
- [x] UI/UX Design Briefing — briefing desain sudah dibuat
- [x] Desain UI/UX — mockup visual sudah selesai di Claude Design
- [x] User Stories MVP — 226 tasks sudah di-breakdown
- [x] Plugin create-fullstack-app — workflow implementasi sudah siap
- [x] Folder structure blog-platform sudah disiapkan
- [x] CLAUDE.md sudah dibuat
- [x] Semua dokumen sudah ada di docs/
- [x] Hasil Claude Design sudah ada di frontend/design-references/
- [x] Plugin sudah di-extract ke .claude/skills/

## Yang Belum Dimulai ⬜

- [ ] EPIC 1 — Project Setup (init monorepo, Docker, GitHub)
- [ ] EPIC 2 — Auth
- [ ] EPIC 3 — Publication Management
- [ ] EPIC 4 — Content Management
- [ ] EPIC 5 — Subscription & Payment
- [ ] EPIC 6 — Reader Experience
- [ ] EPIC 7 — Email & Notifikasi
- [ ] EPIC 8 — Dashboard & Analytics
- [ ] EPIC 9 — Deploy

---

# BAGIAN 13 — CARA MULAI IMPLEMENTASI

## Prasyarat

Pastikan ini sudah ada di komputer:
```bash
node --version    # v20+
git --version
docker --version
claude --version
```

## Cara Jalankan Claude Code

```bash
# 1. Buka terminal di folder project
cd "D:/CLAUDE CODE PROJECT/blog-platform"

# 2. Jalankan Claude Code
claude
```

## Prompt Pembuka untuk Mulai

```
Baca CLAUDE.md terlebih dahulu.
Semua dokumen pre-implementation ada di docs/.
Hasil desain UI ada di frontend/design-references/.
Jalur UI: A — gunakan design-references sebagai referensi visual.

Kita mulai dari EPIC 1 — Project Setup.
Buat branch: git checkout -b chore/init-project
Stack: Express.js + Next.js 16.
```

## Prompt untuk Lanjut Sesi Berikutnya

```
Baca CLAUDE.md dan docs/USER_STORIES_MVP.md.
Lanjutkan implementasi dari EPIC [X] — STORY [Y.Z].
Checkout branch: git checkout feat/[nama-branch]
Task terakhir selesai: TASK-[prefix]-[X.Y.Z]
```

## Cara Jalankan Lokal (3 Terminal)

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

---

# BAGIAN 14 — REFERENSI CEPAT

## File-File Penting

| File | Fungsi |
|---|---|
| `CLAUDE.md` | Auto-dibaca Claude Code — rules + stack summary |
| `docs/PRD_Publication_Platform.md` | Detail requirement & business decisions |
| `docs/SAD_Publication_Platform.md` | Arsitektur teknikal lengkap |
| `docs/TECH_CONTEXT.md` | Rules implementasi untuk Claude Code |
| `docs/USER_STORIES_MVP.md` | Task breakdown + progress tracker |
| `docs/GIT_STRATEGY.md` | Branching & commit convention |
| `frontend/design-references/` | Referensi visual UI |
| `.claude/skills/create-fullstack-app/` | Plugin workflow implementasi |

## Hal yang TIDAK BOLEH Dilakukan Claude Code

```
❌ Hardcode API key / secret di kode
❌ Query database tanpa publicationId
❌ Pakai bcrypt — harus Argon2
❌ Pakai middleware.ts — harus proxy.ts
❌ Simpan access token di localStorage
❌ Pakai <img> — harus next/image
❌ Commit file .env atau .env.local
❌ Pakai unstable_cache — harus 'use cache'
❌ Akses params tanpa await (Next.js 16)
```

## Context7 — Panggil Sebelum Coding

```
use context7 next.js     ← selalu untuk frontend
use context7 prisma      ← jika menyentuh database
use context7 shadcn/ui   ← jika implementasi komponen UI
```

---

*Dokumen ini adalah ringkasan dari: PRD v1.1, SAD v1.2, GIT_STRATEGY, TECH_CONTEXT, USER_STORIES_MVP, UI_UX_DESIGN_BRIEFING, CLAUDE.md*

# Tech Context — Platform Blog Subscription
> Dokumen ini adalah referensi utama untuk AI agent (Claude Code).
> Baca dokumen ini sebelum menulis satu baris kode pun.
> Untuk context bisnis dan fitur, lihat PRD_Publication_Platform.md dan SAD_Publication_Platform.md.

---

## Stack & Versi

### Backend
| Package | Versi | Catatan |
|---|---|---|
| Node.js | 20.9+ | Minimum requirement |
| TypeScript | 5.x | Strict mode ON |
| Express.js | 4.x | Framework utama |
| Prisma | 5.x | ORM — satu-satunya cara akses DB |
| PostgreSQL | 16 | Primary database |
| Redis | 7.x | Cache, session, rate limit, queue |
| Zod | 3.x | Validasi input — semua input divalidasi dengan Zod |
| Argon2 | latest | Password hashing — BUKAN bcrypt |
| jsonwebtoken | 9.x | JWT signing/verification |
| BullMQ | 5.x | Job queue untuk email |
| Resend | latest | Email provider |
| Helmet | 7.x | Security headers |
| cors | 2.x | CORS middleware |
| express-rate-limit | 7.x | Rate limiting |

### Frontend
| Package | Versi | Catatan |
|---|---|---|
| Next.js | 16.x | App Router, Turbopack default |
| React | 19.x | |
| TypeScript | 5.x | Strict mode ON |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | UI components |
| Tiptap | 2.x | Rich text editor — HANYA di Client Component |
| Zod | 3.x | Form validation + type inference |
| React Hook Form | 7.x | Form state management |
| Zustand | 5.x | Global state — HANYA di Client Component |
| Axios | 1.x | HTTP client — HANYA di Client Component |
| TanStack Query | 5.x | Server state, caching — HANYA di Client Component |

### Infrastructure
| Service | Dipakai untuk |
|---|---|
| Railway / Render | Backend hosting |
| Vercel | Frontend hosting |
| Cloudinary | File storage (gambar) |
| Midtrans | Payment gateway |

---

## Struktur Folder

Lihat SAD_Publication_Platform.md section 16 untuk struktur lengkap.

### Backend: `backend/src/modules/<nama-modul>/`
Setiap modul WAJIB terdiri dari 5 file:
```
<modul>.router.ts      — URL + HTTP method + middleware
<modul>.controller.ts  — req/res handling, panggil service
<modul>.service.ts     — business logic
<modul>.repository.ts  — query Prisma, WAJIB scope publicationId
<modul>.schema.ts      — Zod schemas untuk validasi
```

### Frontend: `frontend/src/`
```
app/           — Next.js pages (App Router)
components/    — React components
lib/           — utilities, API wrappers
hooks/         — custom hooks (CC only)
store/         — Zustand stores (CC only)
types/         — TypeScript type definitions
```

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
// TIDAK PERNAH query artikel/konten tanpa filter publicationId

// ✅ BENAR
findMany(publicationId: string) {
  return prisma.article.findMany({ where: { publicationId, deletedAt: null } })
}

// ❌ SALAH — data bisa bocor lintas tenant
findMany() {
  return prisma.article.findMany()
}
```

### 3. Error Handling
- Semua error harus extend class `AppError` di `src/lib/AppError.ts`
- Gunakan `next(error)` untuk pass error ke global error handler
- TIDAK PERNAH gunakan `try/catch` tanpa `next(error)` di controller
- Global error handler di `app.ts` HARUS menjadi middleware terakhir

```typescript
// Pattern yang benar di controller
async getArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await this.articleService.findBySlug(...)
    res.json({ success: true, data: article })
  } catch (error) {
    next(error)  // selalu gunakan next(error), jangan res.status().json() langsung
  }
}
```

### 4. Response Format
Semua API response HARUS menggunakan format ini:
```typescript
// Success
{ "success": true, "data": <payload>, "pagination"?: { ... } }

// Error (ditangani global error handler)
{ "success": false, "statusCode": 404, "error": "NOT_FOUND", "message": "..." }
```

### 5. Validasi Input
- Semua input (body, query, params) divalidasi dengan Zod di middleware sebelum masuk controller
- Schema Zod didefinisikan di `<modul>.schema.ts`
- Gunakan `z.infer<typeof schema>` untuk type inference — tidak perlu definisi type manual

### 6. Password & Auth
- Hash password dengan `argon2.hash()` — BUKAN `bcrypt`
- Access token: JWT, expiry 15 menit, simpan di memory (JS variable)
- Refresh token: opaque string (UUID), expiry 30 hari, simpan di httpOnly cookie
- Refresh token disimpan di Redis: key `refresh:{userId}:{tokenId}`

### 7. Prisma
- Prisma client harus singleton — gunakan instance dari `src/config/database.config.ts`
- Gunakan `prisma.$transaction()` untuk operasi yang butuh atomicity
- Soft delete: set `deletedAt = new Date()`, JANGAN `delete`
- Selalu sertakan `deletedAt: null` dalam query `findMany`

---

## Rules Frontend — WAJIB DIIKUTI

### 1. Server Component vs Client Component
- **Default: Server Component** — tidak perlu directive apapun
- Tambahkan `'use client'` HANYA jika: ada event handler, React hooks, browser API, atau library yang tidak support RSC
- **Push Client Component ke bawah** — jangan jadikan seluruh page CC hanya karena satu tombol

```tsx
// ✅ BENAR — SC di atas, CC hanya untuk tombol
// page.tsx (SC)
export default async function ArticlePage({ params }) {
  const article = await fetchArticle(params.slug)
  return (
    <>
      <ArticleBody content={article.content} />   {/* SC */}
      <LikeButton articleId={article.id} />       {/* CC */}
    </>
  )
}

// ❌ SALAH — seluruh page jadi CC
'use client'
export default function ArticlePage() { ... }
```

### 2. Caching — Next.js 16 Model
- Gunakan `'use cache'` directive di fungsi yang boleh di-cache
- Gunakan `cacheTag()` untuk tagging — wajib ada untuk on-demand invalidation
- Gunakan `cacheLife()` untuk menentukan TTL dengan profile preset
- Data request-time (personalized, subscription check): jangan pakai `'use cache'`
- `revalidateTag()` dipanggil dari Server Action setelah mutasi

```typescript
// ✅ Cache Component
async function fetchArticle(slug: string) {
  'use cache'
  cacheTag(`article-${slug}`, 'articles')
  cacheLife('hours')
  const res = await fetch(`${API_URL}/articles/${slug}`)
  return res.json()
}

// ✅ Request-time (tidak di-cache)
async function checkSubscription(userId: string, pubId: string) {
  // no 'use cache' — harus fresh setiap request
  const res = await fetch(`${API_URL}/subscriptions/check`, { ... })
  return res.json()
}
```

### 3. Data Fetching
- Fetch data di Server Component langsung — TIDAK melalui `useEffect`
- Gunakan `Promise.all()` untuk fetch paralel, bukan sequential await
- Gunakan `<Suspense>` untuk bagian yang load lambat
- API call dari Client Component: gunakan Axios instance dari `lib/api/client.ts`
- API call dari Server Component: gunakan fetch wrapper dari `lib/api/server.ts`

### 4. `proxy.ts` (bukan `middleware.ts`)
- File ini di root project (sejajar dengan `src/`)
- HANYA untuk: redirect, rewrite, set header
- TIDAK untuk: business logic, DB query, complex auth check
- Tenant resolution (set `x-publication-host` header) ada di sini

### 5. `params` dan `searchParams` — Async
Next.js 16: `params` dan `searchParams` HARUS di-await:
```typescript
// ✅ BENAR
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}

// ❌ SALAH — akan error di Next.js 16
export default function Page({ params }) {
  const { slug } = params  // tidak di-await
}
```

### 6. Image
- SELALU gunakan `next/image` — TIDAK PERNAH `<img>`
- Wajib set `sizes` saat menggunakan `fill` mode
- Set `priority={true}` untuk gambar di atas fold (LCP optimization)

### 7. Form & Mutasi
- Gunakan React Hook Form + Zod untuk form di Client Component
- Gunakan Server Actions untuk mutasi sederhana (komentar, save artikel)
- Untuk operasi kompleks (checkout, upload), tetap gunakan REST API via Axios

---

## Git Convention

Lihat GIT_STRATEGY.md untuk detail lengkap.

### Quick Reference
```bash
# Branch naming
feat/<nama>   fix/<nama>   hotfix/<nama>   chore/<nama>

# Commit format (Conventional Commits)
feat(scope): deskripsi
fix(scope): deskripsi
chore(scope): deskripsi
```

### Kapan Commit
- Setiap file atau kelompok file yang logically complete — jangan tunggu satu modul penuh
- Sebelum pindah ke task berikutnya
- Minimal satu commit per session kerja

---

## Environment Variables

Semua env var didefinisikan di `.env.example` — jangan hardcode nilai apapun di kode.

Backend: lihat `backend/.env.example`
Frontend: lihat `frontend/.env.local.example`

Variabel yang bersifat secret (API key, JWT secret, DB password) TIDAK PERNAH di-commit ke git.

---

## Yang TIDAK BOLEH Dilakukan AI Agent

- ❌ Hardcode nilai apapun yang seharusnya ada di `.env`
- ❌ Query database tanpa `publicationId` filter di repository layer
- ❌ Gunakan `bcrypt` — pakai `argon2`
- ❌ Gunakan `middleware.ts` di Next.js — pakai `proxy.ts`
- ❌ Simpan access token di `localStorage` atau cookie biasa
- ❌ Gunakan `<img>` — pakai `next/image`
- ❌ Akses `params` atau `searchParams` tanpa `await` di Next.js 16
- ❌ Tambahkan business logic di Router atau Controller layer backend
- ❌ Import Prisma client langsung — selalu gunakan singleton dari `config/database.config.ts`
- ❌ Commit file `.env` atau file yang berisi API key
- ❌ Gunakan `next lint` — sudah dihapus di Next.js 16, gunakan ESLint langsung
- ❌ Gunakan `unstable_cache` — pakai `'use cache'` directive (Next.js 16)

---

## Cara Pakai Dokumen Ini dengan Claude Code

Saat memulai sesi baru di Claude Code, selalu sertakan:
1. File ini (`TECH_CONTEXT.md`) sebagai konteks utama
2. `SAD_Publication_Platform.md` untuk referensi arsitektur
3. `PRD_Publication_Platform.md` jika membutuhkan referensi requirement bisnis

Contoh prompt pembuka yang efektif:
```
Baca TECH_CONTEXT.md, SAD_Publication_Platform.md terlebih dahulu.
Kita akan mengimplementasikan [nama modul].
Mulai dari [titik awal yang spesifik].
```

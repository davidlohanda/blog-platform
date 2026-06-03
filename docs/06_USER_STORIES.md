# User Stories & Task Breakdown — MVP
## Platform Blog Subscription Multi-Author — Lentera
**Versi:** 2.0 | Update dari Grill Me Session
**Scope:** MVP only
**Referensi:** PRD v1.1, SAD v1.2, Grill Me Decisions

> **Catatan v2.0:** EPIC 1–12 dipertahankan dari v1.0 dengan semua status `[x]` yang sudah ada.
> EPIC 13–17 adalah tambahan baru dari hasil sesi Grill Me.
> Story lama yang punya gap ditandai `⚠️ NEEDS FIX` — task perbaikannya ada di EPIC 13.

---

## Cara Membaca Dokumen Ini

```
EPIC         — Kelompok fitur besar (setara modul)
  STORY      — Kebutuhan dari sudut pandang user (format: "Sebagai X, saya ingin Y, agar Z")
    TASK-BE  — Pekerjaan teknis di backend
    TASK-FE  — Pekerjaan teknis di frontend
    TASK-INT — Pekerjaan integrasi frontend ↔ backend
```

**Status task:** `[ ]` belum dikerjakan · `[x]` selesai

**Urutan pengerjaan yang disarankan:** Ikuti urutan Epic dari atas ke bawah. Dalam setiap Epic, selesaikan semua TASK-BE terlebih dahulu, lalu TASK-FE, lalu TASK-INT.

---

## EPIC 1 — Project Setup & Infrastructure

### STORY 1.1 — Setup Monorepo
Sebagai developer, saya ingin struktur project yang rapi sejak awal, agar frontend dan backend bisa dikembangkan dalam satu repository tanpa konflik.

**TASK-BE-1.1.1** `[x]` Init folder `backend/` dengan TypeScript + Express.js
**TASK-BE-1.1.2** `[x]` Setup `tsconfig.json` dengan strict mode
**TASK-BE-1.1.3** `[x]` Setup ESLint + Prettier untuk backend
**TASK-BE-1.1.4** `[x]` Buat struktur folder sesuai SAD: `modules/`, `middleware/`, `config/`, `lib/`
**TASK-BE-1.1.5** `[x]` Setup `app.ts` dengan middleware chain (helmet, cors, express.json, logger, rate limiter, error handler)
**TASK-BE-1.1.6** `[x]` Buat `AppError` custom class di `lib/AppError.ts`
**TASK-BE-1.1.7** `[x]` Buat global error handler middleware
**TASK-BE-1.1.8** `[x]` Setup environment variables dengan `.env.example`

**TASK-FE-1.1.1** `[x]` Init folder `frontend/` dengan Next.js 16 + TypeScript + Tailwind CSS
**TASK-FE-1.1.2** `[x]` Setup shadcn/ui
**TASK-FE-1.1.3** `[x]` ESLint + Prettier untuk frontend
**TASK-FE-1.1.4** `[x]` Buat struktur folder sesuai SAD: `app/`, `components/`, `lib/`, `hooks/`, `store/`, `types/`
**TASK-FE-1.1.5** `[x]` Setup `proxy.ts` (tenant resolver + auth redirect)
**TASK-FE-1.1.6** `[x]` Setup Axios instance di `lib/api/client.ts` (untuk Client Component)
**TASK-FE-1.1.7** `[x]` Setup fetch wrapper di `lib/api/server.ts` (untuk Server Component)
**TASK-FE-1.1.8** `[x]` Setup environment variables dengan `.env.local.example`

**TASK-1.1.1** `[x]` Buat root `package.json` monorepo dengan scripts untuk jalankan frontend & backend sekaligus
**TASK-1.1.2** `[x]` Buat `docker-compose.yml` untuk PostgreSQL + Redis development lokal
**TASK-1.1.3** `[x]` Buat `.gitignore` root
**TASK-1.1.4** `[x]` Buat `README.md` dengan instruksi setup project
**TASK-1.1.5** `[x]` Init git + commit pertama: `chore(config): init monorepo structure`

---

### STORY 1.2 — Setup Database
Sebagai developer, saya ingin database ter-setup dengan schema yang benar sejak awal, agar semua modul bisa langsung menggunakannya tanpa migrasi berulang.

**TASK-BE-1.2.1** `[x]` Init Prisma di `backend/`
**TASK-BE-1.2.2** `[x]` Tulis Prisma schema lengkap sesuai SAD section 7.2: Users, Publications, PublicationAuthors, SubscriptionPlans, Subscriptions, Articles, Tags, ArticleTags, Series, SeriesArticles, EmailPreferences
**TASK-BE-1.2.3** `[x]` Jalankan migrasi pertama: `prisma migrate dev --name init`
**TASK-BE-1.2.4** `[x]` Buat Prisma client singleton di `config/database.config.ts`
**TASK-BE-1.2.5** `[x]` Buat database indexes sesuai SAD section 7.3
**TASK-BE-1.2.6** `[x]` Buat seed data untuk development (1 publication, 2 author, 5 artikel sample)
**TASK-BE-1.2.7** `[x]` Setup Redis client singleton di `config/redis.config.ts`
**TASK-BE-1.2.8** `[x]` Commit: `chore(db): add Prisma schema and initial migration`

---

### STORY 1.3 — Setup CI/CD Dasar
Sebagai developer, saya ingin setiap push ke GitHub otomatis dicek kualitasnya, agar tidak ada kode rusak yang masuk ke main branch.

**TASK-1.3.1** `[x]` Buat GitHub repository
**TASK-1.3.2** `[x]` Push semua dokumen dari folder `docs/` sebagai commit pertama
**TASK-1.3.3** `[x]` Buat `.github/workflows/backend-ci.yml` — lint + type check saat PR
**TASK-1.3.4** `[x]` Buat `.github/workflows/frontend-ci.yml` — lint + type check + build saat PR
**TASK-1.3.5** `[x]` Setup branch protection rules di GitHub untuk branch `main` ← manual di GitHub UI
**TASK-1.3.6** `[x]` Commit: `chore(ci): add GitHub Actions workflow for lint and build`

---

## EPIC 2 — Autentikasi

### STORY 2.1 — Register dengan Email
Sebagai pengunjung baru, saya ingin bisa membuat akun dengan email dan password, agar saya bisa mengakses fitur platform.

**TASK-BE-2.1.1** `[x]` Buat Zod schema validasi register di `auth.schema.ts` (email, name, password min 8 karakter dengan huruf+angka)
**TASK-BE-2.1.2** `[x]` Buat `auth.repository.ts` — method `findByEmail`, `create`
**TASK-BE-2.1.3** `[x]` Buat `auth.service.ts` — method `register`: validasi email unik, hash password dengan Argon2, simpan user, generate email verification token, trigger kirim email verifikasi
**TASK-BE-2.1.4** `[x]` Buat `auth.controller.ts` — method `register`: ambil body, panggil service, return 201
**TASK-BE-2.1.5** `[x]` Buat `auth.router.ts` — `POST /auth/register` dengan validate middleware
**TASK-BE-2.1.6** `[x]` Buat endpoint `GET /auth/verify-email?token=xxx` untuk verifikasi email
**TASK-BE-2.1.7** `[x]` Commit: `feat(auth): add email/password register with email verification`

**TASK-FE-2.1.1** `[x]` Buat halaman `app/(auth)/register/page.tsx` (Client Component)
**TASK-FE-2.1.2** `[x]` Buat form register dengan React Hook Form + Zod: nama, email, password, checkbox ToS
**TASK-FE-2.1.3** `[x]` Tambahkan tombol "Daftar dengan Google" (belum fungsional, placeholder untuk STORY 2.3)
**TASK-FE-2.1.4** `[x]` Handling error state (email sudah terdaftar, validasi gagal)
**TASK-FE-2.1.5** `[x]` Handling success state — tampilkan pesan "cek email kamu"
**TASK-FE-2.1.6** `[x]` Buat halaman konfirmasi email terverifikasi
**TASK-FE-2.1.7** `[x]` Commit: `feat(auth): add register page with form validation`

**TASK-INT-2.1.1** `[x]` Hubungkan form register ke `POST /auth/register`
**TASK-INT-2.1.2** `[ ]` ~~Test end-to-end: register → terima email → klik link → akun aktif~~ BLOCKED: menunggu manual testing
**TASK-INT-2.1.3** `[x]` Commit: `feat(auth): integrate register frontend with backend`

---

### STORY 2.2 — Login dengan Email ⚠️ NEEDS FIX (refresh token belum scoped per publication — fix di EPIC 13)
Sebagai user terdaftar, saya ingin bisa login dengan email dan password, agar saya bisa mengakses akun saya.

**TASK-BE-2.2.1** `[x]` Buat JWT helper di `lib/jwt.ts` — `signAccessToken`, `signRefreshToken`, `verifyToken`
**TASK-BE-2.2.2** `[x]` Buat Argon2 helper di `lib/password.ts` — `hash`, `verify`
**TASK-BE-2.2.3** `[x]` Buat method `login` di `auth.service.ts`: cari user by email, verify password, issue access token (15m) + refresh token (30d), simpan refresh token di Redis
**TASK-BE-2.2.4** `[x]` Tambahkan `POST /auth/login` di router dengan rate limiting 5 req/menit per IP
**TASK-BE-2.2.5** `[x]` Return access token di response body, refresh token di httpOnly cookie
**TASK-BE-2.2.6** `[x]` Tambahkan `POST /auth/logout` — hapus refresh token dari Redis, clear cookie
**TASK-BE-2.2.7** `[x]` Tambahkan `POST /auth/refresh` — verifikasi refresh token di Redis, rotate token
**TASK-BE-2.2.8** `[x]` Buat `auth.middleware.ts` — verify JWT dari Authorization header, attach `req.user`
**TASK-BE-2.2.9** `[x]` Tambahkan `GET /auth/me` — return data user yang sedang login
**TASK-BE-2.2.10** `[x]` Commit: `feat(auth): add login, logout, refresh token with JWT rotation`

**TASK-FE-2.2.1** `[x]` Buat halaman `app/(auth)/login/page.tsx` (Client Component)
**TASK-FE-2.2.2** `[x]` Buat form login: email, password, checkbox "Tetap masuk", link "Lupa sandi?"
**TASK-FE-2.2.3** `[x]` Buat Zustand auth store di `store/authStore.ts` — simpan access token + user data di memory
**TASK-FE-2.2.4** `[x]` Buat custom hook `useAuth` di `hooks/useAuth.ts`
**TASK-FE-2.2.5** `[x]` Setup Axios interceptor: attach access token ke header, auto-refresh jika 401
**TASK-FE-2.2.6** `[x]` Commit: `feat(auth): add login page with token management`

**TASK-INT-2.2.1** `[x]` Hubungkan form login ke `POST /auth/login`
**TASK-INT-2.2.2** `[ ]` ~~Test refresh token flow: access token expired → auto refresh → request ulang~~ BLOCKED: menunggu manual testing
**TASK-INT-2.2.3** `[ ]` ~~Test logout: token dihapus, redirect ke login~~ BLOCKED: menunggu manual testing
**TASK-INT-2.2.4** `[x]` Commit: `feat(auth): integrate login flow end-to-end`

---

### STORY 2.3 — Login dengan Google OAuth ⚠️ NEEDS FIX (belum dibatasi hanya untuk member — fix di EPIC 13)
Sebagai user, saya ingin bisa login dengan akun Google, agar tidak perlu mengingat password baru.

**TASK-BE-2.3.1** `[ ]` Setup Google OAuth credentials di Google Console ← manual di Google Console
**TASK-BE-2.3.2** `[x]` Install dan konfigurasi Passport.js dengan Google Strategy
**TASK-BE-2.3.3** `[x]` Buat `GET /auth/google` — redirect ke Google consent screen
**TASK-BE-2.3.4** `[x]` Buat `GET /auth/google/callback` — terima code, tukar dengan user info Google, upsert user di DB, issue JWT, redirect ke app
**TASK-BE-2.3.5** `[x]` Commit: `feat(auth): add Google OAuth login`

**TASK-FE-2.3.1** `[x]` Aktifkan tombol "Lanjutkan dengan Google" di halaman login dan register
**TASK-FE-2.3.2** `[x]` Handle redirect callback dari OAuth
**TASK-FE-2.3.3** `[x]` Commit: `feat(auth): integrate Google OAuth in frontend`

---

### STORY 2.4 — Lupa & Reset Password ⚠️ NEEDS FIX (belum handle akun OAuth-only — fix di EPIC 13)
Sebagai user yang lupa password, saya ingin bisa mereset password via email, agar saya bisa kembali mengakses akun.

**TASK-BE-2.4.1** `[x]` Buat `POST /auth/forgot-password` — generate reset token (UUID), simpan di Redis (TTL 1 jam), kirim email berisi link reset
**TASK-BE-2.4.2** `[x]` Buat `POST /auth/reset-password` — verifikasi token dari Redis, hash password baru, update di DB, hapus token dari Redis
**TASK-BE-2.4.3** `[x]` Rate limit forgot-password: 3 request per IP per jam
**TASK-BE-2.4.4** `[x]` Commit: `feat(auth): add forgot and reset password flow`

**TASK-FE-2.4.1** `[x]` Buat halaman `app/(auth)/forgot-password/page.tsx` — form input email
**TASK-FE-2.4.2** `[x]` Buat halaman `app/(auth)/reset-password/page.tsx` — form password baru + konfirmasi
**TASK-FE-2.4.3** `[x]` Commit: `feat(auth): add forgot and reset password pages`

**TASK-INT-2.4.1** `[x]` Integrasi halaman forgot & reset dengan backend
**TASK-INT-2.4.2** `[x]` Commit: `feat(auth): integrate password reset flow`

---

### STORY 2.5 — Profile Settings ⚠️ NEEDS FIX (/me/settings harus pindah ke konteks publication — fix di EPIC 13)
Sebagai user yang sudah login, saya ingin bisa mengubah nama, foto profil, dan password saya.

**TASK-BE-2.5.1** `[x]` Buat `PATCH /users/me` — update nama, bio, avatar_url
**TASK-BE-2.5.2** `[x]` Buat `PATCH /users/me/password` — verifikasi password lama, hash password baru
**TASK-BE-2.5.3** `[x]` Commit: `feat(auth): add profile and password update endpoints`

**TASK-FE-2.5.1** `[x]` Buat halaman `app/me/settings/page.tsx` (Client Component)
**TASK-FE-2.5.2** `[x]` Form update profil: nama, bio, upload foto
**TASK-FE-2.5.3** `[x]` Form ganti password: password lama, password baru, konfirmasi
**TASK-FE-2.5.4** `[x]` Commit: `feat(auth): add profile settings page`

**TASK-INT-2.5.1** `[x]` Integrasi halaman settings dengan backend
**TASK-INT-2.5.2** `[x]` Commit: `feat(auth): integrate profile settings`

---

## EPIC 3 — Publication Management

### STORY 3.1 — Membuat Publication
Sebagai owner baru, saya ingin bisa mendaftarkan publication saya dengan nama, deskripsi, dan logo, agar platform bisa digunakan untuk blog saya.

**TASK-BE-3.1.1** `[x]` Buat `publication.schema.ts` — Zod schema untuk create/update publication
**TASK-BE-3.1.2** `[x]` Buat `publication.repository.ts` — method `create`, `findBySlug`, `findByDomain`, `update`
**TASK-BE-3.1.3** `[x]` Buat `publication.service.ts` — method `create`: generate slug dari nama, simpan ke DB, set creator sebagai owner
**TASK-BE-3.1.4** `[x]` Buat `publication.controller.ts` dan `publication.router.ts`
**TASK-BE-3.1.5** `[x]` Endpoint `POST /publications` — buat publication baru (authenticated)
**TASK-BE-3.1.6** `[x]` Endpoint `GET /publications/:slug` — detail publication (public)
**TASK-BE-3.1.7** `[x]` Endpoint `PATCH /publications/:id` — update settings (owner only)
**TASK-BE-3.1.8** `[x]` Buat `tenant.middleware.ts` — resolve `publication_id` dari Host header, attach ke `req.publication`
**TASK-BE-3.1.9** `[x]` Setup Redis cache untuk publication by slug dan domain (TTL 1 jam)
**TASK-BE-3.1.10** `[x]` Commit: `feat(publication): add publication CRUD and tenant middleware`

**TASK-FE-3.1.1** `[x]` Buat halaman onboarding buat publication baru (Client Component)
**TASK-FE-3.1.2** `[x]` Form: nama publication, deskripsi, upload logo
**TASK-FE-3.1.3** `[x]` Commit: `feat(publication): add create publication onboarding page`

**TASK-INT-3.1.1** `[x]` Integrasi form buat publication dengan backend
**TASK-INT-3.1.2** `[x]` Commit: `feat(publication): integrate publication creation`

---

### STORY 3.2 — Manajemen Author
Sebagai owner, saya ingin bisa mengundang penulis lain untuk bergabung ke publication saya, agar kami bisa menulis bersama dalam satu platform.

**TASK-BE-3.2.1** `[x]` Endpoint `POST /publications/:id/authors/invite` — log invite URL (email menyusul STORY 7.1)
**TASK-BE-3.2.2** `[x]` Endpoint `GET /auth/accept-invite?token=xxx` — unblocked dan selesai di STORY 7.1
**TASK-BE-3.2.3** `[x]` Endpoint `GET /publications/:id/authors` — list semua author
**TASK-BE-3.2.4** `[x]` Endpoint `PATCH /publications/:id/authors/:userId` — update role author
**TASK-BE-3.2.5** `[x]` Endpoint `DELETE /publications/:id/authors/:userId` — remove author (owner only, tidak bisa remove diri sendiri jika satu-satunya owner)
**TASK-BE-3.2.6** `[x]` Buat `roles.middleware.ts` — cek role user di publication (owner/author)
**TASK-BE-3.2.7** `[x]` Commit: `feat(publication): add author invite and management`

**TASK-FE-3.2.1** `[x]` Buat halaman `dashboard/settings/` dengan tab: Umum, Author
**TASK-FE-3.2.2** `[x]` Tab Author: list author dengan role, form invite via email, tombol remove
**TASK-FE-3.2.3** `[x]` Buat halaman accept invite — unblocked dan selesai di STORY 7.1
**TASK-FE-3.2.4** `[x]` Commit: `feat(publication): add author management UI`

**TASK-INT-3.2.1** `[x]` Integrasi invite dan author management
**TASK-INT-3.2.2** `[x]` Commit: `feat(publication): integrate author management`

---

### STORY 3.3 — Publication Settings
Sebagai owner, saya ingin bisa mengkonfigurasi nama, deskripsi, logo, dan custom domain publication saya.

**TASK-BE-3.3.1** `[x]` Endpoint update publication settings (sudah ada di STORY 3.1)
**TASK-BE-3.3.2** `[x]` Endpoint `POST /publications/:id/custom-domain` — simpan custom domain, set status `pending`
**TASK-BE-3.3.3** `[x]` Background job: cek DNS propagation — BullMQ hourly job + migration `customDomainStatus` (pending/verified/failed)
**TASK-BE-3.3.4** `[x]` Commit: `feat(publication): add custom domain configuration`

**TASK-FE-3.3.1** `[x]` Tab Umum di settings: form nama, deskripsi, logo, custom domain
**TASK-FE-3.3.2** `[x]` Tampilkan instruksi CNAME setup setelah input custom domain
**TASK-FE-3.3.3** `[x]` Tampilkan status domain: pending (DNS check background job menyusul)
**TASK-FE-3.3.4** `[x]` Commit: `feat(publication): add publication settings UI`

**TASK-INT-3.3.1** `[x]` Integrasi settings dengan backend
**TASK-INT-3.3.2** `[x]` Commit: `feat(publication): integrate publication settings`

---

## EPIC 4 — Content Management

### STORY 4.1 — Menulis Artikel dengan Rich Text Editor
Sebagai author, saya ingin bisa menulis artikel dengan editor yang lengkap, agar konten yang saya buat terlihat profesional dan mudah dibaca.

**TASK-BE-4.1.1** `[x]` Buat `article.schema.ts` — Zod schema untuk create/update artikel
**TASK-BE-4.1.2** `[x]` Buat `article.repository.ts` — method `create`, `findById`, `findBySlug`, `findMany`, `update`, `softDelete`
**TASK-BE-4.1.3** `[x]` Buat `article.service.ts` — method `create`, `update`, `publish`, `delete`; auto-generate slug dari judul; hitung reading time
**TASK-BE-4.1.4** `[x]` Endpoint `POST /publications/:pubId/articles` — buat artikel baru (status: draft)
**TASK-BE-4.1.5** `[x]` Endpoint `GET /publications/:pubId/articles/:slug` — baca satu artikel
**TASK-BE-4.1.6** `[x]` Endpoint `PATCH /publications/:pubId/articles/:id` — update artikel
**TASK-BE-4.1.7** `[x]` Endpoint `DELETE /publications/:pubId/articles/:id` — soft delete
**TASK-BE-4.1.8** `[x]` Endpoint `POST /publications/:pubId/articles/:id/publish` — publish atau schedule artikel
**TASK-BE-4.1.9** `[x]` Background job: publish scheduled articles — BullMQ job tiap 5 menit, auto-notify subscribers
**TASK-BE-4.1.10** `[x]` Commit: `feat(article): add article CRUD and publish flow`

**TASK-FE-4.1.1** `[x]` Install dan setup Tiptap editor
**TASK-FE-4.1.2** `[x]` Buat komponen `RichTextEditor.tsx` dengan extensions: Bold, Italic, Underline, Strike, Heading H1-H4, BulletList, OrderedList, Blockquote, CodeBlock, Table, HorizontalRule, Image, YouTube
**TASK-FE-4.1.3** `[x]` Buat halaman editor `app/(dashboard)/dashboard/articles/[id]/page.tsx` — full screen
**TASK-FE-4.1.4** `[x]` Settings drawer: visibility, excerpt, jadwal publish, slug URL
**TASK-FE-4.1.5** `[x]` Autosave setiap 30 detik — tampilkan status tersimpan/menyimpan
**TASK-FE-4.1.6** `[x]` Tombol Preview
**TASK-FE-4.1.7** `[x]` Tombol Terbitkan — panggil publish endpoint, redirect ke daftar artikel
**TASK-FE-4.1.8** `[x]` Commit: `feat(article): add rich text editor with Tiptap`

**TASK-INT-4.1.1** `[x]` Hubungkan editor dengan autosave ke backend
**TASK-INT-4.1.2** `[x]` Hubungkan publish action dengan backend
**TASK-INT-4.1.3** `[x]` Commit: `feat(article): integrate editor with backend`

---

### STORY 4.2 — Upload Gambar ke Artikel
Sebagai author, saya ingin bisa menyisipkan gambar ke dalam artikel, agar konten lebih menarik secara visual.

**TASK-BE-4.2.1** `[x]` Setup Cloudinary SDK di backend
**TASK-BE-4.2.2** `[x]` Buat `cloudinary.service.ts` — generate signed upload URL
**TASK-BE-4.2.3** `[x]` Endpoint `GET /media/upload-url` — return signed upload params untuk Cloudinary (authenticated)
**TASK-BE-4.2.4** `[x]` Commit: `feat(media): add Cloudinary signed upload URL endpoint`

**TASK-FE-4.2.1** `[x]` Integrasi Tiptap Image extension dengan Cloudinary direct upload
**TASK-FE-4.2.2** `[x]` Upload flow: minta signed URL dari backend → upload langsung ke Cloudinary → insert URL ke editor
**TASK-FE-4.2.3** `[x]` Tambahkan upload cover image di settings drawer
**TASK-FE-4.2.4** `[x]` Commit: `feat(media): integrate Cloudinary image upload in editor`

---

### STORY 4.3 — Manajemen Artikel di Dashboard
Sebagai author/owner, saya ingin bisa melihat semua artikel dalam satu tampilan, agar saya bisa mengelola konten dengan mudah.

**TASK-BE-4.3.1** `[x]` Endpoint `GET /publications/:pubId/articles` — list semua artikel dengan pagination, filter status dan author
**TASK-BE-4.3.2** `[x]` Commit: `feat(article): add article list endpoint with filters`

**TASK-FE-4.3.1** `[x]` Buat halaman `dashboard/articles/page.tsx` (Client Component)
**TASK-FE-4.3.2** `[x]` Tabel artikel: judul, tag, author, status badge, views, tanggal
**TASK-FE-4.3.3** `[x]` Filter: tab Semua/Terbit/Draft/Terjadwal + search judul
**TASK-FE-4.3.4** `[x]` Pagination dengan cursor-based
**TASK-FE-4.3.5** `[x]` Tombol "Tulis baru" → buat draft baru dan redirect ke editor
**TASK-FE-4.3.6** `[x]` Hapus artikel dari tabel
**TASK-FE-4.3.7** `[x]` Commit: `feat(article): add article management dashboard page`

**TASK-INT-4.3.1** `[x]` Integrasi halaman daftar artikel dengan backend
**TASK-INT-4.3.2** `[x]` Commit: `feat(article): integrate article list with backend`

---

### STORY 4.4 — Series Artikel
Sebagai author, saya ingin bisa mengelompokkan artikel ke dalam sebuah series, agar pembaca bisa mengikuti konten secara terurut.

**TASK-BE-4.4.1** `[x]` Buat `series.schema.ts`, `series.repository.ts`, `series.service.ts`, `series.controller.ts`, `series.router.ts`
**TASK-BE-4.4.2** `[x]` Endpoint `POST /publications/:pubId/series` — buat series baru
**TASK-BE-4.4.3** `[x]` Endpoint `GET /publications/:pubId/series` — list semua series
**TASK-BE-4.4.4** `[x]` Endpoint `GET /publications/:pubId/series/:slug` — detail series + daftar artikel
**TASK-BE-4.4.5** `[x]` Endpoint `PATCH /publications/:pubId/series/:id` — update series
**TASK-BE-4.4.6** `[x]` Endpoint `POST /publications/:pubId/series/:id/articles` — tambah artikel ke series + atur urutan
**TASK-BE-4.4.7** `[x]` Endpoint `DELETE /publications/:pubId/series/:id/articles/:articleId` — remove artikel dari series
**TASK-BE-4.4.8** `[x]` Tracking read progress — PATCH /publications/:pubId/articles/:id/read-progress
**TASK-BE-4.4.9** `[x]` Commit: `feat(series): add series management endpoints`

**TASK-FE-4.4.1** `[x]` Buat halaman `dashboard/series/page.tsx` — list semua series + form create
**TASK-FE-4.4.2** `[x]` Drag-and-drop urutan artikel dalam series — @dnd-kit/sortable
**TASK-FE-4.4.3** `[x]` Halaman series publik — app/(publication)/series/[slug]/page.tsx dengan artikel list
**TASK-FE-4.4.4** `[x]` Progress bar series — visual progress indicator (0/N selesai) di halaman series publik
**TASK-FE-4.4.5** `[x]` Navigasi prev/next series di artikel
**TASK-FE-4.4.6** `[x]` Commit: `feat(series): add series pages frontend`

**TASK-INT-4.4.1** `[x]` Integrasi series dashboard dengan backend
**TASK-INT-4.4.2** `[x]` Commit: `feat(series): integrate series feature end-to-end`

---

## EPIC 5 — Subscription & Payment

### STORY 5.1 — Konfigurasi Paket Subscription
Sebagai owner, saya ingin bisa mengatur harga subscription untuk tiap durasi, agar pembaca bisa memilih paket yang sesuai.

**TASK-BE-5.1.1** `[x]` Buat `subscription.repository.ts` — method untuk plans dan subscriptions
**TASK-BE-5.1.2** `[x]` Endpoint `GET /publications/:pubId/subscription-plans` — list semua plans aktif (public)
**TASK-BE-5.1.3** `[x]` Endpoint `PUT /publications/:pubId/subscription-plans` — update/create semua plans sekaligus (owner only)
**TASK-BE-5.1.4** `[x]` Kalkulasi otomatis persentase hemat vs harga bulanan
**TASK-BE-5.1.5** `[x]` Commit: `feat(subscription): add subscription plans management`

**TASK-FE-5.1.1** `[x]` Tab Paket Harga di halaman settings: input harga per tier, toggle enable/disable, preview "hemat X%"
**TASK-FE-5.1.2** `[x]` Commit: `feat(subscription): add subscription plans settings UI`

**TASK-INT-5.1.1** `[x]` Integrasi settings paket harga
**TASK-INT-5.1.2** `[x]` Commit: `feat(subscription): integrate subscription plans settings`

---

### STORY 5.2 — Proses Berlangganan
Sebagai pembaca, saya ingin bisa berlangganan ke publication yang saya sukai, agar saya bisa mengakses konten premium.

**TASK-BE-5.2.1** `[x]` Setup Midtrans SDK
**TASK-BE-5.2.2** `[x]` Buat `midtrans.service.ts` — create transaction, verify webhook signature
**TASK-BE-5.2.3** `[x]` Endpoint `POST /publications/:pubId/subscriptions/order` — validasi plan, hitung fee (15%), buat record subscription status `pending`, buat Midtrans transaction, return snap_token
**TASK-BE-5.2.4** `[x]` Endpoint `POST /subscriptions/webhook/midtrans` — verify signature, cek idempotency, update status subscription berdasarkan transaction_status
**TASK-BE-5.2.5** `[x]` Buat `member.middleware.ts` — cek apakah user punya subscription aktif untuk publication ini, cache di Redis (TTL 5 menit)
**TASK-BE-5.2.6** `[x]` Commit: `feat(subscription): add Midtrans payment integration and webhook`

**TASK-FE-5.2.1** `[x]` Buat halaman `app/subscribe/page.tsx` (Client Component)
**TASK-FE-5.2.2** `[x]` Tampilkan semua paket aktif dengan harga, persentase hemat
**TASK-FE-5.2.3** `[x]` Tampilkan ringkasan order di sidebar: paket dipilih, PPN, total
**TASK-FE-5.2.4** `[x]` Pilihan metode pembayaran — ditangani oleh popup Midtrans Snap
**TASK-FE-5.2.5** `[x]` Integrasi Midtrans Snap.js — tampilkan popup pembayaran
**TASK-FE-5.2.6** `[x]` Handle callback sukses: redirect ke `next` / `/me/subscription`
**TASK-FE-5.2.7** `[x]` Handle callback gagal: tampilkan pesan error dan opsi coba lagi
**TASK-FE-5.2.8** `[x]` Commit: `feat(subscription): add subscribe and checkout page`

**TASK-INT-5.2.1** `[x]` Integrasi checkout dengan backend dan Midtrans
**TASK-INT-5.2.2** `[ ]` ~~Test end-to-end: pilih paket → bayar (sandbox) → akses konten premium~~ BLOCKED: butuh manual test
**TASK-INT-5.2.3** `[x]` Commit: `feat(subscription): integrate payment flow end-to-end`

---

### STORY 5.3 — Manajemen Subscription Member ⚠️ NEEDS FIX (/me/subscription harus pindah ke konteks publication — fix di EPIC 13)
Sebagai member, saya ingin bisa melihat status subscription saya dan riwayat transaksi, agar saya tahu kapan subscription saya berakhir.

**TASK-BE-5.3.1** `[x]` Endpoint `GET /subscriptions/me` — status subscription aktif user yang login
**TASK-BE-5.3.2** `[x]` Endpoint `GET /subscriptions/me/history` — riwayat semua transaksi
**TASK-BE-5.3.3** `[x]` Endpoint `DELETE /subscriptions/:id` — cancel subscription (akses tetap aktif hingga expired)
**TASK-BE-5.3.4** `[x]` Commit: `feat(subscription): add member subscription management endpoints`

**TASK-FE-5.3.1** `[x]` Buat halaman `app/me/subscription/page.tsx` — status paket aktif, progress bar, tabel riwayat, tombol cancel
**TASK-FE-5.3.2** `[x]` Commit: `feat(subscription): add member subscription settings page`

**TASK-INT-5.3.1** `[x]` Integrasi halaman subscription settings
**TASK-INT-5.3.2** `[x]` Commit: `feat(subscription): integrate member subscription management`

---

## EPIC 6 — Reader Experience

### STORY 6.1 — Homepage Publication
Sebagai pengunjung, saya ingin bisa melihat homepage publication dengan daftar artikel terbaru dan informasi tentang para penulis.

**TASK-BE-6.1.1** `[x]` Endpoint `GET /publications/:pubId/articles` — list artikel publik dengan pagination
**TASK-BE-6.1.2** `[x]` Endpoint `GET /publications/:pubId/authors` — list semua author dengan bio
**TASK-BE-6.1.3** `[x]` Commit: `feat(reader): add public article list and author list endpoints`

**TASK-FE-6.1.1** `[x]` Buat layout `app/(publication)/layout.tsx`
**TASK-FE-6.1.2** `[x]` Buat halaman `app/(publication)/page.tsx` (Cache Component)
**TASK-FE-6.1.3** `[x]` Section hero: tagline, deskripsi, CTA berlangganan + baca gratis, stats
**TASK-FE-6.1.4** `[x]` Section artikel: featured article, grid artikel lainnya, badge PREMIUM
**TASK-FE-6.1.5** `[x]` Section penulis: card tiap author
**TASK-FE-6.1.6** `[x]` Navbar: logo, menu, search icon, Library icon, tombol Masuk / Berlangganan
**TASK-FE-6.1.7** `[x]` `generateMetadata` untuk SEO
**TASK-FE-6.1.8** `[x]` Commit: `feat(reader): add publication homepage`

**TASK-INT-6.1.1** `[x]` Integrasi homepage dengan backend
**TASK-INT-6.1.2** `[x]` Commit: `feat(reader): integrate publication homepage`

---

### STORY 6.2 — Membaca Artikel ⚠️ NEEDS FIX (cut-off subscription saat pindah halaman belum diimplementasi — fix di EPIC 13)
Sebagai pembaca, saya ingin bisa membaca artikel dengan nyaman.

**TASK-BE-6.2.1** `[x]` Untuk artikel premium, cek subscription user, return konten penuh jika member atau return excerpt saja jika bukan
**TASK-BE-6.2.2** `[x]` Endpoint `POST /publications/:pubId/articles/:id/view` — increment view count
**TASK-BE-6.2.3** `[x]` Commit: `feat(reader): add article access control and view tracking`

**TASK-FE-6.2.1** `[x]` Buat halaman `app/(publication)/[articleSlug]/page.tsx`
**TASK-FE-6.2.2** `[x]` Artikel free: Cache Component dengan `cacheLife('hours')` dan `cacheTag`
**TASK-FE-6.2.3** `[x]` Artikel premium: request-time (tidak di-cache), cek subscription server-side
**TASK-FE-6.2.4** `[x]` Layout artikel: cover image, badge tag + PREMIUM, judul, excerpt, info author
**TASK-FE-6.2.5** `[x]` Konten artikel: render Tiptap JSON ke HTML, max-width ~680px
**TASK-FE-6.2.6** `[x]` Progress bar reading — sticky di atas halaman
**TASK-FE-6.2.7** `[x]` Action bar: tombol like, tombol save ke folder, tombol share
**TASK-FE-6.2.8** `[x]` Author bio section di bawah artikel
**TASK-FE-6.2.9** `[x]` Navigasi prev/next artikel jika bagian dari series
**TASK-FE-6.2.10** `[x]` `generateMetadata`
**TASK-FE-6.2.11** `[x]` Commit: `feat(reader): add article reader page`

**TASK-INT-6.2.1** `[x]` Integrasi halaman artikel dengan backend
**TASK-INT-6.2.2** `[ ]` ~~Test: artikel free bisa dibaca semua, artikel premium terblock untuk non-member~~ BLOCKED: menunggu manual testing
**TASK-INT-6.2.3** `[x]` Commit: `feat(reader): integrate article reader`

---

### STORY 6.3 — Paywall
Sebagai non-member yang membaca artikel premium, saya ingin melihat CTA berlangganan yang menarik.

**TASK-FE-6.3.1** `[x]` Buat komponen `ArticlePaywall.tsx` (Server Component)
**TASK-FE-6.3.2** `[x]` Tampilkan preview konten (±200 kata pertama) dengan fade-out effect
**TASK-FE-6.3.3** `[x]` CTA card: "Selebihnya tersedia untuk member" + benefit + tombol Berlangganan + link Masuk
**TASK-FE-6.3.4** `[x]` Tidak ada referensi free trial apapun
**TASK-FE-6.3.5** `[x]` Commit: `feat(reader): add paywall component`

---

### STORY 6.4 — Like Artikel
Sebagai pengunjung, saya ingin bisa memberikan like pada artikel yang saya sukai.

**TASK-BE-6.4.1** `[x]` Endpoint `POST /publications/:pubId/articles/:id/like` — toggle like (authenticated)
**TASK-BE-6.4.2** `[x]` Endpoint `GET /publications/:pubId/articles/:id/like` — cek apakah user sudah like
**TASK-BE-6.4.3** `[x]` Commit: `feat(reader): add article like endpoint`

**TASK-FE-6.4.1** `[x]` Buat komponen `ArticleLikeButton.tsx` (Client Component)
**TASK-FE-6.4.2** `[x]` Non-member bisa like artikel free; member bisa like semua artikel
**TASK-FE-6.4.3** `[x]` Commit: `feat(reader): add article like button`

**TASK-INT-6.4.1** `[x]` Integrasi like button dengan backend
**TASK-INT-6.4.2** `[x]` Commit: `feat(reader): integrate article like`

---

## EPIC 7 — Email & Notifikasi

### STORY 7.1 — Setup Email Service
Sebagai developer, saya ingin sistem email ter-setup dengan benar.

**TASK-BE-7.1.1** `[x]` Setup Resend SDK
**TASK-BE-7.1.2** `[x]` Buat `email.service.ts` — method generic `sendEmail`
**TASK-BE-7.1.3** `[x]` Setup BullMQ untuk email queue dengan Redis
**TASK-BE-7.1.4** `[x]` Buat email worker yang consume job dari queue
**TASK-BE-7.1.5** `[x]` Commit: `feat(email): setup Resend email service with BullMQ queue`

---

### STORY 7.2 — Email Transaksional ⚠️ NEEDS FIX (reminder 1 hari belum ada — fix di EPIC 13)
Sebagai user, saya ingin menerima email konfirmasi untuk setiap aksi penting.

**TASK-BE-7.2.1** `[x]` Buat template email verifikasi akun
**TASK-BE-7.2.2** `[x]` Buat template email reset password
**TASK-BE-7.2.3** `[x]` Buat template email konfirmasi subscription berhasil
**TASK-BE-7.2.4** `[x]` Buat template email reminder subscription akan berakhir (7 hari sebelum)
**TASK-BE-7.2.5** `[x]` Buat template email notifikasi subscription berakhir
**TASK-BE-7.2.6** `[x]` Background job: cek subscription yang akan berakhir dalam 7 hari, kirim reminder
**TASK-BE-7.2.7** `[x]` Commit: `feat(email): add all transactional email templates and jobs`

---

### STORY 7.3 — Notifikasi Artikel Baru
Sebagai subscriber, saya ingin mendapat notifikasi email saat ada artikel baru.

**TASK-BE-7.3.1** `[x]` Buat template email notifikasi artikel baru: judul, excerpt, cover image, CTA baca artikel
**TASK-BE-7.3.2** `[x]` Saat artikel dipublish: enqueue email job ke semua subscriber yang opt-in
**TASK-BE-7.3.3** `[x]` Endpoint `GET /email/unsubscribe?token=xxx` — update `email_preferences.new_article = false`
**TASK-BE-7.3.4** `[x]` Setiap email newsletter menyertakan unsubscribe link dengan signed token
**TASK-BE-7.3.5** `[x]` Commit: `feat(email): add new article notification email`

**TASK-FE-7.3.1** `[x]` Di profile settings, tambahkan toggle preferensi email notifikasi artikel baru
**TASK-FE-7.3.2** `[x]` Commit: `feat(email): add email preferences UI`

---

## EPIC 8 — Dashboard & Analytics

### STORY 8.1 — Dashboard Overview
Sebagai owner, saya ingin melihat ringkasan performa publication saya dalam satu halaman.

**TASK-BE-8.1.1** `[x]` Buat `analytics.service.ts`
**TASK-BE-8.1.2** `[x]` Endpoint `GET /publications/:pubId/analytics/overview`
**TASK-BE-8.1.3** `[x]` Endpoint `GET /publications/:pubId/analytics/subscribers-chart?range=`
**TASK-BE-8.1.4** `[x]` Commit: `feat(analytics): add overview analytics endpoint`

**TASK-FE-8.1.1** `[x]` Buat halaman `dashboard/page.tsx` (Client Component)
**TASK-FE-8.1.2** `[x]` 4 stats card: Subscriber Aktif, MRR, Total Views, Total Artikel
**TASK-FE-8.1.3** `[x]` Chart subscriber baru (Recharts LineChart)
**TASK-FE-8.1.4** `[x]` Tabel top artikel by views
**TASK-FE-8.1.5** `[x]` Tombol "Lihat publication" dan "Tulis baru" di header
**TASK-FE-8.1.6** `[x]` Commit: `feat(analytics): add dashboard overview page`

**TASK-INT-8.1.1** `[x]` Integrasi dashboard dengan backend
**TASK-INT-8.1.2** `[x]` Commit: `feat(analytics): integrate dashboard overview`

---

### STORY 8.2 — Manajemen Subscriber
Sebagai owner, saya ingin melihat daftar lengkap subscriber saya.

**TASK-BE-8.2.1** `[x]` Endpoint `GET /publications/:pubId/analytics/subscribers`
**TASK-BE-8.2.2** `[x]` Endpoint `GET /publications/:pubId/analytics/subscribers/export` — generate dan return CSV
**TASK-BE-8.2.3** `[x]` Commit: `feat(analytics): add subscriber list and CSV export endpoints`

**TASK-FE-8.2.1** `[x]` Buat halaman `dashboard/subscribers/page.tsx`
**TASK-FE-8.2.2** `[x]` Tabel: avatar, nama, email, paket aktif, tanggal subscribe, status
**TASK-FE-8.2.3** `[x]` Filter by status, search by nama/email, load more pagination
**TASK-FE-8.2.4** `[x]` Tombol Export CSV
**TASK-FE-8.2.5** `[x]` Commit: `feat(analytics): add subscriber management page`

**TASK-INT-8.2.1** `[x]` Integrasi subscriber list dan export
**TASK-INT-8.2.2** `[x]` Commit: `feat(analytics): integrate subscriber management`

---

## EPIC 9 — Pre-Launch & Production

### STORY 9.1 — Security Hardening
Sebagai operator platform, saya ingin memastikan platform aman sebelum diluncurkan.

**TASK-9.1.1** `[x]` Audit semua endpoint: pastikan semua query repository include `publicationId`
**TASK-9.1.2** `[x]` Pastikan rate limiting aktif di semua endpoint auth
**TASK-9.1.3** `[x]` Pastikan webhook Midtrans verify signature sebelum proses
**TASK-9.1.4** `[x]` Pastikan tidak ada API key atau secret yang ter-commit di git
**TASK-9.1.5** `[x]` Cross-publication access: dikonfirmasi aman
**TASK-9.1.6** `[x]` Commit: `chore(security): security audit and hardening`

---

### STORY 9.2 — Deployment
Sebagai operator platform, saya ingin platform ter-deploy dan bisa diakses secara publik.

**TASK-9.2.1** `[ ]` Setup project di Railway/Render untuk backend
**TASK-9.2.2** `[ ]` Setup PostgreSQL dan Redis di Railway
**TASK-9.2.3** `[ ]` Setup project di Vercel untuk frontend
**TASK-9.2.4** `[ ]` Konfigurasi semua environment variables di staging
**TASK-9.2.5** `[ ]` Test deployment staging: semua flow berjalan
**TASK-9.2.6** `[ ]` Switch Midtrans ke production mode
**TASK-9.2.7** `[ ]` Deploy ke production
**TASK-9.2.8** `[ ]` Setup monitoring dasar (uptime check)
**TASK-9.2.9** `[ ]` Commit: `chore(deploy): production deployment setup`

---

## EPIC 10 — Platform Admin

### STORY 10.1 — Seed Platform Admin
Sebagai operator platform, saya ingin ada akun admin yang sudah ter-seed.

**TASK-BE-10.1.1** `[x]` Tambahkan role platform_admin di Prisma schema dan migration
**TASK-BE-10.1.2** `[x]` Update seed.ts — buat user admin: email: admin@lentera.id, password: Admin123!, role: platform_admin
**TASK-BE-10.1.3** `[x]` Buat adminGuard middleware — cek role platform_admin, jika bukan → 403
**TASK-INT-10.1.1** `[x]` Jalankan seed ulang, verifikasi login admin berhasil
**TASK-INT-10.1.2** `[x]` Commit: `feat(admin): add platform admin role and seed`

---

### STORY 10.2 — Admin Dashboard
Sebagai platform admin, saya ingin lihat overview semua publications dan users.

**TASK-BE-10.2.1** `[x]` Endpoint GET /admin/overview — return: total publications, total users, total revenue, platform fee collected
**TASK-BE-10.2.2** `[x]` Endpoint GET /admin/publications — list semua publication dengan owner, subscriber count, revenue
**TASK-BE-10.2.3** `[x]` Endpoint GET /admin/users — list semua user terdaftar
**TASK-FE-10.2.1** `[x]` Halaman /admin — redirect ke /admin/dashboard jika platform_admin, tampil 404 jika bukan
**TASK-FE-10.2.2** `[x]` Halaman /admin/dashboard — stats cards + tabel publications + tabel users
**TASK-FE-10.2.3** `[x]` Sidebar admin: Dashboard, Publications, Invite Owner
**TASK-INT-10.2.1** `[x]` Integrasi admin dashboard dengan backend
**TASK-INT-10.2.2** `[x]` Commit: `feat(admin): add admin dashboard page`

---

### STORY 10.3 — Invite Owner
Sebagai platform admin, saya ingin invite calon owner via email.

**TASK-BE-10.3.1** `[x]` Endpoint POST /admin/invite-owner: input nama, email, nama_publication → buat publication draft → buat invite token di Redis TTL 7 hari → kirim email invite via Resend
**TASK-BE-10.3.2** `[x]` Endpoint GET /auth/accept-owner-invite?token=xxx → validasi token → redirect ke /register?invite=xxx&email=xxx
**TASK-BE-10.3.3** `[x]` Update register flow: jika ada invite token, setelah register langsung jadi owner publication yang sudah disiapkan
**TASK-FE-10.3.1** `[x]` Halaman /admin/invite — form invite owner (nama, email, nama publication)
**TASK-FE-10.3.2** `[x]` Halaman /register?invite=xxx — form register khusus, email pre-filled
**TASK-FE-10.3.3** `[x]` Email template: invite owner berisi nama, nama publication, dan link accept invite
**TASK-INT-10.3.1** `[x]` Test flow lengkap: admin invite → email masuk → klik link → register → langsung masuk dashboard publication
**TASK-INT-10.3.2** `[x]` Commit: `feat(admin): add invite owner flow`

---

## EPIC 11 — UX Gaps Fix

### STORY 11.1 — Payment Success Page
Sebagai reader yang baru subscribe, saya ingin melihat halaman konfirmasi setelah bayar.

**TASK-BE-11.1.1** `[x]` Update subscription order endpoint: simpan ?next= URL artikel yang dituju di Redis bersama order_id
**TASK-FE-11.1.1** `[x]` Buat halaman /payment/success: tampil pesan sukses, info paket aktif, tanggal berakhir, CTA "Baca artikel"
**TASK-FE-11.1.2** `[x]` Update /subscribe: setelah Midtrans Snap close dengan status success → redirect ke /payment/success?next=[artikel-slug]
**TASK-INT-11.1.1** `[x]` Test flow: subscribe → bayar → redirect /payment/success → klik → baca artikel premium
**TASK-INT-11.1.2** `[x]` Commit: `feat(ux): add payment success page with article redirect`

---

### STORY 11.2 — Onboarding Checklist Dashboard
Sebagai owner baru, saya ingin ada panduan langkah selanjutnya setelah buat publication.

**TASK-BE-11.2.1** `[x]` Endpoint GET /publications/:id/onboarding-status — return: has_subscription_plans, has_articles, has_logo, has_custom_domain
**TASK-FE-11.2.1** `[x]` Buat komponen OnboardingChecklist: tampil di /dashboard jika belum 100% selesai
**TASK-FE-11.2.2** `[x]` Checklist hilang otomatis jika semua item sudah selesai
**TASK-INT-11.2.1** `[x]` Integrasi checklist dengan backend
**TASK-INT-11.2.2** `[x]` Commit: `feat(ux): add onboarding checklist for new publication owners`

---

### STORY 11.3 — Subscribe dengan Context Artikel
Sebagai reader yang kena paywall, saya ingin setelah subscribe langsung diarahkan ke artikel yang ingin saya baca.

**TASK-FE-11.3.1** `[x]` Update paywall CTA: link berlangganan menyertakan ?next=[article-slug]
**TASK-FE-11.3.2** `[x]` Update /subscribe: baca query param ?next, simpan di state, teruskan ke payment success redirect
**TASK-INT-11.3.1** `[x]` Test: klik paywall → subscribe → bayar → otomatis redirect ke artikel yang tadi diklik
**TASK-INT-11.3.2** `[x]` Commit: `feat(ux): preserve article context through subscribe flow`

---

### STORY 11.4 — Logo Upload yang Berfungsi
Sebagai owner, saya ingin bisa upload logo publication.

**TASK-BE-11.4.1** `[x]` Pastikan endpoint PATCH /publications/:id menerima dan menyimpan logo_url dengan benar
**TASK-FE-11.4.1** `[x]` Fix logo upload di /dashboard/settings: gunakan signed upload URL Cloudinary, setelah upload update logo_url, tampilkan preview
**TASK-INT-11.4.1** `[x]` Test: upload logo → tampil di homepage publication
**TASK-INT-11.4.2** `[x]` Commit: `feat(ux): fix logo upload functionality`

---

## EPIC 12 — Routing & Auth Fix

### STORY 12.1 — Redirect Logic Berdasarkan Role
Sebagai user yang login, saya ingin diarahkan ke halaman yang tepat berdasarkan role saya.

**TASK-BE-12.1.1** `[x]` Pastikan JWT payload include role: platform_admin, owner, author, atau member
**TASK-FE-12.1.1** `[x]` Update redirect setelah login: platform_admin → /admin/dashboard, owner/author → /dashboard, member/reader → /
**TASK-FE-12.1.2** `[x]` Update proxy.ts: akses /admin tanpa role platform_admin → redirect ke /404
**TASK-FE-12.1.3** `[x]` Update proxy.ts: akses /dashboard tanpa login → redirect ke /login
**TASK-INT-12.1.1** `[x]` Test semua skenario login redirect
**TASK-INT-12.1.2** `[x]` Commit: `feat(auth): add role-based redirect after login`

---

### STORY 12.2 — Homepage Platform
Sebagai user yang buka aplikasi tanpa context publication, saya ingin melihat halaman yang informatif.

**TASK-FE-12.2.1** `[x]` Buat halaman / untuk konteks platform: belum login → landing page simpel dengan logo, tagline, tombol Masuk
**TASK-FE-12.2.2** `[x]` Landing page: logo Lentera, tagline singkat, tombol Masuk → /login
**TASK-FE-12.2.3** `[x]` Jika sudah login: platform_admin → redirect /admin/dashboard, owner → redirect /dashboard
**TASK-INT-12.2.1** `[x]` Test: buka localhost:3000 → lihat landing page atau redirect sesuai role
**TASK-INT-12.2.2** `[x]` Commit: `feat(ux): add platform homepage with role-based redirect`

---

## EPIC 13 — Auth & Core Flow Fixes (Hasil Grill Me)

> Semua task di EPIC ini adalah perbaikan atas gap yang ditemukan di sesi Grill Me.
> Kerjakan EPIC ini sebagai prioritas utama sebelum EPIC 14–17.

---

### STORY 13.1 — Refresh Token Scoped per Publication
Sebagai member, saya ingin session saya terisolasi per publication, agar login di satu publication tidak bisa dipakai di publication lain.

**TASK-BE-13.1.1** `[x]` Update `auth.service.ts` — method `login`: sertakan `publicationId` dalam payload refresh token di Redis. Key pattern: `refresh:{userId}:{publicationId}:{tokenId}`
**TASK-BE-13.1.2** `[x]` Update `auth.service.ts` — method `refresh`: validasi bahwa refresh token yang dipakai cocok dengan `publicationId` dari request context (ambil dari `req.publication` via tenant middleware)
**TASK-BE-13.1.3** `[x]` Update `auth.service.ts` — method `logout`: hapus hanya refresh token untuk `publicationId` yang sedang diakses, bukan semua session user
**TASK-BE-13.1.4** `[x]` Update `auth.middleware.ts` — saat verify JWT, pastikan `publicationId` dalam token cocok dengan `publicationId` dari tenant middleware
**TASK-BE-13.1.5** `[x]` Buat migration Prisma jika perlu tambah field `publicationId` di tabel session/token (tidak perlu — pakai Redis key dengan publicationId)
**TASK-BE-13.1.6** `[x]` Commit: `feat(auth): scope refresh token per publication`

**TASK-INT-13.1.1** `[ ]` ~~Test: login di publication A → coba pakai token di publication B → harus gagal (401)~~ BLOCKED: menunggu manual testing
**TASK-INT-13.1.2** `[ ]` ~~Test: logout di publication A → session di publication B (jika ada) tetap aktif~~ BLOCKED: menunggu manual testing
**TASK-INT-13.1.3** `[x]` Commit: `test(auth): verify publication-scoped token isolation`

---

### STORY 13.2 — Google OAuth Hanya untuk Member
Sebagai platform, saya ingin Google OAuth hanya tersedia untuk member/visitor.

**TASK-BE-13.2.1** `[x]` Update `auth.service.ts` — handleGoogleUser(): cek role platform_admin dan publication owner/author → tolak dengan error USE_PASSWORD
**TASK-BE-13.2.2** `[x]` Update `GET /auth/google/callback` — jika user yang login via Google adalah publication owner atau admin, redirect ke /login?error=use_password
**TASK-BE-13.2.3** `[x]` Commit: `feat(auth): restrict Google OAuth to member role only`

**TASK-FE-13.2.1** `[x]` Update halaman login: tombol Google tetap ada tapi backend menolak jika owner/admin dengan error use_password
**TASK-FE-13.2.2** `[x]` Update halaman login: handle error=use_password dari URL param
**TASK-FE-13.2.3** `[x]` Tambah handling error `use_password`: tampilkan pesan "Akun ini terdaftar dengan email/password. Silakan login menggunakan form di bawah."
**TASK-FE-13.2.4** `[x]` Commit: `feat(auth): handle use_password error on login page`

---

### STORY 13.3 — Forgot Password untuk Akun Google OAuth
Sebagai member yang hanya login via Google, saya ingin mendapat informasi yang jelas saat klik "lupa password".

**TASK-BE-13.3.1** `[x]` Update `POST /auth/forgot-password`: cek apakah email adalah akun OAuth-only (tidak punya `password_hash`). Jika ya, kirim email khusus: "Akun kamu terdaftar via Google. Silakan gunakan tombol Login dengan Google."
**TASK-BE-13.3.2** `[x]` Buat template email "akun terdaftar via Google" (`googleAccountInfo`)
**TASK-BE-13.3.3** `[x]` Commit: `feat(auth): handle forgot password for OAuth-only accounts`

**TASK-FE-13.3.1** `[x]` Halaman forgot-password: pesan konfirmasi tetap sama ("cek email kamu") — tidak expose apakah email terdaftar atau tidak (sudah benar)
**TASK-FE-13.3.2** `[x]` Commit: `feat(auth): update forgot password page messaging`

---

### STORY 13.4 — Rate Limiting Login: Lockout Setelah 5x Gagal
Sebagai platform, saya ingin memblokir sementara akun yang gagal login berkali-kali.

**TASK-BE-13.4.1** `[x]` Update `auth.service.ts` — method `login`: setelah password salah, increment counter di Redis. Key: `login_attempts:{email}:{publicationId}`, TTL 15 menit
**TASK-BE-13.4.2** `[x]` Setelah 5x gagal dalam 15 menit → return error 429: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit."
**TASK-BE-13.4.3** `[x]` Setelah login berhasil, hapus counter dari Redis
**TASK-BE-13.4.4** `[x]` Commit: `feat(auth): add login attempt lockout after 5 failures`

**TASK-FE-13.4.1** `[x]` Update halaman login: tampilkan pesan error yang jelas saat terkena lockout (LOGIN_LOCKED error code)
**TASK-FE-13.4.2** `[x]` Commit: `feat(auth): display lockout message on login page`

---

### STORY 13.5 — Pindahkan Member Settings ke Dalam Konteks Publication
Sebagai member, saya ingin kelola akun saya dalam konteks publication yang saya gunakan, agar tidak ada referensi ke platform Lentera.

**TASK-BE-13.5.1** `[x]` Pastikan endpoint `PATCH /users/me` dan `PATCH /users/me/password` bisa diakses dari konteks publication (sudah bisa — tidak ada tenant restriction)
**TASK-BE-13.5.2** `[x]` Pastikan endpoint `GET /subscriptions/me` dan `DELETE /subscriptions/:id` bekerja dalam konteks publication (sudah bisa)
**TASK-BE-13.5.3** `[x]` Commit: `chore(auth): verify member settings endpoints work in publication context`

**TASK-FE-13.5.1** `[x]` Buat halaman `app/(publication)/settings/page.tsx` — profil + password + email preferences
**TASK-FE-13.5.2** `[x]` Buat halaman `app/(publication)/subscription/page.tsx` — subscription aktif + riwayat transaksi
**TASK-FE-13.5.3** `[ ]` ~~Update navbar publication: link settings dan subscription~~ BLOCKED: navbar update perlu context pub yang sudah login sebagai member — skip untuk sesi ini
**TASK-FE-13.5.4** `[x]` Redirect `app/me/settings/page.tsx` → `/settings`
**TASK-FE-13.5.5** `[x]` Redirect `app/me/subscription/page.tsx` → `/subscription`
**TASK-FE-13.5.6** `[x]` Commit: `feat(auth): move member settings to publication context`

**TASK-INT-13.5.1** `[ ]` ~~Test: akses `/me/settings` → redirect ke settings dalam konteks publication~~ BLOCKED: menunggu manual testing
**TASK-INT-13.5.2** `[ ]` ~~Test: settings dan subscription berfungsi dengan benar dalam konteks publication~~ BLOCKED: menunggu manual testing
**TASK-INT-13.5.3** `[x]` Commit: `feat(auth): integrate member settings in publication context`

---

### STORY 13.6 — Subscription Cut-off Saat Pindah Halaman
Sebagai platform, saya ingin subscription yang expired langsung ter-cut-off saat member berpindah halaman.

**TASK-BE-13.6.1** `[x]` Pastikan `member.middleware.ts` selalu cek subscription status fresh dari Redis/DB setiap request ke artikel premium (sudah benar)
**TASK-BE-13.6.2** `[x]` BullMQ job `expire-subscriptions` tiap 10 menit — update status ke `expired` dan invalidate Redis member cache
**TASK-BE-13.6.3** `[x]` Commit: `feat(subscription): ensure real-time subscription status check on page navigation`

**TASK-FE-13.6.1** `[x]` `app/(publication)/[articleSlug]/page.tsx`: sudah cek subscription server-side per render (confirmed by audit — lines 248-256)
**TASK-FE-13.6.2** `[x]` Cut-off hanya saat navigasi ke halaman baru (server-side check, tidak interrupt mid-read)
**TASK-FE-13.6.3** `[x]` Commit: `feat(subscription): implement page-navigation subscription cutoff`

---

### STORY 13.7 — Email Reminder 1 Hari Sebelum Expired
Sebagai member, saya ingin diingatkan 1 hari sebelum subscription saya berakhir.

**TASK-BE-13.7.1** `[x]` Update background job di `email.jobs.ts`: tambah job `subscription-expiry-reminders-1day` jam 09:00 (offset dari 7-day job jam 08:00)
**TASK-BE-13.7.2** `[x]` Buat template email "reminder 1 hari sebelum berakhir" — tone lebih urgent (⚠️ berakhir besok!)
**TASK-BE-13.7.3** `[x]` Tidak ada duplikasi — window cek 20–28 jam tidak overlap dengan window 7-hari (144–192 jam)
**TASK-BE-13.7.4** `[x]` Commit: `feat(email): add 1-day before expiry reminder email`

---

### STORY 13.8 — Email Bounce Handling
Sebagai platform, saya ingin menghentikan pengiriman email ke alamat yang selalu bounce.

**TASK-BE-13.8.1** `[x]` Tambah field `emailBounceCount` (int, default 0) dan `emailBounced` (boolean, default false) di tabel Users — migration `20260601_add_email_bounce_fields`
**TASK-BE-13.8.2** `[x]` Setup Resend webhook untuk event `email.bounced` — endpoint `POST /email/webhook/resend`
**TASK-BE-13.8.3** `[x]` Handler webhook bounce: increment `emailBounceCount`. Jika `>= 3`, set `emailBounced = true`
**TASK-BE-13.8.4** `[x]` Update reminder jobs (7-day dan 1-day): cek `emailBounced` sebelum kirim, skip jika true
**TASK-BE-13.8.5** `[x]` Commit: `feat(email): add email bounce tracking and auto-suppression`

---

### STORY 13.9 — Ikon Gembok dan Prompt Subscribe di Halaman Series
Sebagai visitor yang melihat daftar artikel dalam series, saya ingin tahu artikel mana yang premium sebelum klik.

**TASK-FE-13.9.1** `[x]` Update `app/(publication)/series/[slug]/page.tsx` — artikel premium tampilkan ikon gembok (Lock icon dari lucide-react)
**TASK-FE-13.9.2** `[x]` Klik artikel premium (non-logged-in): tampilkan modal subscribe langsung dengan judul artikel, CTA Berlangganan, link Masuk
**TASK-FE-13.9.3** `[x]` User yang sudah login: ikon gembok tetap muncul di artikel premium tapi klik langsung navigate ke artikel (paywall di halaman artikel)
**TASK-FE-13.9.4** `[x]` Commit: `feat(reader): add lock icon and subscribe modal for premium articles in series`

---

## EPIC 14 — Tiga Role dalam Publication (OWNER, ADMIN, AUTHOR)

---

### STORY 14.1 — Tambah Role ADMIN untuk Publication
Sebagai owner publication, saya ingin bisa memberikan role Admin kepada author tertentu.

**TASK-BE-14.1.1** `[x]` Update Prisma schema: enum `AuthorRole` kini `owner | admin | author` — migration `20260601_add_admin_to_author_role`
**TASK-BE-14.1.2** `[x]` Update `roles.middleware.ts` — helper exports: `requireOwner`, `requireOwnerOrAdmin`, `requireAnyRole`
**TASK-BE-14.1.3** `[x]` Update semua endpoint sesuai permission matrix (analytics owner+admin, plans owner+admin, invite owner+admin, dll)
**TASK-BE-14.1.4** `[x]` `PATCH /publications/:id/authors/:userId` — owner only bisa set role; article update/publish/delete AUTHOR hanya bisa untuk artikel sendiri
**TASK-BE-14.1.5** `[x]` Commit: `feat(publication): add ADMIN role with permission matrix`

**TASK-FE-14.1.1** `[x]` Tab Tim di settings: dropdown role (Author / Admin untuk owner-only invite), role badge menampilkan Owner/Admin/Author; inline role change dropdown untuk owner
**TASK-FE-14.1.2** `[x]` DashboardShell: sidebar Audience section disembunyikan untuk AUTHOR; footer menampilkan role aktual
**TASK-FE-14.1.3** `[x]` Commit: `feat(publication): update author management UI for three roles`

**TASK-INT-14.1.1** `[ ]` ~~Test: login sebagai AUTHOR — tidak bisa lihat analytics dan subscription settings~~ BLOCKED: menunggu manual testing
**TASK-INT-14.1.2** `[ ]` ~~Test: login sebagai ADMIN — bisa kelola artikel semua author tapi tidak bisa hapus publication~~ BLOCKED: menunggu manual testing
**TASK-INT-14.1.3** `[ ]` ~~Test: login sebagai OWNER — full access semua fitur~~ BLOCKED: menunggu manual testing
**TASK-INT-14.1.4** `[x]` Commit: `test(publication): verify three-role permission matrix`

---

## EPIC 15 — Platform Admin Enhancements

---

### STORY 15.1 — Konfigurasi Platform Fee per Publication
Sebagai platform admin, saya ingin bisa mengatur platform fee secara berbeda per publication.

**TASK-BE-15.1.1** `[x]` platformFeePercent sudah ada di schema. Migration: 20260601_add_publication_status_and_deletion (includes status fields)
**TASK-BE-15.1.2** `[x]` subscription.service.ts createOrder(): pakai pub.platformFeePercent, bukan hardcode config.platform.feePercent
**TASK-BE-15.1.3** `[x]` PATCH /admin/publications/:id/fee endpoint
**TASK-BE-15.1.4** `[x]` Commit included

**TASK-FE-15.1.1** `[x]` /admin/publications: kolom Platform Fee dengan tombol edit (click on percentage)
**TASK-FE-15.1.2** `[x]` Dialog edit fee: input 0–100, preview "Publication akan menerima X%"
**TASK-FE-15.1.3** `[x]` Commit included

---

### STORY 15.2 — Impersonate Publication Owner
Sebagai platform admin, saya ingin bisa masuk ke dashboard sebagai publication owner untuk debugging.

**TASK-BE-15.2.1** `[x]` POST /admin/impersonate/:userId — return access token dengan isImpersonation: true + impersonatedBy
**TASK-BE-15.2.2** `[x]` auth.middleware.ts: expose isImpersonation + impersonatedBy ke req.user
**TASK-BE-15.2.3** `[x]` middleware/impersonation.middleware.ts: blockImpersonation() blocker
**TASK-BE-15.2.4** `[x]` log.info impersonation event (audit log ke console/logger)
**TASK-BE-15.2.5** `[x]` Commit included

**TASK-FE-15.2.1** `[x]` /admin/publications: tombol "Masuk sebagai Owner" per row
**TASK-FE-15.2.2** `[x]` DashboardShell: banner kuning impersonasi dengan nama target
**TASK-FE-15.2.3** `[x]` "Kembali ke Admin": call /auth/refresh → restore admin token → /admin/dashboard
**TASK-FE-15.2.4** `[x]` Commit included

---

### STORY 15.3 — Suspend Publication Dua Level
Sebagai platform admin, saya ingin bisa suspend publication dengan dua tingkatan.

**TASK-BE-15.3.1** `[x]` PublicationStatus enum + status, suspendReason fields — migration done
**TASK-BE-15.3.2** `[x]` PATCH /admin/publications/:id/suspend — body: { level: 1|2, reason }
**TASK-BE-15.3.3** `[x]` Level 1: suspended_soft + email ke owner
**TASK-BE-15.3.4** `[x]` Level 2: suspended_hard + refund pro-rata + email ke owner
**TASK-BE-15.3.5** `[x]` Refund pro-rata: amount = grossAmount × (daysRemaining / totalDays), mark cancelled (Midtrans refund TODO production)
**TASK-BE-15.3.6** `[x]` PATCH /admin/publications/:id/unsuspend — set active + email
**TASK-BE-15.3.7** `[x]` tenant.middleware.ts: suspended_hard/pending_deletion → 503; suspended_soft → isSuspendedSoft flag
**TASK-BE-15.3.8** `[x]` Commit included

**TASK-FE-15.3.1** `[x]` /admin/publications: badge status + Suspend/Aktifkan buttons
**TASK-FE-15.3.2** `[x]` Dialog suspend: pilih level (card selector), input alasan
**TASK-FE-15.3.3** `[x]` Level 2 dialog: warning tentang refund
**TASK-FE-15.3.4** `[x]` app/suspended/page.tsx — notice page untuk suspended_hard
**TASK-FE-15.3.5** `[ ]` ~~suspended_soft banner di halaman publication~~ SKIP MVP — tenant middleware set isSuspendedSoft, publikasi tetap bisa diakses member
**TASK-FE-15.3.6** `[x]` Commit included

---

### STORY 15.4 — Delete Publication dengan Cooling Period
Sebagai publication owner, saya ingin bisa menghapus publication saya dengan periode pembatalan.

**TASK-BE-15.4.1** `[x]` DELETE /publications/:id — owner only, set pending_deletion + scheduledDeletionAt = +30d
**TASK-BE-15.4.2** `[x]` Refund pro-rata semua subscriber aktif + email ke owner
**TASK-BE-15.4.3** `[x]` POST /publications/:id/cancel-deletion — set active + clear scheduledDeletionAt
**TASK-BE-15.4.4** `[x]` BullMQ job: delete-expired-publications (daily 03:00)
**TASK-BE-15.4.5** `[x]` pending_deletion: tenant.middleware.ts block dengan 503
**TASK-BE-15.4.6** `[x]` Commit included

**TASK-FE-15.4.1** `[x]` Settings: Danger Zone section dengan tombol Hapus Publication
**TASK-FE-15.4.2** `[x]` Dialog: warning + input confirm nama pub + cooling period explanation
**TASK-FE-15.4.3** `[ ]` ~~Halaman konfirmasi dengan countdown~~ SKIP — redirect ke /login setelah delete
**TASK-FE-15.4.4** `[x]` Email template send-publication-deletion-requested
**TASK-FE-15.4.5** `[x]` Commit included

---

### STORY 15.6 — Kelola Platform Staff (platform_owner only)
Sebagai platform_owner, saya ingin bisa menambah dan menghapus platform_admin.

**Catatan:** Story ini bergantung pada EPIC 18 STORY 18.1 (migration `platform_role` field sudah ada).

**TASK-BE-15.6.1** `[ ]` POST /admin/staff — tambah platform_admin baru (platform_owner only)
- Body: `{ email, name }` → buat user dengan `platform_role = 'platform_admin'`
- Kirim email invite dengan temporary password

**TASK-BE-15.6.2** `[ ]` DELETE /admin/staff/:userId — hapus platform_admin (platform_owner only)
**TASK-BE-15.6.3** `[ ]` PATCH /admin/staff/:userId/role — ubah role platform_admin ↔ platform_owner
**TASK-BE-15.6.4** `[ ]` GET /admin/staff — list semua platform staff
**TASK-BE-15.6.5** `[ ]` Commit: `feat(admin): add platform staff management endpoints`

**TASK-FE-15.6.1** `[ ]` `/admin/dashboard`: tambah section "Platform Staff" (visible hanya untuk platform_owner)
**TASK-FE-15.6.2** `[ ]` Tabel staff dengan kolom: nama, email, role, tanggal bergabung
**TASK-FE-15.6.3** `[ ]` Tombol "Tambah Admin" — modal: email + nama
**TASK-FE-15.6.4** `[ ]` Tombol hapus / ubah role per baris (platform_owner only)
**TASK-INT-15.6.1** `[ ]` Commit: `feat(admin): add platform staff management UI`

---

### STORY 15.5 — Transfer Ownership
Sebagai publication owner, saya ingin bisa mentransfer kepemilikan publication ke author lain.

**TASK-BE-15.5.1** `[x]` POST /publications/:id/transfer-ownership — owner, validate newOwner is member, verify password
**TASK-BE-15.5.2** `[x]` Email ke newOwner dengan link accept. Redis token TTL 48h
**TASK-BE-15.5.3** `[x]` POST /publications/:id/accept-ownership-transfer?token=xxx — swap: newOwner→owner, oldOwner→admin
**TASK-BE-15.5.4** `[x]` Email konfirmasi ke kedua pihak
**TASK-BE-15.5.5** `[x]` Commit included

**TASK-FE-15.5.1** `[x]` Settings Danger Zone: Transfer Ownership button (owner only)
**TASK-FE-15.5.2** `[x]` Dialog: dropdown pilih author, input password konfirmasi
**TASK-FE-15.5.3** `[ ]` ~~Halaman accept transfer~~ SKIP MVP — penerima perlu buka link, halaman khusus bisa ditambahkan nanti; backend endpoint sudah ada
**TASK-FE-15.5.4** `[x]` Commit included

---

## EPIC 16 — Onboarding & Platform Landing Page

---

### STORY 16.1 — Onboarding Wizard 3-Step yang Proper
Sebagai publication owner baru yang menerima invite, saya ingin melalui proses onboarding yang jelas dan terarah.

**Flow:**
```
Email invite → klik link → /accept-invite?token=xxx
→ Step 1: Buat akun (nama display, password)
→ Step 2: Setup publication (nama, slug, deskripsi, logo opsional)
→ Step 3: Selesai → dashboard dengan getting started checklist
```

**TASK-BE-16.1.1** `[x]` GET /auth/accept-owner-invite: return JSON `{ email, ownerName, publicationId, publicationName }`
**TASK-BE-16.1.2** `[x]` POST /auth/complete-owner-invite: buat user + update pub (name/slug/desc) + set owner + issue tokens
**TASK-BE-16.1.3** `[x]` GET /publications/check-slug?slug=xxx: return `{ available, suggestion? }` dengan auto-suggestion -2, -3...
**TASK-BE-16.1.4** `[x]` Commit: `feat(onboarding): EPIC 16 backend`

**TASK-FE-16.1.1** `[x]` Rewrite `app/accept-invite/page.tsx` — 3-step wizard dengan StepIndicator (X of 3)
**TASK-FE-16.1.2** `[x]` Step 1: nama + password + konfirmasi, validasi real-time via Zod + react-hook-form
**TASK-FE-16.1.3** `[x]` Step 2: nama pub, slug (auto-dari-nama, editable), deskripsi. Debounce 500ms slug check
**TASK-FE-16.1.4** `[x]` Slug: preview URL `[slug].lentera.id`, suggestion clickable untuk auto-fill
**TASK-FE-16.1.5** `[x]` Step 3: sukses dengan slug display + tombol "Mulai kelola publication"
**TASK-FE-16.1.6** `[x]` /onboarding redirect ke /dashboard (onboarding lama dihapus)
**TASK-FE-16.1.7** `[x]` Commit: `feat(onboarding): EPIC 16 frontend`

**TASK-INT-16.1.1** `[ ]` ~~Test flow lengkap~~ BLOCKED: menunggu manual testing
**TASK-INT-16.1.2** `[ ]` ~~Test slug collision~~ BLOCKED: menunggu manual testing
**TASK-INT-16.1.3** `[x]` Commit included

---

### STORY 16.2 — Getting Started Checklist yang Lebih Lengkap
Sebagai owner baru, saya ingin ada panduan visual di dashboard dengan CTA langsung ke setiap langkah.

**TASK-BE-16.2.1** `[x]` GET /publications/:id/onboarding-status: tambah `has_co_author` field
**TASK-BE-16.2.2** `[x]` Items: has_logo, has_articles, has_subscription_plans (wajib) + has_co_author (opsional)
**TASK-BE-16.2.3** `[x]` Commit included

**TASK-FE-16.2.1** `[x]` Update OnboardingChecklist — CTA link per item
**TASK-FE-16.2.2** `[x]` CTA: logo→settings, artikel→/articles/new, subscription→settings?tab=plans, co-author→settings?tab=authors (badge Opsional)
**TASK-FE-16.2.3** `[x]` Checklist hilang saat semua item wajib selesai
**TASK-FE-16.2.4** `[x]` Commit included

---

### STORY 16.3 — Platform Landing Page yang Proper
Sebagai pengunjung yang membuka lentera.id, saya ingin melihat halaman yang menjelaskan tentang platform.

**TASK-FE-16.3.1** `[x]` Redesign PlatformLanding di (publication)/page.tsx:
  - Hero: logo + tagline + CTA "Mulai sekarang" dan "Pelajari lebih lanjut"
  - Section "Untuk Siapa": Penulis Solo, Tim Penulis, Komunitas & Kreator
  - Section "Fitur Utama": 4 fitur dengan ikon
  - Section "Cara Kerja": 3 langkah
  - Footer: link masuk + admin + copyright
**TASK-FE-16.3.2** `[x]` Redirect logic tetap: platform_admin → /admin/dashboard, owner/author → /dashboard
**TASK-FE-16.3.3** `[x]` Responsive mobile-first (semua section punya md: breakpoints)
**TASK-FE-16.3.4** `[x]` generateMetadata: title "Lentera — Platform Blog Subscription" untuk platform context
**TASK-FE-16.3.5** `[x]` Commit included

---

## EPIC 17 — Seed Data yang Realistis

---

### STORY 17.1 — Seed Data Realistis untuk Development
Sebagai developer, saya ingin seed data yang realistis dan lengkap agar testing manual tidak membingungkan.

**TASK-BE-17.1.1** `[x]` Rewrite `backend/prisma/seed.ts` dengan data komprehensif:

**User yang harus ada:**
- 1 platform owner: `owner@lentera.id` / `Owner123!` — `platform_role: platform_owner`
- 1 platform admin: `admin@lentera.id` / `Admin123!` — `platform_role: platform_admin`
- 1 publication owner: `owner@investasicerdas.id` / `Owner123!` — nama: "Budi Santoso"
- 1 publication admin: `admin-pub@investasicerdas.id` / `Admin123!` — nama: "Sari Dewi"
- 2 author: `author1@investasicerdas.id` / `Author123!`, `author2@investasicerdas.id` / `Author123!`
- 3 member aktif dengan subscription aktif
- 1 member dengan subscription expired
- 1 member tanpa subscription (akun gratis)

**Publication yang harus ada:**
- Nama: "Investasi Cerdas", slug: "investasi-cerdas"
- Status: active, platform fee: 15%
- Deskripsi yang realistis (bukan lorem ipsum)
- Logo: gunakan URL Unsplash atau placeholder yang valid

**Artikel yang harus ada (minimal 8 artikel):**
- 3 artikel free (sudah published, konten penuh bukan lorem ipsum)
- 3 artikel premium (sudah published)
- 1 artikel draft
- 1 artikel scheduled
- Semua artikel punya: cover image (Unsplash URL), excerpt yang proper, reading time yang akurat

**TASK-BE-17.1.2** `[x]` Gunakan gambar dari Unsplash source URL: `https://images.unsplash.com/photo-[id]?w=1200`
**TASK-BE-17.1.3** `[x]` Buat minimal 1 series dengan 3 artikel di dalamnya
**TASK-BE-17.1.4** `[x]` Buat subscription plans: 1 bulan (Rp 49.000), 3 bulan (Rp 129.000), 6 bulan (Rp 239.000), 12 bulan (Rp 449.000)
**TASK-BE-17.1.5** `[x]` Buat subscriptions aktif untuk 3 member test dengan `expiresAt` berbeda (1 minggu lagi, 1 bulan lagi, 2 bulan lagi)
**TASK-BE-17.1.6** `[x]` Tambah file `backend/prisma/SEED_ACCOUNTS.md` — dokumentasi semua akun test beserta password dan rolenya
**TASK-BE-17.1.7** `[ ]` Commit: `chore(db): rewrite seed with realistic data and proper images`

**TASK-INT-17.1.1** `[x]` Jalankan `npx prisma db seed` — pastikan tidak ada error
**TASK-INT-17.1.2** `[ ]` Verifikasi manual: login sebagai masing-masing role, pastikan semua halaman tampil dengan data yang benar dan gambar muncul
**TASK-INT-17.1.3** `[ ]` Commit: `chore(db): verify seed data integrity`

---

## EPIC 18 — Routing Architecture Refactor (Platform vs Publication Separation)

**Konteks:** Routing saat ini tidak mencerminkan pemisahan bersih antara "dunia platform" (operator Lentera) dan "dunia publication" (owner/staff/member). Auth flows tiga user type tercampur, beberapa halaman berada di luar konteks yang benar, dan `(publication)/layout.tsx` tidak berfungsi sebagai tenant resolver.

**Prerequisite:** EPIC 13, 14, 15, 16 selesai terlebih dahulu (karena EPIC 18 akan memindahkan/refactor halaman yang sedang diimplementasi di EPIC tersebut).

---

### STORY 18.1 — Platform Staff Auth Pages

**TASK-FE-18.1.1** `[ ]` Buat `app/admin/login/page.tsx` — Platform staff login
- Melayani BOTH `platform_owner` dan `platform_admin`
- Email+password ONLY, tanpa Google OAuth button
- Form simpel: email, password, submit
- Error handling: wrong credentials, account locked
- Redirect setelah login: `/admin/dashboard`
- Style: platform branding (berbeda dari publication login)

**TASK-FE-18.1.2** `[ ]` Buat `app/admin/forgot-password/page.tsx`
- Form: email input → kirim link reset
- Tidak perlu deteksi OAuth-only (platform staff tidak punya OAuth)

**TASK-FE-18.1.3** `[ ]` Buat `app/admin/reset-password/page.tsx`
- Query param: `?token=xxx`
- Form: new password + confirm password

**TASK-BE-18.1.1** `[ ]` Buat endpoint `POST /auth/admin/login`
- Validasi: hanya izinkan user dengan `platform_role IN ('platform_owner', 'platform_admin')`
- Jika `platform_role` null → return 403

**TASK-BE-18.1.2** `[ ]` Update schema Prisma — tambah field `platform_role` di model `User`:
```
platformRole  String?  @map("platform_role")
              // null | 'platform_owner' | 'platform_admin'
```

**TASK-BE-18.1.3** `[ ]` Buat `POST /auth/admin/forgot-password` dan `POST /auth/admin/reset-password`
- Link reset di email: `app.lentera.id/admin/reset-password?token=xxx`

**TASK-BE-18.1.4** `[ ]` Update seed.ts — buat 2 platform accounts:
- `owner@lentera.id` / `Owner123!` — platform_owner
- `admin@lentera.id` / `Admin123!` — platform_admin

**TASK-BE-18.1.5** `[ ]` Commit: `feat(auth): add platform staff auth with owner/admin roles`

---

### STORY 18.2 — Buat Member Auth Pages di `(publication)/`

**Konteks:** Auth pages member dipindah ke `(publication)/` (bukan ke dalam `/admin/`). `/login` di publication = member ONLY + Google OAuth.

**TASK-FE-18.2.1** `[ ]` Pindahkan dan refactor `(auth)/login/` → `(publication)/login/`
- MEMBER ONLY — hapus semua logika staff login
- Selalu tampilkan Google OAuth button
- Post-login redirect: ke `/` (publication homepage)
- Baca publication context dari layout (untuk branding)

**TASK-FE-18.2.2** `[ ]` Pindahkan `(auth)/register/` → `(publication)/register/`
**TASK-FE-18.2.3** `[ ]` Pindahkan `(auth)/verify-email/` → `(publication)/verify-email/`
**TASK-FE-18.2.4** `[ ]` Pindahkan `(auth)/forgot-password/` → `(publication)/forgot-password/`
- Panggil endpoint `/auth/forgot-password` (member)
- Deteksi OAuth-only account

**TASK-FE-18.2.5** `[ ]` Pindahkan `(auth)/reset-password/` → `(publication)/reset-password/`
**TASK-FE-18.2.6** `[ ]` Hapus direktori `app/(auth)/` setelah semua halaman dipindah

**TASK-INT-18.2.1** `[ ]` Verifikasi: member auth flow berjalan dari publication subdomain
**TASK-INT-18.2.2** `[ ]` Commit: `refactor(routing): move member auth pages into (publication) root`

---

### STORY 18.3 — Buat Publication Staff Space di `(publication)/admin/`

**Konteks:** Staff (owner/admin/author) mengakses `slug.lentera.id/admin/*`. Pola konsisten dengan platform admin di `app.lentera.id/admin/*`.

**TASK-FE-18.3.1** `[ ]` Buat `(publication)/admin/layout.tsx`
- Pass-through untuk auth routes (`/admin/login`, `/admin/forgot-password`, `/admin/reset-password`)
- Protect semua route lain: require owner/admin/author role di publication ini

**TASK-FE-18.3.2** `[ ]` Buat `(publication)/admin/login/page.tsx`
- STAFF ONLY — no Google OAuth, no "daftar akun" link
- Panggil endpoint `/auth/staff/login`
- Post-login redirect: `/admin/dashboard`
- Baca publication context dari parent layout (nama publication untuk branding)

**TASK-FE-18.3.3** `[ ]` Buat `(publication)/admin/forgot-password/page.tsx`
- Panggil endpoint `/auth/staff/forgot-password`

**TASK-FE-18.3.4** `[ ]` Buat `(publication)/admin/reset-password/page.tsx`

**TASK-FE-18.3.5** `[ ]` Pindahkan `(dashboard)/dashboard/` → `(publication)/admin/dashboard/`
- Update semua internal links dari `/dashboard/*` → `/admin/dashboard/*`

**TASK-FE-18.3.6** `[ ]` Buat `(publication)/admin/dashboard/layout.tsx`
- Guard: verify owner/admin/author role (double check setelah layout parent)

**TASK-FE-18.3.7** `[ ]` Hapus direktori `app/(dashboard)/` setelah dipindah

**TASK-INT-18.3.1** `[ ]` Verifikasi: staff login di `/admin/login`, dashboard di `/admin/dashboard`
**TASK-INT-18.3.2** `[ ]` Commit: `feat(routing): add publication staff space at (publication)/admin/`

---

### STORY 18.4 — Jadikan `(publication)/layout.tsx` Meaningful

**Konteks:** Saat ini layout hanya `return <>{children}</>`. Harus menjadi tenant resolver dan publication context provider.

**TASK-FE-18.4.1** `[ ]` Implementasi `(publication)/layout.tsx`:
- Baca `x-publication-slug` atau `x-publication-host` dari headers
- Fetch publication data (name, slug, logo, status)
- Jika tidak ada slug/host → `notFound()`
- Jika `status === 'suspended_hard'` → redirect ke `/suspended`
- Jika `status === 'pending_deletion'` → redirect ke `/suspended` dengan pesan berbeda
- Provide publication data ke children via React Context

**TASK-FE-18.4.2** `[ ]` Buat `PublicationContext` — provide: `{ publication, isLoading }`
**TASK-FE-18.4.3** `[ ]` Update semua pages di `(publication)/` yang fetch publication secara individual → gunakan context dari layout
**TASK-INT-18.4.1** `[ ]` Commit: `feat(routing): implement meaningful publication layout with tenant resolution`

---

### STORY 18.5 — Pindahkan `subscribe/` dan `suspended/` ke `(publication)/`

**TASK-FE-18.5.1** `[ ]` Pindahkan `app/subscribe/page.tsx` → `(publication)/subscribe/page.tsx`
- Hapus penggunaan `?pub=<id>` query param
- Ambil `publicationId` dari `PublicationContext` (sudah tersedia dari layout)

**TASK-FE-18.5.2** `[ ]` Pindahkan `app/suspended/page.tsx` → `(publication)/suspended/page.tsx`
**TASK-FE-18.5.3** `[ ]` Hapus `app/subscribe/page.tsx` dan `app/suspended/page.tsx` dari root
**TASK-INT-18.5.1** `[ ]` Commit: `refactor(routing): move subscribe and suspended into publication context`

---

### STORY 18.6 — Hapus `app/me/` dan `app/onboarding/`

**TASK-FE-18.6.1** `[ ]` Hapus `app/me/settings/page.tsx` (redirect stub sudah tidak diperlukan)
**TASK-FE-18.6.2** `[ ]` Hapus `app/me/subscription/page.tsx`
**TASK-FE-18.6.3** `[ ]` Hapus direktori `app/me/` sepenuhnya
**TASK-FE-18.6.4** `[ ]` Hapus `app/onboarding/page.tsx` (redirect stub ke /dashboard)
**TASK-INT-18.6.1** `[ ]` Commit: `refactor(routing): remove me/ directory and onboarding stub`

---

### STORY 18.7 — Buat `accept-author-invite` Page (MISSING FEATURE)

**Konteks:** Owner dapat mengundang author. Tapi tidak ada halaman untuk menerima undangan ini.

**TASK-BE-18.7.1** `[ ]` Buat endpoint `GET /auth/accept-author-invite?token=xxx`
- Return: `{ inviterName, publicationName, publicationSlug, email, isExistingUser }`

**TASK-BE-18.7.2** `[ ]` Buat endpoint `POST /auth/complete-author-invite`
- Jika user baru: buat akun (name + password), set role `author`
- Jika existing user: langsung set role `author` di publication
- Return: access token + redirect info

**TASK-FE-18.7.1** `[ ]` Buat `(publication)/accept-author-invite/page.tsx`
- URL: `slug.lentera.id/accept-author-invite?token=xxx`
- Jika `isExistingUser = true`: tampilkan confirmation card saja ("Accept invitation")
- Jika `isExistingUser = false`: tampilkan form buat akun (name + password)
- Setelah accept: redirect ke `/admin/dashboard`

**TASK-INT-18.7.1** `[ ]` Commit: `feat(auth): add author invite acceptance flow`

---

### STORY 18.8 — Fix `accept-invite` Post-Wizard Redirect

**Konteks:** Step 3 wizard saat ini redirect ke `/dashboard` (relative). Dari `app.lentera.id/accept-invite`, ini akan pergi ke `app.lentera.id/dashboard` (SALAH). Seharusnya ke `slug.lentera.id/admin/dashboard`.

**TASK-FE-18.8.1** `[ ]` Update `accept-invite/page.tsx` Step 3 component
- Backend sudah return `publicationSlug` dalam response
- Build full URL: `https://${publicationSlug}.lentera.id/admin/dashboard` (atau `slug.lvh.me:3000/admin/dashboard` di dev)
- Gunakan `window.location.href` bukan `router.push()` karena pindah domain

**TASK-INT-18.8.1** `[ ]` Commit: `fix(auth): correct post-invite-wizard redirect to publication subdomain`

---

### STORY 18.9 — Update `proxy.ts` PROTECTED_PREFIXES

**TASK-FE-18.9.1** `[ ]` Update `proxy.ts`:
- Hapus `/me` dan `/dashboard` dari PROTECTED_PREFIXES
- PROTECTED_PREFIXES yang baru: `['/admin']` — berlaku di semua domain
- Pastikan `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` di-EXCLUDE dari protection
- Implementasi: cek apakah pathname adalah auth route sebelum redirect

**TASK-FE-18.9.2** `[ ]` Update `app/admin/layout.tsx` (platform staff):
- Pass-through untuk `/admin/login`, `/admin/forgot-password`, `/admin/reset-password`
- Require `platform_role IN ('platform_owner', 'platform_admin')` untuk semua route lain
- Endpoint khusus platform_owner (kelola staff) di-guard di service layer backend

**TASK-FE-18.9.3** `[ ]` `(publication)/admin/layout.tsx` sudah handle guard di STORY 18.3 — verifikasi konsistensi

**TASK-INT-18.9.1** `[ ]` Commit: `fix(routing): update proxy to use /admin as single protected prefix with auth exclusion`

---

### STORY 18.10 — Fix Stale Links dan Referensi

**TASK-FE-18.10.1** `[ ]` Fix `payment/success/page.tsx` — ganti link `/me/subscription` → `/subscription`
**TASK-FE-18.10.2** `[ ]` Fix `(publication)/subscription/page.tsx` — ganti link `/me/subscription` → `/subscription`
**TASK-FE-18.10.3** `[ ]` Cari semua referensi `/me/` di seluruh frontend → ganti dengan path yang benar
**TASK-FE-18.10.4** `[ ]` Cari semua referensi `/dashboard` (tanpa `/admin`) di dalam publication staff pages → ganti ke `/admin/dashboard`
**TASK-FE-18.10.5** `[ ]` Fix Google OAuth `state` parameter — sertakan `publicationId` saat initiate OAuth agar callback dapat redirect ke subdomain yang benar
**TASK-INT-18.10.1** `[ ]` Commit: `fix(routing): remove stale /me/ and /dashboard references, fix OAuth state`

---

## RINGKASAN TASK COUNT (v2.0)

| Epic | Total Task | Status |
|------|-----------|--------|
| EPIC 1 — Project Setup | 23 tasks | ✅ Selesai |
| EPIC 2 — Autentikasi | 38 tasks | ✅ Selesai (ada gap → fix di EPIC 13) |
| EPIC 3 — Publication Management | 26 tasks | ✅ Selesai |
| EPIC 4 — Content Management | 37 tasks | ✅ Selesai |
| EPIC 5 — Subscription & Payment | 28 tasks | ✅ Selesai (ada gap → fix di EPIC 13) |
| EPIC 6 — Reader Experience | 30 tasks | ✅ Selesai (ada gap → fix di EPIC 13) |
| EPIC 7 — Email & Notifikasi | 17 tasks | ✅ Selesai (ada gap → fix di EPIC 13) |
| EPIC 8 — Dashboard & Analytics | 18 tasks | ✅ Selesai |
| EPIC 9 — Pre-Launch | 9 tasks | ⬜ Belum (deployment) |
| EPIC 10 — Platform Admin | 15 tasks | ✅ Selesai |
| EPIC 11 — UX Gaps Fix | 16 tasks | ✅ Selesai |
| EPIC 12 — Routing & Auth Fix | 9 tasks | ✅ Selesai |
| EPIC 13 — Auth & Core Flow Fixes | 33 tasks | ⬜ Belum |
| EPIC 14 — Tiga Role Publication | 12 tasks | ⬜ Belum |
| EPIC 15 — Platform Admin Enhancements | 38 tasks | ⬜ Belum sebagian (15.6 baru) |
| EPIC 16 — Onboarding & Landing Page | 18 tasks | ⬜ Belum |
| EPIC 17 — Seed Data Realistis | 8 tasks | ⬜ Belum |
| EPIC 18 — Routing Architecture Refactor | 40 tasks | ⬜ Belum |
| **Grand Total** | **≈405 tasks** | |

---

## URUTAN PENGERJAAN SELANJUTNYA

```
Step 1 — Setup test environment:
  EPIC 17 — Seed Data Realistis
  (paralel: backend-only tasks dari EPIC 13 — 13.1, 13.4, 13.6, 13.7, 13.8)

Step 2 — Tegakkan struktur routing yang benar SEBELUM tambah fitur:
  EPIC 18 — Routing Architecture Refactor
  (semua frontend baru akan dibuat di struktur ini)

Step 3 — Auth & core fixes (frontend di struktur baru):
  EPIC 13 — Auth & Core Flow Fixes (sisa tasks frontend)

Step 4 — Core features:
  EPIC 14 — Tiga Role Publication
  EPIC 16 — Onboarding & Landing Page

Step 5 — Admin enhancements:
  EPIC 15 — Platform Admin Enhancements

Step 6 — Deployment:
  EPIC 9 — Pre-Launch & Production
```

---

## CARA PAKAI DOKUMEN INI DENGAN CLAUDE CODE

```
Baca CLAUDE.md dan docs/06_USER_STORIES.md.
Kerjakan EPIC 13 — Auth & Core Flow Fixes.
Mulai dari STORY 13.1 — Refresh Token Scoped per Publication.
Checkout branch: git checkout -b feat/auth-core-fixes
```

Setiap sesi fokus pada **satu STORY** — jangan loncat antar EPIC.
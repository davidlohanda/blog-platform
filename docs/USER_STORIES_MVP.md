# User Stories & Task Breakdown — MVP
## Platform Blog Subscription Multi-Author
**Versi:** 1.0 | 24 Mei 2026  
**Scope:** MVP only — V2 dan V3 akan didokumentasikan sebagai project terpisah  
**Referensi:** PRD v1.1, SAD v1.2

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
**TASK-1.3.5** `[x ]` Setup branch protection rules di GitHub untuk branch `main` ← manual di GitHub UI  
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

### STORY 2.2 — Login dengan Email
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

### STORY 2.3 — Login dengan Google OAuth
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

### STORY 2.4 — Lupa & Reset Password
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

### STORY 2.5 — Profile Settings
Sebagai user yang sudah login, saya ingin bisa mengubah nama, foto profil, dan password saya.

**TASK-BE-2.5.1** `[x]` Buat `PATCH /users/me` — update nama, bio, avatar_url  
**TASK-BE-2.5.2** `[x]` Buat `PATCH /users/me/password` — verifikasi password lama, hash password baru  
**TASK-BE-2.5.3** `[x]` Commit: `feat(auth): add profile and password update endpoints`  

**TASK-FE-2.5.1** `[x]` Buat halaman `app/me/settings/page.tsx` (Client Component)  
**TASK-FE-2.5.2** `[x]` Form update profil: nama, bio, upload foto ← foto upload menyusul di STORY 4.2  
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
**TASK-FE-3.1.2** `[x]` Form: nama publication, deskripsi, upload logo ← logo upload menyusul di STORY 4.2  
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
**TASK-FE-4.1.6** `[x]` Tombol Preview — reader page tersedia di EPIC 6 (navigate ke /[slug])  
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
**TASK-BE-4.4.8** `[x]` Tracking read progress — PATCH /publications/:pubId/articles/:id/read-progress (upsert ArticleRead.completionPercent)  
**TASK-BE-4.4.9** `[x]` Commit: `feat(series): add series management endpoints`  

**TASK-FE-4.4.1** `[x]` Buat halaman `dashboard/series/page.tsx` — list semua series + form create  
**TASK-FE-4.4.2** `[x]` Drag-and-drop urutan artikel dalam series — @dnd-kit/sortable, dashboard/series/[id]/page.tsx  
**TASK-FE-4.4.3** `[x]` Halaman series publik — app/(publication)/series/[slug]/page.tsx dengan artikel list  
**TASK-FE-4.4.4** `[x]` Progress bar series — visual progress indicator (0/N selesai) di halaman series publik  
**TASK-FE-4.4.5** `[x]` Navigasi prev/next series di artikel — SeriesNav sudah ada sejak EPIC 6  
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

**TASK-FE-5.2.1** `[x]` Buat halaman `app/subscribe/page.tsx` (Client Component) ← (publication) route group menyusul di EPIC 6  
**TASK-FE-5.2.2** `[x]` Tampilkan semua paket aktif dengan harga, persentase hemat  
**TASK-FE-5.2.3** `[x]` Tampilkan ringkasan order di sidebar: paket dipilih, PPN, total  
**TASK-FE-5.2.4** `[x]` Pilihan metode pembayaran — ditangani oleh popup Midtrans Snap (GoPay, QRIS, VA, Kartu)  
**TASK-FE-5.2.5** `[x]` Integrasi Midtrans Snap.js — tampilkan popup pembayaran  
**TASK-FE-5.2.6** `[x]` Handle callback sukses: redirect ke `next` / `/me/subscription`  
**TASK-FE-5.2.7** `[x]` Handle callback gagal: tampilkan pesan error dan opsi coba lagi  
**TASK-FE-5.2.8** `[x]` Commit: `feat(subscription): add subscribe and checkout page`  

**TASK-INT-5.2.1** `[x]` Integrasi checkout dengan backend dan Midtrans (snap token creation ditest OK)  
**TASK-INT-5.2.2** `[ ]` ~~Test end-to-end: pilih paket → bayar (sandbox) → akses konten premium~~ BLOCKED: butuh manual test bayar di browser + webhook tunnel (ngrok)  
**TASK-INT-5.2.3** `[x]` Commit: `feat(subscription): integrate payment flow end-to-end`  

---

### STORY 5.3 — Manajemen Subscription Member
Sebagai member, saya ingin bisa melihat status subscription saya dan riwayat transaksi, agar saya tahu kapan subscription saya berakhir.

**TASK-BE-5.3.1** `[x]` Endpoint `GET /subscriptions/me` — status subscription aktif user yang login, untuk publication yang sedang diakses  
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
Sebagai pengunjung, saya ingin bisa melihat homepage publication dengan daftar artikel terbaru dan informasi tentang para penulis, agar saya bisa memutuskan apakah ingin berlangganan.

**TASK-BE-6.1.1** `[x]` Endpoint `GET /publications/:pubId/articles` — list artikel publik dengan pagination, filter author/tag, sort by terbaru (public: hanya free + metadata premium)  
**TASK-BE-6.1.2** `[x]` Endpoint `GET /publications/:pubId/authors` — list semua author dengan bio  
**TASK-BE-6.1.3** `[x]` Commit: `feat(reader): add public article list and author list endpoints`  

**TASK-FE-6.1.1** `[x]` Buat layout `app/(publication)/layout.tsx` — fetch publication dari host header, set metadata dasar  
**TASK-FE-6.1.2** `[x]` Buat halaman `app/(publication)/page.tsx` (Cache Component, `cacheLife('minutes')`)  
**TASK-FE-6.1.3** `[x]` Section hero: tagline publication, deskripsi, CTA berlangganan + baca gratis, stats (jumlah subscriber, artikel, penulis)  
**TASK-FE-6.1.4** `[x]` Section artikel: featured article (besar), grid artikel lainnya, badge PREMIUM untuk artikel premium  
**TASK-FE-6.1.5** `[x]` Section penulis: card tiap author dengan foto, nama, spesialisasi, bio singkat, link ke semua tulisannya  
**TASK-FE-6.1.6** `[x]` Navbar: logo, menu (Beranda, Series, Roadmap, Penulis, Tentang), search icon, Library icon, tombol Masuk / Berlangganan  
**TASK-FE-6.1.7** `[x]` `generateMetadata` untuk SEO: title, description, OG image dari logo publication  
**TASK-FE-6.1.8** `[x]` Commit: `feat(reader): add publication homepage`  

**TASK-INT-6.1.1** `[x]` Integrasi homepage dengan backend  
**TASK-INT-6.1.2** `[x]` Commit: `feat(reader): integrate publication homepage`  

---

### STORY 6.2 — Membaca Artikel
Sebagai pembaca, saya ingin bisa membaca artikel dengan nyaman, agar pengalaman belajar saya menyenangkan.

**TASK-BE-6.2.1** `[x]` Endpoint artikel sudah ada — tambahkan: untuk artikel premium, cek subscription user, return konten penuh jika member atau return excerpt saja jika bukan  
**TASK-BE-6.2.2** `[x]` Endpoint `POST /publications/:pubId/articles/:id/view` — increment view count  
**TASK-BE-6.2.3** `[x]` Commit: `feat(reader): add article access control and view tracking`  

**TASK-FE-6.2.1** `[x]` Buat halaman `app/(publication)/[articleSlug]/page.tsx`  
**TASK-FE-6.2.2** `[x]` Artikel free: Cache Component dengan `cacheLife('hours')` dan `cacheTag`  
**TASK-FE-6.2.3** `[x]` Artikel premium: request-time (tidak di-cache), cek subscription server-side  
**TASK-FE-6.2.4** `[x]` Layout artikel: cover image, badge tag + PREMIUM, judul, excerpt, info author (avatar + nama + tanggal + reading time)  
**TASK-FE-6.2.5** `[x]` Konten artikel: render Tiptap JSON ke HTML dengan typography yang baik, max-width ~680px  
**TASK-FE-6.2.6** `[x]` Progress bar reading — sticky di atas halaman, update saat scroll (Client Component)  
**TASK-FE-6.2.7** `[x]` Action bar: tombol like (semua user), tombol save ke folder (member), tombol share  
**TASK-FE-6.2.8** `[x]` Author bio section di bawah artikel: foto, nama, bio, link ke semua tulisannya  
**TASK-FE-6.2.9** `[x]` Navigasi prev/next artikel jika bagian dari series  
**TASK-FE-6.2.10** `[x]` `generateMetadata` — meta title, description, OG image dari cover artikel  
**TASK-FE-6.2.11** `[x]` Commit: `feat(reader): add article reader page`  

**TASK-INT-6.2.1** `[x]` Integrasi halaman artikel dengan backend  
**TASK-INT-6.2.2** `[ ]` ~~Test: artikel free bisa dibaca semua, artikel premium terblock untuk non-member~~ BLOCKED: menunggu manual testing  
**TASK-INT-6.2.3** `[x]` Commit: `feat(reader): integrate article reader`  

---

### STORY 6.3 — Paywall
Sebagai non-member yang membaca artikel premium, saya ingin melihat CTA berlangganan yang menarik, agar saya tertarik untuk subscribe.

**TASK-FE-6.3.1** `[x]` Buat komponen `ArticlePaywall.tsx` (Server Component)  
**TASK-FE-6.3.2** `[x]` Tampilkan preview konten (±200 kata pertama) dengan fade-out effect di bawahnya  
**TASK-FE-6.3.3** `[x]` CTA card: "Selebihnya tersedia untuk member" + benefit singkat + tombol Berlangganan + link Masuk (jika sudah punya akun)  
**TASK-FE-6.3.4** `[x]` Tidak ada referensi free trial apapun  
**TASK-FE-6.3.5** `[x]` Commit: `feat(reader): add paywall component`  

---

### STORY 6.4 — Like Artikel
Sebagai pengunjung, saya ingin bisa memberikan like pada artikel yang saya sukai, agar author tahu konten mana yang disukai audiencenya.

**TASK-BE-6.4.1** `[x]` Endpoint `POST /publications/:pubId/articles/:id/like` — toggle like (authenticated)  
**TASK-BE-6.4.2** `[x]` Endpoint `GET /publications/:pubId/articles/:id/like` — cek apakah user sudah like  
**TASK-BE-6.4.3** `[x]` Commit: `feat(reader): add article like endpoint`  

**TASK-FE-6.4.1** `[x]` Buat komponen `ArticleLikeButton.tsx` (Client Component) — tombol like dengan jumlah, toggle state  
**TASK-FE-6.4.2** `[x]` Non-member bisa like artikel free; member bisa like semua artikel  
**TASK-FE-6.4.3** `[x]` Commit: `feat(reader): add article like button`  

**TASK-INT-6.4.1** `[x]` Integrasi like button dengan backend  
**TASK-INT-6.4.2** `[x]` Commit: `feat(reader): integrate article like`  

---

## EPIC 7 — Email & Notifikasi

### STORY 7.1 — Setup Email Service
Sebagai developer, saya ingin sistem email ter-setup dengan benar, agar semua email transaksional dan newsletter bisa dikirim dengan andal.

**TASK-BE-7.1.1** `[x]` Setup Resend SDK  
**TASK-BE-7.1.2** `[x]` Buat `email.service.ts` — method generic `sendEmail`  
**TASK-BE-7.1.3** `[x]` Setup BullMQ untuk email queue dengan Redis  
**TASK-BE-7.1.4** `[x]` Buat email worker yang consume job dari queue  
**TASK-BE-7.1.5** `[x]` Commit: `feat(email): setup Resend email service with BullMQ queue`  

---

### STORY 7.2 — Email Transaksional
Sebagai user, saya ingin menerima email konfirmasi untuk setiap aksi penting, agar saya tahu bahwa tindakan saya berhasil.

**TASK-BE-7.2.1** `[x]` Buat template email verifikasi akun  
**TASK-BE-7.2.2** `[x]` Buat template email reset password  
**TASK-BE-7.2.3** `[x]` Buat template email konfirmasi subscription berhasil  
**TASK-BE-7.2.4** `[x]` Buat template email reminder subscription akan berakhir (7 hari sebelum)  
**TASK-BE-7.2.5** `[x]` Buat template email notifikasi subscription berakhir  
**TASK-BE-7.2.6** `[x]` Background job: cek subscription yang akan berakhir dalam 7 hari, kirim reminder  
**TASK-BE-7.2.7** `[x]` Commit: `feat(email): add all transactional email templates and jobs`  

---

### STORY 7.3 — Notifikasi Artikel Baru
Sebagai subscriber, saya ingin mendapat notifikasi email saat ada artikel baru, agar saya tidak melewatkan konten terbaru.

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
Sebagai owner, saya ingin melihat ringkasan performa publication saya dalam satu halaman, agar saya bisa memantau pertumbuhan dengan mudah.

**TASK-BE-8.1.1** `[x]` Buat `analytics.service.ts`  
**TASK-BE-8.1.2** `[x]` Endpoint `GET /publications/:pubId/analytics/overview` — return: total subscriber aktif, subscriber baru bulan ini, MRR estimasi, total views, total artikel, top artikel by views  
**TASK-BE-8.1.3** `[x]` Endpoint `GET /publications/:pubId/analytics/subscribers-chart?range=` — data subscriber baru per hari/bulan untuk chart  
**TASK-BE-8.1.4** `[x]` Commit: `feat(analytics): add overview analytics endpoint`  

**TASK-FE-8.1.1** `[x]` Buat halaman `dashboard/page.tsx` (Client Component)  
**TASK-FE-8.1.2** `[x]` 4 stats card: Subscriber Aktif, MRR, Total Views, Total Artikel — dengan delta vs bulan lalu  
**TASK-FE-8.1.3** `[x]` Chart subscriber baru (Recharts LineChart, range 30d/6m/12m)  
**TASK-FE-8.1.4** `[x]` Tabel top artikel by views  
**TASK-FE-8.1.5** `[x]` Tombol "Lihat publication" dan "Tulis baru" di header  
**TASK-FE-8.1.6** `[x]` Commit: `feat(analytics): add dashboard overview page`  

**TASK-INT-8.1.1** `[x]` Integrasi dashboard dengan backend  
**TASK-INT-8.1.2** `[x]` Commit: `feat(analytics): integrate dashboard overview`  

---

### STORY 8.2 — Manajemen Subscriber
Sebagai owner, saya ingin melihat daftar lengkap subscriber saya, agar saya bisa menganalisis audience dan mengekspornya jika diperlukan.

**TASK-BE-8.2.1** `[x]` Endpoint `GET /publications/:pubId/analytics/subscribers` — list subscriber dengan pagination, filter by status dan search  
**TASK-BE-8.2.2** `[x]` Endpoint `GET /publications/:pubId/analytics/subscribers/export` — generate dan return CSV  
**TASK-BE-8.2.3** `[x]` Commit: `feat(analytics): add subscriber list and CSV export endpoints`  

**TASK-FE-8.2.1** `[x]` Buat halaman `dashboard/subscribers/page.tsx` (Client Component)  
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

**TASK-9.1.1** `[x]` Audit semua endpoint: pastikan semua query repository include `publicationId` — fix article.repository (update/softDelete/publish/schedule) dan series.repository (update) untuk enforce publicationId di WHERE clause  
**TASK-9.1.2** `[x]` Pastikan rate limiting aktif di semua endpoint auth — tambah `registerRateLimiter` (10 req/jam) ke POST /auth/register yang sebelumnya tidak diproteksi  
**TASK-9.1.3** `[x]` Pastikan webhook Midtrans verify signature sebelum proses — sudah ada dan dikonfirmasi aman (SHA512 HMAC)  
**TASK-9.1.4** `[x]` Pastikan tidak ada API key atau secret yang ter-commit di git — dikonfirmasi: .gitignore menutupi .env dan tidak ada secrets di git  
**TASK-9.1.5** `[x]` Cross-publication access: dikonfirmasi aman — member.middleware pakai BOTH userId+publicationId, roles.middleware validasi DB bukan dari query string  
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
Sebagai operator platform, saya ingin ada akun admin yang sudah ter-seed,
agar saya bisa langsung login tanpa perlu setup manual.

**TASK-BE-10.1.1** `[ ]` Tambahkan role platform_admin di Prisma schema dan migration
**TASK-BE-10.1.2** `[ ]` Update seed.ts — buat user admin: email: admin@lentera.id, password: Admin123!, role: platform_admin
**TASK-BE-10.1.3** `[ ]` Buat adminGuard middleware — cek role platform_admin, jika bukan → 403
**TASK-INT-10.1.1** `[ ]` Jalankan seed ulang, verifikasi login admin berhasil
**TASK-INT-10.1.2** `[ ]` Commit: `feat(admin): add platform admin role and seed`

### STORY 10.2 — Admin Dashboard
Sebagai platform admin, saya ingin lihat overview semua publications dan users,
agar bisa monitor platform.

**TASK-BE-10.2.1** `[ ]` Endpoint GET /admin/overview — return: total publications, total users, total revenue, platform fee collected
**TASK-BE-10.2.2** `[ ]` Endpoint GET /admin/publications — list semua publication dengan owner, subscriber count, revenue
**TASK-BE-10.2.3** `[ ]` Endpoint GET /admin/users — list semua user terdaftar
**TASK-FE-10.2.1** `[ ]` Halaman /admin — redirect ke /admin/dashboard jika platform_admin, tampil 404 jika bukan
**TASK-FE-10.2.2** `[ ]` Halaman /admin/dashboard — stats cards + tabel publications + tabel users
**TASK-FE-10.2.3** `[ ]` Sidebar admin: Dashboard, Publications, Invite Owner
**TASK-INT-10.2.1** `[ ]` Integrasi admin dashboard dengan backend
**TASK-INT-10.2.2** `[ ]` Commit: `feat(admin): add admin dashboard page`

### STORY 10.3 — Invite Owner
Sebagai platform admin, saya ingin invite calon owner via email,
agar mereka bisa register dan langsung mendapat akses sebagai owner publication baru.

**TASK-BE-10.3.1** `[ ]` Endpoint POST /admin/invite-owner: input nama, email, nama_publication → buat publication draft → buat invite token di Redis TTL 7 hari → kirim email invite via Resend
**TASK-BE-10.3.2** `[ ]` Endpoint GET /auth/accept-owner-invite?token=xxx → validasi token → redirect ke /register?invite=xxx&email=xxx
**TASK-BE-10.3.3** `[ ]` Update register flow: jika ada invite token, setelah register langsung jadi owner publication yang sudah disiapkan, skip onboarding buat publication
**TASK-FE-10.3.1** `[ ]` Halaman /admin/invite — form invite owner (nama, email, nama publication)
**TASK-FE-10.3.2** `[ ]` Halaman /register?invite=xxx — form register khusus, email pre-filled dan tidak bisa diubah
**TASK-FE-10.3.3** `[ ]` Email template: invite owner berisi nama, nama publication, dan link accept invite
**TASK-INT-10.3.1** `[ ]` Test flow lengkap: admin invite → email masuk → klik link → register → langsung masuk dashboard publication
**TASK-INT-10.3.2** `[ ]` Commit: `feat(admin): add invite owner flow`

---

## EPIC 11 — UX Gaps Fix

### STORY 11.1 — Payment Success Page
Sebagai reader yang baru subscribe, saya ingin melihat halaman konfirmasi
setelah bayar, agar saya yakin pembayaran berhasil dan tahu apa yang harus dilakukan.

**TASK-BE-11.1.1** `[ ]` Update subscription order endpoint: simpan ?next= URL artikel yang dituju di Redis bersama order_id
**TASK-FE-11.1.1** `[ ]` Buat halaman /payment/success: tampil pesan sukses, info paket aktif, tanggal berakhir, CTA "Baca artikel" yang redirect ke artikel yang dituju
**TASK-FE-11.1.2** `[ ]` Update /subscribe: setelah Midtrans Snap close dengan status success → redirect ke /payment/success?next=[artikel-slug]
**TASK-INT-11.1.1** `[ ]` Test flow: subscribe → bayar → redirect /payment/success → klik → baca artikel premium
**TASK-INT-11.1.2** `[ ]` Commit: `feat(ux): add payment success page with article redirect`

### STORY 11.2 — Onboarding Checklist Dashboard
Sebagai owner baru, saya ingin ada panduan langkah selanjutnya setelah buat publication,
agar saya tahu harus ngapain untuk mulai monetisasi.

**TASK-BE-11.2.1** `[ ]` Endpoint GET /publications/:id/onboarding-status — return: has_subscription_plans, has_articles, has_logo, has_custom_domain
**TASK-FE-11.2.1** `[ ]` Buat komponen OnboardingChecklist: tampil di /dashboard jika belum 100% selesai. Item: Set harga subscription, Tulis artikel pertama, Upload logo, Setup custom domain
**TASK-FE-11.2.2** `[ ]` Checklist hilang otomatis jika semua item sudah selesai
**TASK-INT-11.2.1** `[ ]` Integrasi checklist dengan backend
**TASK-INT-11.2.2** `[ ]` Commit: `feat(ux): add onboarding checklist for new publication owners`

### STORY 11.3 — Subscribe dengan Context Artikel
Sebagai reader yang kena paywall, saya ingin setelah subscribe langsung diarahkan
ke artikel yang ingin saya baca, bukan harus navigasi manual.

**TASK-FE-11.3.1** `[ ]` Update paywall CTA: link berlangganan menyertakan ?next=[article-slug]
**TASK-FE-11.3.2** `[ ]` Update /subscribe: baca query param ?next, simpan di state, teruskan ke payment success redirect
**TASK-INT-11.3.1** `[ ]` Test: klik paywall → subscribe → bayar → otomatis redirect ke artikel yang tadi diklik
**TASK-INT-11.3.2** `[ ]` Commit: `feat(ux): preserve article context through subscribe flow`

### STORY 11.4 — Logo Upload yang Berfungsi
Sebagai owner, saya ingin bisa upload logo publication,
agar brand publication saya terlihat di homepage.

**TASK-BE-11.4.1** `[ ]` Pastikan endpoint PATCH /publications/:id menerima dan menyimpan logo_url dengan benar
**TASK-FE-11.4.1** `[ ]` Fix logo upload di /dashboard/settings: gunakan signed upload URL Cloudinary, setelah upload update logo_url, tampilkan preview
**TASK-INT-11.4.1** `[ ]` Test: upload logo → tampil di homepage publication
**TASK-INT-11.4.2** `[ ]` Commit: `feat(ux): fix logo upload functionality`

---

## EPIC 12 — Routing & Auth Fix

### STORY 12.1 — Redirect Logic Berdasarkan Role
Sebagai user yang login, saya ingin diarahkan ke halaman yang tepat
berdasarkan role saya, agar tidak bingung harus ke mana.

**TASK-BE-12.1.1** `[ ]` Pastikan JWT payload include role: platform_admin, owner, author, atau member
**TASK-FE-12.1.1** `[ ]` Update redirect setelah login: platform_admin → /admin/dashboard, owner/author → /dashboard, member/reader → / (homepage publication)
**TASK-FE-12.1.2** `[ ]` Update proxy.ts: akses /admin tanpa role platform_admin → redirect ke /404
**TASK-FE-12.1.3** `[ ]` Update proxy.ts: akses /dashboard tanpa login → redirect ke /login
**TASK-INT-12.1.1** `[ ]` Test semua skenario: login admin → /admin ✅, login owner → /dashboard ✅, login member → / ✅, akses /admin tanpa admin → 404 ✅
**TASK-INT-12.1.2** `[ ]` Commit: `feat(auth): add role-based redirect after login`

### STORY 12.2 — Homepage Platform
Sebagai user yang buka aplikasi tanpa context publication,
saya ingin melihat halaman yang informatif bukan halaman default Next.js.

**TASK-FE-12.2.1** `[ ]` Buat halaman / untuk konteks platform (bukan publication): belum login → landing page simpel dengan logo, tagline, tombol Masuk
**TASK-FE-12.2.2** `[ ]` Landing page: logo Lentera, tagline singkat, tombol Masuk → /login. Tidak perlu marketing page panjang untuk MVP
**TASK-FE-12.2.3** `[ ]` Jika sudah login: platform_admin → redirect /admin/dashboard, owner → redirect /dashboard
**TASK-INT-12.2.1** `[ ]` Test: buka localhost:3000 → lihat landing page atau redirect sesuai role
**TASK-INT-12.2.2** `[ ]` Commit: `feat(ux): add platform homepage with role-based redirect`

---

## Ringkasan Task Count

| Epic | Total Task |
|---|---|
| EPIC 1 — Project Setup | 23 tasks |
| EPIC 2 — Autentikasi | 38 tasks |
| EPIC 3 — Publication Management | 26 tasks |
| EPIC 4 — Content Management | 37 tasks |
| EPIC 5 — Subscription & Payment | 28 tasks |
| EPIC 6 — Reader Experience | 30 tasks |
| EPIC 7 — Email & Notifikasi | 17 tasks |
| EPIC 8 — Dashboard & Analytics | 18 tasks |
| EPIC 9 — Pre-Launch | 9 tasks |
| EPIC 10 — Platform Admin | 15 tasks |
| EPIC 11 — UX Gaps Fix | 16 tasks |
| EPIC 12 — Routing & Auth Fix | 9 tasks |
| **Total** | **266 tasks** |

---

## Cara Pakai Dokumen Ini dengan Claude Code

Saat memulai sesi implementasi, berikan instruksi seperti ini:

```
Baca docs/TECH_CONTEXT.md dan docs/USER_STORIES_MVP.md.
Kita akan mengerjakan [STORY X.X — Nama Story].
Task yang perlu diselesaikan:
- TASK-BE-X.X.X: [nama task]
- TASK-FE-X.X.X: [nama task]
Setelah selesai, tandai task sebagai [x] di dokumen dan commit dengan pesan yang sesuai.
```

Setiap sesi sebaiknya fokus pada **satu Story** — jangan loncat-loncat antar Epic agar konteks Claude Code tetap terfokus.

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
**TASK-INT-2.1.2** `[ ]` Test end-to-end: register → terima email → klik link → akun aktif ← requires email setup (STORY 7.1)  
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
**TASK-INT-2.2.2** `[ ]` Test refresh token flow: access token expired → auto refresh → request ulang  
**TASK-INT-2.2.3** `[ ]` Test logout: token dihapus, redirect ke login  
**TASK-INT-2.2.4** `[x]` Commit: `feat(auth): integrate login flow end-to-end`  

---

### STORY 2.3 — Login dengan Google OAuth
Sebagai user, saya ingin bisa login dengan akun Google, agar tidak perlu mengingat password baru.

**TASK-BE-2.3.1** `[ ]` Setup Google OAuth credentials di Google Console  
**TASK-BE-2.3.2** `[ ]` Install dan konfigurasi Passport.js dengan Google Strategy  
**TASK-BE-2.3.3** `[ ]` Buat `GET /auth/google` — redirect ke Google consent screen  
**TASK-BE-2.3.4** `[ ]` Buat `GET /auth/google/callback` — terima code, tukar dengan user info Google, upsert user di DB, issue JWT, redirect ke app  
**TASK-BE-2.3.5** `[ ]` Commit: `feat(auth): add Google OAuth login`  

**TASK-FE-2.3.1** `[ ]` Aktifkan tombol "Lanjutkan dengan Google" di halaman login dan register  
**TASK-FE-2.3.2** `[ ]` Handle redirect callback dari OAuth  
**TASK-FE-2.3.3** `[ ]` Commit: `feat(auth): integrate Google OAuth in frontend`  

---

### STORY 2.4 — Lupa & Reset Password
Sebagai user yang lupa password, saya ingin bisa mereset password via email, agar saya bisa kembali mengakses akun.

**TASK-BE-2.4.1** `[ ]` Buat `POST /auth/forgot-password` — generate reset token (UUID), simpan di Redis (TTL 1 jam), kirim email berisi link reset  
**TASK-BE-2.4.2** `[ ]` Buat `POST /auth/reset-password` — verifikasi token dari Redis, hash password baru, update di DB, hapus token dari Redis  
**TASK-BE-2.4.3** `[ ]` Rate limit forgot-password: 3 request per IP per jam  
**TASK-BE-2.4.4** `[ ]` Commit: `feat(auth): add forgot and reset password flow`  

**TASK-FE-2.4.1** `[ ]` Buat halaman `app/(auth)/forgot-password/page.tsx` — form input email  
**TASK-FE-2.4.2** `[ ]` Buat halaman `app/(auth)/reset-password/page.tsx` — form password baru + konfirmasi  
**TASK-FE-2.4.3** `[ ]` Commit: `feat(auth): add forgot and reset password pages`  

**TASK-INT-2.4.1** `[ ]` Integrasi halaman forgot & reset dengan backend  
**TASK-INT-2.4.2** `[ ]` Commit: `feat(auth): integrate password reset flow`  

---

### STORY 2.5 — Profile Settings
Sebagai user yang sudah login, saya ingin bisa mengubah nama, foto profil, dan password saya.

**TASK-BE-2.5.1** `[ ]` Buat `PATCH /users/me` — update nama, bio, avatar_url  
**TASK-BE-2.5.2** `[ ]` Buat `PATCH /users/me/password` — verifikasi password lama, hash password baru  
**TASK-BE-2.5.3** `[ ]` Commit: `feat(auth): add profile and password update endpoints`  

**TASK-FE-2.5.1** `[ ]` Buat halaman `app/me/settings/page.tsx` (Client Component)  
**TASK-FE-2.5.2** `[ ]` Form update profil: nama, bio, upload foto  
**TASK-FE-2.5.3** `[ ]` Form ganti password: password lama, password baru, konfirmasi  
**TASK-FE-2.5.4** `[ ]` Commit: `feat(auth): add profile settings page`  

**TASK-INT-2.5.1** `[ ]` Integrasi halaman settings dengan backend  
**TASK-INT-2.5.2** `[ ]` Commit: `feat(auth): integrate profile settings`  

---

## EPIC 3 — Publication Management

### STORY 3.1 — Membuat Publication
Sebagai owner baru, saya ingin bisa mendaftarkan publication saya dengan nama, deskripsi, dan logo, agar platform bisa digunakan untuk blog saya.

**TASK-BE-3.1.1** `[ ]` Buat `publication.schema.ts` — Zod schema untuk create/update publication  
**TASK-BE-3.1.2** `[ ]` Buat `publication.repository.ts` — method `create`, `findBySlug`, `findByDomain`, `update`  
**TASK-BE-3.1.3** `[ ]` Buat `publication.service.ts` — method `create`: generate slug dari nama, simpan ke DB, set creator sebagai owner  
**TASK-BE-3.1.4** `[ ]` Buat `publication.controller.ts` dan `publication.router.ts`  
**TASK-BE-3.1.5** `[ ]` Endpoint `POST /publications` — buat publication baru (authenticated)  
**TASK-BE-3.1.6** `[ ]` Endpoint `GET /publications/:slug` — detail publication (public)  
**TASK-BE-3.1.7** `[ ]` Endpoint `PATCH /publications/:id` — update settings (owner only)  
**TASK-BE-3.1.8** `[ ]` Buat `tenant.middleware.ts` — resolve `publication_id` dari Host header, attach ke `req.publication`  
**TASK-BE-3.1.9** `[ ]` Setup Redis cache untuk publication by slug dan domain (TTL 1 jam)  
**TASK-BE-3.1.10** `[ ]` Commit: `feat(publication): add publication CRUD and tenant middleware`  

**TASK-FE-3.1.1** `[ ]` Buat halaman onboarding buat publication baru (Client Component)  
**TASK-FE-3.1.2** `[ ]` Form: nama publication, deskripsi, upload logo  
**TASK-FE-3.1.3** `[ ]` Commit: `feat(publication): add create publication onboarding page`  

**TASK-INT-3.1.1** `[ ]` Integrasi form buat publication dengan backend  
**TASK-INT-3.1.2** `[ ]` Commit: `feat(publication): integrate publication creation`  

---

### STORY 3.2 — Manajemen Author
Sebagai owner, saya ingin bisa mengundang penulis lain untuk bergabung ke publication saya, agar kami bisa menulis bersama dalam satu platform.

**TASK-BE-3.2.1** `[ ]` Endpoint `POST /publications/:id/authors/invite` — kirim email undangan dengan token, simpan pending invite di DB  
**TASK-BE-3.2.2** `[ ]` Endpoint `GET /auth/accept-invite?token=xxx` — verifikasi token, tambahkan user sebagai author  
**TASK-BE-3.2.3** `[ ]` Endpoint `GET /publications/:id/authors` — list semua author  
**TASK-BE-3.2.4** `[ ]` Endpoint `PATCH /publications/:id/authors/:userId` — update role author  
**TASK-BE-3.2.5** `[ ]` Endpoint `DELETE /publications/:id/authors/:userId` — remove author (owner only, tidak bisa remove diri sendiri jika satu-satunya owner)  
**TASK-BE-3.2.6** `[ ]` Buat `roles.middleware.ts` — cek role user di publication (owner/author)  
**TASK-BE-3.2.7** `[ ]` Commit: `feat(publication): add author invite and management`  

**TASK-FE-3.2.1** `[ ]` Buat halaman `dashboard/settings/` dengan 3 tab: Umum, Paket Harga, Author  
**TASK-FE-3.2.2** `[ ]` Tab Author: list author dengan role, form invite via email, tombol remove  
**TASK-FE-3.2.3** `[ ]` Buat halaman accept invite untuk user yang menerima undangan  
**TASK-FE-3.2.4** `[ ]` Commit: `feat(publication): add author management UI`  

**TASK-INT-3.2.1** `[ ]` Integrasi invite dan author management  
**TASK-INT-3.2.2** `[ ]` Commit: `feat(publication): integrate author management`  

---

### STORY 3.3 — Publication Settings
Sebagai owner, saya ingin bisa mengkonfigurasi nama, deskripsi, logo, dan custom domain publication saya.

**TASK-BE-3.3.1** `[ ]` Endpoint update publication settings (sudah ada di STORY 3.1)  
**TASK-BE-3.3.2** `[ ]` Endpoint `POST /publications/:id/custom-domain` — simpan custom domain, set status `pending`  
**TASK-BE-3.3.3** `[ ]` Background job: cek DNS propagation setiap 5 menit, update status ke `verified` jika CNAME sudah benar  
**TASK-BE-3.3.4** `[ ]` Commit: `feat(publication): add custom domain configuration`  

**TASK-FE-3.3.1** `[ ]` Tab Umum di settings: form nama, deskripsi, logo, custom domain  
**TASK-FE-3.3.2** `[ ]` Tampilkan instruksi CNAME setup setelah input custom domain  
**TASK-FE-3.3.3** `[ ]` Tampilkan status domain: pending / verified / active  
**TASK-FE-3.3.4** `[ ]` Commit: `feat(publication): add publication settings UI`  

**TASK-INT-3.3.1** `[ ]` Integrasi settings dengan backend  
**TASK-INT-3.3.2** `[ ]` Commit: `feat(publication): integrate publication settings`  

---

## EPIC 4 — Content Management

### STORY 4.1 — Menulis Artikel dengan Rich Text Editor
Sebagai author, saya ingin bisa menulis artikel dengan editor yang lengkap, agar konten yang saya buat terlihat profesional dan mudah dibaca.

**TASK-BE-4.1.1** `[ ]` Buat `article.schema.ts` — Zod schema untuk create/update artikel  
**TASK-BE-4.1.2** `[ ]` Buat `article.repository.ts` — method `create`, `findById`, `findBySlug`, `findMany`, `update`, `softDelete`  
**TASK-BE-4.1.3** `[ ]` Buat `article.service.ts` — method `create`, `update`, `publish`, `delete`; auto-generate slug dari judul; hitung reading time  
**TASK-BE-4.1.4** `[ ]` Endpoint `POST /publications/:pubId/articles` — buat artikel baru (status: draft)  
**TASK-BE-4.1.5** `[ ]` Endpoint `GET /publications/:pubId/articles/:slug` — baca satu artikel  
**TASK-BE-4.1.6** `[ ]` Endpoint `PATCH /publications/:pubId/articles/:id` — update artikel  
**TASK-BE-4.1.7** `[ ]` Endpoint `DELETE /publications/:pubId/articles/:id` — soft delete  
**TASK-BE-4.1.8** `[ ]` Endpoint `POST /publications/:pubId/articles/:id/publish` — publish atau schedule artikel  
**TASK-BE-4.1.9** `[ ]` Background job: publish scheduled articles saat waktu yang ditentukan tiba  
**TASK-BE-4.1.10** `[ ]` Commit: `feat(article): add article CRUD and publish flow`  

**TASK-FE-4.1.1** `[ ]` Install dan setup Tiptap editor  
**TASK-FE-4.1.2** `[ ]` Buat komponen `RichTextEditor.tsx` (Client Component) dengan extensions: Bold, Italic, Underline, Strike, Heading (H1-H4), BulletList, OrderedList, Blockquote, CodeBlock, Table, HorizontalRule, Image, YouTube embed  
**TASK-FE-4.1.3** `[ ]` Buat halaman editor `app/(dashboard)/dashboard/articles/[id]/page.tsx` — full screen, distraction-free  
**TASK-FE-4.1.4** `[ ]` Buat settings drawer: visibility (free/premium), excerpt, cover image, tag, jadwal publish, series, slug URL  
**TASK-FE-4.1.5** `[ ]` Autosave setiap 30 detik — tampilkan status "Tersimpan otomatis · X detik lalu"  
**TASK-FE-4.1.6** `[ ]` Tombol Preview — buka preview artikel di tab baru  
**TASK-FE-4.1.7** `[ ]` Tombol Terbitkan — konfirmasi dialog, lalu publish  
**TASK-FE-4.1.8** `[ ]` Commit: `feat(article): add rich text editor with Tiptap`  

**TASK-INT-4.1.1** `[ ]` Hubungkan editor dengan autosave ke backend  
**TASK-INT-4.1.2** `[ ]` Hubungkan publish action dengan backend  
**TASK-INT-4.1.3** `[ ]` Commit: `feat(article): integrate editor with backend`  

---

### STORY 4.2 — Upload Gambar ke Artikel
Sebagai author, saya ingin bisa menyisipkan gambar ke dalam artikel, agar konten lebih menarik secara visual.

**TASK-BE-4.2.1** `[ ]` Setup Cloudinary SDK di backend  
**TASK-BE-4.2.2** `[ ]` Buat `cloudinary.service.ts` — generate signed upload URL  
**TASK-BE-4.2.3** `[ ]` Endpoint `GET /media/upload-url` — return signed upload params untuk Cloudinary (authenticated)  
**TASK-BE-4.2.4** `[ ]` Commit: `feat(media): add Cloudinary signed upload URL endpoint`  

**TASK-FE-4.2.1** `[ ]` Integrasi Tiptap Image extension dengan Cloudinary direct upload  
**TASK-FE-4.2.2** `[ ]` Upload flow: minta signed URL dari backend → upload langsung ke Cloudinary → insert URL ke editor  
**TASK-FE-4.2.3** `[ ]` Tambahkan upload cover image di settings drawer  
**TASK-FE-4.2.4** `[ ]` Commit: `feat(media): integrate Cloudinary image upload in editor`  

---

### STORY 4.3 — Manajemen Artikel di Dashboard
Sebagai author/owner, saya ingin bisa melihat semua artikel dalam satu tampilan, agar saya bisa mengelola konten dengan mudah.

**TASK-BE-4.3.1** `[ ]` Endpoint `GET /publications/:pubId/articles` — list semua artikel dengan pagination, filter status dan author  
**TASK-BE-4.3.2** `[ ]` Commit: `feat(article): add article list endpoint with filters`  

**TASK-FE-4.3.1** `[ ]` Buat halaman `dashboard/articles/page.tsx` (Server Component)  
**TASK-FE-4.3.2** `[ ]` Tabel artikel: cover thumbnail, judul, tag, author, status badge, views, komentar count, tanggal  
**TASK-FE-4.3.3** `[ ]` Filter: tab Semua/Terbit/Draft/Terjadwal, filter by author, filter by tag, search judul  
**TASK-FE-4.3.4** `[ ]` Pagination dengan cursor-based  
**TASK-FE-4.3.5** `[ ]` Tombol "Tulis baru" → buat draft baru dan redirect ke editor  
**TASK-FE-4.3.6** `[ ]` Kebab menu per artikel: edit, hapus, lihat di publication  
**TASK-FE-4.3.7** `[ ]` Commit: `feat(article): add article management dashboard page`  

**TASK-INT-4.3.1** `[ ]` Integrasi halaman daftar artikel dengan backend  
**TASK-INT-4.3.2** `[ ]` Commit: `feat(article): integrate article list with backend`  

---

### STORY 4.4 — Series Artikel
Sebagai author, saya ingin bisa mengelompokkan artikel ke dalam sebuah series, agar pembaca bisa mengikuti konten secara terurut.

**TASK-BE-4.4.1** `[ ]` Buat `series.repository.ts`, `series.service.ts`, `series.router.ts`  
**TASK-BE-4.4.2** `[ ]` Endpoint `POST /publications/:pubId/series` — buat series baru  
**TASK-BE-4.4.3** `[ ]` Endpoint `GET /publications/:pubId/series` — list semua series  
**TASK-BE-4.4.4** `[ ]` Endpoint `GET /publications/:pubId/series/:slug` — detail series + daftar artikel  
**TASK-BE-4.4.5** `[ ]` Endpoint `PATCH /publications/:pubId/series/:id` — update series  
**TASK-BE-4.4.6** `[ ]` Endpoint `POST /publications/:pubId/series/:id/articles` — tambah artikel ke series + atur urutan  
**TASK-BE-4.4.7** `[ ]` Endpoint `DELETE /publications/:pubId/series/:id/articles/:articleId` — remove artikel dari series  
**TASK-BE-4.4.8** `[ ]` Tracking read progress per user: `POST /series/:id/articles/:articleId/read`  
**TASK-BE-4.4.9** `[ ]` Commit: `feat(series): add series management endpoints`  

**TASK-FE-4.4.1** `[ ]` Buat halaman `dashboard/series/page.tsx` — list semua series  
**TASK-FE-4.4.2** `[ ]` Buat halaman buat/edit series: judul, deskripsi, cover, drag-and-drop urutan artikel  
**TASK-FE-4.4.3** `[ ]` Buat halaman series publik `app/(publication)/series/[slug]/page.tsx` (Cache Component)  
**TASK-FE-4.4.4** `[ ]` Tampilan series: header info, progress bar "X dari Y bagian", daftar artikel dengan status (selesai/sedang dibaca/belum dibaca/premium)  
**TASK-FE-4.4.5** `[ ]` Tambahkan navigasi prev/next series di halaman artikel  
**TASK-FE-4.4.6** `[ ]` Commit: `feat(series): add series pages frontend`  

**TASK-INT-4.4.1** `[ ]` Integrasi series management dan reader experience  
**TASK-INT-4.4.2** `[ ]` Commit: `feat(series): integrate series feature end-to-end`  

---

## EPIC 5 — Subscription & Payment

### STORY 5.1 — Konfigurasi Paket Subscription
Sebagai owner, saya ingin bisa mengatur harga subscription untuk tiap durasi, agar pembaca bisa memilih paket yang sesuai.

**TASK-BE-5.1.1** `[ ]` Buat `subscription.repository.ts` — method untuk plans dan subscriptions  
**TASK-BE-5.1.2** `[ ]` Endpoint `GET /publications/:pubId/subscription-plans` — list semua plans aktif (public)  
**TASK-BE-5.1.3** `[ ]` Endpoint `PUT /publications/:pubId/subscription-plans` — update/create semua plans sekaligus (owner only)  
**TASK-BE-5.1.4** `[ ]` Kalkulasi otomatis persentase hemat vs harga bulanan  
**TASK-BE-5.1.5** `[ ]` Commit: `feat(subscription): add subscription plans management`  

**TASK-FE-5.1.1** `[ ]` Tab Paket Harga di halaman settings: input harga per tier, toggle enable/disable, preview tampilan "hemat X%"  
**TASK-FE-5.1.2** `[ ]` Commit: `feat(subscription): add subscription plans settings UI`  

**TASK-INT-5.1.1** `[ ]` Integrasi settings paket harga  
**TASK-INT-5.1.2** `[ ]` Commit: `feat(subscription): integrate subscription plans settings`  

---

### STORY 5.2 — Proses Berlangganan
Sebagai pembaca, saya ingin bisa berlangganan ke publication yang saya sukai, agar saya bisa mengakses konten premium.

**TASK-BE-5.2.1** `[ ]` Setup Midtrans SDK  
**TASK-BE-5.2.2** `[ ]` Buat `midtrans.service.ts` — create transaction, verify webhook signature  
**TASK-BE-5.2.3** `[ ]` Endpoint `POST /publications/:pubId/subscriptions/order` — validasi plan, hitung fee (15%), buat record subscription status `pending`, buat Midtrans transaction, return snap_token  
**TASK-BE-5.2.4** `[ ]` Endpoint `POST /subscriptions/webhook/midtrans` — verify signature, cek idempotency, update status subscription berdasarkan transaction_status  
**TASK-BE-5.2.5** `[ ]` Buat `member.middleware.ts` — cek apakah user punya subscription aktif untuk publication ini, cache di Redis (TTL 5 menit)  
**TASK-BE-5.2.6** `[ ]` Commit: `feat(subscription): add Midtrans payment integration and webhook`  

**TASK-FE-5.2.1** `[ ]` Buat halaman `app/(publication)/subscribe/page.tsx` (Client Component)  
**TASK-FE-5.2.2** `[ ]` Tampilkan semua paket aktif dengan harga, persentase hemat, dan benefit  
**TASK-FE-5.2.3** `[ ]` Tampilkan ringkasan order di sidebar: paket dipilih, diskon, PPN, total  
**TASK-FE-5.2.4** `[ ]` Pilihan metode pembayaran (GoPay, QRIS, Virtual Account, Kartu Kredit)  
**TASK-FE-5.2.5** `[ ]` Integrasi Midtrans Snap.js — tampilkan popup pembayaran  
**TASK-FE-5.2.6** `[ ]` Handle callback sukses: redirect ke artikel yang dituju / homepage publication  
**TASK-FE-5.2.7** `[ ]` Handle callback gagal: tampilkan pesan error dan opsi coba lagi  
**TASK-FE-5.2.8** `[ ]` Commit: `feat(subscription): add subscribe and checkout page`  

**TASK-INT-5.2.1** `[ ]` Integrasi checkout dengan backend dan Midtrans  
**TASK-INT-5.2.2** `[ ]` Test end-to-end: pilih paket → bayar (sandbox) → akses konten premium  
**TASK-INT-5.2.3** `[ ]` Commit: `feat(subscription): integrate payment flow end-to-end`  

---

### STORY 5.3 — Manajemen Subscription Member
Sebagai member, saya ingin bisa melihat status subscription saya dan riwayat transaksi, agar saya tahu kapan subscription saya berakhir.

**TASK-BE-5.3.1** `[ ]` Endpoint `GET /subscriptions/me` — status subscription aktif user yang login, untuk publication yang sedang diakses  
**TASK-BE-5.3.2** `[ ]` Endpoint `GET /subscriptions/me/history` — riwayat semua transaksi  
**TASK-BE-5.3.3** `[ ]` Endpoint `DELETE /subscriptions/:id` — cancel subscription (akses tetap aktif hingga expired)  
**TASK-BE-5.3.4** `[ ]` Commit: `feat(subscription): add member subscription management endpoints`  

**TASK-FE-5.3.1** `[ ]` Buat halaman `app/me/subscription/page.tsx` — status paket aktif, tanggal berakhir, tabel riwayat transaksi, tombol cancel  
**TASK-FE-5.3.2** `[ ]` Commit: `feat(subscription): add member subscription settings page`  

**TASK-INT-5.3.1** `[ ]` Integrasi halaman subscription settings  
**TASK-INT-5.3.2** `[ ]` Commit: `feat(subscription): integrate member subscription management`  

---

## EPIC 6 — Reader Experience

### STORY 6.1 — Homepage Publication
Sebagai pengunjung, saya ingin bisa melihat homepage publication dengan daftar artikel terbaru dan informasi tentang para penulis, agar saya bisa memutuskan apakah ingin berlangganan.

**TASK-BE-6.1.1** `[ ]` Endpoint `GET /publications/:pubId/articles` — list artikel publik dengan pagination, filter author/tag, sort by terbaru (public: hanya free + metadata premium)  
**TASK-BE-6.1.2** `[ ]` Endpoint `GET /publications/:pubId/authors` — list semua author dengan bio  
**TASK-BE-6.1.3** `[ ]` Commit: `feat(reader): add public article list and author list endpoints`  

**TASK-FE-6.1.1** `[ ]` Buat layout `app/(publication)/layout.tsx` — fetch publication dari host header, set metadata dasar  
**TASK-FE-6.1.2** `[ ]` Buat halaman `app/(publication)/page.tsx` (Cache Component, `cacheLife('minutes')`)  
**TASK-FE-6.1.3** `[ ]` Section hero: tagline publication, deskripsi, CTA berlangganan + baca gratis, stats (jumlah subscriber, artikel, penulis)  
**TASK-FE-6.1.4** `[ ]` Section artikel: featured article (besar), grid artikel lainnya, badge PREMIUM untuk artikel premium  
**TASK-FE-6.1.5** `[ ]` Section penulis: card tiap author dengan foto, nama, spesialisasi, bio singkat, link ke semua tulisannya  
**TASK-FE-6.1.6** `[ ]` Navbar: logo, menu (Beranda, Series, Roadmap, Penulis, Tentang), search icon, Library icon, tombol Masuk / Berlangganan  
**TASK-FE-6.1.7** `[ ]` `generateMetadata` untuk SEO: title, description, OG image dari logo publication  
**TASK-FE-6.1.8** `[ ]` Commit: `feat(reader): add publication homepage`  

**TASK-INT-6.1.1** `[ ]` Integrasi homepage dengan backend  
**TASK-INT-6.1.2** `[ ]` Commit: `feat(reader): integrate publication homepage`  

---

### STORY 6.2 — Membaca Artikel
Sebagai pembaca, saya ingin bisa membaca artikel dengan nyaman, agar pengalaman belajar saya menyenangkan.

**TASK-BE-6.2.1** `[ ]` Endpoint artikel sudah ada — tambahkan: untuk artikel premium, cek subscription user, return konten penuh jika member atau return excerpt saja jika bukan  
**TASK-BE-6.2.2** `[ ]` Endpoint `POST /publications/:pubId/articles/:id/view` — increment view count  
**TASK-BE-6.2.3** `[ ]` Commit: `feat(reader): add article access control and view tracking`  

**TASK-FE-6.2.1** `[ ]` Buat halaman `app/(publication)/[articleSlug]/page.tsx`  
**TASK-FE-6.2.2** `[ ]` Artikel free: Cache Component dengan `cacheLife('hours')` dan `cacheTag`  
**TASK-FE-6.2.3** `[ ]` Artikel premium: request-time (tidak di-cache), cek subscription server-side  
**TASK-FE-6.2.4** `[ ]` Layout artikel: cover image, badge tag + PREMIUM, judul, excerpt, info author (avatar + nama + tanggal + reading time)  
**TASK-FE-6.2.5** `[ ]` Konten artikel: render Tiptap JSON ke HTML dengan typography yang baik, max-width ~680px  
**TASK-FE-6.2.6** `[ ]` Progress bar reading — sticky di atas halaman, update saat scroll (Client Component)  
**TASK-FE-6.2.7** `[ ]` Action bar: tombol like (semua user), tombol save ke folder (member), tombol share  
**TASK-FE-6.2.8** `[ ]` Author bio section di bawah artikel: foto, nama, bio, link ke semua tulisannya  
**TASK-FE-6.2.9** `[ ]` Navigasi prev/next artikel jika bagian dari series  
**TASK-FE-6.2.10** `[ ]` `generateMetadata` — meta title, description, OG image dari cover artikel  
**TASK-FE-6.2.11** `[ ]` Commit: `feat(reader): add article reader page`  

**TASK-INT-6.2.1** `[ ]` Integrasi halaman artikel dengan backend  
**TASK-INT-6.2.2** `[ ]` Test: artikel free bisa dibaca semua, artikel premium terblock untuk non-member  
**TASK-INT-6.2.3** `[ ]` Commit: `feat(reader): integrate article reader`  

---

### STORY 6.3 — Paywall
Sebagai non-member yang membaca artikel premium, saya ingin melihat CTA berlangganan yang menarik, agar saya tertarik untuk subscribe.

**TASK-FE-6.3.1** `[ ]` Buat komponen `ArticlePaywall.tsx` (Server Component)  
**TASK-FE-6.3.2** `[ ]` Tampilkan preview konten (±200 kata pertama) dengan fade-out effect di bawahnya  
**TASK-FE-6.3.3** `[ ]` CTA card: "Selebihnya tersedia untuk member" + benefit singkat + tombol Berlangganan + link Masuk (jika sudah punya akun)  
**TASK-FE-6.3.4** `[ ]` Tidak ada referensi free trial apapun  
**TASK-FE-6.3.5** `[ ]` Commit: `feat(reader): add paywall component`  

---

### STORY 6.4 — Like Artikel
Sebagai pengunjung, saya ingin bisa memberikan like pada artikel yang saya sukai, agar author tahu konten mana yang disukai audiencenya.

**TASK-BE-6.4.1** `[ ]` Endpoint `POST /publications/:pubId/articles/:id/like` — toggle like (authenticated)  
**TASK-BE-6.4.2** `[ ]` Endpoint `GET /publications/:pubId/articles/:id/like` — cek apakah user sudah like  
**TASK-BE-6.4.3** `[ ]` Commit: `feat(reader): add article like endpoint`  

**TASK-FE-6.4.1** `[ ]` Buat komponen `ArticleLikeButton.tsx` (Client Component) — tombol like dengan jumlah, toggle state  
**TASK-FE-6.4.2** `[ ]` Non-member bisa like artikel free; member bisa like semua artikel  
**TASK-FE-6.4.3** `[ ]` Commit: `feat(reader): add article like button`  

**TASK-INT-6.4.1** `[ ]` Integrasi like button dengan backend  
**TASK-INT-6.4.2** `[ ]` Commit: `feat(reader): integrate article like`  

---

## EPIC 7 — Email & Notifikasi

### STORY 7.1 — Setup Email Service
Sebagai developer, saya ingin sistem email ter-setup dengan benar, agar semua email transaksional dan newsletter bisa dikirim dengan andal.

**TASK-BE-7.1.1** `[ ]` Setup Resend SDK  
**TASK-BE-7.1.2** `[ ]` Buat `email.service.ts` — method generic `sendEmail`  
**TASK-BE-7.1.3** `[ ]` Setup BullMQ untuk email queue dengan Redis  
**TASK-BE-7.1.4** `[ ]` Buat email worker yang consume job dari queue  
**TASK-BE-7.1.5** `[ ]` Commit: `feat(email): setup Resend email service with BullMQ queue`  

---

### STORY 7.2 — Email Transaksional
Sebagai user, saya ingin menerima email konfirmasi untuk setiap aksi penting, agar saya tahu bahwa tindakan saya berhasil.

**TASK-BE-7.2.1** `[ ]` Buat template email verifikasi akun  
**TASK-BE-7.2.2** `[ ]` Buat template email reset password  
**TASK-BE-7.2.3** `[ ]` Buat template email konfirmasi subscription berhasil  
**TASK-BE-7.2.4** `[ ]` Buat template email reminder subscription akan berakhir (7 hari sebelum)  
**TASK-BE-7.2.5** `[ ]` Buat template email notifikasi subscription berakhir  
**TASK-BE-7.2.6** `[ ]` Background job: cek subscription yang akan berakhir dalam 7 hari, kirim reminder  
**TASK-BE-7.2.7** `[ ]` Commit: `feat(email): add all transactional email templates and jobs`  

---

### STORY 7.3 — Notifikasi Artikel Baru
Sebagai subscriber, saya ingin mendapat notifikasi email saat ada artikel baru, agar saya tidak melewatkan konten terbaru.

**TASK-BE-7.3.1** `[ ]` Buat template email notifikasi artikel baru: judul, excerpt, cover image, CTA baca artikel  
**TASK-BE-7.3.2** `[ ]` Saat artikel dipublish: enqueue email job ke semua subscriber yang opt-in  
**TASK-BE-7.3.3** `[ ]` Endpoint `GET /email/unsubscribe?token=xxx` — update `email_preferences.new_article = false`  
**TASK-BE-7.3.4** `[ ]` Setiap email newsletter menyertakan unsubscribe link dengan signed token  
**TASK-BE-7.3.5** `[ ]` Commit: `feat(email): add new article notification email`  

**TASK-FE-7.3.1** `[ ]` Di profile settings, tambahkan toggle preferensi email notifikasi artikel baru  
**TASK-FE-7.3.2** `[ ]` Commit: `feat(email): add email preferences UI`  

---

## EPIC 8 — Dashboard & Analytics

### STORY 8.1 — Dashboard Overview
Sebagai owner, saya ingin melihat ringkasan performa publication saya dalam satu halaman, agar saya bisa memantau pertumbuhan dengan mudah.

**TASK-BE-8.1.1** `[ ]` Buat `analytics.service.ts`  
**TASK-BE-8.1.2** `[ ]` Endpoint `GET /publications/:pubId/analytics/overview` — return: total subscriber aktif, subscriber baru bulan ini, MRR estimasi, open rate email, total views 30 hari, top artikel by views  
**TASK-BE-8.1.3** `[ ]` Endpoint `GET /publications/:pubId/analytics/views-chart` — data views per hari/bulan untuk chart  
**TASK-BE-8.1.4** `[ ]` Commit: `feat(analytics): add overview analytics endpoint`  

**TASK-FE-8.1.1** `[ ]` Buat halaman `dashboard/page.tsx` (Server Component, request-time)  
**TASK-FE-8.1.2** `[ ]` 4 stats card: Subscriber Aktif, MRR, Views (30 hari), Open Rate Email — masing-masing dengan mini sparkline dan delta vs periode sebelumnya  
**TASK-FE-8.1.3** `[ ]` Chart views per bulan (Client Component untuk interaktivitas — pilih range 30hr/6bln/12bln)  
**TASK-FE-8.1.4** `[ ]` Tabel top artikel by views  
**TASK-FE-8.1.5** `[ ]` Tombol "Lihat publication" dan "Tulis baru" di header  
**TASK-FE-8.1.6** `[ ]` Commit: `feat(analytics): add dashboard overview page`  

**TASK-INT-8.1.1** `[ ]` Integrasi dashboard dengan backend  
**TASK-INT-8.1.2** `[ ]` Commit: `feat(analytics): integrate dashboard overview`  

---

### STORY 8.2 — Manajemen Subscriber
Sebagai owner, saya ingin melihat daftar lengkap subscriber saya, agar saya bisa menganalisis audience dan mengekspornya jika diperlukan.

**TASK-BE-8.2.1** `[ ]` Endpoint `GET /publications/:pubId/subscribers` — list subscriber dengan pagination, filter by paket dan status  
**TASK-BE-8.2.2** `[ ]` Endpoint `GET /publications/:pubId/subscribers/export` — generate dan return CSV  
**TASK-BE-8.2.3** `[ ]` Commit: `feat(analytics): add subscriber list and CSV export endpoints`  

**TASK-FE-8.2.1** `[ ]` Buat halaman `dashboard/subscribers/page.tsx` (Server Component)  
**TASK-FE-8.2.2** `[ ]` Tabel: avatar, nama, email, paket aktif, tanggal subscribe, status  
**TASK-FE-8.2.3** `[ ]` Filter by paket dan status, search by nama/email  
**TASK-FE-8.2.4** `[ ]` Tombol Export CSV  
**TASK-FE-8.2.5** `[ ]` Commit: `feat(analytics): add subscriber management page`  

**TASK-INT-8.2.1** `[ ]` Integrasi subscriber list dan export  
**TASK-INT-8.2.2** `[ ]` Commit: `feat(analytics): integrate subscriber management`  

---

## EPIC 9 — Pre-Launch & Production

### STORY 9.1 — Security Hardening
Sebagai operator platform, saya ingin memastikan platform aman sebelum diluncurkan.

**TASK-9.1.1** `[ ]` Audit semua endpoint: pastikan semua query repository include `publicationId`  
**TASK-9.1.2** `[ ]` Pastikan rate limiting aktif di semua endpoint auth  
**TASK-9.1.3** `[ ]` Pastikan webhook Midtrans verify signature sebelum proses  
**TASK-9.1.4** `[ ]` Pastikan tidak ada API key atau secret yang ter-commit di git  
**TASK-9.1.5** `[ ]` Test: coba akses artikel premium publication A dengan akun member publication B — harus ditolak  
**TASK-9.1.6** `[ ]` Commit: `chore(security): security audit and hardening`  

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
| **Total** | **226 tasks** |

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

# Product Requirements Document (PRD)
## Platform Blog Subscription Multi-Author
**Versi:** 1.1  
**Tanggal:** 22 Mei 2026  
**Status:** Draft  
**Author:** [Nama Kamu]

---

## Daftar Isi
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [User Personas](#4-user-personas)
5. [Arsitektur Sistem (High Level)](#5-arsitektur-sistem-high-level)
6. [Fitur & Functional Requirements](#6-fitur--functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Database Schema (High Level)](#8-database-schema-high-level)
9. [User Flows](#9-user-flows)
10. [MVP Scope & Prioritas](#10-mvp-scope--prioritas)
11. [Tech Stack Recommendation](#11-tech-stack-recommendation)
12. [Milestone & Roadmap](#12-milestone--roadmap)
13. [Assumptions & Constraints](#13-assumptions--constraints)
14. [Keputusan Bisnis & Teknis](#14-keputusan-bisnis--teknis)

---

## 1. Executive Summary

Platform ini adalah infrastruktur blog berlangganan (subscription-based) yang memungkinkan satu atau beberapa penulis (author) memonetisasi konten tulisan mereka secara langsung kepada audience yang mereka miliki. Setiap "publication" berdiri sendiri secara brand dan audience — pembaca tidak mengetahui atau berinteraksi dengan publication lain yang ada di platform yang sama.

Model ini mirip dengan Ghost.org dalam konsep (setiap blog independen, ditenagai infrastruktur yang sama), namun dengan penekanan pada:
- Multi-author per publication dengan akses member yang terpadu
- Konten berseri dengan tampilan Series/Roadmap
- Fitur komunitas (komentar, Q&A, save artikel)
- Ownership data audience sepenuhnya di tangan pemilik publication

**Platform fee model:** Platform mengambil persentase dari setiap transaksi subscription sebagai revenue model bisnis. Fee bersifat fleksibel — dapat dikonfigurasi per publication dan dapat dimatikan sepenuhnya (misal untuk publication milik operator platform sendiri).

---

## 2. Problem Statement

### Masalah dari Sisi Author/Pemilik Blog
- Kreator konten teks tidak punya platform khusus untuk memonetisasi tulisan mereka secara langsung di Indonesia
- Penulis yang berkolaborasi (misal: komunitas investasi dengan spesialisasi berbeda) tidak punya wadah untuk menyatukan audience dan subscription dalam satu tempat
- Platform yang ada (Medium, Substack) tidak memberikan kontrol penuh atas data subscriber
- Tidak ada insentif finansial yang cukup kuat untuk mendorong kreator konsisten memproduksi konten premium berkualitas

### Masalah dari Sisi Pembaca (Reader)
- Pembaca yang lebih suka belajar melalui teks tidak punya platform berkualitas yang setara dengan platform video (YouTube, dll)
- Untuk mengikuti beberapa penulis dengan keahlian berbeda namun topik serumpun, pembaca harus subscribe ke banyak tempat berbeda
- Tidak ada fitur personal knowledge management untuk menyimpan dan mengorganisasi artikel yang sudah dibaca

---

## 3. Goals & Non-Goals

### ✅ Goals
- Membangun platform yang dapat digunakan oleh satu pemilik publication atau beberapa pemilik sekaligus
- Memberikan kemampuan monetisasi langsung melalui subscription berbasis waktu (bulanan, 3 bulanan, 6 bulanan, tahunan)
- Menjaga eksklusivitas antar publication — setiap publication memiliki audience terpisah
- Memberikan kontrol penuh atas data subscriber kepada pemilik publication
- Menyediakan pengalaman membaca yang superior dibanding platform generik
- Mendukung konten berseri dengan navigasi yang terstruktur (Series & Roadmap)
- Membangun fitur komunitas ringan (komentar, Q&A, save artikel)

### ❌ Non-Goals (untuk saat ini)
- Bukan marketplace publik — tidak ada halaman "explore all publications"
- Tidak membangun fitur video hosting sendiri (embed YouTube cukup)
- Tidak membangun mobile app native di MVP (web responsive dulu)
- Tidak ada sistem referral atau affiliate di MVP
- Tidak ada fitur live session/webinar
- Tidak ada AI-generated content tools
- Tidak ada multi-bahasa UI di MVP (Bahasa Indonesia dulu)

---

## 4. User Personas

### Persona 1: Publication Owner — "Budi, Investor & Kreator Konten"
- **Demografi:** 28–45 tahun, profesional, sudah aktif menulis di media sosial atau blog personal
- **Situasi:** Sudah punya audience organik yang loyal, ingin mulai monetisasi tanpa bergantung pada iklan
- **Pain Point:** Platform yang ada tidak memberi kontrol atas data subscriber, revenue share terlalu besar dipotong platform
- **Goal:** Punya "rumah digital" sendiri untuk audience, bisa monetisasi secara konsisten

### Persona 2: Multi-Author Group — "Komunitas Investasi Bersama"
- **Demografi:** 2–5 orang dengan spesialisasi berbeda dalam satu topik besar
- **Situasi:** Masing-masing punya audience, ingin bergabung untuk memberikan value yang lebih lengkap
- **Pain Point:** Subscriber harus berlangganan ke masing-masing penulis secara terpisah, tidak efisien
- **Goal:** Satu subscription memberikan akses ke semua konten dari semua author dalam publication

### Persona 3: Member/Subscriber — "Rina, Pembaca Aktif"
- **Demografi:** 22–40 tahun, gemar belajar, lebih suka membaca daripada menonton video
- **Situasi:** Ingin belajar topik tertentu secara mendalam dari sumber terpercaya
- **Pain Point:** Konten premium berkualitas tersebar di banyak platform, harus kelola banyak subscription
- **Goal:** Satu tempat, satu subscription, akses konten berkualitas dari expert yang mereka percaya

---

## 5. Arsitektur Sistem (High Level)

### Konsep Utama: Multi-Tenant dengan Isolasi Audience

```
Platform Infrastructure
├── Publication A (investasicerdas.com)
│   ├── Authors: [Author1, Author2, Author3, Author4]
│   ├── Members: [subscriber khusus Publication A]
│   └── Content: [artikel, series, roadmap]
│
├── Publication B (techinsider.id)
│   ├── Authors: [Author1, Author2]
│   ├── Members: [subscriber khusus Publication B]
│   └── Content: [artikel, series, roadmap]
│
└── Shared Infrastructure
    ├── Auth Service (login/register)
    ├── Payment Service (subscription billing)
    ├── Email Service (newsletter, notifikasi)
    └── Storage (gambar, aset konten)
```

### Prinsip Isolasi
- Seorang user yang merupakan Member di Publication A tidak otomatis tahu Publication B exist
- Tidak ada halaman "discover" lintas publication
- Setiap publication dapat menggunakan custom domain sendiri
- Data subscriber masing-masing publication terpisah dan dikelola oleh owner-nya

### Komponen Sistem

| Komponen | Fungsi |
|---|---|
| Web App (Frontend) | Interface untuk reader, author, dan owner |
| Admin Dashboard | Manajemen publication, author, konten, subscriber, analytics |
| API Server | Backend REST API utama |
| Auth Service | Register, login, OAuth (Google), JWT, session management |
| Payment Service | Integrasi payment gateway, webhook, subscription lifecycle |
| Email Service | Transaksional email + newsletter |
| Database | Data utama (PostgreSQL) |
| File Storage | Upload gambar dan aset (cloud storage) |
| Search Service | Full-text search konten |

---

## 6. Fitur & Functional Requirements

### Modul 1: Autentikasi & Manajemen Akun

#### FR-AUTH-01: Register
- User dapat mendaftar dengan email dan password
- Validasi: email unik, password minimum 8 karakter, harus include huruf dan angka
- Email verifikasi dikirim setelah register

#### FR-AUTH-02: Login
- Login dengan email & password
- Login dengan Google OAuth
- Remember me (session 30 hari)

#### FR-AUTH-03: Password Management
- Forgot password via email (token valid 1 jam)
- Change password dari profile settings
- Password lama harus diverifikasi saat change password

#### FR-AUTH-04: Profile Management
- User bisa update nama, foto profil, bio singkat
- Author memiliki profile page publik di dalam publication mereka

---

### Modul 2: Publication Management

#### FR-PUB-01: Membuat Publication
- Owner mendaftarkan publication baru: nama, deskripsi, topik, logo
- Setiap publication mendapat subdomain default: `[slug].platform.com`
- Custom domain bisa dikonfigurasi (CNAME setup)

#### FR-PUB-02: Manajemen Author
- Owner dapat mengundang author via email
- Setiap author punya role: Owner / Senior Author / Author
- Owner dapat remove author dari publication

#### FR-PUB-03: Publication Settings
- Konfigurasi harga subscription (per tier waktu)
- Konfigurasi konten apa saja yang free vs premium
- Konfigurasi halaman "About" publication

---

### Modul 3: Content Management (Editor)

#### FR-CONTENT-01: Rich Text Editor
- Editor WYSIWYG dengan kemampuan:
  - Format teks: heading (H1-H4), bold, italic, underline, strikethrough
  - Lists: bullet dan numbered
  - Blockquote
  - Code block (dengan syntax highlighting)
  - Table
  - Divider/separator
  - Embed gambar (upload atau URL)
  - Embed video YouTube (via URL, ditampilkan sebagai player)
  - Embed tweet/social media
- Autosave setiap 30 detik

#### FR-CONTENT-02: Pengaturan Artikel
- Judul, slug URL (auto-generate, bisa custom)
- Excerpt / ringkasan untuk preview
- Cover image
- Tag/kategori
- Status: Draft / Scheduled / Published
- Visibility: Free / Members Only (Premium)
- Tanggal publish (bisa dijadwalkan)

#### FR-CONTENT-03: Series
- Author dapat membuat "Series" (kumpulan artikel linear)
- Setiap artikel dapat dimasukkan ke dalam satu Series
- Series memiliki: judul, deskripsi, cover image, urutan artikel
- Di halaman artikel, tampil navigasi series: artikel sebelumnya & berikutnya
- Halaman Series menampilkan semua artikel dengan progress pembaca (artikel mana yang sudah dibaca)

#### FR-CONTENT-04: Roadmap / Learning Path
- Author dapat membuat "Roadmap" (kurikulum besar yang terdiri dari beberapa Series atau artikel individual)
- Roadmap memiliki tahapan (stages/nodes): misal Beginner → Intermediate → Advanced
- Setiap node dalam roadmap berisi daftar artikel atau series
- Visual roadmap ditampilkan sebagai diagram tahapan dengan status (locked/unlocked/completed)
- Roadmap bisa sepenuhnya free, sepenuhnya premium, atau campuran

#### FR-CONTENT-05: Preview & SEO
- Preview tampilan artikel sebelum publish
- Meta title dan meta description bisa dikustomisasi
- Open Graph image untuk social sharing
- Artikel free diindeks search engine (SEO-friendly)
- Artikel premium: hanya excerpt yang terindeks, konten utama di-gate

---

### Modul 4: Subscription & Payment

#### FR-PAY-01: Paket Subscription
- Owner mengkonfigurasi harga untuk tier berikut:
  - Bulanan (1 bulan)
  - Kuartalan (3 bulan)
  - Semi-tahunan (6 bulan)
  - Tahunan (12 bulan)
- Owner bisa disable tier tertentu
- Tampilan "hemat X%" otomatis dihitung untuk tier lebih panjang

#### FR-PAY-02: Proses Subscribe
- Reader memilih paket → masuk ke halaman checkout
- Jika belum login, diarahkan ke register/login dulu
- Checkout menampilkan: ringkasan paket, harga, metode pembayaran
- Pembayaran via payment gateway (Midtrans sebagai default)
- Setelah pembayaran sukses: status member aktif, email konfirmasi dikirim

#### FR-PAY-03: Manajemen Subscription
- Member bisa lihat status subscription aktif: paket, tanggal mulai, tanggal berakhir
- Perpanjangan subscription (manual atau auto-renew jika payment gateway support)
- Pembatalan subscription (akses tetap aktif hingga tanggal berakhir)
- Riwayat transaksi

#### FR-PAY-04: Revenue & Platform Fee
- Platform fee default: 15% per transaksi — dikonfigurasi per publication, dapat diubah atau dimatikan
- Publication milik operator platform dapat menggunakan fee 0%
- Sisa revenue (setelah fee) dicatat dan diteruskan ke owner publication
- MVP: payout dilakukan manual oleh operator platform
- Dashboard revenue untuk owner: total subscriber aktif, MRR estimasi, riwayat transaksi masuk

---

### Modul 5: Reader Experience

#### FR-READ-01: Halaman Publikasi
- Landing page publication: nama, deskripsi, daftar author, preview artikel terbaru
- Daftar artikel: semua artikel (free + preview premium)
- Filter by author, tag, series
- Artikel premium ditandai dengan badge "Members Only"
- Call-to-action subscribe yang jelas

#### FR-READ-02: Halaman Artikel
- Konten artikel dengan typography yang baik dan readable
- Progress bar reading (scroll)
- Estimated reading time
- Author info & bio
- Tag artikel
- Navigasi artikel terkait / artikel lain dari series yang sama
- Tombol save artikel ke folder
- Bagian komentar (lihat FR-COMMUNITY-01)

#### FR-READ-03: Paywall
- Artikel premium: tampil excerpt (±200 kata pertama) lalu blur/cut off
- CTA subscribe dengan penjelasan benefit
- Jika sudah subscribe tapi belum login: prompt login

#### FR-READ-04: Search
- Search bar tersedia di setiap publication
- Mencari berdasarkan judul, konten (full-text), dan tag
- Filter hasil by author, by type (artikel/series/roadmap)
- Member mendapat hasil pencarian di konten premium juga; non-member hanya konten free

#### FR-READ-05: Folder & Saved Articles (Personal Library)
- Member dapat membuat folder (nama custom)
- Dari halaman artikel, member bisa save artikel ke folder tertentu
- Halaman "Library" menampilkan semua folder dan isinya
- Bisa pindahkan artikel antar folder
- Bisa remove artikel dari folder

---

### Modul 6: Komunitas

#### FR-COMMUNITY-01: Komentar Artikel
- Komentar **eksklusif untuk member** dengan subscription aktif
- Non-member hanya dapat memberikan **"like"** pada artikel free sebagai sinyal ketertarikan
- Reply komentar (1 level thread)
- Like komentar (oleh member)
- Author/Owner bisa pin komentar tertentu
- Author/Owner bisa moderasi (hapus komentar yang melanggar)
- Notifikasi email jika komentar mendapat reply

#### FR-COMMUNITY-02: Tanya Jawab (Q&A)
- Section Q&A terpisah dari komentar artikel (di level publication, bukan per artikel)
- **Member saja** yang bisa submit pertanyaan dan upvote
- Author bisa menjawab pertanyaan secara resmi
- Author bisa menyematkan/highlight jawaban terbaik
- Pertanyaan yang dijawab bisa dikategorikan by topic/tag

---

### Modul 7: Email & Notifikasi

#### FR-EMAIL-01: Email Notifikasi Artikel Baru
- Ketika artikel baru dipublish, email dikirim ke subscriber yang memberikan consent
- Konten email: judul, excerpt, cover image, CTA "Baca Artikel"
- Frekuensi pengiriman bisa diatur owner: setiap artikel baru, atau digest mingguan

#### FR-EMAIL-02: Email Transaksional
- Verifikasi email register
- Konfirmasi pembayaran subscription
- Reminder subscription akan berakhir (7 hari sebelum)
- Notifikasi subscription berakhir

#### FR-EMAIL-03: Preferensi Notifikasi Member
- Member bisa opt-out dari email newsletter artikel baru
- Member tidak bisa opt-out dari email transaksional (konfirmasi pembayaran, dll)

---

### Modul 8: Analytics & Dashboard Owner

#### FR-ANALYTICS-01: Dashboard Overview
- Total subscriber aktif saat ini
- Subscriber baru bulan ini vs bulan lalu
- MRR (Monthly Recurring Revenue) estimasi
- Total artikel published, total views

#### FR-ANALYTICS-02: Per-Artikel Analytics
- Views per artikel
- Estimated reads (user yang scroll >70% artikel)
- Komentar dan interaksi

#### FR-ANALYTICS-03: Subscriber Data
- List semua subscriber: nama, email, paket aktif, tanggal subscribe
- Export subscriber list (CSV)
- Filter by paket, status (aktif/expired)

---

## 7. Non-Functional Requirements

### Performance
- Halaman artikel harus load < 2 detik pada koneksi normal (tanpa gambar berat)
- API response time < 500ms untuk operasi umum
- Platform harus mampu menangani minimum 1.000 concurrent readers per publication

### Security
- Semua komunikasi via HTTPS
- Password disimpan dengan hashing (bcrypt / argon2)
- JWT untuk authentication dengan expiry yang proper
- Rate limiting pada endpoint login dan register (mencegah brute force)
- Konten premium hanya bisa diakses oleh subscriber aktif yang terautentikasi
- Data subscriber per publication hanya bisa diakses oleh owner publication tersebut

### Scalability
- Arsitektur database harus mendukung penambahan publication baru tanpa perubahan skema besar
- Media/gambar disimpan di cloud storage (bukan local server)
- Email dikirim via email service provider (tidak dari server sendiri)

### Availability
- Uptime target 99.5%
- Error monitoring dan alerting

### Privacy & Data
- Compliance dengan prinsip dasar perlindungan data (tidak menjual data user ke pihak ketiga)
- Owner publication bisa export dan hapus data subscriber atas permintaan

---

## 8. Database Schema (High Level)

### Entitas Utama

```
USERS
- id (uuid, PK)
- email (unique)
- password_hash
- name
- avatar_url
- created_at

PUBLICATIONS
- id (uuid, PK)
- slug (unique)
- name
- description
- logo_url
- custom_domain
- owner_id (FK → USERS)
- created_at

PUBLICATION_AUTHORS
- publication_id (FK)
- user_id (FK)
- role (owner | author)
- joined_at

SUBSCRIPTION_PLANS
- id (uuid, PK)
- publication_id (FK)
- duration_months (1 | 3 | 6 | 12)
- price (decimal)
- is_active (boolean)

SUBSCRIPTIONS
- id (uuid, PK)
- publication_id (FK)
- user_id (FK → subscriber)
- plan_id (FK)
- status (active | expired | cancelled)
- started_at
- expires_at
- payment_id

ARTICLES
- id (uuid, PK)
- publication_id (FK)
- author_id (FK → USERS)
- title
- slug
- content (rich text / JSON)
- excerpt
- cover_image_url
- status (draft | scheduled | published)
- visibility (free | members_only)
- published_at
- meta_title
- meta_description
- reading_time_minutes

SERIES
- id (uuid, PK)
- publication_id (FK)
- author_id (FK)
- title
- description
- cover_image_url
- order_index

SERIES_ARTICLES
- series_id (FK)
- article_id (FK)
- order_index

ROADMAPS
- id (uuid, PK)
- publication_id (FK)
- title
- description

ROADMAP_STAGES
- id (uuid, PK)
- roadmap_id (FK)
- title
- order_index

ROADMAP_STAGE_ITEMS
- stage_id (FK)
- item_type (article | series)
- item_id
- order_index

COMMENTS
- id (uuid, PK)
- article_id (FK)
- user_id (FK)
- parent_id (FK → COMMENTS, nullable — untuk reply)
- content
- is_pinned
- created_at

QA_QUESTIONS
- id (uuid, PK)
- publication_id (FK)
- user_id (FK)
- title
- content
- upvotes
- created_at

QA_ANSWERS
- id (uuid, PK)
- question_id (FK)
- author_id (FK)
- content
- is_official
- created_at

SAVED_FOLDERS
- id (uuid, PK)
- user_id (FK)
- publication_id (FK)
- name

SAVED_ARTICLES
- folder_id (FK)
- article_id (FK)
- saved_at

ARTICLE_READS
- article_id (FK)
- user_id (FK)
- read_at
- completion_percentage
```

---

## 9. User Flows

### Flow 1: Author Membuat & Publish Artikel Premium

```
Author login
  → Masuk ke Dashboard Publication
  → Klik "Tulis Artikel Baru"
  → Gunakan rich text editor (judul, konten, embed media)
  → Setting: visibility = "Members Only"
  → Upload cover image
  → Isi excerpt untuk preview paywall
  → Preview artikel
  → Klik "Publish"
  → Sistem kirim email notifikasi ke subscriber (jika setting aktif)
  → Artikel live di halaman publication
```

### Flow 2: Reader Menemukan & Berlangganan

```
Reader datang dari Google (SEO)
  → Membaca artikel free
  → Menemukan artikel "Members Only" — lihat preview + paywall CTA
  → Klik "Berlangganan Sekarang"
  → Pilih paket (bulanan/tahunan/dll)
  → Register / Login
  → Halaman checkout dengan ringkasan paket
  → Bayar via payment gateway
  → Konfirmasi pembayaran sukses
  → Redirect ke artikel yang mau dibaca
  → Email konfirmasi dikirim
```

### Flow 3: Member Menggunakan Personal Library

```
Member baca artikel
  → Klik ikon "Save"
  → Pilih folder yang sudah ada, atau buat folder baru
  → Artikel tersimpan
  → Kapan saja bisa akses Library → pilih folder → baca lagi
```

### Flow 4: Member Mengikuti Learning Roadmap

```
Member buka halaman Roadmap
  → Lihat visual stage: Beginner → Intermediate → Advanced
  → Klik stage "Beginner" → lihat daftar artikel/series
  → Baca artikel satu per satu
  → Progress tracker update otomatis
  → Setelah semua artikel di stage selesai → stage berikutnya unlock
```

---

## 10. MVP Scope & Prioritas

### MVP — Harus Ada Sebelum Launch

| Fitur | Modul |
|---|---|
| Register, Login, Google OAuth, Forgot Password | Auth |
| Buat Publication, invite author, custom domain | Publication |
| Rich text editor (teks, heading, list, gambar, YouTube embed) | Content |
| Publish artikel (free & premium), scheduling | Content |
| Buat & kelola Series (artikel berseri + navigasi) | Content |
| Subscription plans (4 tier) + checkout + payment gateway | Payment |
| Paywall untuk konten premium | Reader |
| Halaman publication + halaman artikel | Reader |
| Email notifikasi artikel baru + email transaksional | Email |
| Dashboard owner: subscriber count, MRR basic | Analytics |

### V2 — Segera Setelah MVP Stabil

| Fitur | Modul |
|---|---|
| Roadmap / Learning Path visual | Content |
| Komentar artikel + reply | Community |
| Q&A section | Community |
| Search (full-text) | Reader |
| Saved articles & folder (Personal Library) | Reader |
| Analytics lengkap per artikel | Analytics |
| Export subscriber list (CSV) | Analytics |

### V3 — Pengembangan Lanjutan

| Fitur | Modul |
|---|---|
| Digest email mingguan | Email |
| Auto-renew subscription | Payment |
| Revenue payout dashboard | Payment |
| Translate artikel (Google Translate integration) | Content |
| Mobile app (iOS & Android) | Platform |

---

## 11. Tech Stack Recommendation

### Frontend
- **Framework:** Next.js (React) — mendukung SSR/SSG untuk SEO, ekosistem kuat
- **Styling:** Tailwind CSS
- **Rich Text Editor:** Tiptap (extensible, berbasis ProseMirror)
- **State Management:** Zustand atau React Query

### Backend
- **Runtime:** Node.js dengan TypeScript
- **Framework:** NestJS (structured, scalable) atau Express.js (lebih fleksibel)
- **ORM:** Prisma (developer-friendly, type-safe)

### Database
- **Primary DB:** PostgreSQL (relational, cocok untuk relasi subscription & content)
- **Search:** PostgreSQL Full-Text Search (MVP) → upgrade ke Meilisearch/Elasticsearch nanti

### Infrastructure
- **Hosting:** Railway / Render (mudah untuk MVP) → migrasi ke AWS/GCP nanti
- **File Storage:** Cloudinary (gambar) atau Supabase Storage
- **Email:** Resend atau Mailgun
- **Payment:** Midtrans (Indonesia-first, support berbagai metode lokal)

### Auth
- **Strategy:** JWT (access token short-lived) + Refresh Token
- **OAuth:** Google OAuth 2.0 via Passport.js

---

## 12. Milestone & Roadmap

### Fase 1 — MVP (Estimasi: 8–12 minggu)
**Goal:** Platform bisa digunakan oleh 1 publication (blog kamu sendiri)

- Week 1–2: Setup project, arsitektur, database schema, auth system
- Week 3–4: Publication management, author management
- Week 5–6: Content editor, artikel CRUD, series management
- Week 7–8: Subscription & payment integration (Midtrans)
- Week 9–10: Reader experience (paywall, halaman artikel, halaman publication)
- Week 11–12: Email notifications, dashboard basic, bug fixing, deploy

### Fase 2 — V2 (Estimasi: 4–6 minggu setelah MVP)
**Goal:** Fitur komunitas & personal library aktif, onboarding publikasi lain bisa dimulai

- Roadmap/Learning Path feature
- Komentar & Q&A
- Search
- Personal Library (folder & saved articles)
- Analytics lengkap

### Fase 3 — V3 (Ongoing)
**Goal:** Optimasi, growth features, mobile app

---

## 13. Assumptions & Constraints

### Assumptions
- Target awal adalah pasar Indonesia — payment gateway Midtrans sudah cukup
- Owner publication siap mengurus domain sendiri (untuk custom domain)
- Konten video tidak di-host sendiri, cukup embed dari YouTube
- MVP tidak memerlukan mobile app native — web responsive sudah cukup

### Constraints
- Developer awal: 1 orang (dibantu AI agent) → scope MVP harus realistis
- Budget infrastruktur awal harus minimal (gunakan layanan dengan free tier / pay-as-you-go)
- Tidak ada dedicated DevOps — deployment harus sesederhana mungkin di fase awal

---

## 14. Keputusan Bisnis & Teknis

Semua poin di bawah ini telah diputuskan dan menjadi bagian dari requirement resmi.

### Platform Fee
- Default platform fee: **15%** per transaksi subscription
- Fee dapat diubah per publication (negosiasi dengan owner publication)
- Fee dapat **dimatikan sepenuhnya** untuk publication tertentu — khususnya publication milik operator platform sendiri
- Konfigurasi fee disimpan di level publication, bukan global

### Auto-Renew Subscription
- **Tidak ada di MVP** — subscription bersifat one-time per periode
- Member perlu memperpanjang secara manual saat subscription habis
- Sistem mengirim reminder email 7 hari sebelum expired
- Auto-renew dipertimbangkan untuk V2/V3

### Interaksi Non-Member (Free Reader)
- Non-member hanya dapat memberikan **"like"** pada artikel free
- Komentar dan Q&A **eksklusif untuk member** yang memiliki subscription aktif
- Like dari non-member berfungsi sebagai sinyal konten populer untuk author, membantu keputusan produksi konten berikutnya

### Free Trial
- **Tidak ada free trial** — rawan disalahgunakan dengan pembuatan akun baru berulang
- Sebagai gantinya, article preview (±200 kata pertama) sudah cukup untuk memberikan gambaran kualitas konten kepada calon subscriber

### KYC untuk Owner Publication
- **Tidak diperlukan** di tahap awal
- Proses onboarding publication cukup dengan email dan data dasar

### Payout ke Owner Publication
- Target: **otomatis via disbursement API** (Xendit atau Midtrans)
- Di MVP: uang masuk ke rekening platform dulu, payout dilakukan secara manual/semi-otomatis oleh operator
- Otomasi penuh melalui disbursement API masuk roadmap **V2**

### Domain & Subdomain
- Setiap publication mendapat **subdomain gratis** dari platform secara otomatis: `[slug].platformkamu.com`
- Custom domain (`investasicerdas.com`) bersifat opsional — owner membeli dan mengurus domain sendiri
- Platform menyediakan panduan CNAME setup; biaya domain sepenuhnya ditanggung owner publication
- Infrastruktur SSL/HTTPS untuk custom domain ditangani platform secara otomatis (via Let's Encrypt)

---

*Dokumen ini adalah living document — akan diperbarui seiring progress development dan feedback dari pengguna awal.*

**Versi selanjutnya:** System Architecture Document (SAD) & Technical Specification

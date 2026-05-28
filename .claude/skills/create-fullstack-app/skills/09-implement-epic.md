---
name: implement-epic
description: Mengimplementasikan satu Epic dari USER_STORIES secara berurutan — backend dulu, lalu frontend, lalu integrasi. Dijalankan di branch terpisah per Epic, di-commit per Story, dan di-merge ke main setelah Epic selesai. Skill ini sadar posisi progress dan bisa dilanjutkan di sesi berikutnya dari titik terakhir.
---

# Skill 09: Implement Epic

Skill ini mengimplementasikan satu Epic dari dokumen USER_STORIES secara berurutan dan atomic. Satu Story harus selesai sepenuhnya (BE + FE + INT + commit) sebelum pindah ke Story berikutnya.

**Prasyarat:**
- Skill 08 (Setup Project) sudah selesai
- Docker Desktop sedang berjalan
- Backend dan frontend bisa dijalankan lokal

---

## Input yang Dibutuhkan

- `docs/USER_STORIES_[FASE].md` — untuk daftar task
- `docs/TECH_CONTEXT.md` — wajib dibaca sebelum menulis kode apapun
- `docs/SAD_[NamaProduk].md` — untuk referensi arsitektur
- Nama Epic yang akan dikerjakan

---

## Cara Menjalankan Aplikasi Lokal untuk Testing

Sebelum mulai implementasi, pastikan stack lokal berjalan. Butuh **3 terminal** yang terbuka bersamaan:

```
Terminal 1 — Database:
docker-compose up -d
(jalankan sekali, biarkan berjalan di background)

Terminal 2 — Backend:
cd backend && npm run dev
(biarkan berjalan, jangan ditutup)

Terminal 3 — Frontend:
cd frontend && npm run dev
(biarkan berjalan, jangan ditutup)

Browser: buka http://localhost:3000
```

Konfirmasi ke AI agent bahwa semua sudah berjalan sebelum mulai implementasi.

---

## Prinsip Utama

**Baca TECH_CONTEXT.md sebelum menulis satu baris kode pun.**

Keputusan implementasi harus konsisten dengan:
- Layer responsibility (router → controller → service → repository)
- Filter utama per entitas bisnis (sesuai yang didefinisikan di TECH_CONTEXT — misal: `publicationId`, `tenantId`, `organizationId`)
- Response format standar
- Rules SC vs CC di frontend
- Caching strategy

---

## Fase 0: Orient & Buat Branch

Sebelum menulis kode apapun:

**1. Tentukan posisi:**
- Baca `USER_STORIES_[FASE].md`
- Identifikasi Epic yang akan dikerjakan
- Cek task mana yang sudah `[x]` dan mana yang masih `[ ]`

**2. Buat feature branch:**
```bash
git checkout main
git pull origin main
git checkout -b feat/[nama-epic-dalam-kebab-case]
```

Contoh:
```bash
git checkout -b feat/authentication
git checkout -b feat/article-management
git checkout -b feat/subscription-payment
```

**3. Konfirmasi ke user:**
```
Kita akan mengerjakan EPIC [X] — [Nama Epic]
Branch: feat/[nama-branch]
Mulai dari: STORY [X.1] — [nama Story]
Lanjutkan?
```

---

## Fase 1: Implementasi Per Story

Untuk setiap Story dalam Epic, ikuti urutan ini **tanpa exception**:

### Langkah 1: Announce
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORY [X.Y] — [Nama Story]
"Sebagai [persona], saya ingin [aksi], agar [benefit]."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Langkah 2: Kerjakan semua TASK-BE
- Buat/edit file sesuai layer yang benar sesuai SAD
- Validasi input dengan Zod untuk setiap endpoint baru
- Setiap query di repository WAJIB include filter entitas utama (sesuai TECH_CONTEXT)
- Error handling menggunakan `next(error)` — tidak pernah `res.json()` langsung di error

### Langkah 3: Kerjakan semua TASK-FE
- Tentukan SC vs CC sesuai rules di TECH_CONTEXT
- Terapkan rendering strategy yang tepat per halaman
- Gunakan component library yang sudah ditentukan
- Form menggunakan React Hook Form + Zod

### Langkah 4: Kerjakan semua TASK-INT
- Hubungkan FE dengan BE endpoint yang sudah dibuat
- Test di browser (`http://localhost:3000`):
  - Happy path: alur normal berjalan benar
  - Error state: tampilan error yang sesuai, bukan blank page

### Langkah 5: Update USER_STORIES
```
TASK-BE-X.Y.Z `[x]` [deskripsi task]  ← ubah [ ] jadi [x]
```

### Langkah 6: Commit
```bash
git add .
git commit -m "[commit message dari USER_STORIES untuk story ini]"
```

### Langkah 7: Lanjut Story berikutnya

---

## Format Interaksi dengan Manusia

### Gunakan format ini saat butuh input:
```
⚠️ BUTUH INPUT MANUSIA

Konteks: [jelaskan situasinya dengan bahasa sederhana]
Pertanyaan: [pertanyaan spesifik]

Pilihan:
  A) [opsi pertama] — konsekuensi: [apa yang terjadi]
  B) [opsi kedua] — konsekuensi: [apa yang terjadi]

Setelah kamu jawab, implementasi akan dilanjutkan.
```

### Berhenti dan tanya JIKA:
- Ada keputusan bisnis yang ambigu atau tidak ada di PRD
- Implementasi butuh API key yang belum ada di `.env`
- Ada konflik antara PRD dan realitas teknis
- Ditemukan bug di Story yang sudah selesai (perlu hotfix branch terpisah)

### Jangan berhenti untuk:
- Keputusan teknis yang sudah jelas di TECH_CONTEXT / SAD
- Nama variabel atau function
- Detail styling yang bisa disesuaikan nanti

---

## Checklist Kualitas Kode

### Backend — per Endpoint Baru
```
[ ] Zod schema untuk validasi input sudah ada
[ ] Controller hanya ambil dari req, panggil service, return res
[ ] Business logic ada di service, bukan controller
[ ] Repository query include filter entitas utama (sesuai TECH_CONTEXT)
[ ] Error di-handle dengan next(error)
[ ] Response mengikuti format standar {success, data}
```

### Frontend — per Halaman/Komponen Baru
```
[ ] SC atau CC sudah diputuskan dengan alasan yang tepat
[ ] Jika SC: tidak ada useEffect untuk fetch data
[ ] Jika butuh cache: sudah pakai 'use cache' + cacheTag
[ ] Form: pakai React Hook Form + Zod
[ ] Gambar: pakai next/image, bukan <img>
[ ] params/searchParams sudah di-await (Next.js 16)
```

---

## Handling Blocked Task

Jika task tidak bisa dikerjakan karena dependency belum selesai:
```
[ ] ~~TASK-BE-X.Y.Z~~ BLOCKED: menunggu [dependency]
```
Lanjut ke task lain yang tidak bergantung. Kembali ke blocked task setelah dependency selesai.

---

## Setelah Epic Selesai — Merge ke Main

Setelah semua Story dalam Epic selesai:

```bash
# Push branch ke GitHub
git push origin feat/[nama-epic]

# Buat Pull Request di GitHub:
# 1. Buka repository di GitHub
# 2. Klik "Compare & pull request" yang muncul otomatis
# 3. Judul PR: "feat([nama-epic]): [deskripsi singkat]"
# 4. Review perubahan di tab "Files changed"
# 5. Klik "Merge pull request" jika sudah OK
# 6. Klik "Delete branch" setelah merge

# Kembali ke main di lokal
git checkout main
git pull origin main

# Hapus branch lokal
git branch -d feat/[nama-epic]
```

Setelah merge → siap mulai Epic berikutnya dari Fase 0.

---

## Ringkasan Sesi

Saat sesi berakhir, buat ringkasan:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RINGKASAN SESI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Epic: [nama Epic]
Branch: feat/[nama-branch]

Selesai:
✅ STORY X.1 — [nama]
✅ STORY X.2 — [nama]

Belum selesai:
🔄 STORY X.3 — [nama]
   Task terakhir: TASK-BE-X.3.2 (belum selesai)

Untuk lanjut sesi berikutnya, gunakan prompt:
"Baca docs/TECH_CONTEXT.md dan docs/USER_STORIES_MVP.md.
 Lanjutkan implementasi EPIC [X] di branch feat/[nama].
 Checkout branch dulu: git checkout feat/[nama]
 Task terakhir yang dikerjakan: TASK-BE-X.3.1 (selesai)
 Lanjut dari: TASK-BE-X.3.2"

Issues yang ditemukan:
- [jika ada]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Context7 — Selalu Fetch Dokumentasi Sebelum Koding

Sebelum implementasi, baca `references/context7-libraries.md` untuk tahu library apa yang perlu di-fetch.

**Minimal di awal setiap Epic, panggil:**
```
use context7 next.js      ← selalu, karena Next.js 16 berubah cepat
use context7 prisma       ← jika Epic ini menyentuh database
use context7 shadcn/ui    ← jika Epic ini punya frontend
```

Tambahkan library lain sesuai yang digunakan di Epic tersebut.

---

## Frontend Implementation — Cek Jalur Desain Dulu

Sebelum menulis kode frontend, cek jalur yang dipilih di Skill 06:

### Jika Jalur A (ada file di `frontend/design-references/`):

```
Untuk setiap halaman yang diimplementasikan:
1. Panggil context7 untuk next.js dan shadcn/ui
2. Baca file design-references/[nama-halaman].html
3. Identifikasi: struktur layout, komponen, warna, spacing
4. Implementasikan menggunakan shadcn/ui yang sesuai
5. Gunakan Tailwind classes — tidak pernah hardcode style
6. Verifikasi di browser: tampilan harus mendekati referensi
```

### Jika Jalur B (tidak ada design-references):

```
Untuk setiap halaman yang diimplementasikan, ikuti DUA TAHAP ini:

──────────────────────────────────────────────────
TAHAP 1 — Design Thinking (frontend-design skill)
──────────────────────────────────────────────────
Sebelum menulis satu baris kode pun, aktifkan frontend-design skill
dengan memberikan konteks ini:

"Saya akan mengimplementasikan [nama halaman] untuk [nama produk].

Konteks produk: [ringkasan singkat dari UI_UX_DESIGN_BRIEFING.md]
Target user di halaman ini: [persona yang relevan]
Fungsi halaman: [apa yang user lakukan di halaman ini]
Tone produk: [dari bagian Tone & Karakter Visual di briefing]
Constraint teknis: React/Next.js 16, Tailwind CSS, shadcn/ui untuk
komponen fungsional, responsive mobile-first.

Tentukan arah desain yang bold dan intentional:
- Tipografi yang distinctive (BUKAN Inter, Roboto, Arial, system font)
- Color direction yang cohesive dan tidak generik
- Layout approach — apakah ada asymmetry, overlap, grid-breaking?
- Apa ONE THING yang akan membuat halaman ini memorable?
- Komponen shadcn/ui mana yang dipakai vs custom?"

Review output design thinking bersama user jika ada keputusan besar.
Minta persetujuan sebelum lanjut ke Tahap 2.

──────────────────────────────────────────────────
TAHAP 2 — Implementasi Berdasarkan Design Direction
──────────────────────────────────────────────────
Setelah design direction sudah disetujui:

1. Panggil context7 untuk next.js dan shadcn/ui
2. Implementasikan sesuai keputusan dari Tahap 1
3. Untuk komponen fungsional (form, dialog, table, toast):
   → pakai shadcn/ui, extend dengan className untuk karakter
4. Untuk elemen yang butuh karakter visual kuat:
   → boleh custom CSS/Tailwind di luar shadcn/ui
5. Ikuti references/ui-design-system.md sebagai guardrail teknis:
   → semantic color tokens, spacing scale, responsive patterns
6. JANGAN default ke:
   → font Inter/Roboto/Arial tanpa alasan kuat
   → purple gradient on white
   → card grid layout yang predictable
   → komponen shadcn/ui tanpa customisasi apapun
7. Verifikasi di browser (http://localhost:3000)
8. Minta feedback sebelum lanjut ke halaman berikutnya
```

### Panduan kualitas UI (berlaku untuk kedua jalur):

```
Teknikal:
[ ] Tidak ada hardcoded warna (bg-[#xxx] atau text-gray-500)
[ ] Semua warna pakai semantic tokens (bg-primary, text-muted-foreground, dll)
[ ] Tidak ada inline style (style={{ padding: '24px' }})
[ ] Responsive: test di mobile 375px dan desktop 1280px
[ ] Dark mode tidak broken (jika diaktifkan)
[ ] Loading state ada untuk setiap data fetch
[ ] Empty state ada untuk list yang bisa kosong
[ ] Error state ada untuk operasi yang bisa gagal

Estetik (Jalur B — frontend-design skill):
[ ] Font yang dipakai bukan Inter/Roboto/Arial/system-ui
[ ] Tidak ada purple gradient on white sebagai default
[ ] Ada satu elemen visual yang memorable per halaman
[ ] Layout tidak sepenuhnya grid kotak-kotak biasa
[ ] Setiap halaman punya karakter visual yang intentional
[ ] Konsisten dengan halaman lain yang sudah dibuat
```

---
name: setup-project
description: Panduan setup project fullstack dari zero — init monorepo, install dependencies, konfigurasi Docker untuk database lokal, dan first commit. Dirancang untuk user dengan keterbatasan teknis sekalipun. Prasyarat: Skill 00 (Environment Setup) sudah selesai dijalankan.
---

# Skill 08: Setup Project

Skill ini memandu setup project dari zero hingga siap untuk implementasi. Dijalankan sekali per project — berbeda dengan Skill 00 yang dijalankan sekali per komputer.

**Prasyarat:** Skill 00 (Environment Setup) sudah selesai. Jika belum, jalankan Skill 00 terlebih dahulu.

**Estimasi waktu:** 30–60 menit

---

## Input yang Dibutuhkan

- `docs/SAD_[NamaProduk].md` — untuk stack yang dipilih
- `docs/GIT_STRATEGY.md` — untuk konvensi git
- URL repository GitHub yang sudah dibuat (akan diminta di Fase 1)

---

## Fase 0: Konfirmasi Prerequisites

AI agent akan cek dulu bahwa environment sudah siap:

```bash
node --version    # harus v20+
git --version     # harus ada
docker --version  # harus ada
claude --version  # harus ada
```

Jika ada yang belum ada → jalankan Skill 00 terlebih dahulu.

Konfirmasi juga ke user: **apakah Docker Desktop sedang berjalan?**
Cara cek: lihat ikon paus di taskbar (Windows) atau menu bar (Mac) — statusnya harus "running".

---

## Fase 1: Buat Repository GitHub

**Langkah yang dilakukan MANUSIA:**

1. Buka https://github.com → Login
2. Klik tombol "+" di pojok kanan atas → "New repository"
3. Isi:
   - Repository name: `[nama-project]` (huruf kecil, pakai tanda hubung, tanpa spasi)
   - Description: deskripsi singkat
   - Visibility: **Private** (recommended)
   - ❌ Jangan centang "Add a README file"
   - ❌ Jangan centang ".gitignore"
   - ❌ Jangan centang "license"
4. Klik "Create repository"
5. Copy URL repository (format: `https://github.com/username/nama-project.git`)
6. Berikan URL tersebut ke AI agent

**Langkah yang dilakukan AI AGENT:**

```bash
# Buat folder project
mkdir [nama-project] && cd [nama-project]

# Init git dan hubungkan ke GitHub
git init
git branch -M main
git remote add origin [URL dari GitHub]

# Buat folder struktur dasar
mkdir -p docs frontend backend .github/workflows

# Pindahkan semua dokumen ke docs/
# (PRD, SAD, GIT_STRATEGY, TECH_CONTEXT, USER_STORIES, UI_UX_DESIGN_BRIEFING)
```

---

## Fase 2: Load Stack Reference

Baca reference file sesuai stack yang dipilih di SAD:
- Express + Next.js → baca `references/stacks/express-nextjs.md`
- NestJS + Next.js → baca `references/stacks/nestjs-nextjs.md`

Ikuti seluruh instruksi di reference file untuk setup stack tersebut.

---

## Fase 3: Setup Development Database (Docker)

**Penjelasan untuk non-technical user:**

Docker menjalankan database PostgreSQL dan cache Redis di "kotak" terisolasi — tanpa menginstall langsung ke sistem operasi. Data tersimpan dengan aman dan tidak hilang saat Docker dimatikan (kecuali kamu menjalankan `docker-compose down -v` — jangan lakukan ini kecuali memang mau reset).

**Langkah yang dilakukan AI AGENT — buat `docker-compose.yml` di root project:**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: [nama-project]-db
    environment:
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: localpassword
      POSTGRES_DB: [nama-project]_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: [nama-project]-redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

**Langkah yang dilakukan MANUSIA:**

Pastikan Docker Desktop berjalan (ikon paus statusnya "running"), lalu di terminal:
```bash
docker-compose up -d
```

Flag `-d` artinya "detached" — database berjalan di background, terminal tidak akan "tertahan". Ini normal.

Verifikasi:
```bash
docker ps
# Harus muncul 2 baris: container postgres dan redis
```

Jika tidak muncul atau ada error → lihat section Troubleshooting di bawah.

---

## Fase 4: Setup Backend

AI agent menjalankan instruksi dari reference file:
- Init TypeScript project
- Install semua dependencies
- Buat folder structure sesuai SAD
- Buat `app.ts` dengan middleware chain yang benar
- Init Prisma dan jalankan migrasi pertama
- Buat `.env` dari `.env.example`
- Isi nilai yang diperlukan untuk development lokal

**Checkpoint MANUSIA — buka 2 terminal:**

Terminal 1 (database sudah jalan dari Fase 3).

Terminal 2:
```bash
cd backend
npm run dev
```

Harus muncul pesan seperti:
```
Server running on port 4000
Database connected
```

Jika muncul error → lihat Troubleshooting. Konfirmasi ke AI agent jika sudah berjalan.

---

## Fase 5: Setup Frontend

AI agent menjalankan instruksi dari reference file:
- Init Next.js dengan TypeScript + Tailwind
- Install dependencies (shadcn/ui, dll)
- Buat folder structure sesuai SAD
- Buat `proxy.ts`
- Buat `.env.local` dari `.env.local.example`

**Checkpoint MANUSIA — buka Terminal 3:**

```bash
cd frontend
npm run dev
```

Buka browser ke `http://localhost:3000` — harus muncul halaman Next.js.

Konfirmasi ke AI agent jika sudah berjalan.

---

## Fase 6: Setup CI/CD

AI agent membuat `.github/workflows/ci.yml` untuk lint + type-check + build otomatis saat Pull Request.

---

## Fase 7: Setup Branch Protection & First Commit

**Langkah yang dilakukan MANUSIA — setup branch protection di GitHub:**

1. Buka repository di GitHub → Settings → Branches
2. Klik "Add branch protection rule"
3. Branch name pattern: `main`
4. Centang:
   - ✅ "Require a pull request before merging"
   - ✅ "Do not allow bypassing the above settings"
5. Klik "Create"

**Langkah yang dilakukan AI AGENT:**

```bash
# Buat .gitignore
# Commit dokumen terlebih dahulu
git add docs/
git commit -m "chore(docs): add PRD, SAD, git strategy, tech context, and user stories"

# Commit setup project
git add .
git commit -m "chore(config): init monorepo with backend and frontend"

# Push ke GitHub
git push -u origin main
```

**Panduan untuk MANUSIA saat diminta autentikasi:**

Jika terminal menampilkan:
```
Username for 'https://github.com':
```
→ Ketik username GitHub kamu, tekan Enter

```
Password for 'https://...':
```
→ Paste Personal Access Token kamu (bukan password GitHub), tekan Enter
→ Token tidak akan terlihat saat di-paste — ini normal

---

## Checklist Akhir

Verifikasi semua sebelum declare setup selesai:

```
[ ] GitHub repository sudah ada dan terhubung
    Verifikasi: git remote -v → muncul URL GitHub

[ ] Database dan Redis berjalan
    Verifikasi: docker ps → muncul 2 container

[ ] Backend berjalan
    Verifikasi: buka terminal → cd backend && npm run dev → tidak ada error

[ ] Frontend berjalan
    Verifikasi: buka browser → http://localhost:3000 → halaman muncul

[ ] Commit sudah ada
    Verifikasi: git log → ada minimal 2 commit

[ ] File .env ADA tapi tidak ter-commit
    Verifikasi: git status → .env tidak muncul di list

[ ] File .env.example ADA dan ter-commit
    Verifikasi: git log --all --full-history -- backend/.env.example
```

Setelah semua ✅ → project siap. Lanjutkan ke Skill 09.

---

## Troubleshooting Umum

### Error: "port is already allocated" atau "address already in use"
**Penyebab:** Port 5432 atau 6379 sudah dipakai aplikasi lain.
**Solusi:**
```bash
# Cek siapa yang pakai port (Mac/Linux)
lsof -i :5432

# Hentikan container yang mungkin masih jalan dari sebelumnya
docker-compose down
docker-compose up -d
```

### Error: "Cannot connect to the Docker daemon"
**Penyebab:** Docker Desktop tidak sedang berjalan.
**Solusi:** Buka Docker Desktop dan tunggu sampai statusnya "running" sebelum coba lagi.

### Error saat `npm run dev` di backend: "Can't reach database"
**Penyebab:** Database belum jalan atau nilai DATABASE_URL di `.env` salah.
**Solusi:**
1. Pastikan `docker-compose up -d` sudah dijalankan dan muncul di `docker ps`
2. Cek isi `.env` — `DATABASE_URL` harus sama persis dengan yang ada di `docker-compose.yml`

### Error saat `npm run dev` di backend: "Port 4000 already in use"
**Penyebab:** Backend masih berjalan di terminal lain.
**Solusi:** Tutup terminal yang menjalankan backend sebelumnya, atau tekan `Ctrl+C` di terminal tersebut.

### Error: "ENOENT: no such file or directory, open '.env'"
**Penyebab:** File `.env` belum dibuat.
**Solusi:**
```bash
# Di folder backend
cp .env.example .env
```
Lalu isi nilai yang diperlukan.

### Git push tidak berhasil, diminta login terus
**Solusi — simpan credential agar tidak perlu input terus:**
```bash
git config --global credential.helper store
```
Input username + token sekali lagi. Setelah itu tersimpan otomatis.

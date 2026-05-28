---
name: deploy
description: Panduan deployment fullstack app dari staging hingga production. PENTING: Skill ini dijalankan SEKALI setelah semua Epic MVP selesai — bukan setelah tiap Epic. Selama development, cukup jalankan di lokal. Skill ini bisa di-skip jika belum siap deploy. Termasuk panduan setup akun hosting, konfigurasi environment variables dengan penjelasan "apa ini dan dari mana dapat nilainya", step-by-step untuk non-technical user.
---

# Skill 10: Deploy

Skill ini memandu deployment dari zero hingga aplikasi live dan bisa diakses publik.

## Kapan Menjalankan Skill Ini?

```
❌ Bukan setelah tiap Epic
❌ Bukan di tengah-tengah development
✅ SETELAH semua Epic MVP selesai dan sudah ditest lokal
✅ Saat kamu siap aplikasi bisa diakses orang lain
```

**Skill ini bisa di-skip untuk saat ini jika:**
- Kamu masih mau testing di lokal dulu
- Belum punya budget untuk hosting
- MVP belum selesai sepenuhnya

Saat di-skip, development tetap berjalan normal di `http://localhost:3000` menggunakan Docker untuk database.

**Estimasi waktu:** 1–2 jam (termasuk waktu buat akun dan kumpulkan API keys)

---

## Pemahaman Dasar (Untuk Non-Technical User)

**Staging** = versi percobaan yang berjalan di internet — hanya untuk testing, belum untuk publik. Seperti dress rehearsal.

**Production** = versi yang sesungguhnya — yang akan diakses user nyata kamu.

**Kenapa dua environment?** Jika ada bug di staging, yang kena adalah staging — bukan user nyata.

**Environment Variables** = setting rahasia yang diperlukan aplikasi — password database, API key, dll. Tidak boleh disimpan di kode karena kode bisa dilihat di GitHub.

---

## Fase 1: Load Deploy Target Reference

Baca reference file sesuai platform yang dipilih:
- Railway + Vercel → baca `references/deploy-targets/railway-vercel.md`

Ikuti instruksi di reference file.

---

## Fase 2: Siapkan Akun

**Langkah MANUSIA — buat akun di platform berikut:**

### Railway (backend + database)
1. Buka https://railway.app → klik "Login" → login dengan GitHub
2. Verifikasi email jika diminta
3. Konfirmasi: "Akun Railway sudah siap"

### Vercel (frontend)
1. Buka https://vercel.com → klik "Sign Up" → login dengan GitHub
2. Ikuti onboarding singkat
3. Konfirmasi: "Akun Vercel sudah siap"

---

## Fase 3: Setup Database di Railway

**Langkah MANUSIA:**
1. Di Railway dashboard → "New Project" → "Provision PostgreSQL"
2. Tunggu database selesai dibuat
3. Klik database → tab "Connect" → copy nilai `DATABASE_URL`
4. Berikan ke AI agent

Ulangi untuk Redis:
1. Di project yang sama → "Add Service" → "Redis"
2. Copy `REDIS_URL`

---

## Fase 4: Kumpulkan Environment Variables

AI agent akan generate daftar semua env var yang dibutuhkan beserta panduan cara mendapatkannya. Format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT VARIABLES YANG DIPERLUKAN
Tandai [✅] setelah berhasil mendapatkan nilainya
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE_URL        [ ] — dari Railway (sudah dapat di Fase 3)
REDIS_URL           [ ] — dari Railway (sudah dapat di Fase 3)

JWT_ACCESS_SECRET   [ ] — generate sendiri:
                          node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_REFRESH_SECRET  [ ] — generate lagi dengan command yang sama

GOOGLE_CLIENT_ID    [ ] — dari Google Cloud Console
GOOGLE_CLIENT_SECRET [ ] — dari Google Cloud Console
                           Cara: console.cloud.google.com →
                           APIs & Services → Credentials →
                           Create OAuth Client ID → Web application

[dst sesuai stack yang digunakan]

⚠️ ATURAN KEAMANAN:
- Jangan share nilai ini ke siapapun
- Jangan paste di chat atau email
- Simpan di password manager atau Notes yang aman
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Fase 5: Deploy Backend ke Railway

**AI agent** memastikan Dockerfile sudah benar.

**Langkah MANUSIA:**
1. Di Railway → project kamu → "Add Service" → "GitHub Repo"
2. Pilih repository project kamu
3. Set Root Directory: `backend`
4. Railway otomatis detect dan build
5. Tab "Variables" → tambahkan semua env var backend
6. Klik "Deploy"

Verifikasi:
- Tab "Logs" — tidak ada error merah
- Railway memberikan URL: `https://backend-xxx.up.railway.app`
- Simpan URL ini untuk env var frontend

---

## Fase 6: Jalankan Migration di Production

**Langkah MANUSIA:**

Di Railway, buka service backend → tab "Shell" → jalankan:
```bash
npx prisma migrate deploy
```

Ini menerapkan schema database ke production. Harus dijalankan setelah pertama deploy dan setiap ada perubahan schema.

---

## Fase 7: Deploy Frontend ke Vercel

**Langkah MANUSIA:**
1. Di Vercel → "Add New" → "Project" → import repository GitHub
2. Root Directory: `frontend`
3. Framework Preset: Next.js (auto-detected)
4. Environment Variables → tambahkan semua env var frontend:
   - `NEXT_PUBLIC_API_URL` = URL Railway backend dari Fase 5
   - Semua env var lain
5. Klik "Deploy"

Verifikasi:
- Vercel memberikan URL: `https://nama-project.vercel.app`
- Buka di browser — halaman harus muncul

---

## Fase 8: Update CORS di Backend

**AI agent** akan update konfigurasi CORS di backend untuk mengizinkan request dari URL Vercel production:

```typescript
// Tambahkan URL Vercel ke allowed origins
const corsOptions = {
  origin: [
    'http://localhost:3000',           // development
    'https://nama-project.vercel.app', // production
    // custom domain jika ada
  ]
}
```

Commit perubahan ini dan Railway akan auto-deploy ulang.

---

## Fase 9: Smoke Test

AI agent generate checklist yang harus diverifikasi manusia di URL production:

```
SMOKE TEST CHECKLIST
Buka URL production di browser dan test:

Auth:
[ ] Register akun baru → email verifikasi masuk
[ ] Login dengan akun yang baru dibuat
[ ] Login dengan Google (jika ada)
[ ] Lupa password → email reset masuk

Core features:
[ ] [Feature 1 dari MVP]
[ ] [Feature 2 dari MVP]
[ ] [Feature 3 dari MVP]

Payment (jika ada):
[ ] Halaman subscription tampil dengan harga benar
[ ] Proses bayar dengan Sandbox/test card
[ ] Setelah bayar, akses premium aktif

Error handling:
[ ] Akses halaman premium tanpa login → muncul paywall, bukan error
[ ] Submit form kosong → muncul pesan validasi, bukan crash
```

Jika semua ✅ → production siap.
Jika ada ❌ → laporkan ke AI agent untuk di-debug.

---

## Fase 10: Custom Domain (Opsional)

Jika ingin pakai domain sendiri (`namaproject.com`):

**Langkah MANUSIA:**
1. Beli domain di Niagahoster, Cloudflare, Namecheap, atau registrar lain
2. Di Vercel → project → "Domains" → tambahkan domain
3. Vercel tampilkan instruksi DNS record
4. Di dashboard registrar domain → tambahkan DNS record tersebut
5. Tunggu propagasi: 5 menit hingga 24 jam

**Penjelasan:** DNS record seperti "penanda jalan" di internet — memberitahu browser bahwa `namaproject.com` harus mengarah ke server Vercel.

---

## Ringkasan Setelah Deploy

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOYMENT BERHASIL 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:  https://[url-vercel]
Backend:   https://[url-railway]
Database:  Railway PostgreSQL (managed)

Akun yang digunakan:
- GitHub: repository & CI/CD
- Railway: backend + database hosting
- Vercel: frontend hosting
- [akun lain sesuai setup]

Yang perlu diingat:
- Jaga kerahasiaan semua API key
- Backup database berkala (Railway → project → database → Backups)
- Monitor Vercel dan Railway dashboard untuk error

Langkah selanjutnya setelah launch:
- Setup error monitoring (Sentry — gratis untuk skala kecil)
- Pantau performa di Vercel Analytics
- Kumpulkan feedback dari user pertama
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

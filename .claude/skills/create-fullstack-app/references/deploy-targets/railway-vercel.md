# Deploy Target: Railway + Vercel

## Overview

| | Railway | Vercel |
|---|---|---|
| Digunakan untuk | Backend + PostgreSQL + Redis | Frontend (Next.js) |
| Pricing | ~$5–20/bulan (tergantung usage) | Free tier cukup untuk MVP |
| Auto-deploy | Ya, dari GitHub push | Ya, dari GitHub push |
| SSL | Otomatis | Otomatis |
| Custom domain | Didukung | Didukung |

**Estimasi biaya MVP awal:** Rp 75.000–300.000/bulan (Railway) + Rp 0 (Vercel free tier)

---

## Kelebihan Kombinasi Ini

- Zero DevOps — tidak perlu manage server sendiri
- Auto-deploy setiap push ke GitHub branch main
- SSL/HTTPS otomatis untuk semua domain
- Database backup otomatis (Railway)
- Monitoring dan logging built-in
- Bisa scale jika traffic naik

---

## Alternatif Jika Budget Terbatas

### Render (alternatif Railway)
- Ada free tier (tapi ada "cold start" — pertama kali dibuka agak lambat)
- Lebih murah untuk beberapa use case
- Setup mirip Railway

### Supabase (alternatif database Railway)
- PostgreSQL managed dengan fitur tambahan
- Free tier generous (500MB database)
- Bisa replace Railway DB + Redis untuk skala kecil

### VPS — DigitalOcean / Hetzner / Vultr (untuk V2/V3)
- Paling murah untuk skala besar
- Butuh setup manual: Docker, Nginx, SSL
- Rekomendasi setelah ada revenue dan tim lebih besar

---

## Pre-Deploy Checklist

Sebelum deploy, pastikan semua ini sudah OK:

```
[ ] Semua Epic MVP sudah selesai diimplementasikan
[ ] Smoke test lokal sudah dilakukan — semua fitur utama berjalan
[ ] .env.example sudah up-to-date (semua variabel tercantum)
[ ] .env dan .env.local tidak ter-commit ke git
    Verifikasi: git log --all -- "**/.env" → tidak ada hasil
[ ] Dockerfile sudah ada di folder backend
[ ] Tidak ada hardcoded URL localhost di kode
    Cari dengan: grep -r "localhost" backend/src --include="*.ts"
    Pastikan semua sudah pakai environment variable
[ ] CORS dikonfigurasi untuk production domain
[ ] Rate limiting aktif di endpoint auth
[ ] Midtrans/payment gateway sudah switch ke production mode
    (jangan lupa ini — sandbox tidak menerima pembayaran nyata)
```

---

## Setelah Deploy — Maintenance Rutin

Yang perlu dilakukan secara berkala:

**Harian:**
- Cek Railway dan Vercel dashboard untuk error log

**Mingguan:**
- Cek Railway PostgreSQL usage (storage dan RAM)
- Pantau Vercel Analytics untuk performa

**Bulanan:**
- Update dependencies: `npm outdated` di backend dan frontend
- Cek Railway billing — pastikan tidak ada overage charge

**Setiap ada perubahan schema database:**
- Deploy backend terlebih dahulu
- Jalankan `npx prisma migrate deploy` di Railway Shell
- Verifikasi tidak ada error sebelum deploy frontend

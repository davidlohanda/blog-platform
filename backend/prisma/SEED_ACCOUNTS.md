# Seed Accounts — Investasi Cerdas

Semua akun development setelah `npx prisma db seed`.

---

## Platform Admin

| Email | Password | Role |
|-------|----------|------|
| `admin@lentera.id` | `Admin123!` | `platform_admin` |

URL: `http://localhost:3000/admin/dashboard`

---

## Publication: **Investasi Cerdas** (`investasi-cerdas`)

URL: `http://investasi-cerdas.localhost:3000` (dev) / `investasi-cerdas.lentera.id` (prod)

### Staf Publication

| Email | Password | Role Saat Ini | Catatan |
|-------|----------|---------------|---------|
| `owner@investasicerdas.id` | `Owner123!` | `owner` | Budi Santoso — full akses dashboard |
| `admin-pub@investasicerdas.id` | `Admin123!` | `author` | Sari Dewi — akan menjadi `admin` setelah EPIC 14 diimplementasi |
| `author1@investasicerdas.id` | `Author123!` | `author` | Eko Prasetyo — hanya bisa kelola artikel sendiri |
| `author2@investasicerdas.id` | `Author123!` | `author` | Dewi Kusuma — hanya bisa kelola artikel sendiri |

URL Dashboard: `http://investasi-cerdas.localhost:3000/dashboard`

### Member

| Email | Password | Status Subscription | Keterangan |
|-------|----------|---------------------|------------|
| `member1@example.com` | `Member123!` | Active ✅ | Reza Firmansyah — plan 1 bulan, expires **2026-06-08** |
| `member2@example.com` | `Member123!` | Active ✅ | Nina Rahayu — plan 3 bulan, expires **2026-07-01** |
| `member3@example.com` | `Member123!` | Active ✅ | Hendra Wijaya — plan 6 bulan, expires **2026-08-01** |
| `member-expired@example.com` | `Member123!` | Expired ❌ | Andi Setiawan — plan 1 bulan, expired **2026-05-01** |
| `member-free@example.com` | `Member123!` | Tidak ada | Fitri Handayani — akun gratis tanpa subscription |

---

## Konten yang Di-seed

### Subscription Plans

| Durasi | Harga/bulan | Total |
|--------|-------------|-------|
| 1 bulan | Rp 49.000 | Rp 49.000 |
| 3 bulan | Rp 43.000 | Rp 129.000 |
| 6 bulan | Rp 40.000 | Rp 240.000 |
| 12 bulan | Rp 37.500 | Rp 450.000 |

### Artikel (8 total)

| Judul | Status | Visibility | Author |
|-------|--------|------------|--------|
| Mulai Investasi dari Rp 100.000 | Published | Free | Budi Santoso |
| 5 Kesalahan Investasi Pemula | Published | Free | Eko Prasetyo |
| Reksa Dana 101 | Published | Free | Dewi Kusuma |
| Strategi Alokasi Aset | Published | Premium | Budi Santoso |
| Analisis Fundamental Saham | Published | Premium | Eko Prasetyo |
| DCA vs Lump Sum | Published | Premium | Dewi Kusuma |
| Obligasi Pemerintah vs Korporasi | **Draft** | Premium | Sari Dewi |
| Prospek Properti 2026 | **Scheduled** (2026-06-15) | Premium | Budi Santoso |

### Series

- **"Investasi untuk Pemula: Panduan Lengkap dari Nol"** — 3 artikel free (artikel 1, 2, 3)

### Tags

`Investasi` · `Saham` · `Reksa Dana` · `Obligasi` · `Properti` · `Untuk Pemula`

---

## Catatan Implementasi

- `admin-pub@investasicerdas.id` saat ini diberi role `author` karena enum `AuthorRole` belum memiliki nilai `admin`. Role ini akan diupdate ke `admin` setelah **EPIC 14** (Tiga Role Publication) diimplementasi.
- Password di-hash menggunakan **Argon2** (bukan bcrypt) sesuai ketentuan platform.
- Semua subscription menggunakan `paymentId` dengan prefix `LNT-SEED-*` untuk membedakan dari transaksi produksi.

# UI/UX Design Briefing
## Platform Blog Subscription Multi-Author

---

## Tentang Produk

Platform blog berlangganan yang memungkinkan satu atau beberapa penulis memonetisasi konten tulisan mereka kepada audience yang mereka miliki. Setiap "publication" berdiri sendiri secara brand dan audience — seperti Ghost.org dalam konsep, tapi dengan penekanan pada multi-author dan fitur komunitas.

**Analogi mental model:** Bayangkan setiap publication adalah majalah digital independen. Pembaca berlangganan ke majalah itu, bukan ke "platform"-nya. Tidak ada halaman explore atau discovery lintas publication.

---

## Target Pengguna (3 Persona)

### 1. Owner / Penulis Solo — "Budi"
- Profesional 28–45 tahun, sudah punya audience organik
- Ingin monetisasi tulisannya langsung tanpa bergantung iklan
- Butuh dashboard yang simpel untuk kelola konten dan lihat revenue
- Tidak terlalu teknis — onboarding harus mudah

### 2. Tim Penulis — "Komunitas Investasi"
- 2–5 orang dengan spesialisasi berbeda (misal: teknikal, fundamental, makroekonomi)
- Bergabung dalam satu publication agar subscriber bisa akses semua konten dengan satu subscription
- Butuh tampilan yang menunjukkan identitas tiap author dengan jelas

### 3. Pembaca / Member — "Rina"
- 22–40 tahun, lebih suka belajar dengan membaca daripada menonton video
- Ingin pengalaman membaca yang nyaman dan fokus — mirip Medium tapi lebih personal
- Butuh fitur untuk menyimpan dan mengorganisasi artikel yang sudah dibaca

---

## Halaman yang Perlu Didesain

### A. Publication Site (Reader-facing)
Halaman-halaman ini adalah wajah publik dari setiap publication. Diakses via domain sendiri (misal: `investasicerdas.com`).

| Halaman | Deskripsi |
|---|---|
| Homepage publication | Profil publication, daftar artikel terbaru, CTA subscribe |
| Halaman artikel (free) | Konten penuh, info author, artikel terkait, tombol like |
| Halaman artikel (premium — non-member) | Preview 200 kata pertama, lalu paywall dengan CTA subscribe |
| Halaman artikel (premium — member) | Konten penuh + komentar + tombol save ke folder |
| Halaman series | Daftar artikel dalam satu series, progress pembaca |
| Halaman roadmap | Visual learning path bertahap (Beginner → Intermediate → Advanced), status tiap node |
| Halaman subscribe & checkout | Pilih paket (1/3/6/12 bulan), ringkasan, redirect ke payment |
| Halaman login / register | Form login email+password, tombol Google OAuth |
| Halaman forgot password | Input email, konfirmasi kirim email reset |

### B. Dashboard (Owner & Author-facing)
Diakses via `app.platform.com` setelah login. Tampilan internal untuk mengelola publication.

| Halaman | Deskripsi |
|---|---|
| Dashboard overview | Statistik ringkas: subscriber aktif, MRR, artikel terbaru, views |
| Daftar artikel | List semua artikel dengan status (draft/published), filter, search |
| Editor artikel | Rich text editor full-screen untuk menulis konten |
| Manajemen series | Buat dan atur urutan artikel dalam series |
| Manajemen roadmap | Buat learning path dengan stages dan node |
| Daftar subscriber | Tabel subscriber aktif dengan filter dan export CSV |
| Analytics | Grafik views, reads, subscriber growth |
| Settings — umum | Nama, deskripsi, logo, custom domain publication |
| Settings — subscription plans | Atur harga untuk tiap tier (1/3/6/12 bulan) |
| Settings — authors | Invite author, lihat daftar author, atur role |

### C. Personal (Member-facing)
Halaman personal untuk member yang sudah login.

| Halaman | Deskripsi |
|---|---|
| Personal library | Daftar folder + artikel yang disimpan, bisa buat folder baru |
| Profile settings | Update nama, foto, password |
| Subscription settings | Status subscription aktif, history transaksi, cancel |

---

## User Flows Kunci

### Flow 1: Reader → Member (Conversion)
```
Baca artikel free via Google
→ Ketemu artikel premium → lihat preview + paywall
→ Klik "Berlangganan"
→ Pilih paket harga
→ Register/Login (jika belum)
→ Checkout & bayar
→ Sukses → redirect ke artikel yang mau dibaca
```

### Flow 2: Author → Artikel Published
```
Login ke dashboard
→ Klik "Tulis Artikel Baru"
→ Tulis di editor (rich text, embed gambar/video)
→ Set visibility (free / members only)
→ Isi excerpt untuk paywall preview
→ Preview → Publish
→ Notifikasi email otomatis ke subscriber
```

### Flow 3: Member → Personal Library
```
Baca artikel
→ Klik ikon "Save"
→ Pilih folder / buat folder baru
→ Tersimpan
→ Akses kapanpun via menu "Library"
```

### Flow 4: Member → Learning Roadmap
```
Buka halaman Roadmap
→ Lihat visual stage bertahap
→ Klik stage → lihat daftar konten
→ Baca satu per satu → progress terupdate otomatis
→ Selesai satu stage → stage berikutnya unlock
```

---

## Constraint Teknis yang Relevan untuk Desain

- **Component library:** shadcn/ui — desain harus kompatibel dengan komponen-komponen standar shadcn (button, card, dialog, dropdown, form, table, tabs, dll)
- **Styling:** Tailwind CSS — gunakan spacing dan sizing yang sesuai dengan Tailwind scale
- **Responsive:** Mobile-first. Publication site wajib nyaman dibaca di mobile. Dashboard boleh prioritaskan desktop tapi tetap harus bisa dipakai di tablet.
- **Typography:** Halaman artikel harus mengutamakan readability — line height lebar, font size cukup besar, lebar konten dibatasi (max ~680px) agar nyaman dibaca panjang
- **Dark mode:** Harus dipertimbangkan sejak awal — Tailwind + shadcn sudah support dark mode via CSS variables

---

## Tone & Karakter Visual

- **Bersih dan fokus** — pembaca datang untuk membaca, bukan terdistraksi visual
- **Profesional tapi tidak korporat** — hangat, personal, seperti membaca tulisan seseorang yang kamu percaya
- **Konten adalah raja** — UI harus "mundur" dan membiarkan konten tampil di depan
- Referensi visual yang bagus untuk inspirasi: **Ghost.org**, **Substack**, **Medium** — tapi dengan identitas yang lebih bisa dikustomisasi per publication

---

## Fitur Unik yang Perlu Perhatian Desain Khusus

### Paywall
Harus terasa natural, bukan agresif. Pembaca harus merasa "sayang melewatkan" bukan "dipaksa bayar". Preview konten harus cukup untuk membuat penasaran.

### Roadmap Visual
Ini fitur paling unik di platform ini. Harus divisualisasikan sebagai journey yang terasa progresif — ada rasa pencapaian saat menyelesaikan tiap stage. Pertimbangkan progress indicator, status node (locked/in-progress/completed), dan visual koneksi antar stage.

### Multi-Author
Di homepage dan halaman artikel, identitas tiap author harus jelas. Pembaca harus bisa tahu "ini tulisan siapa" dengan mudah, sekaligus menemukan tulisan lain dari author yang sama.

### Rich Text Editor
Full-screen, distraction-free. Toolbar minimal tapi lengkap. Mirip pengalaman menulis di Notion atau iA Writer.

---

## Prioritas Desain (MVP Dulu)

Fokuskan desain MVP pada halaman berikut terlebih dahulu, sesuai urutan kepentingan:

1. Halaman artikel (free & premium dengan paywall)
2. Homepage publication
3. Halaman subscribe & checkout
4. Login / Register
5. Dashboard overview + daftar artikel
6. Editor artikel
7. Series page
8. Personal library

Halaman roadmap, analytics lengkap, dan Q&A bisa menyusul di V2.

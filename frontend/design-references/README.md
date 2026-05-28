# Blog Platform — Design Reference

Desain MVP untuk platform blog berlangganan multi-author. Folder ini berisi semua halaman desain dalam format HTML standalone + source React/JSX yang bisa dipakai sebagai konteks untuk Claude Code.

## Cara pakai sebagai referensi

1. **Buka `index.html`** — canvas pan/zoom dengan semua desain side-by-side, lengkap dengan tombol fokus per artboard. Ini view paling enak untuk eksplorasi.
2. **Buka `screens/index.html`** — daftar tiap halaman dalam HTML standalone (satu file per layar). Cocok di-share screenshot atau buka satu-satu.
3. **Source code** ada di folder `src/` dalam JSX (React + Babel inline). Token sistem ada di `styles.css`.

## Struktur file

```
.
├── index.html                          ← Master canvas — semua desain berdampingan
├── styles.css                          ← Design tokens (warna, type, primitives shadcn-style)
├── design-canvas.jsx                   ← Wrapper canvas pan/zoom (boleh diabaikan untuk impl)
├── src/
│   ├── shared.jsx                      ← Komponen umum: TopBar, Logo, Avatar, Icon, ArticleCard,
│   │                                     PubFooter, sample data (PUB, AUTHORS, ARTICLES)
│   ├── article.jsx                     ← Halaman artikel (free / paywall / member)
│   ├── homepage.jsx                    ← Homepage publication
│   ├── checkout.jsx                    ← Subscribe & checkout
│   ├── auth.jsx                        ← Login / Register / Lupa sandi
│   ├── series.jsx                      ← Halaman series (reader)
│   ├── roadmap.jsx                     ← Halaman roadmap (reader)
│   ├── search.jsx                      ← Halaman hasil pencarian
│   ├── qa.jsx                          ← Q&A list + detail (reader)
│   ├── library.jsx                     ← Personal library member
│   ├── profile.jsx                     ← Profile settings + Subscription settings (member)
│   ├── dashboard.jsx                   ← Dashboard chrome + Overview + Daftar artikel
│   ├── editor.jsx                      ← Editor artikel
│   ├── dashboard-analytics.jsx
│   ├── dashboard-subscribers.jsx
│   ├── dashboard-settings.jsx          ← 3 tab: Umum, Paket harga, Author
│   ├── dashboard-series.jsx            ← Series management
│   ├── dashboard-roadmap.jsx           ← Roadmap management
│   └── dashboard-qa.jsx                ← Q&A inbox + composer jawaban resmi
└── screens/                            ← Satu HTML per halaman (standalone, mudah dibuka)
```

## Sistem desain (ringkas)

- **Brand contoh:** *Lentera* — esai mingguan multi-author. Tagline: "Tulisan-tulisan pelan untuk masa yang terburu-buru."
- **Typography:**
  - Serif (body artikel, judul, branding): `Newsreader`
  - Sans (UI, dashboard, form): `Geist`
  - Mono (angka, kode, URL slug): `Geist Mono`
- **Palet warm-neutral** dengan satu accent amber. Token di `styles.css`:
  - `--bg #FAF7F2` · `--bg-elev #FFFFFF` · `--surface #F3EFE8` · `--surface-2 #EBE5D9`
  - `--border #E5DFD4` · `--border-2 #D8D1C2`
  - `--fg #1C1A17` · `--fg-2 #4A453E` · `--fg-3 #756E63` · `--fg-4 #A39C8E`
  - `--accent oklch(0.62 0.15 60)` (amber/gold) · `--accent-soft` untuk pill, `--accent-ink` untuk teks
- **Dark mode** disediakan via `.dark` / `[data-theme="dark"]` (lihat `styles.css`).
- **Radii:** 6 / 8 / 12 / 16 px (`--r-sm/md/lg/xl`).
- **Komponen** mengikuti vocabulary shadcn/ui: `.btn` (`btn-primary`/`btn-accent`/`btn-outline`/`btn-ghost` × `btn-sm`/`btn-lg`/`btn-icon`), `.card`, `.input`, `.label`, `.badge` (`badge-soft`/`badge-accent`/`badge-success`/`badge-dot`), `.table`, `.avatar`, `.prose` (untuk body artikel).
- **Placeholder image** menggunakan class `.placeholder-img` dengan atribut `data-caption` untuk teks indikator.

## Cakupan halaman (15 section, 27 layar)

### Publication site (reader)
1. Halaman artikel — 4 state (gratis, paywall, member, dialog save-to-folder)
2. Homepage publication
3. Subscribe & checkout
4. Auth — Login / Register / Lupa sandi
5. Halaman series
6. Halaman roadmap (visual stage Pemula → Menengah → Lanjut)
7. Halaman hasil search (filter: tipe, author, tag, urutan)
8. Q&A — daftar pertanyaan (upvote + status + filter)
9. Q&A — detail pertanyaan (jawaban resmi pin + jawaban member)

### Member personal
10. Personal library (folder + artikel tersimpan)
11. Profile settings (nama, foto, bio, password)
12. Subscription settings (status, history, cancel)

### Dashboard (owner/author)
13. Overview (MRR, subscriber, views, aktivitas)
14. Daftar artikel (filter + status: terbit/draft/terjadwal)
15. Editor artikel (full-screen, floating toolbar, settings drawer)
16. Analytics (chart views vs reads, funnel, performa per artikel)
17. Subscribers (tabel, filter, bulk action, export CSV)
18. Settings (3 tab: Umum, Paket harga, Author)
19. Series management (drag-reorder bagian)
20. Roadmap management (stage editor + items)
21. Q&A management (inbox + composer jawaban resmi + pin jawaban member terbaik)

## Constraint teknis target (untuk implementasi)

- **shadcn/ui** + **Tailwind CSS** — desain sudah dibangun mengikuti vocabulary keduanya, tinggal di-map ke komponen shadcn yang sesuai.
- **Responsive:** Mobile-first. Publication site wajib nyaman dibaca di mobile. Dashboard boleh prioritaskan desktop tapi tetap usable di tablet.
- **Reading area** dibatasi max ~680px untuk readability.
- **Dark mode** dipertimbangkan dari awal (CSS variables).

## Catatan untuk Claude Code

- Sample data (`PUB`, `AUTHORS`, `ARTICLES`) di `src/shared.jsx` adalah placeholder — ganti dengan model/data nyata saat implementasi.
- Komponen `Icon` di `shared.jsx` adalah inline SVG kecil — di implementasi nyata bisa diganti dengan `lucide-react` (icon names sudah mendekati).
- Komponen `Avatar` membangkitkan warna dari hash author ID — saat implementasi, foto profil sebenarnya akan menggantikan inisial.
- Tidak ada free trial di platform ini — akses langsung setelah bayar, batalkan kapan saja.

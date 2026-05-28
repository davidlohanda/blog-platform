# Context7 — Library Reference Mapping

Dokumen ini mendefinisikan kapan dan library apa yang harus di-fetch via Context7 selama implementasi. Context7 memastikan AI agent selalu menggunakan dokumentasi resmi terbaru — bukan training data yang mungkin sudah outdated.

---

## Cara Menggunakan Context7

Di Claude Code, sebelum mengimplementasikan sesuatu yang melibatkan library di bawah ini, panggil Context7:

```
use context7 [nama library]
```

Contoh:
```
use context7 next.js
use context7 prisma
use context7 shadcn/ui
```

Context7 akan fetch dokumentasi terbaru dan inject ke context sebelum AI menulis kode.

---

## Kapan Harus Panggil Context7

### WAJIB dipanggil — library yang berubah cepat:

| Situasi | Library yang di-fetch |
|---|---|
| Implementasi halaman/routing Next.js | `next.js` |
| Implementasi caching (`'use cache'`, `cacheTag`) | `next.js` |
| Setup `proxy.ts` (Next.js 16+) | `next.js` |
| Server Component vs Client Component decision | `next.js` |
| Query database, migration, schema | `prisma` |
| Tambah komponen UI baru | `shadcn/ui` |
| Setup form dengan validasi | `react-hook-form`, `zod` |
| Setup Tiptap editor | `tiptap` |
| Integrasi payment | `midtrans` (jika tersedia) |
| Setup email | `resend` |
| Upload file | `cloudinary` |
| Job queue | `bullmq` |
| Redis operations | `ioredis` |
| Google OAuth | `passport.js` |

### Tidak perlu Context7 — stable/tidak berubah:

| Situasi | Alasan skip |
|---|---|
| Vanilla TypeScript syntax | Tidak berubah |
| Express.js routing dasar | Sangat stable |
| Git commands | Tidak berubah |
| Docker compose syntax | Sangat stable |
| JWT operations | API stabil |
| Argon2 hashing | API stabil |

---

## Library Index

### Frontend

```
next.js          → https://nextjs.org/docs
react            → https://react.dev
tailwindcss      → https://tailwindcss.com/docs
shadcn/ui        → https://ui.shadcn.com/docs
react-hook-form  → https://react-hook-form.com/docs
zod              → https://zod.dev
zustand          → https://zustand-demo.pmnd.rs
axios            → https://axios-http.com/docs
tiptap           → https://tiptap.dev/docs
lucide-react     → https://lucide.dev
```

### Backend

```
express          → https://expressjs.com/en/api.html
prisma           → https://www.prisma.io/docs
bullmq           → https://docs.bullmq.io
ioredis          → https://ioredis.io/docs
resend           → https://resend.com/docs
passport         → https://www.passportjs.org/docs
jsonwebtoken     → https://github.com/auth0/node-jsonwebtoken
argon2           → https://github.com/ranisalt/node-argon2
helmet           → https://helmetjs.github.io
zod              → https://zod.dev
```

### Infrastructure & Tools

```
docker           → https://docs.docker.com
railway          → https://docs.railway.app
vercel           → https://vercel.com/docs
cloudinary       → https://cloudinary.com/documentation
midtrans         → https://docs.midtrans.com
```

---

## Panduan untuk AI Agent

### Saat mulai implementasi Epic baru:
```
Fetch dokumentasi yang relevan dengan Epic ini sebelum mulai koding:
- Identifikasi library apa yang akan digunakan di Epic ini
- Panggil context7 untuk setiap library yang masuk kategori WAJIB
- Baru mulai implementasi
```

### Saat menemukan behavior yang tidak terduga:
```
Jika kode tidak bekerja seperti yang diharapkan dan library-nya
masuk kategori WAJIB → panggil context7 lagi untuk refresh dokumentasi
sebelum mencoba fix.
```

### Prioritas jika context window terbatas:
```
1. next.js (paling sering berubah, paling kritikal)
2. prisma (schema dan query API berubah antar versi)
3. shadcn/ui (component API berubah)
4. Library lain sesuai kebutuhan spesifik Epic
```

---

## Catatan Penting

- Context7 hanya berguna jika library tersebut ada di index Context7. Jika tidak tersedia, AI agent harus mencatat ketidakpastian dan minta konfirmasi dari user.
- Untuk library yang sangat baru atau custom, Context7 mungkin tidak punya dokumentasinya. Dalam kasus ini, minta user untuk provide link dokumentasi resmi.
- Versi library yang diinstall di project (dari `package.json`) harus konsisten dengan dokumentasi yang di-fetch. Jika ada mismatch versi, tandai sebagai ⚠️ dan minta konfirmasi.

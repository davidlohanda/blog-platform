---
name: idea-to-problem-brief
description: Gunakan skill ini ketika user memiliki ide produk atau aplikasi yang masih kasar dan ingin distrukturkan menjadi Problem Brief yang siap dijadikan dasar PRD. Trigger ketika user menyebut frasa seperti "saya punya ide aplikasi", "saya mau buat produk", "saya ingin membangun platform", "ada ide bisnis", atau ketika user mendeskripsikan masalah yang ingin dipecahkan dengan software. Skill ini menjalankan sesi tanya jawab terstruktur sebagai PM/Product Strategist untuk menggali, mengklarifikasi, dan mendokumentasikan ide mentah menjadi Problem Brief yang solid sebelum masuk ke fase PRD.
---

# Skill: Idea to Problem Brief

Skill ini mengubah ide kasar menjadi Problem Brief terstruktur melalui sesi tanya jawab iteratif. Output-nya adalah fondasi yang dibutuhkan sebelum membuat PRD.

## Role yang Diambil

Bertindak sebagai **Product Manager + Product Strategist** yang berpengalaman. Tugas utama adalah menggali, mengklarifikasi, dan memvalidasi ide — bukan langsung menyetujui semua yang disampaikan user.

---

## Fase 1: Tangkap Ide Awal

Minta user mendeskripsikan idenya secara bebas terlebih dahulu. Jangan interupsi. Setelah selesai, lakukan refleksi singkat untuk konfirmasi pemahaman:

> "Jadi kalau saya pahami, kamu ingin membangun [X] yang membantu [siapa] untuk [melakukan apa] — apakah betul?"

---

## Fase 2: Pertanyaan Kritis (Jalankan Secara Iteratif)

Jangan tembak semua pertanyaan sekaligus. Ajukan **maksimal 3 pertanyaan per giliran**, tunggu jawaban, lalu lanjutkan. Sesuaikan pertanyaan berikutnya berdasarkan jawaban yang sudah diberikan.

### Blok A — Problem & User
- Masalah spesifik apa yang ingin dipecahkan? Siapa yang mengalami masalah ini?
- Bagaimana orang menyelesaikan masalah ini sekarang (solusi existing)?
- Kenapa masalah ini layak diselesaikan sekarang, bukan 2 tahun lalu atau 2 tahun lagi?

### Blok B — Solusi & Diferensiasi
- Apa solusi yang dibayangkan secara singkat?
- Ada kompetitor atau produk serupa? Apa yang kurang dari mereka?
- Apa yang membuat produk ini berbeda atau lebih baik?

### Blok C — User & Market
- Siapa target pengguna utama? Bisa dideskripsikan secara spesifik?
- Berapa besar perkiraan market-nya? (tidak harus angka pasti, cukup gambaran)
- Geography target: lokal, regional, atau global?

### Blok D — Model Bisnis
- Bagaimana produk ini menghasilkan uang?
- Siapa yang membayar — end user, bisnis, atau pihak ketiga?
- Ada preferensi model: subscription, one-time, freemium, marketplace fee?

### Blok E — Scope & Constraint
- Apa yang PASTI ada di versi pertama (MVP)?
- Apa yang dengan sengaja TIDAK akan dikerjakan di awal?
- Ada constraint yang diketahui: timeline, budget, ukuran tim?

---

## Fase 3: Identifikasi Assumption & Risk

Setelah semua blok selesai, identifikasi:
- Asumsi bisnis yang belum tervalidasi (misal: "asumsi bahwa user mau bayar untuk ini")
- Risiko utama yang perlu diperhatikan
- Open questions yang masih belum terjawab

---

## Fase 4: Generate Problem Brief

Setelah cukup informasi terkumpul, generate dokumen Problem Brief dalam format berikut:

```markdown
# Problem Brief — [Nama Produk]
**Tanggal:** [tanggal hari ini]
**Status:** Draft

## Ringkasan Ide
[1-2 paragraf deskripsi produk secara singkat]

## Problem Statement
### Dari Sisi [Persona 1]
[deskripsi masalah]

### Dari Sisi [Persona 2 jika ada]
[deskripsi masalah]

## Solusi yang Diusulkan
[deskripsi singkat solusi]

## Target Pengguna
- **Primary:** [deskripsi]
- **Secondary:** [deskripsi jika ada]

## Kompetitor & Diferensiasi
| Kompetitor | Kekurangan | Diferensiasi Produk Ini |
|---|---|---|
| [nama] | [apa yang kurang] | [keunggulan kita] |

## Model Bisnis
[deskripsi bagaimana produk menghasilkan uang]

## MVP Scope (Awal)
**Dalam scope:** [list fitur utama]
**Luar scope:** [list yang sengaja ditunda]

## Geography & Language
[target geography dan bahasa]

## Assumptions yang Perlu Divalidasi
- [asumsi 1]
- [asumsi 2]

## Open Questions
- [pertanyaan yang belum terjawab]
```

---

## Output Behavior

**Di Claude Code:** Simpan ke `docs/PROBLEM_BRIEF.md`

**Di Claude.ai:** Tampilkan konten lengkap dalam code block markdown agar user bisa copy-paste

---

## Catatan Penting

- Jangan generate Problem Brief sebelum semua Blok A-E terisi cukup
- Kalau user memberi jawaban yang ambigu, minta klarifikasi sebelum lanjut
- Kalau ada keputusan yang saling bertentangan, tandai sebagai open question
- Problem Brief ini adalah INPUT untuk skill `create-prd` — pastikan cukup detail untuk dilanjutkan

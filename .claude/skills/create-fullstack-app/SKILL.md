---
name: create-fullstack-app
description: Plugin lengkap untuk membangun fullstack web application dari ide mentah hingga production — mencakup seluruh pre-implementation phase (Problem Brief, PRD, SAD, Git Strategy, Tech Context, UI/UX Briefing, User Stories) dan implementation phase (Setup Project, Implement per Epic, Deploy). Gunakan plugin ini ketika user ingin membangun aplikasi baru dari nol, menyebut "bangun aplikasi", "buat project baru", "dari ide ke production", atau ketika ingin menjalankan software development lifecycle secara terstruktur dengan panduan AI agent dari awal hingga akhir. Plugin ini dirancang untuk bekerja dengan user yang memiliki berbagai level teknis — dari non-technical hingga experienced developer.
---

# Plugin: Create Fullstack App

Plugin ini adalah workflow lengkap Software Development Lifecycle (SDLC) — dari ide mentah hingga aplikasi live di production.

---

## Cara Kerja Plugin Ini

Plugin ini terdiri dari **11 skill** yang dijalankan secara berurutan. Setiap skill menghasilkan output yang menjadi input skill berikutnya.

```
FASE ENVIRONMENT (SEKALI SEUMUR HIDUP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skill 00 → Environment Setup
           (VS Code, Node.js, Git, Docker, Claude Code)

FASE PRE-IMPLEMENTATION (PER PROJECT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skill 01 → Problem Brief
Skill 02 → PRD (Product Requirements Document)
Skill 03 → SAD (System Architecture Document)
Skill 04 → Git Strategy
Skill 05 → Tech Context
Skill 06 → UI/UX Design Briefing *
Skill 07 → User Stories & Task Breakdown

FASE IMPLEMENTATION (PER PROJECT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skill 08 → Setup Project
Skill 09 → Implement Epic (diulang per Epic)
Skill 10 → Deploy (opsional, dijalankan sekali di akhir)
```

> *Skill 06 menghasilkan dokumen briefing yang dibawa ke **Claude Design** (tool terpisah) untuk menghasilkan mockup visual. Skill ini tidak menghasilkan visual langsung di Claude Code.

---

## Langkah Pertama: Tentukan Titik Mulai

**Apakah kamu baru pertama kali setup di komputer ini?**

- **Ya, baru pertama kali** → Mulai dari Skill 00 (Environment Setup)
- **Sudah pernah setup sebelumnya** → Skip ke Skill 01, atau ke skill yang relevan

**Sudah punya dokumen PRD/SAD dari sebelumnya?**

- **Belum ada dokumen apapun** → Mulai dari Skill 01
- **PRD sudah ada, belum ada SAD** → Mulai dari Skill 03
- **Semua dokumen sudah ada** → Mulai dari Skill 08

---

## Pilih Stack (Dilakukan Saat Skill 03 — SAD)

Stack tidak perlu dipilih sekarang. Saat Skill 03 dijalankan, AI agent akan menjelaskan pilihan yang tersedia dalam bahasa awam dan membantu kamu memutuskan.

Stack yang tersedia:
- **Express.js + Next.js 16** (Recommended untuk solo dev / startup)
- **NestJS + Next.js 16** (Untuk tim yang butuh struktur lebih ketat)
- **Custom** (Jika ada kebutuhan spesifik)

Reference file akan di-load otomatis sesuai pilihan saat dibutuhkan.

---

## Pilih Deploy Target (Dilakukan Saat Skill 10 — Deploy)

Deploy tidak dilakukan di tengah-tengah development. Skill 10 dijalankan **sekali saja setelah semua Epic MVP selesai**. Selama development, cukup jalankan di lokal.

Deploy target yang tersedia:
- **Railway + Vercel** (Recommended: zero DevOps, cocok untuk MVP)
- **AWS / GCP** (Untuk skala besar)
- **VPS** (Budget terbatas, mau lebih kontrol)

---

## Tanggung Jawab Manusia vs AI Agent

```
MANUSIA (kamu)                  AI AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Punya ide produk            →   Menggali & mengstrukturkan ide
Keputusan bisnis            →   Mendokumentasikan keputusan
Install tools (Skill 00)    →   Memberi panduan cara install
Buat akun (GitHub, dll)     →   Memberi instruksi langkah demi langkah
Provide API keys & secrets  →   Setup semua konfigurasi teknis
Review setiap output        →   Generate & implementasi
Approve deployment          →   Menyiapkan & menjalankan deployment
```

**Prinsip utama:**
- AI agent tidak pernah membuat keputusan bisnis atas namamu
- AI agent tidak pernah menyimpan atau melihat nilai API key / secret — hanya kamu yang input langsung ke file `.env`
- Setiap output dokumen (PRD, SAD, dll) harus di-review dan disetujui manusia sebelum lanjut ke fase berikutnya

---

## Cara Melanjutkan di Sesi Baru

Claude Code tidak ingat percakapan sebelumnya. Setiap kali mulai sesi baru, gunakan salah satu template prompt berikut:

**Lanjut pre-implementation:**
```
Baca docs/TECH_CONTEXT.md dan docs/PRD_[NamaProduk].md.
Kita sedang di fase pre-implementation.
[Dokumen yang sudah selesai]: PRD, SAD
[Dokumen yang akan dibuat]: User Stories
Lanjutkan dengan Skill 07.
```

**Lanjut implementasi:**
```
Baca docs/TECH_CONTEXT.md dan docs/USER_STORIES_MVP.md.
Semua dokumen pre-implementation sudah selesai dan project sudah di-setup.
Lanjutkan implementasi dari EPIC [X] — STORY [Y.Z].
Task terakhir yang selesai: TASK-BE-[X.Y.Z].
```

**Mulai Epic baru:**
```
Baca docs/TECH_CONTEXT.md dan docs/USER_STORIES_MVP.md.
EPIC [X] sudah selesai. Lanjutkan ke EPIC [X+1]: [nama Epic].
Buat branch feat/[nama-epic] dan mulai dari STORY [X+1.1].
```

---

## Dokumen yang Dihasilkan

Semua dokumen disimpan di folder `docs/` dalam project:

```
docs/
├── PROBLEM_BRIEF.md          ← output Skill 01
├── PRD_[NamaProduk].md       ← output Skill 02
├── SAD_[NamaProduk].md       ← output Skill 03
├── GIT_STRATEGY.md           ← output Skill 04
├── TECH_CONTEXT.md           ← output Skill 05
├── UI_UX_DESIGN_BRIEFING.md  ← output Skill 06 (dibawa ke Claude Design)
└── USER_STORIES_MVP.md       ← output Skill 07
```

---

## Estimasi Waktu Per Fase

| Fase | Estimasi | Catatan |
|---|---|---|
| Skill 00 — Environment Setup | 30–60 menit | Hanya sekali |
| Skill 01–07 — Pre-implementation | 2–4 jam | Tergantung kompleksitas produk |
| Skill 06 di Claude Design | 1–3 jam | Terpisah dari Claude Code |
| Skill 08 — Setup Project | 30–60 menit | |
| Skill 09 — Per Epic | 2–8 jam per Epic | Tergantung jumlah Story |
| Skill 10 — Deploy | 1–2 jam | Hanya sekali di akhir |

---

## Skill Index

| # | File | Fungsi | Kapan Dijalankan |
|---|---|---|---|
| 00 | `skills/00-environment-setup.md` | Install semua tools development | Sekali seumur hidup |
| 01 | `skills/01-idea-to-problem-brief.md` | Strukturkan ide → Problem Brief | Awal setiap project |
| 02 | `skills/02-create-prd.md` | Problem Brief → PRD | Setelah Skill 01 |
| 03 | `skills/03-create-sad.md` | PRD → SAD | Setelah Skill 02 |
| 04 | `skills/04-create-git-strategy.md` | SAD → Git Strategy | Setelah Skill 03 |
| 05 | `skills/05-create-tech-context.md` | PRD + SAD → Tech Context | Setelah Skill 04 |
| 06 | `skills/06-create-uiux-briefing.md` | PRD → UI/UX Briefing + pilih jalur A (Claude Design) atau B (langsung implementasi) | Setelah Skill 05 |
| 07 | `skills/07-create-user-stories.md` | PRD + SAD → User Stories | Setelah Skill 06 |
| 08 | `skills/08-setup-project.md` | Init monorepo, dependencies, Docker | Awal implementation |
| 09 | `skills/09-implement-epic.md` | Implementasi per Epic | Diulang per Epic |
| 10 | `skills/10-deploy.md` | Deploy ke staging → production | Sekali, setelah semua Epic selesai |

---

## Reference Files

| File | Kapan Dibaca |
|---|---|
| `references/stacks/express-nextjs.md` | Skill 08, jika stack Express + Next.js dipilih |
| `references/ui-design-system.md` | Skill 09, untuk semua implementasi frontend |
| `references/context7-libraries.md` | Skill 08 & 09, sebelum menulis kode apapun |
| `references/stacks/nestjs-nextjs.md` | Skill 08, jika stack NestJS + Next.js dipilih |
| `references/deploy-targets/railway-vercel.md` | Skill 10, jika deploy target Railway + Vercel dipilih |

---

## Catatan untuk AI Agent

- Selalu baca skill file yang relevan sebelum menjalankan fase apapun
- Jangan loncat fase — setiap fase menghasilkan output yang dibutuhkan fase berikutnya
- Setelah setiap skill selesai, tanya user: "Apakah output ini sudah sesuai sebelum kita lanjut?"
- Jangan lanjut ke skill berikutnya tanpa konfirmasi eksplisit dari user
- Saat menemukan keputusan yang butuh input manusia, gunakan format ⚠️ BUTUH INPUT MANUSIA
- Setiap checkpoint yang butuh aksi manusia harus dijelaskan dengan bahasa non-technical
- Progress implementasi dilacak via checkbox di USER_STORIES — selalu update setelah task selesai
- Stack selection terjadi SATU KALI di Skill 03 — jangan tanya ulang di skill lain

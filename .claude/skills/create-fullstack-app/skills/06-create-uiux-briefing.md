---
name: create-uiux-briefing
description: Gunakan skill ini ketika user ingin menyiapkan desain UI/UX sebelum implementasi frontend. Skill ini menghasilkan briefing dokumen DAN menawarkan dua opsi: (A) bawa ke Claude Design untuk mockup visual, atau (B) langsung implementasi frontend dari briefing tanpa keluar dari Claude Code. Trigger ketika user menyebut "briefing desain", "UI UX", "desain halaman", "mau bikin tampilan", atau saat PRD sudah selesai dan user ingin menyiapkan panduan visual.
---

# Skill 06: UI/UX Design Briefing & Implementation Path

Skill ini melakukan dua hal:
1. Generate `UI_UX_DESIGN_BRIEFING.md` dari PRD
2. Membantu user memilih jalur desain yang sesuai

---

## Input yang Dibutuhkan

- `docs/PRD_[NamaProduk].md` — **wajib ada**
- `docs/SAD_[NamaProduk].md` — opsional, untuk constraint teknis UI

---

## Fase 1: Generate UI_UX_DESIGN_BRIEFING.md

Terlepas dari opsi yang dipilih, dokumen ini selalu dibuat dulu.
Baca PRD dan SAD, ekstrak semua informasi yang relevan untuk desain.

```markdown
# UI/UX Design Briefing
## [Nama Produk]
**Dibuat dari:** PRD v[X.X] | [tanggal]

---

## Tentang Produk
[2-3 paragraf: deskripsi produk, mental model yang tepat,
analogi dengan produk yang sudah dikenal user]

---

## Target Pengguna

### Persona 1 — "[Nama]"
- **Demografi:** [umur, profesi, tingkat tech-savviness]
- **Situasi:** [konteks penggunaan konkret]
- **Pain Point:** [masalah spesifik yang dialami]
- **Goal:** [apa yang ingin dicapai dengan produk ini]

[ulangi per persona dari PRD]

---

## Halaman yang Perlu Didesain

### A. [Konteks 1 — misal: Public / Reader-facing]
| Halaman | Deskripsi | Prioritas |
|---|---|---|
| [nama] | [deskripsi] | MVP / V2 |

### B. [Konteks 2 — misal: Dashboard / Admin]
| Halaman | Deskripsi | Prioritas |
|---|---|---|

[tambah konteks sesuai kebutuhan]

---

## User Flows Kritis

### Flow 1: [Nama — misal: Konversi Reader → Member]
```
[langkah 1]
→ [langkah 2]
→ [langkah 3]
→ [outcome]
```

[ulangi per flow kritis dari PRD]

---

## Constraint Teknis untuk Desain

- **Component library:** shadcn/ui
- **CSS framework:** Tailwind CSS
- **Responsive:** [prioritas platform — misal: Mobile-first]
- **Dark mode:** [perlu/tidak]
- **Typography:** [panduan khusus — misal: max-width artikel 680px]
- **Font:** [jika ada preferensi — misal: Inter untuk UI, Lora untuk artikel]

---

## Tone & Karakter Visual

[3-5 poin deskriptif — bukan instruksi teknis, tapi panduan feeling]

Referensi visual:
- [produk 1]: [aspek apa yang relevan]
- [produk 2]: [aspek apa yang relevan]

---

## Fitur Unik yang Butuh Perhatian Desain Khusus

### [Fitur 1]
[penjelasan mengapa unik dan arah visual yang diinginkan]

[tambah sesuai kebutuhan]

---

## Prioritas MVP

Halaman yang HARUS didesain untuk MVP (urutan):
1. [halaman 1]
2. [halaman 2]
...

Halaman yang bisa menyusul (V2):
- [halaman non-MVP]

---

## Yang Harus Dihindari
[list hal yang TIDAK diinginkan dalam desain]
```

---

## Fase 2: Pilih Jalur Desain

Setelah dokumen selesai, tanyakan user:

```
UI_UX_DESIGN_BRIEFING.md sudah selesai dan disimpan di docs/.

Sekarang ada dua jalur untuk lanjut:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JALUR A — Claude Design (Mockup Visual Dulu)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kamu bawa briefing ini ke Claude Design, Claude Design
menghasilkan mockup visual per halaman, kamu review dan
iterasi sampai puas, lalu hasilnya dibawa kembali ke
Claude Code sebagai referensi implementasi.

Cocok jika: kamu peduli dengan tampilan yang sangat spesifik,
mau review visual sebelum kode ditulis, atau mau share
mockup ke stakeholder dulu.

Waktu tambahan: ~1-3 jam di Claude Design sebelum lanjut implementasi.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JALUR B — Langsung Implementasi (dari Briefing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claude Code langsung implementasi frontend berdasarkan
briefing ini menggunakan frontend-design skill — skill
khusus yang menghasilkan UI distinctive dan production-
grade, bukan template generic "buatan AI".

Setiap halaman akan melalui design thinking dulu:
tone apa, karakter visual seperti apa, apa yang membuat
halaman ini memorable — baru kemudian dikodekan.

Cocok jika: kamu mau cepat, tidak butuh mockup terpisah,
atau mau lihat hasilnya langsung di browser.

Waktu: langsung lanjut ke Skill 07 → Skill 08 → Skill 09.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pilih A atau B?
```

---

## Jika User Pilih Jalur A — Claude Design

Berikan panduan berikut:

```
PANDUAN JALUR A — Claude Design

Langkah 1: Buka Claude Design
→ https://claude.ai/design (tool berbeda dari Claude Code)

Langkah 2: Upload briefing
→ Upload file docs/UI_UX_DESIGN_BRIEFING.md

Langkah 3: Mulai desain
→ Prompt: "Baca briefing ini. Desainkan halaman [halaman pertama
  di prioritas MVP] terlebih dahulu. Gunakan Tailwind CSS dan
  komponen shadcn/ui sebagai basis."

Langkah 4: Iterate
→ Review hasilnya, minta revisi jika perlu
→ Lanjut ke halaman berikutnya sampai semua MVP selesai

Langkah 5: Simpan hasil
→ Download atau copy HTML/CSS tiap halaman
→ Simpan di: frontend/design-references/
   Contoh: frontend/design-references/homepage.html
           frontend/design-references/article-page.html
           frontend/design-references/dashboard.html

Langkah 6: Kembali ke Claude Code
→ Lanjut ke Skill 07 (User Stories)
→ Saat Skill 09 implementasi frontend, Claude Code akan
  merujuk ke file-file di design-references/

Konfirmasi ke saya setelah hasil Claude Design tersimpan
di frontend/design-references/ — kita akan lanjut ke Skill 07.
```

---

## Jika User Pilih Jalur B — Langsung Implementasi

Catat keputusan ini dan berikan instruksi untuk Skill 09:

```
JALUR B DIPILIH — Implementasi Langsung dengan frontend-design skill

Yang akan terjadi saat Skill 09 mengimplementasikan frontend:

Setiap halaman melalui dua tahap:

TAHAP 1 — Design Thinking (sebelum kode ditulis)
Menggunakan frontend-design skill untuk menentukan:
- Tone dan karakter visual halaman ini
- Tipografi yang distinctive (bukan Inter/Roboto/Arial)
- Color system yang cohesive
- Layout yang memorable, bukan template
- Micro-interaction dan motion jika relevan

TAHAP 2 — Implementasi
Kode ditulis berdasarkan keputusan design thinking:
- Tailwind CSS untuk styling
- shadcn/ui untuk komponen fungsional (form, dialog, table)
- Custom CSS untuk elemen yang butuh karakter visual unik
- Hasilnya bisa direvisi jika tidak sesuai ekspektasi

Tidak perlu action apapun sekarang. Lanjut ke Skill 07.
```

Tambahkan catatan di `docs/UI_UX_DESIGN_BRIEFING.md`:
```markdown
---
**Jalur implementasi:** B — Langsung dari briefing menggunakan frontend-design skill
**Design system:** references/ui-design-system.md (sebagai constraint teknis)
**Design skill:** frontend-design (untuk aesthetic decisions)
```

---

## Instruksi untuk Skill 09 (Implementasi Frontend)

### Jika Jalur A dipilih — ada file di `frontend/design-references/`:

```
Saat implementasi halaman [X]:
1. Panggil context7 untuk next.js dan shadcn/ui
2. Baca file design-references/[nama-halaman].html
3. Analisis: struktur layout, komponen apa yang digunakan,
   warna dan spacing yang terlihat
4. Implementasikan menggunakan komponen shadcn/ui yang sesuai
5. Pastikan pixel-perfect dengan referensi di mana memungkinkan
6. Gunakan Tailwind classes, bukan hardcode style
```

### Jika Jalur B dipilih — tidak ada design-references:

```
Saat implementasi halaman [X]:
1. Panggil context7 untuk next.js dan shadcn/ui
2. Baca docs/UI_UX_DESIGN_BRIEFING.md — section halaman yang relevan
3. Baca references/ui-design-system.md — design system yang harus diikuti
4. Implementasikan dengan prinsip:
   - Hierarchy yang jelas: satu elemen utama per halaman
   - Whitespace yang cukup: jangan cramped
   - Konsisten dengan halaman lain yang sudah dibuat
   - Komponen shadcn/ui untuk semua elemen standar (button, form, card, dll)
   - Semantic color tokens — tidak pernah hardcode warna
5. Tunjukkan hasil di browser (http://localhost:3000) dan
   minta feedback sebelum lanjut ke halaman berikutnya
```

---

## Output yang Dihasilkan Skill Ini

**Selalu:**
- `docs/UI_UX_DESIGN_BRIEFING.md`

**Jika Jalur A:**
- `frontend/design-references/` (diisi user dari Claude Design)
- Panduan cara menggunakan hasil Claude Design di Skill 09

**Jika Jalur B:**
- Catatan jalur di `UI_UX_DESIGN_BRIEFING.md`
- Instruksi untuk Skill 09 tentang cara implementasi dari briefing

---

## Catatan Penting

- Jangan masukkan detail teknis seperti database schema ke briefing
- Semua persona dari PRD harus ada di briefing
- Prioritas halaman harus selaras dengan MVP scope di PRD
- Kedua jalur menghasilkan UI yang production-quality — bukan placeholder

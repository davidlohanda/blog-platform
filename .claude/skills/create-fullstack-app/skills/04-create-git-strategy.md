---
name: create-git-strategy
description: Gunakan skill ini ketika user ingin membuat Git Strategy dan branching convention untuk sebuah project software. Trigger ketika user menyebut "git strategy", "branching strategy", "git workflow", "cara kerja git", "konvensi commit", atau ketika user sudah memiliki PRD/SAD dan ingin melengkapi dokumentasi pre-implementation sebelum mulai coding. Skill ini menghasilkan dokumen GIT_STRATEGY.md yang berisi branching model, naming convention, commit message format, dan alur kerja harian yang disesuaikan dengan ukuran tim dan karakteristik project.
---

# Skill: Create Git Strategy

Skill ini menghasilkan dokumen GIT_STRATEGY.md yang berisi panduan lengkap penggunaan Git untuk sebuah project, disesuaikan dengan konteks tim dan project.

## Input yang Dibutuhkan

- Ukuran tim (solo, 2-3 orang, atau tim lebih besar)
- Jenis produk (web app, mobile app, library, dll)
- Platform deployment (continuous deployment atau scheduled release)
- PRD/SAD jika tersedia (untuk memahami konteks project)

Jika belum ada informasi ini, tanyakan sebelum generate.

---

## Role yang Diambil

Bertindak sebagai **Senior Developer / Tech Lead** yang berpengalaman mengelola codebase tim. Rekomendasikan pendekatan yang paling sesuai — bukan yang paling kompleks.

---

## Fase 1: Tentukan Model yang Tepat

Berdasarkan konteks, pilih model yang sesuai:

### GitHub Flow (Simplified)
**Kapan dipakai:** Solo developer atau tim kecil (2-3 orang), web app dengan continuous deployment
**Karakteristik:** Satu branch `main` yang selalu production-ready, semua fitur lewat branch sementara, PR sebelum merge
**Rekomendasi untuk:** MVP, startup stage, AI-assisted development

### Git Flow
**Kapan dipakai:** Tim lebih besar, produk dengan release cycle terjadwal (mobile app, enterprise software)
**Karakteristik:** Branch `main`, `develop`, `release`, `hotfix`, dan `feature`
**Rekomendasi untuk:** Produk yang butuh release management ketat

### Trunk-Based Development
**Kapan dipakai:** Tim besar dengan CI/CD matang, banyak automated test
**Karakteristik:** Semua commit langsung ke `main`, feature flags untuk hide incomplete features
**Rekomendasi untuk:** Tim engineering yang sudah mature

---

## Fase 2: Generate GIT_STRATEGY.md

```markdown
# Git Strategy & Branching Convention
## [Nama Project]
**Model:** [GitHub Flow / Git Flow / Trunk-Based]
**Versi:** 1.0 | [tanggal]

---

## Filosofi
[1-2 kalimat yang menjelaskan prinsip utama git strategy yang dipilih]

---

## Branch Structure

### Branch Permanen
[daftar branch permanen dan aturan per branch]

### Branch Sementara
[daftar tipe branch sementara]

---

## Naming Convention

### Format
[format nama branch]

### Tipe Branch
| Tipe | Kapan dipakai | Contoh |
|---|---|---|
| feat/ | Fitur baru | feat/auth-register |
| fix/ | Bug fix | fix/article-slug |
| hotfix/ | Bug kritis production | hotfix/payment-fail |
| chore/ | Setup, config | chore/init-project |
| refactor/ | Refactor | refactor/auth-service |
| docs/ | Dokumentasi | docs/update-readme |

---

## Commit Message Convention (Conventional Commits)

### Format
```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Tipe Commit
| Tipe | Kapan dipakai |
|---|---|
| feat | Fitur baru |
| fix | Bug fix |
| chore | Setup, config, tooling |
| refactor | Refactor tanpa perubahan behavior |
| docs | Update dokumentasi |
| style | Formatting |
| test | Tambah/update test |
| perf | Optimasi performance |
| ci | Perubahan CI/CD |

### Scope yang Disarankan
[list scope berdasarkan modul yang ada di project]

### Contoh Baik
[3-5 contoh commit message yang baik dari konteks project ini]

### Contoh Buruk
[contoh yang harus dihindari]

---

## Alur Kerja Harian

### Mulai Fitur Baru
[langkah-langkah dengan git command]

### Develop & Commit
[panduan frekuensi commit]

### Selesai — Pull Request
[panduan buat PR]

### Merge & Cleanup
[cleanup setelah merge]

---

## Hotfix Flow
[langkah menangani bug kritis]

---

## Repository Structure
[monorepo vs polyrepo recommendation dengan alasan]

---

## Branch Protection Rules
[rules yang disarankan untuk di-setup di GitHub/GitLab]

---

## .gitignore Essentials
[template .gitignore yang relevan dengan tech stack project]

---

## Urutan Branch untuk MVP
[list branch yang akan dibuat selama MVP sesuai urutan Epic dari PRD]

---

## Quick Reference
[cheatsheet git command yang paling sering dipakai]
```

---

## Penyesuaian untuk AI-Assisted Development

Jika project menggunakan AI agent (Claude Code) untuk implementasi, tambahkan section khusus:

- Panduan commit atomik dengan AI agent (commit setiap komponen selesai, jangan tunggu modul penuh)
- Satu Story = satu atau beberapa commit yang related
- AI agent tidak boleh commit file `.env` — tambahkan pengecekan ini

---

## Output Behavior

**Di Claude Code:** Simpan ke `docs/GIT_STRATEGY.md`

**Di Claude.ai:** Tampilkan konten lengkap, informasikan user bahwa ini siap di-copy ke file `docs/GIT_STRATEGY.md`

---

## Catatan Penting

- Pilih model yang paling simpel yang memenuhi kebutuhan — jangan over-engineer
- Conventional Commits wajib jika project menggunakan AI agent, karena memudahkan AI memahami konteks perubahan
- `.gitignore` harus disesuaikan dengan tech stack yang ada di SAD/PRD

# Git Strategy & Branching Convention
## Platform Blog Subscription Multi-Author
**Model:** GitHub Flow (simplified)  
**Versi:** 1.0 | 22 Mei 2026

---

## Filosofi

> **Satu branch utama (`main`), selalu production-ready, deploy otomatis setiap merge.**

Model ini dipilih karena:
- Simpel — tidak ada overhead mengelola banyak branch long-lived
- Cocok untuk web app dengan deployment continuous
- 1–3 developer bisa bekerja paralel tanpa konflik besar
- Mudah dipahami dan di-enforce oleh AI agent

---

## Branch Structure

### Branch Permanen: `main`

- **Satu-satunya** branch yang long-lived
- **Selalu** dalam kondisi bisa di-deploy ke production
- Tidak ada yang push langsung ke `main` — semua lewat Pull Request
- Setiap merge ke `main` otomatis men-trigger CI/CD pipeline

### Branch Sementara (Short-lived)

Semua branch selain `main` bersifat sementara — dibuat saat mulai, dihapus setelah merge.

---

## Naming Convention

### Format
```
<type>/<short-description>
```

Gunakan kebab-case, huruf kecil semua, maksimal 4–5 kata.

### Tipe Branch

| Tipe | Kapan dipakai | Contoh |
|---|---|---|
| `feat/` | Fitur baru | `feat/auth-register` |
| `fix/` | Bug fix non-kritis | `fix/article-slug-duplicate` |
| `hotfix/` | Bug kritis di production | `hotfix/payment-webhook-fail` |
| `chore/` | Setup, config, dependency update | `chore/setup-prisma` |
| `refactor/` | Refactor tanpa perubahan behavior | `refactor/article-service` |
| `docs/` | Update dokumentasi saja | `docs/update-readme` |

### Contoh Nama Branch yang Baik
```
feat/auth-google-oauth
feat/article-rich-text-editor
feat/subscription-midtrans
fix/comment-delete-permission
hotfix/jwt-refresh-token-expired
chore/init-project-structure
chore/setup-postgresql-prisma
```

---

## Alur Kerja Harian

### 1. Mulai Fitur Baru

```bash
# Pastikan main selalu up-to-date sebelum mulai
git checkout main
git pull origin main

# Buat branch baru dari main
git checkout -b feat/nama-fitur
```

### 2. Develop & Commit

```bash
# Commit sesering mungkin — setiap logical unit selesai
git add .
git commit -m "feat(auth): add email/password register endpoint"

# Push ke remote secara berkala (backup + progress tracking)
git push origin feat/nama-fitur
```

### 3. Selesai — Buat Pull Request

```bash
# Final push sebelum PR
git push origin feat/nama-fitur

# Buat Pull Request di GitHub/GitLab:
# - Base: main
# - Compare: feat/nama-fitur
# - Deskripsi: apa yang berubah, cara test
```

### 4. Merge & Cleanup

```bash
# Setelah PR merged (di GitHub UI)
git checkout main
git pull origin main

# Hapus branch lokal yang sudah merged
git branch -d feat/nama-fitur

# Hapus branch remote (bisa dilakukan di GitHub UI juga)
git push origin --delete feat/nama-fitur
```

---

## Commit Message Convention

Menggunakan **Conventional Commits** — format standar industri yang bisa di-parse otomatis untuk changelog.

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipe Commit

| Tipe | Kapan dipakai |
|---|---|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `chore` | Setup, config, tooling — tidak mempengaruhi app logic |
| `refactor` | Refactor kode — tidak ada fitur baru, tidak ada bug fix |
| `docs` | Update dokumentasi |
| `style` | Formatting, whitespace — tidak ada logic change |
| `test` | Tambah atau update tests |
| `perf` | Optimasi performance |
| `ci` | Perubahan CI/CD config |

### Scope (opsional tapi disarankan)

Nama modul yang terpengaruh: `auth`, `article`, `publication`, `subscription`, `comment`, `search`, `email`, `media`, `analytics`, `ui`, `db`, `config`

### Contoh Commit Message yang Baik

```bash
# Fitur baru
feat(auth): add Google OAuth login with Passport.js
feat(article): implement rich text editor with Tiptap
feat(subscription): integrate Midtrans payment gateway

# Bug fix
fix(auth): resolve refresh token not rotating on reuse
fix(article): fix slug collision when title is duplicate

# Setup & config
chore(config): init Next.js 16 project with TypeScript
chore(db): add Prisma schema for users and publications
chore(ci): add GitHub Actions workflow for lint and test

# Refactor
refactor(article): extract paywall logic to separate component

# Multiple file changes — body menjelaskan detail
feat(subscription): add webhook handler for Midtrans payment

Handle settlement, pending, cancel, and expire statuses.
Add idempotency check to prevent duplicate processing.
Send confirmation email after successful payment.

Closes #42
```

### Contoh yang BURUK — Jangan Ditiru

```bash
# Terlalu vague
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
git commit -m "wip"

# Tidak pakai convention
git commit -m "Added login feature and fixed some bugs and updated readme"
```

---

## Strategi untuk Solo Developer + AI Agent

Saat bekerja sendiri dengan bantuan AI agent, beberapa tambahan yang membantu:

### Branch per Modul MVP

Urutan branch yang disarankan untuk MVP:

```
chore/init-monorepo-structure
chore/init-backend-express
chore/init-frontend-nextjs
chore/setup-database-prisma
chore/setup-docker-compose

feat/auth-backend           ← backend auth endpoints
feat/auth-frontend          ← frontend auth pages & forms
feat/publication-backend
feat/publication-frontend
feat/article-backend
feat/article-editor         ← rich text editor
feat/subscription-backend
feat/payment-midtrans
feat/reader-experience      ← paywall, artikel page
feat/email-notifications
feat/dashboard-analytics
```

### Commit Atomik dengan AI Agent

Saat AI agent menulis kode, commit setiap komponen yang logically complete — jangan tunggu satu modul penuh selesai:

```bash
# Contoh untuk modul auth backend
feat(auth): add User model and Prisma migration
feat(auth): implement register endpoint with Argon2 hashing
feat(auth): add login endpoint with JWT access token
feat(auth): implement refresh token rotation with Redis
feat(auth): add Google OAuth with Passport.js
feat(auth): add forgot password and reset password flow
test(auth): add integration tests for auth endpoints
```

---

## Skenario Multi-Sesi per Epic

Skenario A — Epic selesai dalam satu sesi (ideal):
  commit per Story → push per Story → PR ke main setelah Epic penuh selesai

Skenario B — Epic tidak selesai dalam satu sesi:
  commit per Story → push per Story → JANGAN buat PR dulu
  Sesi berikutnya: checkout branch yang sama → lanjut Story berikutnya
  PR ke main HANYA dibuat setelah SEMUA Story dalam Epic selesai

---

## Hotfix Flow (Bug Kritis di Production)

Kalau ada bug kritis yang harus diperbaiki segera:

```bash
# Buat hotfix dari main (bukan dari feature branch yang sedang berjalan)
git checkout main
git pull origin main
git checkout -b hotfix/deskripsi-bug

# Fix, commit, push
git commit -m "hotfix(subscription): fix duplicate subscription on webhook retry"
git push origin hotfix/deskripsi-bug

# Buat PR ke main, merge secepatnya
# Deploy otomatis setelah merge
```

---

## Repository Structure

### Monorepo vs Polyrepo

Untuk project ini, gunakan **monorepo** — frontend dan backend dalam satu repository:

```
platform-blog/              ← satu repo GitHub
├── frontend/               ← Next.js app
├── backend/                ← Express app
├── docs/                   ← PRD, SAD, dan dokumen lain
│   ├── PRD_Publication_Platform.md
│   ├── SAD_Publication_Platform.md
│   ├── GIT_STRATEGY.md
│   └── TECH_CONTEXT.md
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
├── docker-compose.yml      ← untuk development lokal
└── README.md
```

**Alasan monorepo:**
- Satu PR bisa mencakup perubahan frontend + backend sekaligus
- Lebih mudah untuk 1 developer
- Shared types bisa di-extract ke `packages/shared` di masa depan

---

## Branch Protection Rules (Setup di GitHub)

Setelah repository dibuat, aktifkan di **Settings → Branches → Add rule** untuk branch `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass (lint, test) — aktifkan setelah CI setup
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
- ❌ Require approvals — tidak perlu untuk solo developer

---

## `.gitignore` Essentials

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
.next/
dist/
build/

# Environment variables — JANGAN PERNAH COMMIT
.env
.env.local
.env.*.local
!.env.example      ← file ini boleh di-commit (template tanpa nilai)

# Database
*.db
*.sqlite

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/
*.swp

# Prisma
prisma/dev.db

# Testing
coverage/
```

---

## Quick Reference

```bash
# Mulai fitur baru
git checkout main && git pull && git checkout -b feat/nama-fitur

# Commit dengan convention
git commit -m "feat(scope): deskripsi singkat"

# Push progress
git push origin feat/nama-fitur

# Update branch dengan perubahan terbaru di main
git fetch origin
git rebase origin/main   # lebih bersih dari merge untuk feature branch

# Lihat status semua branch
git branch -a

# Hapus branch lokal yang sudah merged
git branch -d feat/nama-fitur
```

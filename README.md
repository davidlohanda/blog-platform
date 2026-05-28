# Lentera — Blog Subscription Platform

Platform blog subscription multi-author. Setiap publication berdiri independen dengan audience-nya sendiri.

## Tech Stack

- **Backend**: Node.js + TypeScript + Express.js + Prisma + PostgreSQL + Redis
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Payment**: Midtrans
- **Email**: Resend + BullMQ
- **Storage**: Cloudinary

## Setup Lokal

### Prerequisites

- Node.js 20.9+
- Docker & Docker Compose
- npm 11+

### 1. Clone & Install

```bash
git clone <repo-url>
cd blog-platform
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — isi DATABASE_URL, REDIS_URL, JWT secrets, dll.

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local — isi NEXT_PUBLIC_API_URL
```

### 3. Jalankan Database

```bash
# Terminal 1 — PostgreSQL + Redis via Docker
docker-compose up -d
```

### 4. Setup Database (pertama kali)

```bash
cd backend
npx prisma migrate dev
npx prisma db seed   # opsional — isi data sample
```

### 5. Jalankan Aplikasi

```bash
# Dari root — jalankan backend + frontend sekaligus
npm run dev

# Atau individual:
npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:3000
```

## Struktur Project

```
blog-platform/
├── backend/          — Express.js API
│   ├── src/
│   │   ├── modules/  — domain modules (auth, article, dll.)
│   │   ├── middleware/
│   │   ├── config/
│   │   └── lib/
│   └── prisma/
├── frontend/         — Next.js 16 app
│   └── src/
│       ├── app/      — App Router pages
│       ├── components/
│       ├── lib/      — API wrappers, utilities
│       ├── hooks/
│       ├── store/    — Zustand stores
│       └── types/
├── docs/             — PRD, SAD, dan dokumen planning
└── docker-compose.yml
```

## Dokumentasi

- `docs/PRD_Publication_Platform.md` — product requirements
- `docs/SAD_Publication_Platform.md` — system architecture
- `docs/TECH_CONTEXT.md` — coding rules & conventions
- `docs/GIT_STRATEGY.md` — branching & commit convention
- `docs/USER_STORIES_MVP.md` — task breakdown & progress tracker

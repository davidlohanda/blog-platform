# Stack Reference: NestJS + Next.js 16

> ⚠️ Stack ini belum sepenuhnya didokumentasikan dalam plugin ini.
> 
> Jika kamu memilih stack ini, AI agent akan tetap membantu setup,
> namun instruksi tidak akan sedetail Express + Next.js.
>
> **Rekomendasi:** Jika kamu tidak familiar dengan NestJS atau baru pertama
> kali membangun fullstack app, gunakan stack Express + Next.js terlebih dahulu.
> NestJS cocok untuk tim yang sudah familiar dan butuh struktur yang lebih strict.

---

## Kapan Memilih NestJS?

Pilih NestJS jika:
- Kamu sudah pernah pakai NestJS sebelumnya
- Tim lebih dari 3 orang dan butuh struktur yang lebih enforced
- Project butuh fitur enterprise seperti microservices, GraphQL, atau gRPC

Tetap pilih Express jika:
- Solo developer atau tim kecil
- MVP yang perlu selesai cepat
- Kamu lebih familiar dengan Express

---

## Stack Overview
- **Backend:** Node.js + TypeScript + NestJS + Prisma
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Redis
- **Deploy:** Railway + Vercel

---

## Backend Setup (NestJS)

```bash
npm install -g @nestjs/cli
nest new backend --package-manager npm
cd backend

npm install @prisma/client prisma
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt passport-google-oauth20
npm install zod argon2 class-validator class-transformer
npm install @nestjs/bull bull ioredis resend

npx prisma init
```

### Struktur Folder NestJS
```
backend/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── strategies/
│   └── [modul lain sesuai SAD]
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── decorators/
└── database/
    └── prisma.service.ts
```

---

## Frontend Setup

Frontend (Next.js) sama persis dengan stack Express + Next.js.
Ikuti instruksi frontend di `references/stacks/express-nextjs.md` — bagian Frontend Setup.

---

## .env.example Backend (NestJS)
```bash
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://developer:localpassword@localhost:5432/[project]_dev
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

RESEND_API_KEY=
EMAIL_FROM=noreply@localhost.com

API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

---

## Deployment Notes

Sama dengan Express + Next.js. Lihat bagian Deployment Notes di
`references/stacks/express-nextjs.md`.

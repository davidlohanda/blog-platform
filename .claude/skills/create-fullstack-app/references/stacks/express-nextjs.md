# Stack Reference: Express.js + Next.js 16

## Stack Overview
- **Backend:** Node.js + TypeScript + Express.js + Prisma
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Redis (via Docker lokal, Railway di production)
- **Deploy:** Railway (backend + DB) + Vercel (frontend)

---

## Backend Setup

### Init & Dependencies

```bash
cd backend
npm init -y
npm install express prisma @prisma/client
npm install zod argon2 jsonwebtoken cookie-parser cors helmet express-rate-limit
npm install bullmq ioredis resend
npm install -D typescript @types/node @types/express @types/jsonwebtoken @types/cookie-parser ts-node-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

npx tsc --init
npx prisma init
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "ts-node src/database/seed.ts"
  }
}
```

### Middleware Chain di app.ts
```typescript
// URUTAN INI KRITIS — JANGAN DIUBAH
app.use(helmet())
app.use(cors(corsOptions))          // sesuaikan origins per environment
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(loggerMiddleware)
app.use(rateLimiter)
app.use(tenantMiddleware)           // jika multi-tenant

// Routes
app.use('/api/v1/auth', authRouter)
// ... routes lainnya

// ERROR HANDLER HARUS PALING TERAKHIR
app.use(errorHandlerMiddleware)
```

### .env.example Backend
```bash
NODE_ENV=development
PORT=4000

# Database & Cache (Docker lokal)
DATABASE_URL=postgresql://developer:localpassword@localhost:5432/[project]_dev
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# Payment (Midtrans) — sesuaikan jika pakai gateway lain
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@localhost.com

# App URLs
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

---

## Frontend Setup

### Init & Dependencies
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# shadcn/ui
npx shadcn@latest init

# Additional dependencies
npm install axios zustand react-hook-form @hookform/resolvers zod
npm install date-fns lucide-react
```

**Tambahkan Tiptap hanya jika ada rich text editor di project:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-youtube
```

### next.config.ts
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // tambahkan hostname lain jika diperlukan
    ],
  },
  experimental: {
    dynamicIO: true,  // aktifkan 'use cache' directive (Next.js 16)
  },
}

export default nextConfig
```

### .env.local.example Frontend
```bash
# URL backend
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
API_URL=http://localhost:4000/api/v1

# Google OAuth (client side)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## Dockerfile — Backend
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

---

## Deployment Notes

### Railway Backend
- Root Directory: `backend`
- Build Command: `npm run build`
- Start Command: `node dist/index.js`
- Setelah deploy pertama, jalankan di Railway Shell: `npx prisma migrate deploy`

### Vercel Frontend
- Root Directory: `frontend`
- Framework Preset: Next.js (auto-detected)
- Build Command: `npm run build` (default)

### CORS di Production
Update `corsOptions` di backend untuk allow URL Vercel:
```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,  // set di Railway env vars
  ].filter(Boolean),
  credentials: true,
}
```

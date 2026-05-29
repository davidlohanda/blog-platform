import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  redis: {
    url: requireEnv('REDIS_URL'),
  },

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: '15m',
    refreshExpiresIn: '30d',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
  },

  resend: {
    apiKey: requireEnv('RESEND_API_KEY'),
    fromEmail: process.env.RESEND_FROM_EMAIL ?? 'noreply@lentera.id',
  },

  cloudinary: {
    cloudName: requireEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: requireEnv('CLOUDINARY_API_KEY'),
    apiSecret: requireEnv('CLOUDINARY_API_SECRET'),
  },

  midtrans: {
    serverKey: requireEnv('MIDTRANS_SERVER_KEY'),
    clientKey: requireEnv('MIDTRANS_CLIENT_KEY'),
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
  },

  platform: {
    feePercent: 15,
    baseDomain: process.env.BASE_DOMAIN ?? 'lentera.id',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },
};

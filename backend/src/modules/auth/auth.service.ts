import { randomUUID } from 'crypto';
import { authRepository } from './auth.repository';
import { AppError } from '../../lib/AppError';
import { hash, verify } from '../../lib/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { redis } from '../../config/redis.config';
import type { RegisterInput, LoginInput } from './auth.schema';

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) throw AppError.conflict('Email sudah terdaftar', 'EMAIL_TAKEN');

    const passwordHash = await hash(input.password);
    const user = await authRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    // Generate 24-hour email verification token (stored in DB per SAD 7.4)
    await authRepository.deleteAllEmailVerificationTokens(user.id);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await authRepository.createEmailVerificationToken({ userId: user.id, token, expiresAt });

    // TODO STORY 7.1: send verification email via Resend
    // For now, log the token so development is unblocked
    console.log(`[Auth] Verification URL: /auth/verify-email?token=${token}`);

    return { id: user.id, email: user.email, name: user.name };
  },

  async verifyEmail(token: string) {
    const record = await authRepository.findEmailVerificationToken(token);
    if (!record) throw AppError.badRequest('Token tidak valid atau sudah kedaluwarsa', 'INVALID_TOKEN');
    if (record.expiresAt < new Date()) {
      await authRepository.deleteEmailVerificationToken(record.id);
      throw AppError.badRequest('Token verifikasi sudah kedaluwarsa', 'TOKEN_EXPIRED');
    }

    await authRepository.markEmailVerified(record.userId);
    await authRepository.deleteEmailVerificationToken(record.id);
    return { message: 'Email berhasil diverifikasi' };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Email atau password salah', 'INVALID_CREDENTIALS');
    }

    const valid = await verify(user.passwordHash, input.password);
    if (!valid) throw AppError.unauthorized('Email atau password salah', 'INVALID_CREDENTIALS');

    const tokenId = randomUUID();
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken(user.id, tokenId);

    await redis.setex(`refresh:${user.id}:${tokenId}`, REFRESH_TOKEN_TTL, tokenId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  },

  async refresh(refreshTokenCookie: string) {
    let payload: { userId: string; tokenId: string };
    try {
      payload = verifyRefreshToken(refreshTokenCookie);
    } catch {
      throw AppError.unauthorized('Refresh token tidak valid', 'INVALID_REFRESH_TOKEN');
    }

    const stored = await redis.get(`refresh:${payload.userId}:${payload.tokenId}`);
    if (!stored) throw AppError.unauthorized('Sesi sudah berakhir, silakan login ulang', 'SESSION_EXPIRED');

    // Rotate: delete old, issue new
    await redis.del(`refresh:${payload.userId}:${payload.tokenId}`);

    const user = await authRepository.findById(payload.userId);
    if (!user) throw AppError.unauthorized('User tidak ditemukan', 'USER_NOT_FOUND');

    const newTokenId = randomUUID();
    const newAccessToken = signAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = signRefreshToken(user.id, newTokenId);

    await redis.setex(`refresh:${user.id}:${newTokenId}`, REFRESH_TOKEN_TTL, newTokenId);

    return { accessToken: newAccessToken, newRefreshToken, user };
  },

  async logout(userId: string, refreshTokenCookie: string) {
    try {
      const payload = verifyRefreshToken(refreshTokenCookie);
      await redis.del(`refresh:${userId}:${payload.tokenId}`);
    } catch {
      // Ignore invalid token during logout — just clear cookie
    }
  },

  async getMe(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');
    return user;
  },
};

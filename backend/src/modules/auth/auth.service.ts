import { randomUUID } from 'crypto';
import { authRepository } from './auth.repository';
import { publicationRepository } from '../publication/publication.repository';
import { AppError } from '../../lib/AppError';
import { hash, verify } from '../../lib/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { redis } from '../../config/redis.config';
import { emailService } from '../email/email.service';
import { config } from '../../config';
import type { RegisterInput, LoginInput } from './auth.schema';

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export const authService = {
  async register(input: RegisterInput, ownerInviteToken?: string) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) throw AppError.conflict('Email sudah terdaftar', 'EMAIL_TAKEN');

    // Jika ada owner invite token, validasi dulu sebelum membuat user
    let ownerInvitePayload: {
      email: string;
      ownerName: string;
      publicationId: string;
      publicationName: string;
    } | null = null;

    if (ownerInviteToken) {
      const raw = await redis.get(`owner-invite:${ownerInviteToken}`);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          type: string;
          email: string;
          ownerName: string;
          publicationId: string;
          publicationName: string;
        };
        if (parsed.type === 'owner-invite' && parsed.email === input.email) {
          ownerInvitePayload = parsed;
        }
      }
    }

    const passwordHash = await hash(input.password);
    const user = await authRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    if (ownerInvitePayload) {
      // Langsung mark email verified & set sebagai owner publication
      await authRepository.markEmailVerified(user.id);
      await publicationRepository.addAuthor(ownerInvitePayload.publicationId, user.id, 'owner');
      await redis.del(`owner-invite:${ownerInviteToken}`);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        ownerInvite: true,
        publicationId: ownerInvitePayload.publicationId,
      };
    }

    // Flow register normal: kirim email verifikasi
    await authRepository.deleteAllEmailVerificationTokens(user.id);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await authRepository.createEmailVerificationToken({ userId: user.id, token, expiresAt });

    const frontendUrl = config.platform.frontendUrl;
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    await emailService.sendVerification({ to: user.email, name: user.name, verifyUrl });

    return { id: user.id, email: user.email, name: user.name };
  },

  async verifyEmail(token: string) {
    const record = await authRepository.findEmailVerificationToken(token);
    if (!record)
      throw AppError.badRequest('Token tidak valid atau sudah kedaluwarsa', 'INVALID_TOKEN');
    if (record.expiresAt < new Date()) {
      await authRepository.deleteEmailVerificationToken(record.id);
      throw AppError.badRequest('Token verifikasi sudah kedaluwarsa', 'TOKEN_EXPIRED');
    }

    await authRepository.markEmailVerified(record.userId);
    await authRepository.deleteEmailVerificationToken(record.id);
    return { message: 'Email berhasil diverifikasi' };
  },

  async login(input: LoginInput, publicationId: string) {
    const user = await authRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Email atau password salah', 'INVALID_CREDENTIALS');
    }

    // Rate limiting: check lockout counter per email + publicationId
    const lockKey = `login_attempts:${input.email}:${publicationId}`;
    const attempts = await redis.get(lockKey);
    if (attempts && parseInt(attempts) >= 5) {
      throw AppError.tooManyRequests(
        'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
        'LOGIN_LOCKED',
      );
    }

    const valid = await verify(user.passwordHash, input.password);
    if (!valid) {
      // Increment attempt counter (TTL 15 menit)
      await redis.multi().incr(lockKey).expire(lockKey, 15 * 60).exec();
      throw AppError.unauthorized('Email atau password salah', 'INVALID_CREDENTIALS');
    }

    // Clear attempt counter on success
    await redis.del(lockKey);

    if (!user.emailVerifiedAt) {
      throw AppError.forbidden(
        'Silakan verifikasi email kamu terlebih dahulu. Cek inbox dan folder spam.',
        'EMAIL_NOT_VERIFIED',
      );
    }

    const tokenId = randomUUID();
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken(user.id, tokenId, publicationId);

    await redis.setex(`refresh:${user.id}:${publicationId}:${tokenId}`, REFRESH_TOKEN_TTL, tokenId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  },

  async refresh(refreshTokenCookie: string) {
    let payload: { userId: string; tokenId: string; publicationId: string };
    try {
      payload = verifyRefreshToken(refreshTokenCookie);
    } catch {
      throw AppError.unauthorized('Refresh token tidak valid', 'INVALID_REFRESH_TOKEN');
    }

    const { userId, tokenId, publicationId } = payload;
    const redisKey = `refresh:${userId}:${publicationId}:${tokenId}`;

    const stored = await redis.get(redisKey);
    if (!stored)
      throw AppError.unauthorized('Sesi sudah berakhir, silakan login ulang', 'SESSION_EXPIRED');

    // Rotate: delete old, issue new
    await redis.del(redisKey);

    const user = await authRepository.findById(userId);
    if (!user) throw AppError.unauthorized('User tidak ditemukan', 'USER_NOT_FOUND');

    const newTokenId = randomUUID();
    const newAccessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken(user.id, newTokenId, publicationId);

    await redis.setex(`refresh:${user.id}:${publicationId}:${newTokenId}`, REFRESH_TOKEN_TTL, newTokenId);

    return { accessToken: newAccessToken, newRefreshToken, user };
  },

  async logout(userId: string, refreshTokenCookie: string) {
    try {
      const payload = verifyRefreshToken(refreshTokenCookie);
      await redis.del(`refresh:${userId}:${payload.publicationId}:${payload.tokenId}`);
    } catch {
      // Ignore invalid token during logout — just clear cookie
    }
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findByEmail(email);
    // Always return same message to avoid email enumeration
    if (!user)
      return { message: 'Jika email terdaftar, link reset akan dikirim dalam beberapa menit.' };

    // Akun OAuth-only (tidak punya passwordHash) — kirim email informasi, bukan link reset
    if (!user.passwordHash) {
      await emailService.sendGoogleAccountInfo({ to: user.email, name: user.name });
      return { message: 'Jika email terdaftar, link reset akan dikirim dalam beberapa menit.' };
    }

    const token = randomUUID();
    await redis.setex(`reset:${token}`, 60 * 60, user.id); // TTL 1 hour

    const frontendUrl = config.platform.frontendUrl;
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await emailService.sendResetPassword({ to: user.email, name: user.name, resetUrl });

    return { message: 'Jika email terdaftar, link reset akan dikirim dalam beberapa menit.' };
  },

  async resetPassword(token: string, newPassword: string) {
    const userId = await redis.get(`reset:${token}`);
    if (!userId) {
      throw AppError.badRequest('Token tidak valid atau sudah kedaluwarsa', 'INVALID_TOKEN');
    }

    const passwordHash = await hash(newPassword);
    await authRepository.updatePassword(userId, passwordHash);
    await redis.del(`reset:${token}`);

    return { message: 'Password berhasil diubah. Silakan login dengan password baru.' };
  },

  async handleGoogleUser(
    profile: { googleId: string; email: string; name: string; avatarUrl?: string },
    publicationId: string,
  ) {
    let user = await authRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const existingByEmail = await authRepository.findByEmail(profile.email);
      if (existingByEmail) {
        user = await authRepository.linkGoogleId(
          existingByEmail.id,
          profile.googleId,
          profile.avatarUrl,
        );
      } else {
        user = await authRepository.createGoogleUser(profile);
      }
    }

    // Google OAuth hanya untuk member/visitor — tolak owner dan platform_admin
    if (user.role === 'platform_admin') {
      throw AppError.forbidden(
        'Akun admin platform tidak bisa login via Google. Gunakan email dan password.',
        'USE_PASSWORD',
      );
    }

    const pubAuthor = await publicationRepository.findAuthor(publicationId, user.id);
    if (pubAuthor && (pubAuthor.role === 'owner' || pubAuthor.role === 'author')) {
      throw AppError.forbidden(
        'Akun publication owner/author tidak bisa login via Google. Gunakan email dan password.',
        'USE_PASSWORD',
      );
    }

    const tokenId = randomUUID();
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken(user.id, tokenId, publicationId);
    await redis.setex(`refresh:${user.id}:${publicationId}:${tokenId}`, REFRESH_TOKEN_TTL, tokenId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  },

  async getMe(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');
    return user;
  },

  async acceptOwnerInvite(token: string) {
    const raw = await redis.get(`owner-invite:${token}`);
    if (!raw)
      throw AppError.badRequest('Token tidak valid atau sudah kedaluwarsa', 'INVALID_INVITE');

    const payload = JSON.parse(raw) as {
      type: string;
      email: string;
      ownerName: string;
      publicationId: string;
      publicationName: string;
    };

    if (payload.type !== 'owner-invite') {
      throw AppError.badRequest('Token tidak valid', 'INVALID_INVITE');
    }

    const frontendUrl = config.platform.frontendUrl;
    return {
      redirectUrl: `${frontendUrl}/register?invite=${token}&email=${encodeURIComponent(payload.email)}`,
    };
  },

  async acceptInvite(userId: string, token: string) {
    const raw = await redis.get(`invite:${token}`);
    if (!raw)
      throw AppError.badRequest('Undangan tidak valid atau sudah kedaluwarsa', 'INVALID_INVITE');

    const invite = JSON.parse(raw) as {
      email: string;
      publicationId: string;
      role: 'owner' | 'author';
    };

    const user = await authRepository.findById(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');
    if (user.email !== invite.email) {
      throw AppError.forbidden('Undangan ini bukan untuk akun kamu');
    }

    // Check if already a member
    const existing = await publicationRepository.findAuthor(invite.publicationId, userId);
    if (existing)
      throw AppError.conflict('Kamu sudah menjadi member publikasi ini', 'ALREADY_MEMBER');

    await publicationRepository.addAuthor(invite.publicationId, userId, invite.role);
    await redis.del(`invite:${token}`);

    return { message: 'Kamu berhasil bergabung ke publikasi', publicationId: invite.publicationId };
  },
};

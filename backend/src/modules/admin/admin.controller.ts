import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { adminService } from './admin.service';
import { emailService } from '../email/email.service';
import { publicationRepository } from '../publication/publication.repository';
import { authRepository } from '../auth/auth.repository';
import { redis } from '../../config/redis.config';
import { config } from '../../config';
import { AppError } from '../../lib/AppError';

export const adminController = {
  async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getOverview();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listPublications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
      const data = await adminService.listPublications(page, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
      const data = await adminService.listUsers(page, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async inviteOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const { ownerName, email, publicationName } = req.body as {
        ownerName: string;
        email: string;
        publicationName: string;
      };

      if (!ownerName || !email || !publicationName) {
        return next(AppError.badRequest('ownerName, email, dan publicationName wajib diisi'));
      }

      // Check email tidak sudah terdaftar
      const existing = await authRepository.findByEmail(email);
      if (existing) {
        return next(AppError.conflict('Email sudah terdaftar sebagai user Lentera', 'EMAIL_TAKEN'));
      }

      // Generate slug dari nama publication
      const slug = publicationName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 100);

      // Cek slug conflict dan generate unique jika perlu
      const slugCheck = await publicationRepository.findBySlug(slug);
      const finalSlug = slugCheck ? `${slug}-${Date.now()}` : slug;

      // Buat publication draft (tanpa owner — owner ditentukan saat accept invite)
      const publication = await publicationRepository.createDraft({
        slug: finalSlug,
        name: publicationName,
      });

      // Simpan owner invite token di Redis (7 hari)
      const token = randomUUID();
      const payload = {
        type: 'owner-invite',
        email,
        ownerName,
        publicationId: publication.id,
        publicationName,
      };
      await redis.setex(`owner-invite:${token}`, 7 * 24 * 60 * 60, JSON.stringify(payload));

      const frontendUrl = config.platform.frontendUrl;
      const inviteUrl = `${frontendUrl}/register?invite=${token}&email=${encodeURIComponent(email)}`;

      await emailService.sendOwnerInvite({
        to: email,
        ownerName,
        publicationName,
        inviteUrl,
      });

      res.status(202).json({
        success: true,
        data: {
          message: `Undangan owner berhasil dikirim ke ${email}`,
          publicationId: publication.id,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.config';
import { verifyUnsubscribeToken } from './email.service';
import { AppError } from '../../lib/AppError';

export const emailController = {
  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token?: string };
      if (!token) throw AppError.badRequest('Token tidak valid', 'INVALID_TOKEN');

      const payload = verifyUnsubscribeToken(token);
      if (!payload)
        throw AppError.badRequest('Token tidak valid atau sudah kedaluwarsa', 'INVALID_TOKEN');

      await prisma.emailPreference.upsert({
        where: {
          userId_publicationId: { userId: payload.userId, publicationId: payload.publicationId },
        },
        update: { newArticle: false },
        create: { userId: payload.userId, publicationId: payload.publicationId, newArticle: false },
      });

      res.json({
        success: true,
        data: { message: 'Kamu berhasil berhenti berlangganan notifikasi artikel baru.' },
      });
    } catch (error) {
      next(error);
    }
  },
};

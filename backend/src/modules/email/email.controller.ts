import { Request, Response, NextFunction } from 'express';
import { emailService, verifyUnsubscribeToken } from './email.service';
import { AppError } from '../../lib/AppError';

export const emailController = {
  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token?: string };
      if (!token) throw AppError.badRequest('Token tidak valid', 'INVALID_TOKEN');

      const payload = verifyUnsubscribeToken(token);
      if (!payload)
        throw AppError.badRequest('Token tidak valid atau sudah kedaluwarsa', 'INVALID_TOKEN');

      await emailService.processUnsubscribe(payload.userId, payload.publicationId);

      res.json({
        success: true,
        data: { message: 'Kamu berhasil berhenti berlangganan notifikasi artikel baru.' },
      });
    } catch (error) {
      next(error);
    }
  },
};

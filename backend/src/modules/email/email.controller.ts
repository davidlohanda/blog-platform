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

  // Resend webhook — handles email bounce events
  async resendWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.body as { type?: string; data?: { email_id?: string; to?: string[] } };
      if (event.type === 'email.bounced') {
        const emailAddress = event.data?.to?.[0];
        if (emailAddress) {
          await emailService.handleEmailBounce(emailAddress);
        }
      }
      // Always return 200 to Resend — never let webhook retries cause issues
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};

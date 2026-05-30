import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { prisma } from '../../config/database.config';
import type { AuthRequest } from '../../middleware/auth.middleware';
import type { UpdateProfileInput, UpdatePasswordInput } from './users.schema';

export const usersController = {
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const input = req.body as UpdateProfileInput;
      const user = await usersService.updateProfile(userId, input);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const input = req.body as UpdatePasswordInput;
      const result = await usersService.updatePassword(userId, input);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getEmailPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      // Return active subscriptions with their email preferences
      const subscriptions = await prisma.subscription.findMany({
        where: { userId, status: 'active', expiresAt: { gt: new Date() } },
        include: {
          publication: { select: { id: true, name: true, slug: true, logoUrl: true } },
        },
        orderBy: { expiresAt: 'desc' },
        distinct: ['publicationId'],
      });

      const prefRecords = await prisma.emailPreference.findMany({
        where: {
          userId,
          publicationId: { in: subscriptions.map((s) => s.publicationId) },
        },
      });

      const prefMap = new Map(prefRecords.map((p) => [p.publicationId, p.newArticle]));

      const result = subscriptions.map((sub) => ({
        publicationId: sub.publicationId,
        publicationName: sub.publication.name,
        publicationSlug: sub.publication.slug,
        logoUrl: sub.publication.logoUrl,
        newArticle: prefMap.get(sub.publicationId) ?? true, // default true
      }));

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateEmailPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const { publicationId } = req.params;
      const { newArticle } = req.body as { newArticle: boolean };

      await prisma.emailPreference.upsert({
        where: { userId_publicationId: { userId, publicationId } },
        update: { newArticle },
        create: { userId, publicationId, newArticle },
      });

      res.json({ success: true, data: { newArticle } });
    } catch (error) {
      next(error);
    }
  },
};

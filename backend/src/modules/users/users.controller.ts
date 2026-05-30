import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import type { AuthRequest } from '../../middleware/auth.middleware';
import type {
  UpdateProfileInput,
  UpdatePasswordInput,
  EmailPreferenceUpdateInput,
} from './users.schema';

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
      const result = await usersService.getEmailPreferences(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateEmailPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const { publicationId } = req.params;
      const { newArticle } = req.body as EmailPreferenceUpdateInput;
      const result = await usersService.updateEmailPreference(userId, publicationId, newArticle);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

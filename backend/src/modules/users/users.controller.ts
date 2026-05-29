import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
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
};

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError';
import { authRepository } from '../modules/auth/auth.repository';
import type { AuthRequest } from './auth.middleware';

export async function adminGuard(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) return next(AppError.unauthorized());

    const user = await authRepository.findById(userId);
    if (!user || user.role !== 'platform_admin') {
      return next(AppError.forbidden('Akses ditolak — hanya platform admin'));
    }

    next();
  } catch (error) {
    next(error);
  }
}

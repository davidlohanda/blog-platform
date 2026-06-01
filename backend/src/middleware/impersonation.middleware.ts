import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError';
import type { AuthRequest } from './auth.middleware';

// Blocks sensitive operations (delete, payment) when in impersonation mode
export function blockImpersonation(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user;
  if (user?.isImpersonation) {
    next(
      AppError.forbidden(
        'Operasi ini tidak diizinkan dalam mode impersonasi',
        'IMPERSONATION_BLOCKED',
      ),
    );
    return;
  }
  next();
}

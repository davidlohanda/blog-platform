import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { AppError } from '../lib/AppError';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(AppError.unauthorized());
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    (req as AuthRequest).user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    next(AppError.unauthorized('Token tidak valid atau sudah kedaluwarsa'));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    (req as AuthRequest).user = { userId: payload.userId, email: payload.email };
  } catch {
    // Not authenticated — continue without user
  }
  next();
}

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../lib/jwt';
import { AppError } from '../lib/AppError';
import { authRepository } from '../modules/auth/auth.repository';
import { redis } from '../config/redis.config';

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

// Checks Authorization header (access token) OR refreshToken cookie (read-only, no rotation).
// Used by server-rendered Next.js requests that forward the refresh cookie.
export async function optionalAuthenticateAny(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  // 1. Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(authHeader.slice(7));
      (req as AuthRequest).user = { userId: payload.userId, email: payload.email };
      return next();
    } catch {
      // Invalid — fall through to cookie check
    }
  }

  // 2. Try refreshToken cookie (read-only — does NOT rotate the token)
  const cookieHeader = req.headers.cookie ?? '';
  const match = /(?:^|;\s*)refreshToken=([^;]+)/.exec(cookieHeader);
  const rawCookie = match?.[1];
  if (rawCookie) {
    try {
      const payload = verifyRefreshToken(rawCookie);
      const exists = await redis.exists(`refresh:${payload.userId}:${payload.tokenId}`);
      if (exists) {
        const user = await authRepository.findById(payload.userId);
        if (user) {
          (req as AuthRequest).user = { userId: user.id, email: user.email };
        }
      }
    } catch {
      // Invalid refresh token — continue unauthenticated
    }
  }

  next();
}

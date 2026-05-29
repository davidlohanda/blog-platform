import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../modules/subscription/subscription.service';
import { AppError } from '../lib/AppError';
import type { AuthRequest } from './auth.middleware';

export interface MemberRequest extends AuthRequest {
  isMember: boolean;
}

// Attaches req.isMember; does NOT block (use requireMember for blocking)
export async function attachMembership(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const publicationId = req.params.pubId ?? (req.query.publicationId as string);
    if (!userId || !publicationId) {
      (req as MemberRequest).isMember = false;
      return next();
    }
    (req as MemberRequest).isMember = await subscriptionService.isActiveMember(
      userId,
      publicationId,
    );
    next();
  } catch (error) {
    next(error);
  }
}

// Blocks non-members
export async function requireMember(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) return next(AppError.unauthorized());

    const publicationId = req.params.pubId ?? (req.query.publicationId as string);
    if (!publicationId) return next(AppError.badRequest('Publication ID wajib ada'));

    const isMember = await subscriptionService.isActiveMember(userId, publicationId);
    if (!isMember) {
      return next(AppError.forbidden('Konten ini khusus untuk member', 'MEMBERS_ONLY'));
    }
    (req as MemberRequest).isMember = true;
    next();
  } catch (error) {
    next(error);
  }
}

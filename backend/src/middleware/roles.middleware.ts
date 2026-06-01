import { Request, Response, NextFunction } from 'express';
import { publicationRepository } from '../modules/publication/publication.repository';
import { AppError } from '../lib/AppError';
import type { AuthRequest } from './auth.middleware';

export type PublicationRole = 'owner' | 'admin' | 'author';

export interface PublicationRoleRequest extends AuthRequest {
  publicationId: string;
  userRole: PublicationRole;
}

export function requirePublicationRole(...allowedRoles: PublicationRole[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return next(AppError.unauthorized());

      const publicationId = req.params.pubId ?? req.params.publicationId ?? req.params.id;
      if (!publicationId) return next(AppError.badRequest('Publication ID wajib ada'));

      const membership = await publicationRepository.findAuthor(publicationId, userId);
      if (!membership) {
        return next(AppError.forbidden('Kamu bukan anggota publication ini'));
      }

      const role = membership.role as PublicationRole;
      if (!allowedRoles.includes(role)) {
        return next(AppError.forbidden('Akses ditolak — role tidak mencukupi'));
      }

      const roleReq = req as PublicationRoleRequest;
      roleReq.publicationId = publicationId;
      roleReq.userRole = role;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Helper shortcuts matching the permission matrix
export const requireOwner = requirePublicationRole('owner');
export const requireOwnerOrAdmin = requirePublicationRole('owner', 'admin');
export const requireAnyRole = requirePublicationRole('owner', 'admin', 'author');

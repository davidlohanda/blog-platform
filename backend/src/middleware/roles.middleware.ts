import { Request, Response, NextFunction } from 'express';
import { publicationRepository } from '../modules/publication/publication.repository';
import { AppError } from '../lib/AppError';
import type { AuthRequest } from './auth.middleware';

export interface PublicationRoleRequest extends AuthRequest {
  publicationId: string;
  userRole: 'owner' | 'author';
}

export function requirePublicationRole(...allowedRoles: Array<'owner' | 'author'>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return next(AppError.unauthorized());

      // pubId first (nested article/series routes where :id is the resource ID, not publication)
      // then publicationId or id for top-level publication routes
      const publicationId = req.params.pubId ?? req.params.publicationId ?? req.params.id;
      if (!publicationId) return next(AppError.badRequest('Publication ID wajib ada'));

      const membership = await publicationRepository.findAuthor(publicationId, userId);
      if (!membership) {
        return next(AppError.forbidden('Kamu bukan anggota publication ini'));
      }

      if (!allowedRoles.includes(membership.role as 'owner' | 'author')) {
        return next(AppError.forbidden('Akses ditolak — role tidak mencukupi'));
      }

      const roleReq = req as PublicationRoleRequest;
      roleReq.publicationId = publicationId;
      roleReq.userRole = membership.role as 'owner' | 'author';
      next();
    } catch (error) {
      next(error);
    }
  };
}

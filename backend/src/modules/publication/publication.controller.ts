import { Request, Response, NextFunction } from 'express';
import { publicationService } from './publication.service';
import type { AuthRequest } from '../../middleware/auth.middleware';
import type { PublicationRoleRequest } from '../../middleware/roles.middleware';
import type {
  CreatePublicationInput,
  UpdatePublicationInput,
  SetCustomDomainInput,
} from './publication.schema';

export const publicationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const pub = await publicationService.create(userId, req.body as CreatePublicationInput);
      res.status(201).json({ success: true, data: pub });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const pub = await publicationService.getBySlug(req.params.slug);
      res.json({ success: true, data: pub });
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const pubs = await publicationService.getForUser(userId);
      res.json({ success: true, data: pubs });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const pub = await publicationService.update(
        publicationId,
        req.body as UpdatePublicationInput,
      );
      res.json({ success: true, data: pub });
    } catch (error) {
      next(error);
    }
  },

  async setCustomDomain(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const pub = await publicationService.setCustomDomain(
        publicationId,
        req.body as SetCustomDomainInput,
      );
      res.json({ success: true, data: pub });
    } catch (error) {
      next(error);
    }
  },

  async listAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const authors = await publicationService.listAuthors(publicationId);
      res.json({ success: true, data: authors });
    } catch (error) {
      next(error);
    }
  },

  async inviteAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const { email, role } = req.body as { email: string; role: 'owner' | 'author' };

      // TODO STORY 7.1: send invite email via Resend
      // For now, log the invite so development is unblocked
      const token = (await import('crypto')).randomUUID();
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      console.log(
        `[Publication] Invite URL for ${email}: ${frontendUrl}/accept-invite?token=${token}&pub=${publicationId}&role=${role}`,
      );

      res.status(202).json({
        success: true,
        data: { message: `Undangan akan dikirim ke ${email} (email setup pending STORY 7.1)` },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateAuthorRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const { userId } = req.params;
      const { role } = req.body as { role: 'owner' | 'author' };
      const updated = await publicationService.updateAuthorRole(publicationId, userId, role);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async removeAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const requestingUserId = (req as AuthRequest).user.userId;
      const { userId } = req.params;
      const result = await publicationService.removeAuthor(publicationId, requestingUserId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

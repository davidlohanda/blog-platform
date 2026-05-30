import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { publicationService } from './publication.service';
import { emailService } from '../email/email.service';
import { redis } from '../../config/redis.config';
import { config } from '../../config';
import { authRepository } from '../auth/auth.repository';
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
      const inviterId = (req as AuthRequest).user.userId;
      const { email, role } = req.body as { email: string; role: 'owner' | 'author' };

      const [pub, inviter] = await Promise.all([
        publicationService.getById(publicationId),
        authRepository.findById(inviterId),
      ]);

      const token = randomUUID();
      // Store invite payload in Redis for 7 days
      await redis.setex(
        `invite:${token}`,
        7 * 24 * 60 * 60,
        JSON.stringify({ email, publicationId, role }),
      );

      const frontendUrl = config.platform.frontendUrl;
      const inviteUrl = `${frontendUrl}/accept-invite?token=${token}`;

      await emailService.sendAuthorInvite({
        to: email,
        publicationName: pub.name,
        invitedBy: inviter?.name ?? 'Admin',
        role,
        inviteUrl,
      });

      res.status(202).json({
        success: true,
        data: { message: `Undangan berhasil dikirim ke ${email}` },
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

  // Public: list authors with bio for the publication homepage (no email)
  async listPublicAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authors = await publicationService.listAuthors(id);
      const safe = authors.map((a) => ({
        id: a.userId,
        role: a.role,
        joinedAt: a.joinedAt,
        name: a.user.name,
        avatarUrl: a.user.avatarUrl,
        bio: a.user.bio,
      }));
      res.json({ success: true, data: safe });
    } catch (error) {
      next(error);
    }
  },
};

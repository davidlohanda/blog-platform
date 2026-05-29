import { Request, Response, NextFunction } from 'express';
import { articleService } from './article.service';
import type { AuthRequest } from '../../middleware/auth.middleware';
import type { MemberRequest } from '../../middleware/member.middleware';
import type {
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArticleFilters,
} from './article.schema';
import type { PublicArticleFilters } from './article.repository';

export const articleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId } = req.params;
      const authorId = (req as AuthRequest).user.userId;
      const article = await articleService.create(pubId, authorId, req.body as CreateArticleInput);
      res.status(201).json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId } = req.params;
      const result = await articleService.list(pubId, req.query as unknown as ArticleFilters);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, slug } = req.params;
      const article = await articleService.getBySlug(pubId, slug);
      res.json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  },

  // Public reader endpoint — gates premium content based on membership
  async getPublicBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, slug } = req.params;
      const isMember = (req as MemberRequest).isMember ?? false;
      const article = await articleService.getPublicBySlug(pubId, slug, { isMember });
      res.json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  },

  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId } = req.params;
      const { authorId, tag, cursor, limit } = req.query as Record<string, string | undefined>;
      const filters: PublicArticleFilters = {
        authorId,
        tag,
        cursor,
        limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      };
      const result = await articleService.listPublic(pubId, filters);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async view(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      await articleService.incrementView(pubId, id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const userId = (req as AuthRequest).user.userId;
      const result = await articleService.toggleLike(pubId, id, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getLikeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const userId = (req as AuthRequest).user.userId;
      const result = await articleService.getLikeStatus(pubId, id, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const article = await articleService.update(pubId, id, req.body as UpdateArticleInput);
      res.json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const article = await articleService.publish(pubId, id, req.body as PublishArticleInput);
      res.json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  },

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      await articleService.softDelete(pubId, id);
      res.json({ success: true, data: { message: 'Artikel berhasil dihapus' } });
    } catch (error) {
      next(error);
    }
  },
};

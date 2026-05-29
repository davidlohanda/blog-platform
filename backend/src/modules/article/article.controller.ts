import { Request, Response, NextFunction } from 'express';
import { articleService } from './article.service';
import type { AuthRequest } from '../../middleware/auth.middleware';
import type {
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArticleFilters,
} from './article.schema';

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

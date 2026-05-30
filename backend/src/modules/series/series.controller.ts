import { Request, Response, NextFunction } from 'express';
import { seriesService } from './series.service';
import type { AuthRequest } from '../../middleware/auth.middleware';
import type {
  CreateSeriesInput,
  UpdateSeriesInput,
  AddArticleToSeriesInput,
} from './series.schema';

export const seriesController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId } = req.params;
      const authorId = (req as AuthRequest).user.userId;
      const series = await seriesService.create(pubId, authorId, req.body as CreateSeriesInput);
      res.status(201).json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const series = await seriesService.list(req.params.pubId);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const series = await seriesService.getById(pubId, id);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, slug } = req.params;
      const series = await seriesService.getBySlug(pubId, slug);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const series = await seriesService.update(pubId, id, req.body as UpdateSeriesInput);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  },

  async addArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const result = await seriesService.addArticle(pubId, id, req.body as AddArticleToSeriesInput);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async removeArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id, articleId } = req.params;
      const result = await seriesService.removeArticle(pubId, id, articleId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async reorderArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId, id } = req.params;
      const { orderedArticleIds } = req.body as { orderedArticleIds: string[] };
      const result = await seriesService.reorderArticles(pubId, id, orderedArticleIds);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

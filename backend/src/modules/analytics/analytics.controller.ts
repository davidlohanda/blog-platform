import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import type { PublicationRoleRequest } from '../../middleware/roles.middleware';

export const analyticsController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const data = await analyticsService.getOverview(publicationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSubscriberChart(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const range = (req.query.range as '30d' | '6m' | '12m') ?? '30d';
      const validRanges = ['30d', '6m', '12m'];
      const safeRange = validRanges.includes(range) ? range : '30d';
      const data = await analyticsService.getSubscriberChart(publicationId, safeRange);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listSubscribers(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const { status, planId, search, cursor, limit = '20' } = req.query as Record<string, string>;
      const take = Math.min(parseInt(limit, 10) || 20, 100);
      const result = await analyticsService.listSubscribers(publicationId, {
        status,
        planId,
        search,
        cursor,
        take,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async exportSubscribersCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;
      const csv = await analyticsService.exportSubscribersCSV(publicationId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
      res.send('﻿' + csv); // BOM for Excel compatibility
    } catch (error) {
      next(error);
    }
  },
};

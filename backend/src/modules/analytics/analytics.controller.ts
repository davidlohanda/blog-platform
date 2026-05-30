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

      const subs = await import('../../config/database.config').then(({ prisma }) =>
        prisma.subscription.findMany({
          where: {
            publicationId,
            ...(status ? { status: status as 'active' | 'expired' | 'cancelled' | 'pending' } : {}),
            ...(planId ? { planId } : {}),
            ...(search
              ? {
                  user: {
                    OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      { email: { contains: search, mode: 'insensitive' } },
                    ],
                  },
                }
              : {}),
            ...(cursor ? { id: { lt: cursor } } : {}),
          },
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            plan: { select: { durationMonths: true, price: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: take + 1,
        }),
      );

      const hasMore = subs.length > take;
      const data = hasMore ? subs.slice(0, take) : subs;
      const nextCursor = hasMore ? data[data.length - 1]?.id : null;

      res.json({ success: true, data, nextCursor, hasMore });
    } catch (error) {
      next(error);
    }
  },

  async exportSubscribersCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId } = req as PublicationRoleRequest;

      const subs = await import('../../config/database.config').then(({ prisma }) =>
        prisma.subscription.findMany({
          where: { publicationId },
          include: {
            user: { select: { name: true, email: true } },
            plan: { select: { durationMonths: true, price: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      );

      const rows = [
        ['Nama', 'Email', 'Status', 'Paket (Bulan)', 'Harga/Bulan', 'Mulai', 'Berakhir'],
        ...subs.map((s) => [
          s.user.name,
          s.user.email,
          s.status,
          String(s.plan.durationMonths),
          String(s.plan.price),
          s.startedAt?.toISOString().slice(0, 10) ?? '-',
          s.expiresAt?.toISOString().slice(0, 10) ?? '-',
        ]),
      ];

      const csv = rows
        .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
      res.send('﻿' + csv); // BOM for Excel compatibility
    } catch (error) {
      next(error);
    }
  },
};

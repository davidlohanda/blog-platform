import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from './subscription.service';
import type { AuthRequest } from '../../middleware/auth.middleware';
import type { UpdatePlansInput, CreateOrderInput } from './subscription.schema';

export const subscriptionController = {
  async listPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId } = req.params;
      // Public endpoint returns only active plans
      const plans = await subscriptionService.listPlans(pubId, true);
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  },

  async updatePlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId } = req.params;
      const plans = await subscriptionService.updatePlans(pubId, req.body as UpdatePlansInput);
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  },

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { pubId } = req.params;
      const userId = (req as AuthRequest).user.userId;
      const { planId, next: nextUrl } = req.body as CreateOrderInput;
      const result = await subscriptionService.createOrder(pubId, userId, planId, nextUrl);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.handleWebhook(
        req.body as Parameters<typeof subscriptionService.handleWebhook>[0],
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const publicationId = req.query.publicationId as string;
      const sub = await subscriptionService.getMine(userId, publicationId);
      res.json({ success: true, data: sub });
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const history = await subscriptionService.getHistory(userId);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.userId;
      const result = await subscriptionService.cancel(userId, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

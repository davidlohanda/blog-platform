import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireOwnerOrAdmin } from '../../middleware/roles.middleware';

const router = Router({ mergeParams: true });

// Analytics visible to owner + admin only (not author)
router.use(authenticate, requireOwnerOrAdmin);

router.get('/overview', (req, res, next) => analyticsController.getOverview(req, res, next));
router.get('/subscribers-chart', (req, res, next) =>
  analyticsController.getSubscriberChart(req, res, next),
);
router.get('/subscribers', (req, res, next) => analyticsController.listSubscribers(req, res, next));
router.get('/subscribers/export', (req, res, next) =>
  analyticsController.exportSubscribersCSV(req, res, next),
);

export { router as analyticsRouter };

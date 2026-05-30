import { Router } from 'express';
import { subscriptionController } from './subscription.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePublicationRole } from '../../middleware/roles.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updatePlansSchema, createOrderSchema, webhookPayloadSchema } from './subscription.schema';

// ─── Nested under /publications/:pubId ───────────────────────────
// mergeParams so :pubId is available
const nestedRouter = Router({ mergeParams: true });

// Plans — public list
nestedRouter.get('/subscription-plans', (req, res, next) =>
  subscriptionController.listPlans(req, res, next),
);

// Plans — owner replaces all plans
nestedRouter.put(
  '/subscription-plans',
  authenticate,
  requirePublicationRole('owner'),
  validate(updatePlansSchema),
  (req, res, next) => subscriptionController.updatePlans(req, res, next),
);

// Create order — authenticated reader
nestedRouter.post(
  '/subscriptions/order',
  authenticate,
  validate(createOrderSchema),
  (req, res, next) => subscriptionController.createOrder(req, res, next),
);

// ─── Top-level /subscriptions ────────────────────────────────────
const topRouter = Router();

// Webhook — no auth (verified by signature), Midtrans posts here
topRouter.post('/webhook/midtrans', validate(webhookPayloadSchema), (req, res, next) =>
  subscriptionController.webhook(req, res, next),
);

topRouter.get('/me', authenticate, (req, res, next) =>
  subscriptionController.getMine(req, res, next),
);

topRouter.get('/me/history', authenticate, (req, res, next) =>
  subscriptionController.getHistory(req, res, next),
);

topRouter.delete('/:id', authenticate, (req, res, next) =>
  subscriptionController.cancel(req, res, next),
);

export { nestedRouter as subscriptionNestedRouter, topRouter as subscriptionRouter };

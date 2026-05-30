import { Router } from 'express';
import { publicationController } from './publication.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePublicationRole } from '../../middleware/roles.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createPublicationSchema,
  updatePublicationSchema,
  setCustomDomainSchema,
} from './publication.schema';
import { z } from 'zod';
import { articleRouter } from '../article/article.router';
import { seriesRouter } from '../series/series.router';
import { subscriptionNestedRouter } from '../subscription/subscription.router';
import { analyticsRouter } from '../analytics/analytics.router';

const router = Router();

// Create new publication
router.post('/', authenticate, validate(createPublicationSchema), (req, res, next) =>
  publicationController.create(req, res, next),
);

// Get user's own publications
router.get('/mine', authenticate, (req, res, next) =>
  publicationController.getMine(req, res, next),
);

// Get publication by slug (public)
router.get('/:slug', (req, res, next) => publicationController.getBySlug(req, res, next));

// Update publication settings (owner only)
router.patch(
  '/:id',
  authenticate,
  requirePublicationRole('owner'),
  validate(updatePublicationSchema),
  (req, res, next) => publicationController.update(req, res, next),
);

// Set custom domain (owner only)
router.post(
  '/:id/custom-domain',
  authenticate,
  requirePublicationRole('owner'),
  validate(setCustomDomainSchema),
  (req, res, next) => publicationController.setCustomDomain(req, res, next),
);

// Authors — public list for reader homepage (no email)
router.get('/:id/authors/public', (req, res, next) =>
  publicationController.listPublicAuthors(req, res, next),
);

// Authors — list (owner/author, includes email for management)
router.get(
  '/:id/authors',
  authenticate,
  requirePublicationRole('owner', 'author'),
  (req, res, next) => publicationController.listAuthors(req, res, next),
);

// Authors — invite (owner only)
const inviteSchema = z.object({
  email: z.email('Format email tidak valid'),
  role: z.enum(['owner', 'author']),
});
router.post(
  '/:id/authors/invite',
  authenticate,
  requirePublicationRole('owner'),
  validate(inviteSchema),
  (req, res, next) => publicationController.inviteAuthor(req, res, next),
);

// Authors — update role (owner only)
router.patch(
  '/:id/authors/:userId',
  authenticate,
  requirePublicationRole('owner'),
  validate(z.object({ role: z.enum(['owner', 'author']) })),
  (req, res, next) => publicationController.updateAuthorRole(req, res, next),
);

// Authors — remove (owner only)
router.delete(
  '/:id/authors/:userId',
  authenticate,
  requirePublicationRole('owner'),
  (req, res, next) => publicationController.removeAuthor(req, res, next),
);

// Mount article and series sub-routers with mergeParams
router.use('/:pubId/articles', articleRouter);
router.use('/:pubId/series', seriesRouter);
// Subscription plans + order (mergeParams gives :pubId)
router.use('/:pubId', subscriptionNestedRouter);
// Analytics (mergeParams gives :pubId)
router.use('/:pubId/analytics', analyticsRouter);

export { router as publicationRouter };

import { Router } from 'express';
import { publicationController } from './publication.controller';
import { authenticate } from '../../middleware/auth.middleware';
import {
  requireOwner,
  requireOwnerOrAdmin,
  requireAnyRole,
} from '../../middleware/roles.middleware';
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

// Check slug availability (public, must come before /:slug)
router.get('/check-slug', (req, res, next) => publicationController.checkSlug(req, res, next));

// Get publication by slug (public)
router.get('/:slug', (req, res, next) => publicationController.getBySlug(req, res, next));

// Update publication settings (owner + admin)
router.patch(
  '/:id',
  authenticate,
  requireOwnerOrAdmin,
  validate(updatePublicationSchema),
  (req, res, next) => publicationController.update(req, res, next),
);

// Set custom domain (owner only)
router.post(
  '/:id/custom-domain',
  authenticate,
  requireOwner,
  validate(setCustomDomainSchema),
  (req, res, next) => publicationController.setCustomDomain(req, res, next),
);

// Onboarding status (any publication role)
router.get('/:id/onboarding-status', authenticate, requireAnyRole, (req, res, next) =>
  publicationController.getOnboardingStatus(req, res, next),
);

// Authors — public list for reader homepage (no email)
router.get('/:id/authors/public', (req, res, next) =>
  publicationController.listPublicAuthors(req, res, next),
);

// Authors — list (any publication role, includes email for management)
router.get('/:id/authors', authenticate, requireAnyRole, (req, res, next) =>
  publicationController.listAuthors(req, res, next),
);

// Authors — invite (owner + admin)
// Note: owner cannot be invited — only admin and author roles can be assigned via invite
const inviteSchema = z.object({
  email: z.email('Format email tidak valid'),
  role: z.enum(['admin', 'author']),
});
router.post(
  '/:id/authors/invite',
  authenticate,
  requireOwnerOrAdmin,
  validate(inviteSchema),
  (req, res, next) => publicationController.inviteAuthor(req, res, next),
);

// Authors — update role (owner only — per permission matrix: only owner can change roles)
router.patch(
  '/:id/authors/:userId',
  authenticate,
  requireOwner,
  validate(z.object({ role: z.enum(['admin', 'author']) })),
  (req, res, next) => publicationController.updateAuthorRole(req, res, next),
);

// Authors — remove (owner + admin)
router.delete('/:id/authors/:userId', authenticate, requireOwnerOrAdmin, (req, res, next) =>
  publicationController.removeAuthor(req, res, next),
);

// Mount article and series sub-routers with mergeParams
router.use('/:pubId/articles', articleRouter);
router.use('/:pubId/series', seriesRouter);
// Subscription plans + order (mergeParams gives :pubId)
router.use('/:pubId', subscriptionNestedRouter);
// Analytics (mergeParams gives :pubId)
router.use('/:pubId/analytics', analyticsRouter);

export { router as publicationRouter };

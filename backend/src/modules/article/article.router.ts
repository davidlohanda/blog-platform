import { Router } from 'express';
import { articleController } from './article.controller';
import { authenticate, optionalAuthenticateAny } from '../../middleware/auth.middleware';
import { requirePublicationRole } from '../../middleware/roles.middleware';
import { attachMembership } from '../../middleware/member.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createArticleSchema,
  updateArticleSchema,
  publishArticleSchema,
  articleFiltersSchema,
} from './article.schema';

// mergeParams: true gives access to :pubId from parent publication router
const router = Router({ mergeParams: true });

// Public list (published only, no content)
router.get('/public', (req, res, next) => articleController.listPublic(req, res, next));

router.get('/', validate(articleFiltersSchema, 'query'), (req, res, next) =>
  articleController.list(req, res, next),
);

router.post(
  '/',
  authenticate,
  requirePublicationRole('owner', 'author'),
  validate(createArticleSchema),
  (req, res, next) => articleController.create(req, res, next),
);

// Public reader: optional auth (cookie or bearer), attaches membership status
router.get('/read/:slug', optionalAuthenticateAny, attachMembership, (req, res, next) =>
  articleController.getPublicBySlug(req, res, next),
);

router.get('/:slug', (req, res, next) => articleController.getBySlug(req, res, next));

router.patch(
  '/:id',
  authenticate,
  requirePublicationRole('owner', 'author'),
  validate(updateArticleSchema),
  (req, res, next) => articleController.update(req, res, next),
);

router.post(
  '/:id/publish',
  authenticate,
  requirePublicationRole('owner', 'author'),
  validate(publishArticleSchema),
  (req, res, next) => articleController.publish(req, res, next),
);

router.delete('/:id', authenticate, requirePublicationRole('owner', 'author'), (req, res, next) =>
  articleController.softDelete(req, res, next),
);

// View count (public, fire-and-forget)
router.post('/:id/view', (req, res, next) => articleController.view(req, res, next));

// Read progress (authenticated members)
router.patch('/:id/read-progress', authenticate, (req, res, next) =>
  articleController.updateReadProgress(req, res, next),
);

// Like toggle (authenticated)
router.post('/:id/like', authenticate, (req, res, next) =>
  articleController.toggleLike(req, res, next),
);
router.get('/:id/like', authenticate, (req, res, next) =>
  articleController.getLikeStatus(req, res, next),
);

export { router as articleRouter };

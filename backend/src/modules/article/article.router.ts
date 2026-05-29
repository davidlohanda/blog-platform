import { Router } from 'express';
import { articleController } from './article.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePublicationRole } from '../../middleware/roles.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createArticleSchema,
  updateArticleSchema,
  publishArticleSchema,
  articleFiltersSchema,
} from './article.schema';

// mergeParams: true gives access to :pubId from parent publication router
const router = Router({ mergeParams: true });

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

export { router as articleRouter };

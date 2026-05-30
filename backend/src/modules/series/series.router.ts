import { Router } from 'express';
import { seriesController } from './series.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePublicationRole } from '../../middleware/roles.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createSeriesSchema, updateSeriesSchema, addArticleToSeriesSchema } from './series.schema';

const router = Router({ mergeParams: true });

router.get('/', (req, res, next) => seriesController.list(req, res, next));

router.post(
  '/',
  authenticate,
  requirePublicationRole('owner', 'author'),
  validate(createSeriesSchema),
  (req, res, next) => seriesController.create(req, res, next),
);

router.get('/:slug', (req, res, next) => seriesController.getBySlug(req, res, next));

router.patch(
  '/:id',
  authenticate,
  requirePublicationRole('owner', 'author'),
  validate(updateSeriesSchema),
  (req, res, next) => seriesController.update(req, res, next),
);

router.post(
  '/:id/articles',
  authenticate,
  requirePublicationRole('owner', 'author'),
  validate(addArticleToSeriesSchema),
  (req, res, next) => seriesController.addArticle(req, res, next),
);

router.delete(
  '/:id/articles/:articleId',
  authenticate,
  requirePublicationRole('owner', 'author'),
  (req, res, next) => seriesController.removeArticle(req, res, next),
);

router.patch(
  '/:id/articles/reorder',
  authenticate,
  requirePublicationRole('owner', 'author'),
  (req, res, next) => seriesController.reorderArticles(req, res, next),
);

// Get series by ID (for dashboard, returns full detail with articles)
router.get('/:id', authenticate, requirePublicationRole('owner', 'author'), (req, res, next) =>
  seriesController.getById(req, res, next),
);

export { router as seriesRouter };

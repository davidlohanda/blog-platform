import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema, updatePasswordSchema } from './users.schema';

const router = Router();

router.patch('/me', authenticate, validate(updateProfileSchema), (req, res, next) =>
  usersController.updateProfile(req, res, next),
);

router.patch('/me/password', authenticate, validate(updatePasswordSchema), (req, res, next) =>
  usersController.updatePassword(req, res, next),
);

router.get('/me/email-preferences', authenticate, (req, res, next) =>
  usersController.getEmailPreferences(req, res, next),
);
router.patch('/me/email-preferences/:publicationId', authenticate, (req, res, next) =>
  usersController.updateEmailPreference(req, res, next),
);

export { router as usersRouter };

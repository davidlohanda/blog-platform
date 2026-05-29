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

export { router as usersRouter };

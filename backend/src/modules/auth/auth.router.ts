import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import { registerSchema, loginSchema, verifyEmailQuerySchema } from './auth.schema';

const router = Router();

router.use(cookieParser());

router.post('/register', validate(registerSchema), authController.register);
router.get('/verify-email', validate(verifyEmailQuerySchema, 'query'), authController.verifyEmail);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export { router as authRouter };

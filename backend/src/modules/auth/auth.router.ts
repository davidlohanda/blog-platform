import { Router } from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import { registerSchema, loginSchema, verifyEmailQuerySchema } from './auth.schema';
import { config } from '../../config';

const router = Router();

router.use(cookieParser());

router.post('/register', validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);
router.get('/verify-email', validate(verifyEmailQuerySchema, 'query'), (req, res, next) =>
  authController.verifyEmail(req, res, next),
);
router.post('/login', authRateLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

// Google OAuth — only mount if credentials are configured
if (config.google.clientId && config.google.clientSecret) {
  const oauthFailureUrl = `${config.platform.frontendUrl}/login?error=oauth_failed`;

  router.get(
    '/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] }),
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: oauthFailureUrl }),
    (req, res, next) => authController.googleCallback(req, res, next),
  );
}

export { router as authRouter };

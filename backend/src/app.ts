import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { config } from './config';
import { configurePassport } from './config/passport.config';
import { logger } from './middleware/logger.middleware';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { publicationRouter } from './modules/publication/publication.router';
import { mediaRouter } from './modules/media/media.router';
import { subscriptionRouter } from './modules/subscription/subscription.router';
import { emailRouter } from './modules/email/email.router';
import { adminRouter } from './modules/admin/admin.router';
import { tenantMiddleware } from './middleware/tenant.middleware';

export function createApp() {
  const app = express();

  configurePassport();

  app.use(helmet());

  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());

  app.use(logger);

  app.use(globalRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', env: config.nodeEnv } });
  });

  app.use(tenantMiddleware);

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/publications', publicationRouter);
  app.use('/media', mediaRouter);
  app.use('/subscriptions', subscriptionRouter);
  app.use('/email', emailRouter);
  app.use('/admin', adminRouter);

  app.use(errorHandler);

  return app;
}

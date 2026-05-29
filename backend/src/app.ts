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

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  app.use(errorHandler);

  return app;
}

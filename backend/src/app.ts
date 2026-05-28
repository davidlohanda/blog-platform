import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { logger } from './middleware/logger.middleware';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(logger);

  app.use(globalRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', env: config.nodeEnv } });
  });

  // TODO: mount module routers here as they are implemented

  app.use(errorHandler);

  return app;
}

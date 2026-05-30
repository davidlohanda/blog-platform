import Redis from 'ioredis';
import { config } from './index';
import { log } from '../lib/logger';

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  log.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  log.info('[Redis] Connected');
});

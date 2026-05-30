import { Queue } from 'bullmq';
import { config } from '../../config';
import type { EmailJobData } from './email.types';

const bullConnection = { url: config.redis.url, maxRetriesPerRequest: null as unknown as number };

export const emailQueue = new Queue<EmailJobData>('email', {
  connection: bullConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

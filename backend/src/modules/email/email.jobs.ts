import { Queue, Worker } from 'bullmq';
import { config } from '../../config';
import { emailService } from './email.service';

// BullMQ connection — separate from the ioredis singleton (maxRetriesPerRequest: null required)
const bullConnection = { url: config.redis.url, maxRetriesPerRequest: null as unknown as number };

const systemQueue = new Queue('system-jobs', {
  connection: bullConnection,
  defaultJobOptions: { removeOnComplete: 10, removeOnFail: 50 },
});

export async function scheduleRecurringJobs() {
  await systemQueue.add(
    'subscription-expiry-reminders',
    {},
    {
      repeat: { pattern: '0 8 * * *' }, // 08:00 daily
      jobId: 'subscription-expiry-reminders',
    },
  );
  console.log('[Jobs] Recurring jobs scheduled');
}

export function startSystemWorker() {
  const worker = new Worker(
    'system-jobs',
    async (job) => {
      if (job.name === 'subscription-expiry-reminders') {
        const count = await emailService.sendExpiryReminders();
        console.log(`[Jobs] Sent ${count} expiry reminder(s)`);
      }
    },
    { connection: bullConnection },
  );

  worker.on('failed', (job, err) => {
    console.error(`[Jobs] Job ${job?.name} failed:`, err.message);
  });

  return worker;
}

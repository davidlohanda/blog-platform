import { createApp } from './app';
import { config } from './config';
import { startEmailWorker } from './modules/email/email.worker';
import { startSystemWorker, scheduleRecurringJobs } from './modules/email/email.jobs';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[Server] Running on http://localhost:${config.port} (${config.nodeEnv})`);

  // Start BullMQ workers and recurring jobs
  startEmailWorker();
  startSystemWorker();
  scheduleRecurringJobs().catch((err: Error) =>
    console.error('[Jobs] Failed to schedule recurring jobs:', err.message),
  );
});

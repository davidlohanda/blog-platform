import { createApp } from './app';
import { config } from './config';
import { log } from './lib/logger';
import { startEmailWorker } from './modules/email/email.worker';
import { startSystemWorker, scheduleRecurringJobs } from './modules/email/email.jobs';

const app = createApp();

app.listen(config.port, () => {
  log.info(`[Server] Running on http://localhost:${config.port} (${config.nodeEnv})`);

  // Start BullMQ workers and recurring jobs
  startEmailWorker();
  startSystemWorker();
  scheduleRecurringJobs().catch((err: Error) =>
    log.error('[Jobs] Failed to schedule recurring jobs:', err.message),
  );
});

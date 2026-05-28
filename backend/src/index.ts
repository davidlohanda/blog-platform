import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[Server] Running on http://localhost:${config.port} (${config.nodeEnv})`);
});

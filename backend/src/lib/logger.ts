const isProduction = process.env.NODE_ENV === 'production';

function timestamp() {
  return new Date().toISOString();
}

export const log = {
  info(message: string, ...args: unknown[]) {
    console.log(`[${timestamp()}] INFO: ${message}`, ...args);
  },
  warn(message: string, ...args: unknown[]) {
    console.warn(`[${timestamp()}] WARN: ${message}`, ...args);
  },
  error(message: string, ...args: unknown[]) {
    console.error(`[${timestamp()}] ERROR: ${message}`, ...args);
  },
  debug(message: string, ...args: unknown[]) {
    if (!isProduction) {
      console.log(`[${timestamp()}] DEBUG: ${message}`, ...args);
    }
  },
};

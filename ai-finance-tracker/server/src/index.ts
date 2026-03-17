import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();
const server = createServer(app);

server.listen(parseInt(env.PORT), () => {
  logger.info(`AI Finance Tracker server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

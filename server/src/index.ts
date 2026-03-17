import { createServer } from 'http';
import { createApp } from './app';
import { createSocketServer } from './socket/index';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();
const httpServer = createServer(app);
createSocketServer(httpServer);

httpServer.listen(parseInt(env.PORT), () => {
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

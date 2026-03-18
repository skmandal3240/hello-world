import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.listen(parseInt(env.PORT), () => {
  logger.info(`Smart Recipe Planner server running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`Client URL: ${env.CLIENT_URL}`);
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' })); // 2mb for CSV imports
  app.use('/api', apiLimiter);
  app.use('/api', routes);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use(errorHandler);
  return app;
}

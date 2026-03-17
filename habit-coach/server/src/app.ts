import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use('/api', routes);
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'habit-coach' }));
  app.use(errorHandler);
  return app;
}

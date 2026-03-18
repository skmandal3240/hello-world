import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './lib/logger';
import authRoutes from './routes/auth.routes';
import sessionsRoutes from './routes/sessions.routes';
import statsRoutes from './routes/stats.routes';
import notificationsRoutes from './routes/notifications.routes';

// Validate required env vars
const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ANTHROPIC_API_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3008;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5181';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

app.use('/api/auth', authRoutes);
app.use('/api/sessions', aiLimiter, sessionsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  app: 'ai-health-checker',
  timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => logger.info(`AI Health Checker server on port ${PORT}`));

export default app;

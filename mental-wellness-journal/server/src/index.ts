import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './lib/logger';
import { startScheduler } from './scheduler';
import authRoutes from './routes/auth.routes';
import entriesRoutes from './routes/entries.routes';
import moodRoutes from './routes/mood.routes';
import exercisesRoutes from './routes/exercises.routes';
import notificationsRoutes from './routes/notifications.routes';
import aiRoutes from './routes/ai.routes';
import statsRoutes from './routes/stats.routes';

// Validate required env vars
const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ANTHROPIC_API_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3005;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5178';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'mental-wellness-journal', timestamp: new Date().toISOString() }));

startScheduler();

app.listen(PORT, () => logger.info(`Mental Wellness Journal server on port ${PORT}`));

export default app;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './lib/logger';
import authRoutes from './routes/auth.routes';
import categoriesRoutes from './routes/categories.routes';
import providersRoutes from './routes/providers.routes';
import servicesRoutes from './routes/services.routes';
import jobsRoutes from './routes/jobs.routes';
import reviewsRoutes from './routes/reviews.routes';
import aiRoutes from './routes/ai.routes';
import messagesRoutes from './routes/messages.routes';

// Validate required env vars
const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ANTHROPIC_API_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3004;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5177';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => logger.info(`Local Services Marketplace server running on port ${PORT}`));

export default app;

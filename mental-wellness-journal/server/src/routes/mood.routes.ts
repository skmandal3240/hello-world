import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const days = Math.min(parseInt(String(req.query.days || '30')), 90);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await prisma.moodLog.findMany({
      where: { userId: req.user!.userId, loggedAt: { gte: since } },
      orderBy: { loggedAt: 'asc' },
      select: { id: true, score: true, note: true, loggedAt: true },
    });
    res.json(logs);
  } catch (error) {
    logger.error({ error }, 'Failed to get mood history');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = z.object({
      score: z.number().int().min(1).max(10),
      note: z.string().max(500).optional(),
    }).parse(req.body);

    // Upsert: one mood log per day per user (key by day boundary)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.moodLog.findFirst({
      where: { userId: req.user!.userId, loggedAt: { gte: today } },
    });

    let log;
    if (existing) {
      log = await prisma.moodLog.update({ where: { id: existing.id }, data: { score: body.score, note: body.note } });
    } else {
      log = await prisma.moodLog.create({ data: { ...body, userId: req.user!.userId } });
    }
    res.status(201).json(log);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to log mood');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const logs = await prisma.moodLog.findMany({
      where: { userId: req.user!.userId, loggedAt: { gte: since } },
      orderBy: { loggedAt: 'asc' },
    });

    if (logs.length === 0) return res.json({ avg: null, trend: null, best: null, worst: null, totalDays: 0 });

    const avg = logs.reduce((s, l) => s + l.score, 0) / logs.length;
    const sorted = [...logs].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    // Simple trend: compare first half avg vs second half avg
    const half = Math.floor(logs.length / 2);
    const firstAvg = logs.slice(0, half).reduce((s, l) => s + l.score, 0) / (half || 1);
    const secondAvg = logs.slice(half).reduce((s, l) => s + l.score, 0) / (logs.length - half || 1);
    const trend = secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable';

    res.json({ avg: Math.round(avg * 10) / 10, trend, best, worst, totalDays: logs.length });
  } catch (error) {
    logger.error({ error }, 'Failed to get mood stats');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

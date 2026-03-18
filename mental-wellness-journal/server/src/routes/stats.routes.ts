import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);

    const [streak, totalEntries, moodLogs, exercisesCompleted, recentEntries] = await Promise.all([
      prisma.journalingStreak.findUnique({ where: { userId } }),
      prisma.journalEntry.count({ where: { userId } }),
      prisma.moodLog.findMany({
        where: { userId, loggedAt: { gte: since30 } },
        select: { score: true },
      }),
      prisma.exerciseCompletion.count({ where: { userId } }),
      prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, content: true, moodScore: true, tags: true, createdAt: true },
      }),
    ]);

    const avgMood30d = moodLogs.length
      ? Math.round((moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length) * 10) / 10
      : null;

    res.json({
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      totalEntries,
      avgMood30d,
      exercisesCompleted,
      recentEntries,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get dashboard stats');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

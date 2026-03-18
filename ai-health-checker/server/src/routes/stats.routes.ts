import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [totalSessions, recentSessions, triageCounts] = await Promise.all([
      prisma.symptomSession.count({ where: { userId } }),
      prisma.symptomSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, title: true, triageLevel: true, status: true, createdAt: true,
          _count: { select: { messages: true } },
        },
      }),
      prisma.symptomSession.groupBy({
        by: ['triageLevel'],
        where: { userId, triageLevel: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const triageBreakdown: Record<string, number> = {};
    for (const row of triageCounts) {
      if (row.triageLevel) triageBreakdown[row.triageLevel] = row._count._all;
    }

    res.json({ totalSessions, triageBreakdown, recentSessions });
  } catch (error) {
    logger.error({ error }, 'Failed to get dashboard stats');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

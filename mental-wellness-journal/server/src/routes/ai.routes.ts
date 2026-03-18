import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';
import { generateDailyPrompt, generateWeeklySummary, recommendExercise } from '../services/ai.service';
import { NotificationType } from '@prisma/client';

const router = Router();

router.get('/daily-prompt', authenticateToken, async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check cache
    const cached = await prisma.notification.findFirst({
      where: {
        userId: req.user!.userId,
        type: NotificationType.AI_DAILY_PROMPT,
        createdAt: { gte: today },
      },
    });

    if (cached?.metadata) {
      const meta = cached.metadata as any;
      return res.json({ prompt: meta.prompt });
    }

    const prompt = await generateDailyPrompt();

    // Cache in notification
    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: NotificationType.AI_DAILY_PROMPT,
        title: "Today's Journaling Prompt",
        body: prompt,
        metadata: { prompt },
      },
    });

    res.json({ prompt });
  } catch (error) {
    logger.error({ error }, 'Failed to get daily prompt');
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
});

router.post('/weekly-summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [entries, moodLogs] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId: req.user!.userId, createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
        select: { content: true, moodScore: true, createdAt: true },
      }),
      prisma.moodLog.findMany({
        where: { userId: req.user!.userId, loggedAt: { gte: since } },
        select: { score: true, loggedAt: true },
      }),
    ]);

    if (entries.length < 1) {
      return res.status(400).json({ error: 'Not enough entries for a summary yet' });
    }

    const summary = await generateWeeklySummary(entries, moodLogs);

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: NotificationType.AI_WEEKLY_SUMMARY,
        title: 'Your Weekly Wellness Summary',
        body: summary,
      },
    });

    res.json({ summary });
  } catch (error) {
    logger.error({ error }, 'Failed to generate weekly summary');
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

router.post('/recommend-exercise', authenticateToken, async (req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [moodLogs, entries] = await Promise.all([
      prisma.moodLog.findMany({ where: { userId: req.user!.userId, loggedAt: { gte: since } } }),
      prisma.journalEntry.findMany({
        where: { userId: req.user!.userId, createdAt: { gte: since } },
        select: { tags: true },
      }),
    ]);

    const avgMood = moodLogs.length
      ? moodLogs.reduce((s, l) => s + l.score, 0) / moodLogs.length
      : 5;

    const recentTags = [...new Set(entries.flatMap(e => e.tags))].slice(0, 10);
    const recommendation = await recommendExercise(avgMood, recentTags);

    const exercise = await prisma.cbtExercise.findFirst({ where: { category: recommendation.category as any } });
    res.json({ ...recommendation, exercise });
  } catch (error) {
    logger.error({ error }, 'Failed to recommend exercise');
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
});

export default router;

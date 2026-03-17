import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { getDailyNudge, getWeeklySummary, getReengagementMessage } from '../services/ai.service';

async function batchProcess<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  batchSize = 10,
  delayMs = 500
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(fn));
    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

export function startScheduler() {
  // Daily nudge at 8:00 AM UTC
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running daily nudge job');
    const users = await prisma.user.findMany({
      where: { habits: { some: { isArchived: false } } },
      select: { id: true },
    });
    await batchProcess(users, async ({ id }) => {
      await getDailyNudge(id);
    });
    logger.info({ count: users.length }, 'Daily nudge job complete');
  });

  // Re-engagement check at 9:00 AM UTC
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running re-engagement check');
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const staleHabits = await prisma.habit.findMany({
      where: {
        isArchived: false,
        currentStreak: { gt: 0 },
        checkIns: {
          none: { date: { gte: twoDaysAgo }, completed: true },
        },
      },
      select: { id: true, userId: true },
    });

    await batchProcess(staleHabits, async ({ id, userId }) => {
      await getReengagementMessage(userId, id);
    });
    logger.info({ count: staleHabits.length }, 'Re-engagement job complete');
  });

  // Weekly summary every Sunday at 9:00 AM UTC
  cron.schedule('0 9 * * 0', async () => {
    logger.info('Running weekly summary job');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await prisma.user.findMany({
      where: { habits: { some: { createdAt: { lte: weekAgo }, isArchived: false } } },
      select: { id: true },
    });

    await batchProcess(users, async ({ id }) => {
      await getWeeklySummary(id);
    });
    logger.info({ count: users.length }, 'Weekly summary job complete');
  });

  logger.info('Scheduler started');
}

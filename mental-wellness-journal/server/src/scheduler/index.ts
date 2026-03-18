import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { generateDailyPrompt, generateWeeklySummary } from '../services/ai.service';
import { NotificationType } from '@prisma/client';

async function batchProcess<T>(items: T[], fn: (item: T) => Promise<void>, batchSize = 10, delayMs = 500) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(fn));
    if (i + batchSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function runDailyPrompts() {
  const JOB = 'daily-prompt';
  logger.info(`[${JOB}] Starting`);
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({ select: { id: true } });
    logger.info({ count: users.length }, `[${JOB}] Processing users`);

    await batchProcess(users, async (user) => {
      try {
        const alreadySent = await prisma.notification.findFirst({
          where: { userId: user.id, type: NotificationType.AI_DAILY_PROMPT, createdAt: { gte: today } },
        });
        if (alreadySent) return;

        const prompt = await generateDailyPrompt();
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: NotificationType.AI_DAILY_PROMPT,
            title: "Today's Journaling Prompt ✍️",
            body: prompt,
            metadata: { prompt },
          },
        });
      } catch (err) {
        logger.error({ err, userId: user.id }, `[${JOB}] Failed for user`);
      }
    });

    logger.info(`[${JOB}] Complete`);
  } catch (error) {
    logger.error({ error }, `[${JOB}] Fatal error`);
  }
}

async function runWeeklySummaries() {
  const JOB = 'weekly-summary';
  logger.info(`[${JOB}] Starting`);
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    // Only process users with at least 3 entries in the past 7 days
    const activeUsers = await prisma.journalEntry.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      having: { userId: { _count: { gte: 3 } } },
    });

    logger.info({ count: activeUsers.length }, `[${JOB}] Active users`);

    await batchProcess(activeUsers, async ({ userId }) => {
      try {
        const alreadySent = await prisma.notification.findFirst({
          where: { userId, type: NotificationType.AI_WEEKLY_SUMMARY, createdAt: { gte: weekStart } },
        });
        if (alreadySent) return;

        const [entries, moodLogs] = await Promise.all([
          prisma.journalEntry.findMany({
            where: { userId, createdAt: { gte: since } },
            select: { content: true, moodScore: true, createdAt: true },
          }),
          prisma.moodLog.findMany({
            where: { userId, loggedAt: { gte: since } },
            select: { score: true, loggedAt: true },
          }),
        ]);

        const summary = await generateWeeklySummary(entries, moodLogs);

        await prisma.notification.create({
          data: {
            userId,
            type: NotificationType.AI_WEEKLY_SUMMARY,
            title: 'Your Weekly Wellness Summary 💙',
            body: summary,
          },
        });

        // Streak milestones
        const streak = await prisma.journalingStreak.findUnique({ where: { userId } });
        if (streak && [7, 14, 30, 60, 100].includes(streak.currentStreak)) {
          await prisma.notification.create({
            data: {
              userId,
              type: NotificationType.STREAK_MILESTONE,
              title: `🔥 ${streak.currentStreak}-Day Streak!`,
              body: `Amazing! You've journaled for ${streak.currentStreak} days in a row. Your consistency is building real resilience.`,
            },
          });
        }
      } catch (err) {
        logger.error({ err, userId }, `[${JOB}] Failed for user`);
      }
    });

    logger.info(`[${JOB}] Complete`);
  } catch (error) {
    logger.error({ error }, `[${JOB}] Fatal error`);
  }
}

export function startScheduler() {
  // 8:00 AM UTC — daily journaling prompt
  cron.schedule('0 8 * * *', runDailyPrompts);

  // 9:00 AM UTC Sunday — weekly wellness summary
  cron.schedule('0 9 * * 0', runWeeklySummaries);

  logger.info('Scheduler started: daily-prompt (8am UTC), weekly-summary (Sun 9am UTC)');
}

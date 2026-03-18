import { prisma } from '../lib/prisma';

/**
 * Call after a journal entry is created.
 * Updates the user's JournalingStreak row (upsert).
 * Returns the updated streak.
 */
export async function updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.journalingStreak.findUnique({ where: { userId } });

  if (!existing) {
    const streak = await prisma.journalingStreak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastEntryDate: today },
    });
    return { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak };
  }

  const lastDate = existing.lastEntryDate ? new Date(existing.lastEntryDate) : null;
  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let newStreak: number;
  if (!lastDate) {
    newStreak = 1;
  } else if (lastDate.getTime() === today.getTime()) {
    // Already logged today — no change
    return { currentStreak: existing.currentStreak, longestStreak: existing.longestStreak };
  } else if (lastDate.getTime() === yesterday.getTime()) {
    // Consecutive day
    newStreak = existing.currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, existing.longestStreak);
  const updated = await prisma.journalingStreak.update({
    where: { userId },
    data: { currentStreak: newStreak, longestStreak: newLongest, lastEntryDate: today },
  });

  return { currentStreak: updated.currentStreak, longestStreak: updated.longestStreak };
}

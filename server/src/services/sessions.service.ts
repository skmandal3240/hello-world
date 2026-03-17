import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';

export async function getSessionHistory(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: { in: ['ENDED', 'ABANDONED'] },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        status: true,
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
        createdAt: true,
        targetLanguage: { select: { code: true, name: true, flagEmoji: true } },
        sourceLanguage: { select: { code: true, name: true, flagEmoji: true } },
        userA: { select: { id: true, displayName: true } },
        userB: { select: { id: true, displayName: true } },
        _count: { select: { utterances: true, feedbackEntries: true } },
      },
    }),
    prisma.session.count({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: { in: ['ENDED', 'ABANDONED'] },
      },
    }),
  ]);

  return { sessions, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getSessionById(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      targetLanguage: { select: { code: true, name: true, flagEmoji: true } },
      sourceLanguage: { select: { code: true, name: true, flagEmoji: true } },
      userA: { select: { id: true, displayName: true } },
      userB: { select: { id: true, displayName: true } },
      utterances: { orderBy: { sequenceNumber: 'asc' } },
    },
  });

  if (!session) throw createError('Session not found', 404);
  if (session.userAId !== userId && session.userBId !== userId) {
    throw createError('Forbidden', 403);
  }
  return session;
}

export async function incrementUserSessionStats(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalSessions: true, currentStreak: true, longestStreak: true, lastSessionDate: true },
  });
  if (!user) return;

  const now = new Date();
  const lastDate = user.lastSessionDate;
  let currentStreak = user.currentStreak;

  if (lastDate) {
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  } else {
    currentStreak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalSessions: { increment: 1 },
      currentStreak,
      longestStreak: Math.max(user.longestStreak, currentStreak),
      lastSessionDate: now,
    },
  });
}

import { HabitCategory } from '@prisma/client';
import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';
import { createNotification } from './notifications.service';

function getActivePair(userId: string) {
  return prisma.partnerPair.findFirst({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      status: 'MATCHED',
    },
  });
}

function getPartnerId(pair: { user1Id: string; user2Id: string }, userId: string) {
  return pair.user1Id === userId ? pair.user2Id : pair.user1Id;
}

export async function getStatus(userId: string) {
  const pair = await getActivePair(userId);
  if (pair) {
    const partnerId = getPartnerId(pair, userId);
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { displayName: false, avatarColor: true },
    });
    const partnerHabits = await prisma.habit.findMany({
      where: { userId: partnerId, isArchived: false },
      select: { currentStreak: true, longestStreak: true },
    });
    const topStreak = partnerHabits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
    return {
      status: 'MATCHED',
      pairId: pair.id,
      category: pair.category,
      partner: {
        avatarColor: partner?.avatarColor ?? '#6366f1',
        habitCount: partnerHabits.length,
        topStreak,
      },
    };
  }

  const queue = await prisma.matchingQueue.findUnique({ where: { userId } });
  if (queue) {
    const position = await prisma.matchingQueue.count({
      where: { category: queue.category, joinedAt: { lte: queue.joinedAt } },
    });
    return { status: 'PENDING', category: queue.category, queuePosition: position };
  }

  return { status: 'UNMATCHED' };
}

export async function optIn(userId: string, category: HabitCategory, io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } }) {
  // Check if already matched
  const existing = await getActivePair(userId);
  if (existing) throw createError('Already in an active partnership', 409);

  // Look for someone waiting in same category
  const candidate = await prisma.matchingQueue.findFirst({
    where: { category, userId: { not: userId } },
    orderBy: { joinedAt: 'asc' },
  });

  if (candidate) {
    // Sort IDs lexicographically for @@unique constraint
    const [user1Id, user2Id] = [userId, candidate.userId].sort();
    const pair = await prisma.$transaction(async (tx) => {
      const p = await tx.partnerPair.create({ data: { user1Id, user2Id, category } });
      await tx.matchingQueue.delete({ where: { userId: candidate.userId } });
      return p;
    });

    await Promise.all([
      createNotification(userId, 'PARTNER_MATCHED', 'Accountability Partner Found!',
        `You've been matched with an anonymous partner for ${category} habits.`, { pairId: pair.id }),
      createNotification(candidate.userId, 'PARTNER_MATCHED', 'Accountability Partner Found!',
        `You've been matched with an anonymous partner for ${category} habits.`, { pairId: pair.id }),
    ]);

    if (io) {
      io.to(`user:${candidate.userId}`).emit('partner-matched', { category });
    }

    return { status: 'MATCHED', pairId: pair.id };
  } else {
    await prisma.matchingQueue.upsert({
      where: { userId },
      create: { userId, category },
      update: { category },
    });
    return { status: 'PENDING', category };
  }
}

export async function optOut(userId: string) {
  await prisma.$transaction([
    prisma.matchingQueue.deleteMany({ where: { userId } }),
    prisma.partnerPair.updateMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: 'MATCHED' },
      data: { status: 'UNMATCHED', unmatchedAt: new Date() },
    }),
  ]);
}

export async function getPartnerHabits(userId: string) {
  const pair = await getActivePair(userId);
  if (!pair) throw createError('No active partnership', 404);

  const partnerId = getPartnerId(pair, userId);
  const habits = await prisma.habit.findMany({
    where: { userId: partnerId, isArchived: false },
    orderBy: { createdAt: 'asc' },
  });

  return habits.map((h, i) => ({
    id: Buffer.from(h.id).toString('base64'), // anonymize ID
    anonymousName: `${h.category} Habit #${i + 1}`,
    category: h.category,
    frequency: h.frequency,
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
  }));
}

export async function getMessages(userId: string, page = 1, limit = 50) {
  const pair = await getActivePair(userId);
  if (!pair) throw createError('No active partnership', 404);

  const skip = (page - 1) * limit;
  const messages = await prisma.partnerMessage.findMany({
    where: { pairId: pair.id },
    orderBy: { createdAt: 'asc' },
    skip,
    take: limit,
  });

  // Return messages without exposing sender identity (only whether it's "mine")
  return messages.map((m) => ({
    id: m.id,
    content: m.content,
    isFromMe: m.senderId === userId,
    isRead: m.isRead,
    createdAt: m.createdAt,
  }));
}

export async function sendMessage(
  userId: string,
  content: string,
  io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } }
) {
  const pair = await getActivePair(userId);
  if (!pair) throw createError('No active partnership', 404);

  const message = await prisma.partnerMessage.create({
    data: { pairId: pair.id, senderId: userId, content },
  });

  const partnerId = getPartnerId(pair, userId);
  await createNotification(
    partnerId,
    'PARTNER_ENCOURAGEMENT',
    'New message from your partner',
    content.slice(0, 100),
    { pairId: pair.id }
  );

  if (io) {
    io.to(`user:${partnerId}`).emit('new-message', {
      id: message.id,
      content: message.content,
      isFromMe: false,
      isRead: false,
      createdAt: message.createdAt,
    });
  }

  return { id: message.id, content: message.content, isFromMe: true, isRead: false, createdAt: message.createdAt };
}

export async function markMessagesRead(userId: string) {
  const pair = await getActivePair(userId);
  if (!pair) return;
  const partnerId = getPartnerId(pair, userId);
  await prisma.partnerMessage.updateMany({
    where: { pairId: pair.id, senderId: partnerId, isRead: false },
    data: { isRead: true },
  });
}

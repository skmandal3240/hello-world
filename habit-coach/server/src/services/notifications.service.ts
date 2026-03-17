import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  metadata?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: { userId, type, title, body, metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined },
  });
}

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { notifications, total, page, limit };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markRead(userId: string, notificationId: string) {
  const n = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
  if (!n) return null;
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function deleteNotification(userId: string, notificationId: string) {
  await prisma.notification.deleteMany({ where: { id: notificationId, userId } });
}

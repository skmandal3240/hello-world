import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || '1'));
    const limit = 20;
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json(notifications);
  } catch (error) {
    logger.error({ error }, 'Failed to get notifications');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/unread-count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user!.userId, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    logger.error({ error }, 'Failed to get unread count');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const n = await prisma.notification.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!n) return res.status(404).json({ error: 'Notification not found' });
    const updated = await prisma.notification.update({
      where: { id: String(req.params.id) },
      data: { isRead: true },
    });
    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to mark notification read');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/read-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error({ error }, 'Failed to mark all read');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const n = await prisma.notification.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!n) return res.status(404).json({ error: 'Notification not found' });
    await prisma.notification.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    logger.error({ error }, 'Failed to delete notification');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

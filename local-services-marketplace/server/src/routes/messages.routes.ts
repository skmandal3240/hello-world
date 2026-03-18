import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const SendMessageSchema = z.object({
  jobRequestId: z.string(),
  providerId: z.string(),
  content: z.string().min(1).max(2000),
});

router.get('/:jobRequestId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { jobRequestId: req.params.jobRequestId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    });
    res.json(messages);
  } catch (error) {
    logger.error({ error }, 'Failed to get messages');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = SendMessageSchema.parse(req.body);
    const message = await prisma.message.create({
      data: { ...body, senderId: req.user!.userId },
      include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    });
    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to send message');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

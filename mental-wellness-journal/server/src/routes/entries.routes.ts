import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';
import { updateStreak } from '../services/streak.service';
import { generateEntryReflection } from '../services/ai.service';

const router = Router();

const CreateEntrySchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(10000),
  moodScore: z.number().int().min(1).max(10),
  tags: z.array(z.string()).default([]),
});

const UpdateEntrySchema = CreateEntrySchema.partial();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(String(req.query.limit || '20'));
    const before = req.query.before ? new Date(String(req.query.before)) : undefined;

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: req.user!.userId,
        ...(before ? { createdAt: { lt: before } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50),
      select: { id: true, title: true, content: true, moodScore: true, tags: true, aiReflection: true, createdAt: true, updatedAt: true },
    });
    res.json(entries);
  } catch (error) {
    logger.error({ error }, 'Failed to get entries');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = CreateEntrySchema.parse(req.body);
    const entry = await prisma.journalEntry.create({
      data: { ...body, userId: req.user!.userId },
    });
    // Update streak (non-blocking)
    updateStreak(req.user!.userId).catch(err => logger.error({ err }, 'Streak update failed'));
    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to create entry');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    logger.error({ error }, 'Failed to get entry');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = UpdateEntrySchema.parse(req.body);
    const existing = await prisma.journalEntry.findFirst({ where: { id: String(req.params.id), userId: req.user!.userId } });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    const entry = await prisma.journalEntry.update({ where: { id: String(req.params.id) }, data: body });
    res.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to update entry');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.journalEntry.findFirst({ where: { id: String(req.params.id), userId: req.user!.userId } });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    await prisma.journalEntry.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    logger.error({ error }, 'Failed to delete entry');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/reflect', authenticateToken, async (req: Request, res: Response) => {
  try {
    const entry = await prisma.journalEntry.findFirst({ where: { id: String(req.params.id), userId: req.user!.userId } });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    const reflection = await generateEntryReflection(entry.content, entry.moodScore);
    const updated = await prisma.journalEntry.update({
      where: { id: entry.id },
      data: { aiReflection: reflection, aiReflectionGeneratedAt: new Date() },
    });
    res.json({ aiReflection: updated.aiReflection });
  } catch (error) {
    logger.error({ error }, 'Failed to generate reflection');
    res.status(500).json({ error: 'Failed to generate reflection' });
  }
});

export default router;

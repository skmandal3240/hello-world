import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where = category ? { category: String(category) as any } : {};

    const exercises = await prisma.cbtExercise.findMany({
      where,
      orderBy: { category: 'asc' },
    });
    res.json(exercises);
  } catch (error) {
    logger.error({ error }, 'Failed to get exercises');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const completions = await prisma.exerciseCompletion.findMany({
      where: { userId: req.user!.userId },
      orderBy: { completedAt: 'desc' },
      take: 50,
      include: { exercise: { select: { title: true, category: true } } },
    });
    res.json(completions);
  } catch (error) {
    logger.error({ error }, 'Failed to get exercise history');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const exercise = await prisma.cbtExercise.findUnique({ where: { id: String(req.params.id) } });
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (error) {
    logger.error({ error }, 'Failed to get exercise');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = z.object({ notes: z.string().max(1000).optional() }).parse(req.body);
    const exercise = await prisma.cbtExercise.findUnique({ where: { id: String(req.params.id) } });
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });

    const completion = await prisma.exerciseCompletion.create({
      data: { userId: req.user!.userId, exerciseId: String(req.params.id), notes: body.notes },
      include: { exercise: { select: { title: true, category: true } } },
    });
    res.status(201).json(completion);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to complete exercise');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

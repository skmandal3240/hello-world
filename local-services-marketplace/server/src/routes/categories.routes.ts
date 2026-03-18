import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { services: true } } },
    });
    res.json(categories);
  } catch (error) {
    logger.error({ error }, 'Failed to get categories');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const category = await prisma.serviceCategory.findUnique({
      where: { slug: req.params.slug },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    logger.error({ error }, 'Failed to get category');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken, requireProvider } from '../middleware/auth.middleware';

const router = Router();

const CreateServiceSchema = z.object({
  categoryId: z.string(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  priceType: z.enum(['hourly', 'fixed']).default('hourly'),
});

// List services (optionally filtered)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoryId, providerId } = req.query;
    const where: any = {};
    if (categoryId) where.categoryId = String(categoryId);
    if (providerId) where.providerId = String(providerId);

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        provider: { include: { user: { select: { name: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(services);
  } catch (error) {
    logger.error({ error }, 'Failed to get services');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create service
router.post('/', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const body = CreateServiceSchema.parse(req.body);
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const service = await prisma.service.create({
      data: { ...body, providerId: profile.id },
      include: { category: true },
    });
    res.status(201).json(service);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to create service');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service
router.patch('/:id', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const body = CreateServiceSchema.partial().parse(req.body);
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const service = await prisma.service.findFirst({ where: { id: req.params.id, providerId: profile.id } });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const updated = await prisma.service.update({ where: { id: req.params.id }, data: body });
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to update service');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete service
router.delete('/:id', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const service = await prisma.service.findFirst({ where: { id: req.params.id, providerId: profile.id } });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    logger.error({ error }, 'Failed to delete service');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

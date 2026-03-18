import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken, requireProvider } from '../middleware/auth.middleware';

const router = Router();

const CreateProfileSchema = z.object({
  bio: z.string().min(10).max(1000),
  location: z.string().min(2).max(200),
  zipCode: z.string().min(3).max(10),
  hourlyRate: z.number().positive(),
  yearsExp: z.number().int().min(0).max(50),
});

const UpdateProfileSchema = CreateProfileSchema.partial().extend({
  isAvailable: z.boolean().optional(),
});

// Search/list providers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, zipCode, minRating, page = '1', limit = '12' } = req.query;

    const where: any = {};
    if (zipCode) where.zipCode = String(zipCode);
    if (minRating) where.rating = { gte: parseFloat(String(minRating)) };
    if (category) {
      where.services = { some: { category: { slug: String(category) } } };
    }

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { rating: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          services: { include: { category: true }, take: 3 },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    res.json({ providers, total, page: parseInt(String(page)), limit: parseInt(String(limit)) });
  } catch (error) {
    logger.error({ error }, 'Failed to get providers');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get provider by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, createdAt: true } },
        services: { include: { category: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { author: { select: { name: true, avatarUrl: true } } },
        },
      },
    });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    res.json(provider);
  } catch (error) {
    logger.error({ error }, 'Failed to get provider');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create provider profile
router.post('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = CreateProfileSchema.parse(req.body);
    const existing = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (existing) return res.status(409).json({ error: 'Profile already exists' });

    const profile = await prisma.providerProfile.create({
      data: { ...body, userId: req.user!.userId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to create provider profile');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update provider profile
router.patch('/profile', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const body = UpdateProfileSchema.parse(req.body);
    const profile = await prisma.providerProfile.update({
      where: { userId: req.user!.userId },
      data: body,
    });
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to update provider profile');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my provider profile
router.get('/profile/me', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        services: { include: { category: true } },
        _count: { select: { reviews: true, bookings: true } },
      },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    logger.error({ error }, 'Failed to get my profile');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

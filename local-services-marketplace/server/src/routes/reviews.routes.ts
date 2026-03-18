import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';
import { BookingStatus } from '@prisma/client';

const router = Router();

const CreateReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = CreateReviewSchema.parse(req.body);

    const booking = await prisma.booking.findFirst({
      where: { id: body.bookingId, jobRequest: { customerId: req.user!.userId }, status: BookingStatus.COMPLETED },
    });
    if (!booking) return res.status(404).json({ error: 'Completed booking not found' });

    const existing = await prisma.review.findUnique({ where: { bookingId: body.bookingId } });
    if (existing) return res.status(409).json({ error: 'Already reviewed this booking' });

    const review = await prisma.review.create({
      data: { ...body, authorId: req.user!.userId, providerId: booking.providerId },
    });

    // Update provider rating
    const allReviews = await prisma.review.findMany({ where: { providerId: booking.providerId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.providerProfile.update({
      where: { id: booking.providerId },
      data: { rating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length },
    });

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to create review');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/provider/:providerId', async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { providerId: req.params.providerId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, avatarUrl: true } } },
    });
    res.json(reviews);
  } catch (error) {
    logger.error({ error }, 'Failed to get provider reviews');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

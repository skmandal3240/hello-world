import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken, requireProvider } from '../middleware/auth.middleware';
import { BookingStatus } from '@prisma/client';

const router = Router();

const CreateJobSchema = z.object({
  serviceId: z.string(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  location: z.string().min(2).max(200),
  zipCode: z.string().min(3).max(10),
  budget: z.number().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
});

const AcceptJobSchema = z.object({
  agreedPrice: z.number().positive(),
});

// Customer: create job request
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = CreateJobSchema.parse(req.body);
    const job = await prisma.jobRequest.create({
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        customerId: req.user!.userId,
      },
      include: { service: { include: { category: true, provider: { include: { user: { select: { name: true } } } } } } },
    });
    res.status(201).json(job);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to create job');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer: list my job requests
router.get('/my', authenticateToken, async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.jobRequest.findMany({
      where: { customerId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        service: { include: { category: true } },
        booking: { include: { provider: { include: { user: { select: { name: true, avatarUrl: true } } } } } },
      },
    });
    res.json(jobs);
  } catch (error) {
    logger.error({ error }, 'Failed to get my jobs');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provider: list incoming job requests for my services
router.get('/incoming', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const jobs = await prisma.jobRequest.findMany({
      where: {
        service: { providerId: profile.id },
        status: BookingStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        service: { include: { category: true } },
        customer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    res.json(jobs);
  } catch (error) {
    logger.error({ error }, 'Failed to get incoming jobs');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provider: accept job request
router.post('/:id/accept', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const body = AcceptJobSchema.parse(req.body);
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const job = await prisma.jobRequest.findFirst({
      where: { id: req.params.id, service: { providerId: profile.id }, status: BookingStatus.PENDING },
    });
    if (!job) return res.status(404).json({ error: 'Job request not found' });

    const [updatedJob, booking] = await prisma.$transaction([
      prisma.jobRequest.update({ where: { id: job.id }, data: { status: BookingStatus.ACCEPTED } }),
      prisma.booking.create({
        data: { jobRequestId: job.id, providerId: profile.id, agreedPrice: body.agreedPrice, status: BookingStatus.ACCEPTED },
      }),
    ]);

    res.json({ job: updatedJob, booking });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to accept job');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provider: decline job request
router.post('/:id/decline', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const job = await prisma.jobRequest.findFirst({
      where: { id: req.params.id, service: { providerId: profile.id }, status: BookingStatus.PENDING },
    });
    if (!job) return res.status(404).json({ error: 'Job request not found' });

    const updated = await prisma.jobRequest.update({ where: { id: job.id }, data: { status: BookingStatus.DECLINED } });
    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to decline job');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provider: mark job as complete
router.post('/:id/complete', authenticateToken, requireProvider, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const booking = await prisma.booking.findFirst({
      where: { jobRequestId: req.params.id, providerId: profile.id },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const [updatedJob, updatedBooking] = await prisma.$transaction([
      prisma.jobRequest.update({ where: { id: req.params.id }, data: { status: BookingStatus.COMPLETED } }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.COMPLETED, completedAt: new Date() },
      }),
    ]);

    res.json({ job: updatedJob, booking: updatedBooking });
  } catch (error) {
    logger.error({ error }, 'Failed to complete job');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

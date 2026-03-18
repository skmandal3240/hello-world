import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';
import { generateGreeting, generateResponse, generateSummary, extractTriageLevel } from '../services/ai.service';
import { TriageLevel } from '@prisma/client';

const router = Router();

// GET /sessions — list user's sessions (paginated)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || '20')), 50);
    const page = Math.max(parseInt(String(req.query.page || '1')), 1);

    const sessions = await prisma.symptomSession.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, triageLevel: true, status: true,
        doctorSummary: true, createdAt: true, updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
    res.json(sessions);
  } catch (error) {
    logger.error({ error }, 'Failed to get sessions');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /sessions — create new session with AI greeting
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const greeting = await generateGreeting();

    const session = await prisma.symptomSession.create({
      data: {
        userId: req.user!.userId,
        title: 'New Consultation',
        messages: {
          create: { role: 'ASSISTANT', content: greeting },
        },
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    res.status(201).json(session);
  } catch (error) {
    logger.error({ error }, 'Failed to create session');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /sessions/:id — get session with all messages
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const session = await prisma.symptomSession.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    logger.error({ error }, 'Failed to get session');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /sessions/:id
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const session = await prisma.symptomSession.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    await prisma.symptomSession.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    logger.error({ error }, 'Failed to delete session');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /sessions/:id/messages — send user message, get AI response
router.post('/:id/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { content } = z.object({ content: z.string().min(1).max(2000) }).parse(req.body);
    const sessionId = String(req.params.id);

    const session = await prisma.symptomSession.findFirst({
      where: { id: sessionId, userId: req.user!.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Session is completed' });
    }

    // Build conversation history for AI
    const priorMessages = session.messages.map((m) => ({
      role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }));

    // Save user message
    await prisma.sessionMessage.create({ data: { sessionId, role: 'USER', content } });

    // Auto-set title from first user message
    if (session.messages.filter((m) => m.role === 'USER').length === 0) {
      const titleText = content.length > 60 ? content.slice(0, 57) + '...' : content;
      await prisma.symptomSession.update({ where: { id: sessionId }, data: { title: titleText } });
    }

    // Generate AI response
    const aiText = await generateResponse(priorMessages, content);

    // Save AI response
    const aiMessage = await prisma.sessionMessage.create({
      data: { sessionId, role: 'ASSISTANT', content: aiText },
    });

    // Extract and update triage level
    const triageStr = extractTriageLevel(aiText);
    if (triageStr && triageStr !== session.triageLevel) {
      await prisma.symptomSession.update({
        where: { id: sessionId },
        data: { triageLevel: triageStr as TriageLevel },
      });
    }

    res.json({ message: aiMessage, triageLevel: triageStr || session.triageLevel });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Failed to process message');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /sessions/:id/complete — mark session as COMPLETED
router.post('/:id/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const session = await prisma.symptomSession.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updated = await prisma.symptomSession.update({
      where: { id: String(req.params.id) },
      data: { status: 'COMPLETED' },
    });
    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to complete session');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /sessions/:id/summary — generate (or return cached) doctor prep summary
router.post('/:id/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.params.id);
    const session = await prisma.symptomSession.findFirst({
      where: { id: sessionId, userId: req.user!.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Return cached if exists
    if (session.doctorSummary) {
      return res.json({ summary: session.doctorSummary, cached: true });
    }

    if (session.messages.length < 3) {
      return res.status(400).json({ error: 'Not enough conversation to generate a summary. Please describe your symptoms first.' });
    }

    // Build conversation text
    const conversationText = session.messages
      .map((m) => `${m.role === 'USER' ? 'Patient' : 'HealthCheck AI'}: ${m.content}`)
      .join('\n\n');

    const summary = await generateSummary(conversationText);

    const updated = await prisma.symptomSession.update({
      where: { id: sessionId },
      data: { doctorSummary: summary, summaryGeneratedAt: new Date() },
    });

    res.json({ summary: updated.doctorSummary, cached: false });
  } catch (error) {
    logger.error({ error }, 'Failed to generate summary');
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;

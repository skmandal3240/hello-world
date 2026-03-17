import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';

export async function getSessionFeedback(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) throw createError('Session not found', 404);
    if (session.userAId !== req.userId && session.userBId !== req.userId) {
      throw createError('Forbidden', 403);
    }

    const feedback = await prisma.feedbackEntry.findMany({
      where: { sessionId: req.params.id, userId: req.userId! },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        utteranceId: true,
        correctedText: true,
        grammarErrors: true,
        vocabularySuggestions: true,
        pronunciationScore: true,
        overallFeedback: true,
        createdAt: true,
        utterance: { select: { transcript: true, sequenceNumber: true, spokenAt: true } },
      },
    });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

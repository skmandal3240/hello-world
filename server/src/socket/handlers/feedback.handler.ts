import { Socket } from 'socket.io';
import { SESSION_EVENTS } from '../events';
import { analyzeSpeech } from '../../services/ai.service';
import { prisma } from '../../config/prisma';
import { logger } from '../../utils/logger';

// Per-user utterance count for rate limiting (30/hour)
const utteranceCounts: Map<string, { count: number; windowStart: number }> = new Map();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = utteranceCounts.get(userId);
  if (!entry || now - entry.windowStart > 60 * 60 * 1000) {
    utteranceCounts.set(userId, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= 30) return true;
  entry.count++;
  return false;
}

export async function generateFeedback(
  socket: Socket,
  utteranceId: string,
  sessionId: string,
  userId: string,
  transcript: string,
  languageCode: string
): Promise<void> {
  if (isRateLimited(userId)) {
    socket.emit(SESSION_EVENTS.FEEDBACK_ERROR, {
      utteranceId,
      message: 'Feedback rate limit reached. Please slow down a little!',
    });
    return;
  }

  try {
    // Fetch user proficiency and language info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        proficiencyLevel: true,
        learningLanguage: { select: { name: true } },
      },
    });

    // Get last 3 utterances for context
    const recentUtterances = await prisma.utterance.findMany({
      where: { sessionId, id: { not: utteranceId } },
      orderBy: { sequenceNumber: 'desc' },
      take: 3,
      select: { speakerId: true, transcript: true },
    });

    const context = recentUtterances.reverse().map((u) => ({
      role: (u.speakerId === userId ? 'learner' : 'partner') as 'learner' | 'partner',
      text: u.transcript,
    }));

    const feedback = await analyzeSpeech(
      transcript,
      user?.learningLanguage?.name || languageCode,
      user?.proficiencyLevel || 'B1',
      context
    );

    // Persist feedback entry
    await prisma.feedbackEntry.create({
      data: {
        sessionId,
        utteranceId,
        userId,
        correctedText: feedback.correctedText,
        grammarErrors: feedback.grammarErrors,
        vocabularySuggestions: feedback.vocabularySuggestions,
        pronunciationScore: feedback.pronunciationScore,
        overallFeedback: feedback.overallFeedback,
        rawAiResponse: feedback.rawAiResponse,
      },
    });

    socket.emit(SESSION_EVENTS.FEEDBACK_RESULT, {
      utteranceId,
      correctedText: feedback.correctedText,
      grammarErrors: feedback.grammarErrors,
      vocabularySuggestions: feedback.vocabularySuggestions,
      pronunciationScore: feedback.pronunciationScore,
      overallFeedback: feedback.overallFeedback,
    });
  } catch (err) {
    logger.error({ err, utteranceId, userId }, 'Error generating AI feedback');
    socket.emit(SESSION_EVENTS.FEEDBACK_ERROR, {
      utteranceId,
      message: 'AI feedback is temporarily unavailable.',
    });
  }
}

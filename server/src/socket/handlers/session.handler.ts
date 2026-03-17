import { Socket, Server } from 'socket.io';
import { SESSION_EVENTS } from '../events';
import * as matchingService from '../../services/matching.service';
import * as sessionsService from '../../services/sessions.service';
import { generateFeedback } from './feedback.handler';
import { prisma } from '../../config/prisma';
import { logger } from '../../utils/logger';

export function registerSessionHandlers(io: Server, socket: Socket): void {
  const userId = (socket.data as { userId: string }).userId;

  socket.on(SESSION_EVENTS.JOIN, ({ sessionId }: { sessionId: string }) => {
    socket.join(`session:${sessionId}`);
  });

  socket.on(SESSION_EVENTS.LEAVE, ({ sessionId }: { sessionId: string }) => {
    socket.leave(`session:${sessionId}`);
  });

  socket.on(SESSION_EVENTS.UTTERANCE_SUBMIT, async (data: {
    sessionId: string;
    transcript: string;
    languageCode: string;
    sequenceNumber: number;
  }) => {
    try {
      // Persist utterance
      const utterance = await prisma.utterance.create({
        data: {
          sessionId: data.sessionId,
          speakerId: userId,
          transcript: data.transcript,
          languageCode: data.languageCode,
          sequenceNumber: data.sequenceNumber,
        },
      });

      // Broadcast transcript to partner in room (not back to speaker — they already have it)
      socket.to(`session:${data.sessionId}`).emit(SESSION_EVENTS.UTTERANCE_RECEIVED, {
        utteranceId: utterance.id,
        speakerId: userId,
        transcript: utterance.transcript,
        sequenceNumber: utterance.sequenceNumber,
        spokenAt: utterance.spokenAt,
      });

      // Generate AI feedback asynchronously — emit result only to speaker
      generateFeedback(socket, utterance.id, data.sessionId, userId, data.transcript, data.languageCode);
    } catch (err) {
      logger.error({ err, userId, sessionId: data.sessionId }, 'Error in utterance:submit');
      socket.emit(SESSION_EVENTS.ERROR, { code: 'UTTERANCE_ERROR', message: 'Failed to save utterance' });
    }
  });

  socket.on(SESSION_EVENTS.END, async ({ sessionId }: { sessionId: string }) => {
    try {
      const { durationSeconds } = await matchingService.endSession(sessionId, userId);

      // Update stats for both participants
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { userAId: true, userBId: true },
      });
      if (session) {
        await Promise.all([
          sessionsService.incrementUserSessionStats(session.userAId),
          session.userBId ? sessionsService.incrementUserSessionStats(session.userBId) : Promise.resolve(),
        ]);
      }

      io.to(`session:${sessionId}`).emit(SESSION_EVENTS.ENDED, { sessionId, durationSeconds });
    } catch (err) {
      logger.error({ err, userId, sessionId }, 'Error in session:end');
    }
  });

  socket.on('disconnect', async () => {
    // Find any active sessions this user was in and mark as abandoned
    try {
      const activeSessions = await prisma.session.findMany({
        where: {
          OR: [{ userAId: userId }, { userBId: userId }],
          status: 'ACTIVE',
        },
      });
      for (const session of activeSessions) {
        await prisma.session.update({
          where: { id: session.id },
          data: { status: 'ABANDONED', endedAt: new Date() },
        });
        socket.to(`session:${session.id}`).emit(SESSION_EVENTS.PARTNER_DISCONNECTED, {
          sessionId: session.id,
        });
      }
    } catch (err) {
      logger.error({ err, userId }, 'Error handling disconnect for sessions');
    }
  });
}

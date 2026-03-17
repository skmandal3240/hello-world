import { Socket, Server } from 'socket.io';
import { MATCH_EVENTS } from '../events';
import * as matchingService from '../../services/matching.service';
import { logger } from '../../utils/logger';

export function registerMatchmakingHandlers(io: Server, socket: Socket): void {
  const userId = (socket.data as { userId: string }).userId;

  socket.on(MATCH_EVENTS.QUEUE_JOIN, async (data: {
    learningLanguageId: string;
    nativeLanguageId: string;
    proficiencyLevel: string;
  }) => {
    try {
      matchingService.joinQueue({
        userId,
        socketId: socket.id,
        learningLanguageId: data.learningLanguageId,
        nativeLanguageId: data.nativeLanguageId,
        proficiencyLevel: data.proficiencyLevel,
        joinedAt: new Date(),
      });

      const partner = matchingService.findMatch(userId);

      if (partner) {
        // Create session in DB and pending match in memory
        const match = await matchingService.createPendingMatch(
          userId,
          socket.id,
          partner.userId,
          partner.socketId,
          data.learningLanguageId,  // userA is learning this
          data.nativeLanguageId     // userA's native = source
        );

        // Notify both users
        socket.emit(MATCH_EVENTS.MATCH_FOUND, {
          sessionId: match.sessionId,
          partnerDisplayName: 'Partner', // Fetched on client via REST
        });

        const partnerSocket = io.sockets.sockets.get(partner.socketId);
        if (partnerSocket) {
          partnerSocket.emit(MATCH_EVENTS.MATCH_FOUND, {
            sessionId: match.sessionId,
            partnerDisplayName: 'Partner',
          });
        }
      } else {
        const position = matchingService.getQueuePosition(userId);
        socket.emit(MATCH_EVENTS.QUEUE_POSITION, { position, estimatedWait: position * 30 });
      }
    } catch (err) {
      logger.error({ err, userId }, 'Error in queue:join');
      socket.emit(SESSION_EVENTS_ERROR, { code: 'QUEUE_ERROR', message: 'Failed to join queue' });
    }
  });

  socket.on(MATCH_EVENTS.QUEUE_LEAVE, () => {
    matchingService.leaveQueue(userId);
  });

  socket.on(MATCH_EVENTS.MATCH_ACCEPT, async ({ sessionId }: { sessionId: string }) => {
    try {
      const match = matchingService.acceptMatch(sessionId, userId);
      if (!match) return;

      if (match.acceptedBy.size === 2) {
        await matchingService.startSession(sessionId);

        // Notify both users session is ready
        const roomId = `session:${sessionId}`;
        socket.emit(MATCH_EVENTS.MATCH_READY, { sessionId, roomId });

        const partnerSocketId =
          match.userAId === userId ? match.userBSocketId : match.userASocketId;
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        if (partnerSocket) {
          partnerSocket.emit(MATCH_EVENTS.MATCH_READY, { sessionId, roomId });
        }
      }
    } catch (err) {
      logger.error({ err, userId, sessionId }, 'Error in match:accept');
    }
  });

  socket.on(MATCH_EVENTS.MATCH_DECLINE, async ({ sessionId }: { sessionId: string }) => {
    const match = matchingService.declineMatch(sessionId);
    if (!match) return;

    const partnerSocketId =
      match.userAId === userId ? match.userBSocketId : match.userASocketId;
    const partnerSocket = io.sockets.sockets.get(partnerSocketId);
    if (partnerSocket) {
      partnerSocket.emit(MATCH_EVENTS.MATCH_PARTNER_DECLINED);
      // Re-queue partner
      // They will need to re-join manually via the UI
    }
  });

  socket.on('disconnect', () => {
    matchingService.leaveQueue(userId);
  });
}

// Local reference to avoid circular import
const SESSION_EVENTS_ERROR = 'error';

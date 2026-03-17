import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import { registerMatchmakingHandlers } from './handlers/matchmaking.handler';
import { registerSessionHandlers } from './handlers/session.handler';
import { logger } from '../utils/logger';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT auth middleware for all socket connections
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data = { userId: payload.userId, email: payload.email };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket.data as { userId: string }).userId;
    logger.info({ userId, socketId: socket.id }, 'Socket connected');

    registerMatchmakingHandlers(io, socket);
    registerSessionHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info({ userId, socketId: socket.id, reason }, 'Socket disconnected');
    });
  });

  return io;
}

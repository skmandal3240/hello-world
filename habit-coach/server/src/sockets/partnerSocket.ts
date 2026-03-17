import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import * as partnerService from '../services/partner.service';

export function initSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string;
      if (!token) return next(new Error('No token'));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId: string = socket.data.userId;
    logger.info({ userId }, 'Socket connected');

    socket.join(`user:${userId}`);

    socket.on('send-message', async ({ content }: { content: string }) => {
      try {
        await partnerService.sendMessage(userId, content, {
          to: (room: string) => ({ emit: (event: string, data: unknown) => { io.to(room).emit(event, data); } }),
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
        logger.error({ err }, 'Socket send-message error');
      }
    });

    socket.on('disconnect', () => {
      logger.info({ userId }, 'Socket disconnected');
    });
  });

  return io;
}

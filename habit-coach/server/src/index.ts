import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initSocket } from './sockets/partnerSocket';
import { setIO } from './controllers/partner.controller';
import { startScheduler } from './jobs/scheduler';

const app = createApp();
const httpServer = createServer(app);
const io = initSocket(httpServer);

// Make Socket.io instance available to partner controller
setIO({
  to: (room: string) => ({
    emit: (event: string, data: unknown) => { io.to(room).emit(event, data); },
  }),
});

if (env.NODE_ENV !== 'test') {
  startScheduler();
}

httpServer.listen(parseInt(env.PORT), () => {
  logger.info(`Habit Coach server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

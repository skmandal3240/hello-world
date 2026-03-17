import { Router } from 'express';
import authRoutes from './auth.routes';
import habitsRoutes from './habits.routes';
import checkinsRoutes from './checkins.routes';
import partnerRoutes from './partner.routes';
import aiRoutes from './ai.routes';
import notificationsRoutes from './notifications.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);
router.use('/check-ins', checkinsRoutes);
router.use('/partner', partnerRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationsRoutes);

export default router;

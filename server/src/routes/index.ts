import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import languagesRoutes from './languages.routes';
import sessionsRoutes from './sessions.routes';
import feedbackRoutes from './feedback.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/languages', languagesRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/sessions/:id/feedback', feedbackRoutes);

export default router;

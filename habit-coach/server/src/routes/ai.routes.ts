import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/ai.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/nudge', ctrl.getNudge);
router.get('/weekly-summary', ctrl.getWeeklySummary);
router.post('/chat', validate(z.object({ message: z.string().min(1).max(1000) })), ctrl.chat);

export default router;

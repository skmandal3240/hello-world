import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/partner.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/status', ctrl.getStatus);
router.post('/opt-in', validate(z.object({
  category: z.enum(['HEALTH','FITNESS','LEARNING','PRODUCTIVITY','MINDFULNESS','NUTRITION','SOCIAL','CREATIVITY','FINANCE','OTHER']),
})), ctrl.optIn);
router.post('/opt-out', ctrl.optOut);
router.get('/habits', ctrl.getPartnerHabits);
router.get('/messages', ctrl.getMessages);
router.post('/messages', validate(z.object({
  content: z.string().min(1).max(500),
})), ctrl.sendMessage);

export default router;

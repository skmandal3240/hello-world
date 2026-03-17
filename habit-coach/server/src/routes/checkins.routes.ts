import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/checkins.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/today', ctrl.getTodayStatus);
router.get('/history', ctrl.getHistory);
router.post('/', validate(z.object({
  habitId: z.string().min(1),
  completed: z.boolean(),
  note: z.string().max(500).optional(),
  date: z.string().optional(),
})), ctrl.logCheckIn);
router.patch('/:id', validate(z.object({
  completed: z.boolean().optional(),
  note: z.string().max(500).optional(),
})), ctrl.updateCheckIn);

export default router;

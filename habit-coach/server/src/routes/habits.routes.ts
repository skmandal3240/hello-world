import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/habits.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const categoryEnum = z.enum(['HEALTH','FITNESS','LEARNING','PRODUCTIVITY','MINDFULNESS','NUTRITION','SOCIAL','CREATIVITY','FINANCE','OTHER']);
const frequencyEnum = z.enum(['DAILY','WEEKLY']);

router.use(authenticate);

router.get('/', ctrl.getHabits);
router.post('/', validate(z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  frequency: frequencyEnum.optional(),
  category: categoryEnum.optional(),
  targetDays: z.number().int().min(1).max(365).optional(),
})), ctrl.createHabit);
router.get('/:id', ctrl.getHabit);
router.patch('/:id', validate(z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  frequency: frequencyEnum.optional(),
  category: categoryEnum.optional(),
  targetDays: z.number().int().min(1).max(365).optional(),
})), ctrl.updateHabit);
router.post('/:id/archive', ctrl.archiveHabit);
router.delete('/:id', ctrl.deleteHabit);

export default router;

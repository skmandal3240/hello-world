import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/budgets.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, validate(z.object({
  categoryId: z.string().cuid(),
  amount: z.number().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
})), ctrl.upsert);
router.delete('/:id', authenticate, ctrl.remove);

export default router;

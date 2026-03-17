import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/accounts.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'LOAN', 'CASH']),
  balance: z.number(),
  currency: z.string().length(3).default('USD'),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  balance: z.number().optional(),
});

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, validate(createSchema), ctrl.create);
router.patch('/:id', authenticate, validate(updateSchema), ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

export default router;

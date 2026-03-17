import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/categories.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, validate(z.object({
  name: z.string().min(1).max(50),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})), ctrl.create);
router.delete('/:id', authenticate, ctrl.remove);

export default router;

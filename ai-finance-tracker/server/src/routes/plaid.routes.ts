import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/plaid.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/link-token', authenticate, ctrl.linkToken);
router.post('/exchange', authenticate, validate(z.object({
  publicToken: z.string(),
  institutionName: z.string(),
})), ctrl.exchange);
router.post('/sync', authenticate, ctrl.sync);
router.delete('/items/:id', authenticate, ctrl.disconnect);

export default router;

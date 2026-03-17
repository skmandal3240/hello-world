import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/insights.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', authenticate, ctrl.list);
router.post('/generate', authenticate, validate(z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
})), ctrl.generate);
router.get('/forecast', authenticate, ctrl.forecast);
router.post('/chat', authenticate, validate(z.object({
  message: z.string().min(1).max(500),
})), ctrl.chatEndpoint);

export default router;

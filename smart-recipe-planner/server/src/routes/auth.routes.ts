import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();

const dietaryEnum = z.enum(['NONE','VEGETARIAN','VEGAN','GLUTEN_FREE','DAIRY_FREE','KETO','PALEO','LOW_CARB','HALAL','KOSHER']);

router.post('/signup', validate(z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(50),
})), ctrl.signup);

router.post('/login', validate(z.object({
  email: z.string().email(),
  password: z.string().min(1),
})), ctrl.login);

router.post('/refresh', validate(z.object({ refreshToken: z.string().min(1) })), ctrl.refresh);
router.post('/logout', authenticate, validate(z.object({ refreshToken: z.string().min(1) })), ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);
router.patch('/me', authenticate, validate(z.object({
  displayName: z.string().min(2).max(50).optional(),
  dietaryPreferences: z.array(dietaryEnum).optional(),
  servings: z.number().int().min(1).max(20).optional(),
  weeklyBudget: z.number().positive().optional(),
})), ctrl.updateMe);

export default router;

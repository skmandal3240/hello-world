import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();

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
  bio: z.string().max(200).optional(),
  timezone: z.string().optional(),
  avatarColor: z.string().optional(),
  matchingEnabled: z.boolean().optional(),
  preferredCategory: z.enum(['HEALTH','FITNESS','LEARNING','PRODUCTIVITY','MINDFULNESS','NUTRITION','SOCIAL','CREATIVITY','FINANCE','OTHER']).optional(),
})), ctrl.updateMe);

export default router;

import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/auth.controller';
import { getMe, updateMe, changePassword } from '../controllers/users.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
const tokenSchema = z.object({ refreshToken: z.string().min(1) });

router.post('/signup', authLimiter, validate(z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(50),
})), ctrl.signup);

router.post('/login', authLimiter, validate(z.object({
  email: z.string().email(),
  password: z.string().min(1),
})), ctrl.login);

router.post('/refresh', validate(tokenSchema), ctrl.refresh);
router.post('/logout', authenticate, validate(tokenSchema), ctrl.logout);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(z.object({
  displayName: z.string().min(2).max(50).optional(),
  currency: z.string().length(3).optional(),
})), updateMe);
router.post('/change-password', authenticate, validate(z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})), changePassword);

export default router;

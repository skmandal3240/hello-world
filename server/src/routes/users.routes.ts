import { Router } from 'express';
import { z } from 'zod';
import * as usersController from '../controllers/users.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

const updateMeSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional(),
});

const onboardingSchema = z.object({
  nativeLanguageId: z.string().cuid(),
  learningLanguageId: z.string().cuid(),
  proficiencyLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
});

router.get('/me', authenticate, usersController.getMe);
router.patch('/me', authenticate, validate(updateMeSchema), usersController.updateMe);
router.patch('/me/onboarding', authenticate, validate(onboardingSchema), usersController.onboarding);
router.get('/me/stats', authenticate, usersController.getStats);

export default router;

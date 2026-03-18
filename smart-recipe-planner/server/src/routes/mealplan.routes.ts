import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/mealplan.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

const mealTypeEnum = z.enum(['BREAKFAST','LUNCH','DINNER','SNACK']);

router.get('/', ctrl.getMealPlan);

router.post('/generate', ctrl.generateMealPlan);

router.post('/entries', validate(z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: mealTypeEnum,
  recipeId: z.string().optional(),
  customName: z.string().max(100).optional(),
})), ctrl.setEntry);

router.delete('/entries/:id', ctrl.removeEntry);

export default router;

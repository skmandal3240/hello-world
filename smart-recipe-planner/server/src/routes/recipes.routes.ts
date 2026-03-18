import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/recipes.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/', ctrl.getRecipes);
router.get('/saved', authenticate, ctrl.getSavedRecipes);
router.get('/:id', ctrl.getRecipeById);

router.post('/generate', authenticate, validate(z.object({
  cuisinePreference: z.string().max(50).optional(),
  servings: z.number().int().min(1).max(20).optional(),
})), ctrl.generateRecipe);

router.post('/saved', authenticate, validate(z.object({
  recipeId: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
})), ctrl.saveRecipe);

router.patch('/saved/:id', authenticate, validate(z.object({
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
})), ctrl.updateSavedRecipe);

router.delete('/saved/:id', authenticate, ctrl.unsaveRecipe);

export default router;

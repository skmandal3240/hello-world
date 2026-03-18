import { Router } from 'express';
import authRoutes from './auth.routes';
import pantryRoutes from './pantry.routes';
import recipesRoutes from './recipes.routes';
import mealPlanRoutes from './mealplan.routes';
import shoppingListRoutes from './shoppinglist.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/pantry', pantryRoutes);
router.use('/recipes', recipesRoutes);
router.use('/meal-plan', mealPlanRoutes);
router.use('/shopping-list', shoppingListRoutes);

export default router;

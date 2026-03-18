import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as mealPlanService from '../services/mealplan.service';
import { prisma } from '../config/prisma';
import { MealType } from '@prisma/client';

export const getMealPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const week = req.query['week'] as string | undefined;
    res.json(await mealPlanService.getMealPlan(req.userId!, week));
  } catch (err) { next(err); }
};

export const setEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dayOfWeek, mealType, recipeId, customName } = req.body;
    res.status(201).json(await mealPlanService.setMealPlanEntry(req.userId!, dayOfWeek, mealType as MealType, recipeId, customName));
  } catch (err) { next(err); }
};

export const removeEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await mealPlanService.removeMealPlanEntry(req.userId!, req.params['id'] as string); res.status(204).send(); }
  catch (err) { next(err); }
};

export const generateMealPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pantryItems = await prisma.pantryItem.findMany({ where: { userId: req.userId } });
    const result = await mealPlanService.generateWeeklyMealPlan(
      req.userId!,
      pantryItems,
      user?.dietaryPreferences ?? [],
      user?.servings ?? 2
    );
    res.status(201).json(result);
  } catch (err) { next(err); }
};

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as recipesService from '../services/recipes.service';
import { prisma } from '../config/prisma';

export const getRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cuisine, tags } = req.query as { cuisine?: string; tags?: string };
    res.json(await recipesService.getRecipes({ cuisine, tags }));
  } catch (err) { next(err); }
};

export const getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await recipesService.getRecipeById(req.params['id'] as string)); }
  catch (err) { next(err); }
};

export const generateRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cuisinePreference, servings } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pantryItems = await prisma.pantryItem.findMany({ where: { userId: req.userId } });
    const recipe = await recipesService.generateAndSaveRecipe(
      pantryItems,
      user?.dietaryPreferences ?? [],
      servings ?? user?.servings ?? 2,
      cuisinePreference
    );
    res.status(201).json(recipe);
  } catch (err) { next(err); }
};

export const getSavedRecipes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await recipesService.getSavedRecipes(req.userId!)); }
  catch (err) { next(err); }
};

export const saveRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { recipeId, rating, notes } = req.body;
    res.status(201).json(await recipesService.saveRecipe(req.userId!, recipeId, rating, notes));
  } catch (err) { next(err); }
};

export const updateSavedRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rating, notes } = req.body;
    res.json(await recipesService.updateSavedRecipe(req.userId!, req.params['id'] as string, rating, notes));
  } catch (err) { next(err); }
};

export const unsaveRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await recipesService.unsaveRecipe(req.userId!, req.params['id'] as string); res.status(204).send(); }
  catch (err) { next(err); }
};

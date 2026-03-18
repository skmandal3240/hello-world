import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';
import { generateRecipe } from './ai.service';
import { PantryItem } from '@prisma/client';

export async function getRecipes(filters: { cuisine?: string; tags?: string }) {
  return prisma.recipe.findMany({
    where: {
      ...(filters.cuisine ? { cuisine: { contains: filters.cuisine, mode: 'insensitive' } } : {}),
      ...(filters.tags ? { tags: { has: filters.tags } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getRecipeById(id: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) throw createError('Recipe not found', 404);
  return recipe;
}

export async function generateAndSaveRecipe(
  pantryItems: PantryItem[],
  dietaryPreferences: string[],
  servings: number,
  cuisinePreference?: string
) {
  const generated = await generateRecipe(pantryItems, dietaryPreferences, servings, cuisinePreference);
  return prisma.recipe.create({
    data: {
      name: generated.name,
      description: generated.description,
      ingredients: generated.ingredients,
      instructions: generated.instructions,
      prepTimeMinutes: generated.prepTimeMinutes,
      cookTimeMinutes: generated.cookTimeMinutes,
      servings: generated.servings,
      cuisine: generated.cuisine,
      tags: generated.tags,
      nutritionPerServing: generated.nutritionPerServing,
      aiGenerated: true,
    },
  });
}

export async function getSavedRecipes(userId: string) {
  return prisma.savedRecipe.findMany({
    where: { userId },
    include: { recipe: true },
    orderBy: { savedAt: 'desc' },
  });
}

export async function saveRecipe(userId: string, recipeId: string, rating?: number, notes?: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) throw createError('Recipe not found', 404);

  return prisma.savedRecipe.upsert({
    where: { userId_recipeId: { userId, recipeId } },
    update: { rating, notes },
    create: { userId, recipeId, rating, notes },
    include: { recipe: true },
  });
}

export async function updateSavedRecipe(userId: string, savedRecipeId: string, rating?: number, notes?: string) {
  const saved = await prisma.savedRecipe.findUnique({ where: { id: savedRecipeId } });
  if (!saved || saved.userId !== userId) throw createError('Saved recipe not found', 404);

  return prisma.savedRecipe.update({
    where: { id: savedRecipeId },
    data: { rating, notes },
    include: { recipe: true },
  });
}

export async function unsaveRecipe(userId: string, savedRecipeId: string) {
  const saved = await prisma.savedRecipe.findUnique({ where: { id: savedRecipeId } });
  if (!saved || saved.userId !== userId) throw createError('Saved recipe not found', 404);
  await prisma.savedRecipe.delete({ where: { id: savedRecipeId } });
}

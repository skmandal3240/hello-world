import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';
import { generateMealPlan } from './ai.service';
import { MealType, PantryItem } from '@prisma/client';

function getWeekStart(dateStr?: string): Date {
  const date = dateStr ? new Date(dateStr) : new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getMealPlan(userId: string, weekStr?: string) {
  const weekStart = getWeekStart(weekStr);

  let plan = await prisma.mealPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include: {
      entries: {
        include: { recipe: true },
        orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
      },
    },
  });

  if (!plan) {
    plan = await prisma.mealPlan.create({
      data: { userId, weekStart },
      include: { entries: { include: { recipe: true } } },
    });
  }

  return plan;
}

export async function setMealPlanEntry(
  userId: string,
  dayOfWeek: number,
  mealType: MealType,
  recipeId?: string,
  customName?: string
) {
  const weekStart = getWeekStart();

  let plan = await prisma.mealPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });

  if (!plan) {
    plan = await prisma.mealPlan.create({ data: { userId, weekStart } });
  }

  return prisma.mealPlanEntry.upsert({
    where: { mealPlanId_dayOfWeek_mealType: { mealPlanId: plan.id, dayOfWeek, mealType } },
    update: { recipeId, customName },
    create: { mealPlanId: plan.id, dayOfWeek, mealType, recipeId, customName },
    include: { recipe: true },
  });
}

export async function removeMealPlanEntry(userId: string, entryId: string) {
  const entry = await prisma.mealPlanEntry.findUnique({
    where: { id: entryId },
    include: { mealPlan: true },
  });
  if (!entry || entry.mealPlan.userId !== userId) throw createError('Entry not found', 404);
  await prisma.mealPlanEntry.delete({ where: { id: entryId } });
}

export async function generateWeeklyMealPlan(
  userId: string,
  pantryItems: PantryItem[],
  dietaryPreferences: string[],
  servings: number
) {
  const suggestions = await generateMealPlan(pantryItems, dietaryPreferences, servings);

  const weekStart = getWeekStart();
  let plan = await prisma.mealPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });

  if (!plan) {
    plan = await prisma.mealPlan.create({ data: { userId, weekStart } });
  }

  // Clear existing entries for the week
  await prisma.mealPlanEntry.deleteMany({ where: { mealPlanId: plan.id } });

  // Create new entries from AI suggestions
  const entries = await prisma.$transaction(
    suggestions.map((s) =>
      prisma.mealPlanEntry.create({
        data: {
          mealPlanId: plan!.id,
          dayOfWeek: s.dayOfWeek,
          mealType: s.mealType as MealType,
          customName: s.recipeName,
        },
        include: { recipe: true },
      })
    )
  );

  return { weekStart, entries, suggestions };
}

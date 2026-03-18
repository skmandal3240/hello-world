import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';
import { IngredientCategory } from '@prisma/client';

function getWeekStart(dateStr?: string): Date {
  const date = dateStr ? new Date(dateStr) : new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getShoppingList(userId: string, weekStr?: string) {
  const weekStart = getWeekStart(weekStr);

  let list = await prisma.shoppingList.findFirst({
    where: { userId, weekStart },
    include: {
      items: { orderBy: [{ category: 'asc' }, { checked: 'asc' }] },
    },
  });

  if (!list) {
    list = await prisma.shoppingList.create({
      data: { userId, weekStart },
      include: { items: true },
    });
  }

  return list;
}

export async function generateShoppingList(userId: string) {
  const weekStart = getWeekStart();

  // Get meal plan for the week
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include: {
      entries: {
        include: { recipe: true },
      },
    },
  });

  // Get current pantry
  const pantry = await prisma.pantryItem.findMany({ where: { userId } });
  const pantryMap = new Map(pantry.map((p) => [p.name.toLowerCase(), p.quantity]));

  // Collect needed ingredients from meal plan
  const neededMap = new Map<string, { quantity: number; unit: string; category: IngredientCategory }>();

  if (mealPlan) {
    for (const entry of mealPlan.entries) {
      if (entry.recipe) {
        const ingredients = entry.recipe.ingredients as { name: string; quantity: number; unit: string }[];
        for (const ing of ingredients) {
          const key = ing.name.toLowerCase();
          const existing = neededMap.get(key);
          if (existing) {
            neededMap.set(key, { ...existing, quantity: existing.quantity + ing.quantity });
          } else {
            neededMap.set(key, { quantity: ing.quantity, unit: ing.unit, category: 'OTHER' });
          }
        }
      }
    }
  }

  // Find missing items (not in pantry or insufficient quantity)
  const missingItems: { name: string; quantity: number; unit: string; category: IngredientCategory }[] = [];
  for (const [name, needed] of neededMap.entries()) {
    const inPantry = pantryMap.get(name) ?? 0;
    if (inPantry < needed.quantity) {
      missingItems.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity: needed.quantity - inPantry,
        unit: needed.unit,
        category: needed.category,
      });
    }
  }

  // Create or replace shopping list
  let list = await prisma.shoppingList.findFirst({ where: { userId, weekStart } });

  if (list) {
    await prisma.shoppingListItem.deleteMany({ where: { shoppingListId: list.id } });
  } else {
    list = await prisma.shoppingList.create({ data: { userId, weekStart } });
  }

  if (missingItems.length > 0) {
    await prisma.$transaction(
      missingItems.map((item) =>
        prisma.shoppingListItem.create({
          data: { shoppingListId: list!.id, ...item },
        })
      )
    );
  }

  return prisma.shoppingList.findUnique({
    where: { id: list.id },
    include: { items: { orderBy: [{ category: 'asc' }, { checked: 'asc' }] } },
  });
}

export async function toggleItem(userId: string, itemId: string) {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { shoppingList: true },
  });
  if (!item || item.shoppingList.userId !== userId) throw createError('Item not found', 404);

  return prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { checked: !item.checked },
  });
}

export async function deleteItem(userId: string, itemId: string) {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { shoppingList: true },
  });
  if (!item || item.shoppingList.userId !== userId) throw createError('Item not found', 404);
  await prisma.shoppingListItem.delete({ where: { id: itemId } });
}

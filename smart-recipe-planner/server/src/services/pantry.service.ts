import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';
import { IngredientCategory } from '@prisma/client';

interface PantryItemInput {
  name: string;
  quantity: number;
  unit: string;
  category?: IngredientCategory;
  expiryDate?: string;
}

export async function getPantry(userId: string) {
  return prisma.pantryItem.findMany({
    where: { userId },
    orderBy: [{ category: 'asc' }, { expiryDate: 'asc' }],
  });
}

export async function addItem(userId: string, data: PantryItemInput) {
  return prisma.pantryItem.create({
    data: {
      userId,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      category: data.category ?? 'OTHER',
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
  });
}

export async function addBulk(userId: string, items: PantryItemInput[]) {
  const created = await prisma.$transaction(
    items.map((item) =>
      prisma.pantryItem.create({
        data: {
          userId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category ?? 'OTHER',
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        },
      })
    )
  );
  return created;
}

export async function updateItem(userId: string, id: string, data: Partial<PantryItemInput>) {
  const item = await prisma.pantryItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) throw createError('Pantry item not found', 404);

  return prisma.pantryItem.update({
    where: { id },
    data: {
      ...data,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
  });
}

export async function deleteItem(userId: string, id: string) {
  const item = await prisma.pantryItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) throw createError('Pantry item not found', 404);
  await prisma.pantryItem.delete({ where: { id } });
}

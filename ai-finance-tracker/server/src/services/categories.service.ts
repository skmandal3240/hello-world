import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ isDefault: true }, { userId }] },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

export async function createCategory(userId: string, data: { name: string; icon: string; color: string }) {
  return prisma.category.create({ data: { ...data, userId, isDefault: false } });
}

export async function deleteCategory(id: string, userId: string) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw createError('Category not found', 404);
  if (cat.isDefault || cat.userId !== userId) throw createError('Cannot delete this category', 403);
  await prisma.category.delete({ where: { id } });
}

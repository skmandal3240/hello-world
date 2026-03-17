import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';

export async function listBudgets(userId: string, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });

  // Aggregate actual spend per category for the month
  const spentByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'EXPENSE',
      date: { gte: start, lte: end },
      categoryId: { in: budgets.map((b) => b.categoryId) },
    },
    _sum: { amount: true },
  });

  const spentMap = Object.fromEntries(
    spentByCategory.map((s) => [s.categoryId!, Number(s._sum.amount || 0)])
  );

  return budgets.map((b) => ({
    ...b,
    amount: Number(b.amount),
    spent: spentMap[b.categoryId] || 0,
    remaining: Number(b.amount) - (spentMap[b.categoryId] || 0),
    percentUsed: Math.round(((spentMap[b.categoryId] || 0) / Number(b.amount)) * 100),
  }));
}

export async function upsertBudget(userId: string, data: {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}) {
  return prisma.budget.upsert({
    where: { userId_categoryId_month_year: { userId, categoryId: data.categoryId, month: data.month, year: data.year } },
    update: { amount: data.amount },
    create: { ...data, userId },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });
}

export async function deleteBudget(id: string, userId: string) {
  const budget = await prisma.budget.findUnique({ where: { id } });
  if (!budget) throw createError('Budget not found', 404);
  if (budget.userId !== userId) throw createError('Forbidden', 403);
  await prisma.budget.delete({ where: { id } });
}

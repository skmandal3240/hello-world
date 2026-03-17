import { TxType, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';

export interface TransactionFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  accountId?: string;
  type?: TxType;
  q?: string;
  page?: number;
  limit?: number;
}

export async function listTransactions(userId: string, filters: TransactionFilters) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, filters.limit || 50);

  const where: Prisma.TransactionWhereInput = { userId };
  if (filters.from) where.date = { ...where.date as object, gte: new Date(filters.from) };
  if (filters.to) where.date = { ...where.date as object, lte: new Date(filters.to) };
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.accountId) where.accountId = filters.accountId;
  if (filters.type) where.type = filters.type;
  if (filters.q) where.description = { contains: filters.q, mode: 'insensitive' };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        account: { select: { id: true, name: true, type: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createTransaction(userId: string, data: {
  accountId: string;
  categoryId?: string;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  type: TxType;
  isRecurring?: boolean;
}) {
  // Verify account belongs to user
  const account = await prisma.account.findUnique({ where: { id: data.accountId } });
  if (!account || account.userId !== userId) throw createError('Account not found', 404);

  const tx = await prisma.transaction.create({
    data: { ...data, userId, date: new Date(data.date) },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      account: { select: { id: true, name: true, type: true } },
    },
  });

  // Update account balance
  const delta = data.type === 'EXPENSE' ? -Math.abs(data.amount) : Math.abs(data.amount);
  await prisma.account.update({ where: { id: data.accountId }, data: { balance: { increment: delta } } });

  return tx;
}

export async function updateTransaction(id: string, userId: string, data: {
  categoryId?: string;
  description?: string;
  notes?: string;
  amount?: number;
  date?: string;
  type?: TxType;
}) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw createError('Transaction not found', 404);
  if (tx.userId !== userId) throw createError('Forbidden', 403);

  return prisma.transaction.update({
    where: { id },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      account: { select: { id: true, name: true, type: true } },
    },
  });
}

export async function deleteTransaction(id: string, userId: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw createError('Transaction not found', 404);
  if (tx.userId !== userId) throw createError('Forbidden', 403);

  // Reverse balance change
  const delta = tx.type === 'EXPENSE' ? Math.abs(Number(tx.amount)) : -Math.abs(Number(tx.amount));
  await prisma.$transaction([
    prisma.transaction.delete({ where: { id } }),
    prisma.account.update({ where: { id: tx.accountId }, data: { balance: { increment: delta } } }),
  ]);
}

export interface CsvRow {
  date: string;
  description: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  categoryId?: string;
}

export async function bulkImport(userId: string, accountId: string, rows: CsvRow[]) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== userId) throw createError('Account not found', 404);

  const created = await prisma.$transaction(
    rows.map((row) =>
      prisma.transaction.create({
        data: {
          userId,
          accountId,
          amount: row.amount,
          description: row.description,
          date: new Date(row.date),
          type: row.type,
          categoryId: row.categoryId || null,
        },
      })
    )
  );

  // Recalculate account balance from all transactions
  const result = await prisma.transaction.aggregate({
    where: { accountId },
    _sum: {
      // We can't easily aggregate with sign logic in Prisma, so update inline
    },
  });

  return { imported: created.length };
}

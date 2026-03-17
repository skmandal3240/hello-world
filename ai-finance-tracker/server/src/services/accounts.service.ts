import { AccountType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';

export async function listAccounts(userId: string) {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, name: true, type: true, balance: true, currency: true,
      isPlaid: true, plaidAccountId: true, createdAt: true,
      plaidItem: { select: { institutionName: true } },
    },
  });
}

export async function createAccount(userId: string, data: {
  name: string; type: AccountType; balance: number; currency?: string;
}) {
  return prisma.account.create({
    data: { ...data, userId },
    select: { id: true, name: true, type: true, balance: true, currency: true, isPlaid: true },
  });
}

export async function updateAccount(id: string, userId: string, data: { name?: string; balance?: number }) {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) throw createError('Account not found', 404);
  if (account.userId !== userId) throw createError('Forbidden', 403);
  return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(id: string, userId: string) {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) throw createError('Account not found', 404);
  if (account.userId !== userId) throw createError('Forbidden', 403);
  await prisma.account.delete({ where: { id } });
}

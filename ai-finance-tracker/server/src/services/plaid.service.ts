import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, Transaction as PlaidTransaction } from 'plaid';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { categorizeBatch } from './ai.service';
import { logger } from '../utils/logger';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': env.PLAID_SECRET || '',
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export async function createLinkToken(userId: string): Promise<string> {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'AI Finance Tracker',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
    redirect_uri: env.PLAID_REDIRECT_URI,
  });
  return response.data.link_token;
}

export async function exchangeToken(userId: string, publicToken: string, institutionName: string) {
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
  const { access_token, item_id } = exchangeResponse.data;

  const plaidItem = await prisma.plaidItem.create({
    data: { userId, accessToken: access_token, itemId: item_id, institutionName },
  });

  // Fetch and create accounts from Plaid
  const accountsResponse = await plaidClient.accountsGet({ access_token });
  const createdAccounts = await Promise.all(
    accountsResponse.data.accounts.map((acct) =>
      prisma.account.create({
        data: {
          userId,
          name: acct.name,
          type: mapPlaidType(acct.type),
          balance: acct.balances.current || 0,
          isPlaid: true,
          plaidItemId: plaidItem.id,
          plaidAccountId: acct.account_id,
        },
      })
    )
  );

  return { plaidItem, accounts: createdAccounts };
}

export async function syncTransactions(userId: string) {
  const plaidItems = await prisma.plaidItem.findMany({ where: { userId } });
  let totalAdded = 0;

  for (const item of plaidItems) {
    try {
      let cursor = item.cursor || undefined;
      let hasMore = true;
      const added: PlaidTransaction[] = [];

      while (hasMore) {
        const response = await plaidClient.transactionsSync({
          access_token: item.accessToken,
          cursor,
        });
        added.push(...response.data.added);
        cursor = response.data.next_cursor;
        hasMore = response.data.has_more;
      }

      // Update cursor
      await prisma.plaidItem.update({
        where: { id: item.id },
        data: { cursor, lastSync: new Date() },
      });

      // Upsert transactions
      const accounts = await prisma.account.findMany({
        where: { plaidItemId: item.id },
        select: { id: true, plaidAccountId: true },
      });
      const accountMap = Object.fromEntries(accounts.map((a) => [a.plaidAccountId!, a.id]));

      for (const tx of added) {
        const accountId = accountMap[tx.account_id];
        if (!accountId) continue;
        await prisma.transaction.upsert({
          where: { plaidTxId: tx.transaction_id },
          update: {},
          create: {
            userId,
            accountId,
            amount: Math.abs(tx.amount),
            description: tx.merchant_name || tx.name,
            date: new Date(tx.date),
            type: tx.amount > 0 ? 'EXPENSE' : 'INCOME',
            plaidTxId: tx.transaction_id,
          },
        });
      }

      totalAdded += added.length;

      // AI categorize uncategorized transactions
      const uncategorized = await prisma.transaction.findMany({
        where: { userId, categoryId: null, plaidTxId: { not: null } },
        take: 50,
        select: { id: true, description: true },
      });

      if (uncategorized.length > 0) {
        const categories = await prisma.category.findMany({
          where: { OR: [{ isDefault: true }, { userId }] },
          select: { id: true, name: true },
        });
        const results = await categorizeBatch(uncategorized, categories);
        await Promise.all(
          results.map((r) =>
            prisma.transaction.update({
              where: { id: r.id },
              data: { categoryId: r.categoryId },
            })
          )
        );
      }
    } catch (err) {
      logger.error({ err, plaidItemId: item.id }, 'Error syncing Plaid item');
    }
  }

  return { synced: totalAdded };
}

export async function disconnectItem(itemId: string, userId: string) {
  const item = await prisma.plaidItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) throw new Error('Plaid item not found');
  await plaidClient.itemRemove({ access_token: item.accessToken }).catch(() => {});
  await prisma.plaidItem.delete({ where: { id: itemId } });
}

function mapPlaidType(type: string): 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'LOAN' | 'CASH' {
  const map: Record<string, 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'LOAN' | 'CASH'> = {
    depository: 'CHECKING',
    credit: 'CREDIT',
    investment: 'INVESTMENT',
    loan: 'LOAN',
    other: 'CASH',
  };
  return map[type] || 'CHECKING';
}

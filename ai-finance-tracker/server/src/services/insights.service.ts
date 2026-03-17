import { prisma } from '../config/prisma';
import { analyzeSpending, detectAnomalies, forecastBalance, chat, FinancialContext } from './ai.service';
import { logger } from '../utils/logger';

// Per-user chat rate limit: 20 messages/hour
const chatCounts = new Map<string, { count: number; windowStart: number }>();

function isChatRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = chatCounts.get(userId);
  if (!entry || now - entry.windowStart > 3600000) {
    chatCounts.set(userId, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= 20) return true;
  entry.count++;
  return false;
}

export async function listInsights(userId: string) {
  return prisma.aiInsight.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function generateInsights(userId: string, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 0, 23, 59, 59);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });

  // Spending by category
  const spendingRaw = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    _sum: { amount: true },
  });

  const prevSpendingRaw = await prisma.transaction.aggregate({
    where: { userId, type: 'EXPENSE', date: { gte: prevStart, lte: prevEnd } },
    _sum: { amount: true },
  });

  const incomeRaw = await prisma.transaction.aggregate({
    where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
    _sum: { amount: true },
  });

  // Fetch category names
  const categoryIds = spendingRaw.map((s) => s.categoryId).filter(Boolean) as string[];
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const budgets = await prisma.budget.findMany({ where: { userId, month, year } });
  const budgetMap = Object.fromEntries(budgets.map((b) => [b.categoryId, Number(b.amount)]));

  const spendingByCategory = spendingRaw.map((s) => ({
    categoryName: catMap[s.categoryId!]?.name || 'Other',
    spent: Number(s._sum.amount || 0),
    budget: budgetMap[s.categoryId!],
  }));

  const totalSpent = spendingRaw.reduce((acc, s) => acc + Number(s._sum.amount || 0), 0);
  const totalIncome = Number(incomeRaw._sum.amount || 0);
  const prevMonthTotalSpent = Number(prevSpendingRaw._sum.amount || 0);

  // Generate summary insight
  const summary = await analyzeSpending({
    month, year,
    currency: user?.currency || 'USD',
    spendingByCategory,
    totalSpent,
    totalIncome,
    prevMonthTotalSpent,
  });

  const summaryInsight = await prisma.aiInsight.create({
    data: {
      userId, type: 'WEEKLY_SUMMARY',
      title: summary.title,
      body: summary.body,
      data: { tips: summary.tips, ...summary.data },
      month, year,
    },
  });

  // Anomaly detection
  const recentTxs = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end }, type: 'EXPENSE' },
    include: { category: { select: { name: true } } },
    orderBy: { amount: 'desc' },
    take: 50,
  });

  const avgByCategory = spendingByCategory.map((s) => ({
    category: s.categoryName,
    average: s.spent / 30,
  }));

  const anomaly = await detectAnomalies({
    transactions: recentTxs.map((t) => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      category: t.category?.name,
      date: t.date.toISOString(),
    })),
    averageByCategory: avgByCategory,
  });

  if (anomaly) {
    await prisma.aiInsight.create({
      data: { userId, type: 'ANOMALY', title: anomaly.title, body: anomaly.body, month, year },
    });
  }

  return summaryInsight;
}

export async function getForecast(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });

  // Current total balance
  const balanceAgg = await prisma.account.aggregate({
    where: { userId },
    _sum: { balance: true },
  });
  const totalBalance = Number(balanceAgg._sum.balance || 0);

  // 3-month averages
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [spendAgg, incomeAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: threeMonthsAgo } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: threeMonthsAgo } },
      _sum: { amount: true },
    }),
  ]);

  const avgMonthlySpend = Number(spendAgg._sum.amount || 0) / 3;
  const avgMonthlyIncome = Number(incomeAgg._sum.amount || 0) / 3;

  // Recurring expenses
  const recurringTxs = await prisma.transaction.findMany({
    where: { userId, isRecurring: true },
    select: { description: true, amount: true },
  });

  return forecastBalance({
    currentBalance: totalBalance,
    currency: user?.currency || 'USD',
    avgMonthlySpend,
    avgMonthlyIncome,
    recurringExpenses: recurringTxs.map((t) => ({ description: t.description, amount: Number(t.amount) })),
  });
}

export async function chatWithAI(userId: string, message: string) {
  if (isChatRateLimited(userId)) {
    throw new Error('Chat rate limit reached. Please wait before sending more messages.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });

  // Persist user message
  await prisma.chatMessage.create({ data: { userId, role: 'user', content: message } });

  // Build context
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [balanceAgg, spendAgg, incomeAgg, topSpending, budgets] = await Promise.all([
    prisma.account.aggregate({ where: { userId }, _sum: { balance: true } }),
    prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: monthStart } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    }),
    prisma.budget.findMany({ where: { userId, month: now.getMonth() + 1, year: now.getFullYear() } }),
  ]);

  const categoryIds = topSpending.map((s) => s.categoryId).filter(Boolean) as string[];
  const cats = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const budgetCatIds = budgets.map((b) => b.categoryId);
  const budgetCats = await prisma.category.findMany({ where: { id: { in: budgetCatIds } } });
  const budgetCatMap = Object.fromEntries(budgetCats.map((c) => [c.id, c.name]));

  const context: FinancialContext = {
    currency: user?.currency || 'USD',
    totalBalance: Number(balanceAgg._sum.balance || 0),
    monthlySpend: Number(spendAgg._sum.amount || 0),
    monthlyIncome: Number(incomeAgg._sum.amount || 0),
    topCategories: topSpending.map((s) => ({
      name: catMap[s.categoryId!] || 'Other',
      spent: Number(s._sum.amount || 0),
    })),
    budgetStatus: budgets.map((b) => ({
      category: budgetCatMap[b.categoryId] || 'Unknown',
      budget: Number(b.amount),
      spent: 0, // simplified — could join with spending
    })),
  };

  // Get last 9 messages for context
  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 9,
  });

  const messages = [...history.reverse().map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })), { role: 'user' as const, content: message }];

  const reply = await chatWithAI_inner(messages, context, userId, message);
  return reply;
}

async function chatWithAI_inner(messages: { role: 'user' | 'assistant'; content: string }[], context: FinancialContext, userId: string, userMessage: string): Promise<string> {
  const { chat: aiChat } = await import('./ai.service');
  const reply = await aiChat(messages, context);
  await prisma.chatMessage.create({ data: { userId, role: 'assistant', content: reply } });
  return reply;
}

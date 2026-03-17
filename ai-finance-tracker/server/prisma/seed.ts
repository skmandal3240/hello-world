import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Food & Dining', icon: '🍔', color: '#f97316' },
  { name: 'Groceries', icon: '🛒', color: '#84cc16' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Housing', icon: '🏠', color: '#8b5cf6' },
  { name: 'Utilities', icon: '💡', color: '#eab308' },
  { name: 'Healthcare', icon: '🏥', color: '#ef4444' },
  { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { name: 'Shopping', icon: '🛍️', color: '#06b6d4' },
  { name: 'Travel', icon: '✈️', color: '#14b8a6' },
  { name: 'Education', icon: '📚', color: '#6366f1' },
  { name: 'Fitness', icon: '💪', color: '#22c55e' },
  { name: 'Subscriptions', icon: '📱', color: '#a855f7' },
  { name: 'Personal Care', icon: '💆', color: '#f43f5e' },
  { name: 'Savings', icon: '🏦', color: '#10b981' },
  { name: 'Income', icon: '💰', color: '#059669' },
  { name: 'Investment', icon: '📈', color: '#0ea5e9' },
  { name: 'Other', icon: '📦', color: '#6b7280' },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.name }, // use name as temp lookup
      update: {},
      create: { ...cat, isDefault: true },
    }).catch(async () => {
      // upsert by name not supported directly — use findFirst + create
      const existing = await prisma.category.findFirst({ where: { name: cat.name, isDefault: true } });
      if (!existing) {
        await prisma.category.create({ data: { ...cat, isDefault: true } });
      }
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

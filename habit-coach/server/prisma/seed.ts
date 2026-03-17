import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash,
      displayName: 'Alice',
      avatarColor: '#6366f1',
      matchingEnabled: true,
      preferredCategory: 'FITNESS',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      passwordHash,
      displayName: 'Bob',
      avatarColor: '#10b981',
      matchingEnabled: true,
      preferredCategory: 'FITNESS',
    },
  });

  // Create habits for Alice
  const habit1 = await prisma.habit.upsert({
    where: { id: 'seed-habit-1' },
    update: {},
    create: {
      id: 'seed-habit-1',
      userId: alice.id,
      name: 'Morning Run',
      description: '30 minutes of running',
      frequency: 'DAILY',
      category: 'FITNESS',
      targetDays: 30,
      currentStreak: 7,
      longestStreak: 14,
      totalCompletions: 20,
    },
  });

  await prisma.habit.upsert({
    where: { id: 'seed-habit-2' },
    update: {},
    create: {
      id: 'seed-habit-2',
      userId: alice.id,
      name: 'Read 20 pages',
      description: 'Daily reading habit',
      frequency: 'DAILY',
      category: 'LEARNING',
      targetDays: 60,
      currentStreak: 3,
      longestStreak: 10,
      totalCompletions: 15,
    },
  });

  // Create check-ins for the past 10 days for Alice's first habit
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    await prisma.checkIn.upsert({
      where: { habitId_date: { habitId: habit1.id, date } },
      update: {},
      create: {
        userId: alice.id,
        habitId: habit1.id,
        date,
        completed: i !== 3, // miss day 3 for realism
      },
    });
  }

  // Create partner pair between Alice and Bob
  const [user1Id, user2Id] = [alice.id, bob.id].sort();
  await prisma.partnerPair.upsert({
    where: { user1Id_user2Id: { user1Id, user2Id } },
    update: {},
    create: { user1Id, user2Id, category: 'FITNESS', status: 'MATCHED' },
  });

  console.log('Seed complete!');
  console.log('Demo accounts:');
  console.log('  alice@example.com / password123');
  console.log('  bob@example.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

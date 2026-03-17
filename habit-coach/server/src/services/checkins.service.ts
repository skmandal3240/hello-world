import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';
import { calculateCurrentStreak, calculateLongestStreak } from './streak.service';

export async function getTodayStatus(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    orderBy: { createdAt: 'asc' },
  });

  const todayCheckIns = await prisma.checkIn.findMany({
    where: { userId, date: today },
  });

  const checkInMap = new Map(todayCheckIns.map((c) => [c.habitId, c]));

  return habits.map((habit) => ({
    habit,
    checkIn: checkInMap.get(habit.id) || null,
  }));
}

export async function logCheckIn(
  userId: string,
  habitId: string,
  completed: boolean,
  note?: string,
  dateInput?: string
) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw createError('Habit not found', 404);

  const date = dateInput ? new Date(dateInput) : new Date();
  date.setHours(0, 0, 0, 0);

  const checkIn = await prisma.checkIn.upsert({
    where: { habitId_date: { habitId, date } },
    create: { userId, habitId, date, completed, note },
    update: { completed, note },
  });

  // Recalculate streaks from last 90 days
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const recentCheckIns = await prisma.checkIn.findMany({
    where: { habitId, date: { gte: since } },
    select: { date: true, completed: true },
  });

  const today = new Date();
  const currentStreak = calculateCurrentStreak(recentCheckIns, habit.frequency, today);
  const longestStreak = Math.max(
    habit.longestStreak,
    calculateLongestStreak(recentCheckIns, habit.frequency)
  );
  const totalCompletions = completed
    ? habit.totalCompletions + (checkIn.completed && !habit.totalCompletions ? 1 : 0)
    : habit.totalCompletions;

  // Count total completions properly
  const completedCount = await prisma.checkIn.count({ where: { habitId, completed: true } });

  const updatedHabit = await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak, longestStreak, totalCompletions: completedCount },
  });

  return { checkIn, habit: updatedHabit };
}

export async function updateCheckIn(
  userId: string,
  checkInId: string,
  data: { completed?: boolean; note?: string }
) {
  const checkIn = await prisma.checkIn.findFirst({ where: { id: checkInId, userId } });
  if (!checkIn) throw createError('Check-in not found', 404);

  const updated = await prisma.checkIn.update({ where: { id: checkInId }, data });

  // Re-run streak recalculation
  await logCheckIn(userId, checkIn.habitId, updated.completed, updated.note ?? undefined);
  return updated;
}

export async function getCheckInHistory(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return prisma.checkIn.findMany({
    where: { userId, date: { gte: since } },
    include: { habit: { select: { name: true, category: true } } },
    orderBy: { date: 'desc' },
  });
}
